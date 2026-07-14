// Gửi FCM push notification (HTTP v1 API) cho app mobile driver.
//
// - Token thiết bị nằm ở bảng device_tokens (app mobile upsert sau khi login).
// - Cần secret FCM_SERVICE_ACCOUNT = toàn bộ JSON service account của Firebase
//   (supabase secrets set FCM_SERVICE_ACCOUNT="$(cat service-account.json)").
//   Chưa set secret → sendPushToUser tự bỏ qua, các edge fn vẫn chạy bình thường.
// - Gửi push là side-effect: mọi hàm ở đây NUỐT lỗi (console.error), không được
//   throw — đặt vé/xếp chuyến đã thành công thì không thể fail vì FCM lỗi.

import type { SupabaseClient } from "jsr:@supabase/supabase-js@2";

interface ServiceAccount {
  project_id: string;
  client_email: string;
  private_key: string;
}

export interface PushNotification {
  title: string;
  body: string;
}

function getServiceAccount(): ServiceAccount | null {
  const raw = Deno.env.get("FCM_SERVICE_ACCOUNT");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ServiceAccount;
  } catch {
    console.error("[push] FCM_SERVICE_ACCOUNT không phải JSON hợp lệ");
    return null;
  }
}

// ---- OAuth2: đổi JWT ký bằng private key service account lấy access token ----
// (FCM v1 không nhận server key kiểu legacy; tự ký RS256 bằng WebCrypto để
// khỏi kéo thêm dependency google-auth-library.)

let cachedToken: { token: string; expiresAt: number } | null = null;

function base64UrlEncode(data: Uint8Array | string): string {
  const bytes = typeof data === "string" ? new TextEncoder().encode(data) : data;
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function importPrivateKey(pem: string): Promise<CryptoKey> {
  const body = pem
    .replace("-----BEGIN PRIVATE KEY-----", "")
    .replace("-----END PRIVATE KEY-----", "")
    .replace(/\s/g, "");
  const der = Uint8Array.from(atob(body), (c) => c.charCodeAt(0));
  return crypto.subtle.importKey(
    "pkcs8",
    der,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );
}

async function getAccessToken(sa: ServiceAccount): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  if (cachedToken && cachedToken.expiresAt - 60 > now) return cachedToken.token;

  const header = base64UrlEncode(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claims = base64UrlEncode(JSON.stringify({
    iss: sa.client_email,
    scope: "https://www.googleapis.com/auth/firebase.messaging",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  }));
  const signingInput = `${header}.${claims}`;
  const key = await importPrivateKey(sa.private_key);
  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    key,
    new TextEncoder().encode(signingInput),
  );
  const jwt = `${signingInput}.${base64UrlEncode(new Uint8Array(signature))}`;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });
  if (!res.ok) {
    throw new Error(`OAuth token ${res.status}: ${await res.text()}`);
  }
  const data = await res.json();
  cachedToken = { token: data.access_token, expiresAt: now + data.expires_in };
  return cachedToken.token;
}

// ---- Gửi tới 1 token; trả về true nếu token chết (cần xóa khỏi DB) ----
async function sendToToken(
  sa: ServiceAccount,
  accessToken: string,
  token: string,
  notification: PushNotification,
  data: Record<string, string>,
): Promise<boolean> {
  const res = await fetch(
    `https://fcm.googleapis.com/v1/projects/${sa.project_id}/messages:send`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: {
          token,
          notification,
          data,
          android: { priority: "high" },
        },
      }),
    },
  );
  if (res.ok) return false;

  const bodyText = await res.text();
  // 404/UNREGISTERED = token hết hạn hoặc app đã gỡ → xóa để bảng không phình.
  if (res.status === 404 || bodyText.includes("UNREGISTERED")) return true;
  console.error(`[push] FCM ${res.status}: ${bodyText}`);
  return false;
}

/**
 * Gửi push tới mọi thiết bị của 1 user. Không bao giờ throw.
 * `data` phải là map string→string (ràng buộc của FCM), app mobile dùng để
 * điều hướng (VD { trip_id }).
 */
export async function sendPushToUser(
  admin: SupabaseClient,
  userId: string,
  notification: PushNotification,
  data: Record<string, string> = {},
): Promise<void> {
  try {
    const sa = getServiceAccount();
    if (!sa) return; // chưa cấu hình FCM → tắt tính năng, không phải lỗi

    const { data: tokens, error } = await admin
      .from("device_tokens")
      .select("token")
      .eq("user_id", userId);
    if (error) {
      console.error(`[push] đọc device_tokens lỗi: ${error.message}`);
      return;
    }
    if (!tokens || tokens.length === 0) return;

    const accessToken = await getAccessToken(sa);
    const deadTokens: string[] = [];
    for (const row of tokens) {
      const dead = await sendToToken(sa, accessToken, row.token, notification, data);
      if (dead) deadTokens.push(row.token);
    }
    if (deadTokens.length > 0) {
      await admin.from("device_tokens").delete().in("token", deadTokens);
    }
  } catch (err) {
    console.error(`[push] sendPushToUser lỗi: ${err instanceof Error ? err.message : err}`);
  }
}

/**
 * Gửi push cho tài xế của 1 chuyến. Trips không còn cột driver_id —
 * tài xế = chủ xe (vehicles.driver_id). Không bao giờ throw.
 */
export async function notifyTripDriver(
  admin: SupabaseClient,
  tripId: string,
  notification: PushNotification,
  extraData: Record<string, string> = {},
): Promise<void> {
  try {
    const { data: trip, error } = await admin
      .from("trips")
      .select("id, vehicle:vehicles(driver_id)")
      .eq("id", tripId)
      .maybeSingle();
    if (error || !trip) {
      if (error) console.error(`[push] đọc trip lỗi: ${error.message}`);
      return;
    }
    const vehicle = trip.vehicle as unknown as { driver_id: string | null } | null;
    if (!vehicle?.driver_id) return; // xe chưa gán tài xế → không có ai để báo

    await sendPushToUser(admin, vehicle.driver_id, notification, {
      trip_id: tripId,
      ...extraData,
    });
  } catch (err) {
    console.error(`[push] notifyTripDriver lỗi: ${err instanceof Error ? err.message : err}`);
  }
}
