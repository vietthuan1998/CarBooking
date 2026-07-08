// supabase/functions/create-account/index.ts
//
// Tạo tài khoản mới (admin / staff / driver) cho hệ thống quản trị.
//
// Lý do cần Edge Function (không cho client gọi supabase.auth.signUp trực tiếp):
//   - supabase.auth.signUp() ở client sẽ tự đăng nhập vào tài khoản vừa tạo,
//     làm mất phiên đăng nhập hiện tại của admin đang thao tác.
//   - Việc tạo tài khoản (auth.users) chỉ được phép bởi admin, cần dùng
//     service role + auth.admin.createUser() và tự kiểm tra quyền người gọi
//     (không có RLS nào bảo vệ việc này ở tầng Postgres).
//
// Input (JSON body):
// {
//   "email": "driver1@example.com",
//   "password": "matkhau123",
//   "full_name": "Nguyễn Văn A",
//   "phone": "0901234567",       // optional
//   "role": "driver"             // "admin" | "staff" | "driver"
// }
//
// profiles.role/status mặc định do trigger handle_new_user() tạo tự động
// khi insert vào auth.users, dựa trên raw_user_meta_data.

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

const VALID_ROLES = ["admin", "staff", "driver"] as const;
type Role = (typeof VALID_ROLES)[number];

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
      // Service role: cần để gọi auth.admin.createUser() và đọc profiles
      // bất kể RLS, sau khi đã tự xác thực + kiểm tra quyền người gọi bên dưới.
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
      callerProfile.role !== "admin" ||
      callerProfile.status !== "active"
    ) {
      return json({ error: "Chỉ admin mới có quyền tạo tài khoản" }, 403);
    }

    // ---- Validate input ----
    const body = await req.json().catch(() => null);
    if (!body) return json({ error: "Request body không hợp lệ" }, 400);

    const email = typeof body.email === "string" ? body.email.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";
    const fullName =
      typeof body.full_name === "string" ? body.full_name.trim() : "";
    const phone =
      typeof body.phone === "string" && body.phone.trim()
        ? body.phone.trim()
        : null;
    const role = body.role as Role;

    if (!email) return json({ error: "Thiếu email" }, 400);
    if (!password || password.length < 6) {
      return json({ error: "Mật khẩu phải có ít nhất 6 ký tự" }, 400);
    }
    if (!fullName) return json({ error: "Thiếu họ và tên" }, 400);
    if (!VALID_ROLES.includes(role)) {
      return json(
        { error: "role phải là một trong: " + VALID_ROLES.join(", ") },
        400,
      );
    }

    // ---- Tạo user trong auth.users ----
    // Trigger trg_on_auth_user_created sẽ tự tạo dòng profiles tương ứng.
    const { data: created, error: createError } = await admin.auth.admin
      .createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: fullName, phone, role },
        app_metadata: { status: "active" },
      });

    if (createError) {
      const status = createError.status === 422 ? 409 : 500;
      return json({ error: createError.message }, status);
    }
    if (!created?.user) {
      return json({ error: "Tạo tài khoản thất bại" }, 500);
    }

    // Trigger handle_new_user mặc định tạo profile 'inactive' (chờ duyệt cho
    // tài khoản tự đăng ký). GoTrue merge app_metadata SAU khi insert user nên
    // trigger không thấy status active ở trên — account do admin tạo phải
    // kích hoạt tường minh ở đây.
    const { error: activateError } = await admin
      .from("profiles")
      .update({ status: "active" })
      .eq("id", created.user.id);

    if (activateError) {
      return json({ error: activateError.message }, 500);
    }

    const { data: profile, error: profileError } = await admin
      .from("profiles")
      .select("*")
      .eq("id", created.user.id)
      .single();

    if (profileError) {
      return json({ error: profileError.message }, 500);
    }

    return json({ profile }, 201);
  } catch (err) {
    return json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      500,
    );
  }
});
