// supabase/functions/reset-password/index.ts
//
// Đặt lại mật khẩu một tài khoản về giá trị mặc định theo role của tài khoản đó.
//
// Lý do cần Edge Function: đổi mật khẩu user khác phải dùng
// auth.admin.updateUserById() với service role, và phải tự kiểm tra quyền
// người gọi (không có RLS nào bảo vệ việc này ở tầng Postgres).
//
// Phân quyền:
//   - admin (active): reset được mọi tài khoản.
//   - staff (active): chỉ reset được chính mình và các tài khoản driver.
//
// Input (JSON body): { "user_id": "<uuid tài khoản cần reset>" }
// Output: { "new_password": "..." }

import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// Mật khẩu mặc định theo role của tài khoản bị reset.
// Bản hiển thị phía client: DEFAULT_RESET_PASSWORDS trong src/utils/constants.ts
// — đổi ở đây thì phải đổi cả bên đó.
const DEFAULT_PASSWORDS: Record<string, string> = {
  driver: "123456",
  staff: "111111",
  admin: "@dmin123",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace(/^Bearer\s+/i, "");
    if (!token) {
      return json({ error: "Thiếu Authorization token" }, 401);
    }

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // ---- Xác thực người gọi ----
    const { data: callerData, error: callerError } = await admin.auth.getUser(
      token,
    );
    if (callerError || !callerData?.user) {
      return json({ error: "Token không hợp lệ hoặc đã hết hạn" }, 401);
    }

    const { data: callerProfile, error: callerProfileError } = await admin
      .from("profiles")
      .select("role, status")
      .eq("id", callerData.user.id)
      .maybeSingle();

    if (callerProfileError) {
      return json({ error: callerProfileError.message }, 500);
    }
    if (
      !callerProfile ||
      callerProfile.status !== "active" ||
      (callerProfile.role !== "admin" && callerProfile.role !== "staff")
    ) {
      return json(
        { error: "Bạn không có quyền đặt lại mật khẩu" },
        403,
      );
    }

    // ---- Validate input ----
    const body = await req.json().catch(() => null);
    const userId = typeof body?.user_id === "string" ? body.user_id : "";
    if (!userId) return json({ error: "Thiếu user_id" }, 400);

    const { data: target, error: targetError } = await admin
      .from("profiles")
      .select("id, role, full_name")
      .eq("id", userId)
      .maybeSingle();

    if (targetError) {
      return json({ error: targetError.message }, 500);
    }
    if (!target) {
      return json({ error: "Không tìm thấy tài khoản" }, 404);
    }

    // ---- Phân quyền theo caller/target ----
    const isSelf = target.id === callerData.user.id;
    if (
      callerProfile.role === "staff" &&
      !isSelf &&
      target.role !== "driver"
    ) {
      return json(
        { error: "Bạn không có quyền đặt lại mật khẩu cho tài khoản này" },
        403,
      );
    }

    const newPassword = DEFAULT_PASSWORDS[target.role];
    if (!newPassword) {
      return json({ error: "Role không hỗ trợ đặt lại mật khẩu" }, 400);
    }

    const { error: updateError } = await admin.auth.admin.updateUserById(
      target.id,
      { password: newPassword },
    );
    if (updateError) {
      return json({ error: updateError.message }, 500);
    }

    return json({ new_password: newPassword });
  } catch (err) {
    return json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      500,
    );
  }
});
