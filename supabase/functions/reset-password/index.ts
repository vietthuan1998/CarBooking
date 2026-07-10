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

import { createAdminClient } from "../_shared/adminClient.ts";
import { verifyCaller } from "../_shared/verifyCaller.ts";
import { json, servePost } from "../_shared/http.ts";

// Mật khẩu mặc định theo role của tài khoản bị reset.
// Bản hiển thị phía client: DEFAULT_RESET_PASSWORDS trong src/utils/constants.ts
// — đổi ở đây thì phải đổi cả bên đó.
const DEFAULT_PASSWORDS: Record<string, string> = {
  driver: "123456",
  staff: "111111",
  admin: "@dmin123",
};

servePost(async (req: Request) => {
  const admin = createAdminClient();

  // ---- Xác thực người gọi ----
  const caller = await verifyCaller(
    req,
    admin,
    ["admin", "staff"],
    "Bạn không có quyền đặt lại mật khẩu",
  );
  if (!caller.ok) return json({ error: caller.message }, caller.status);

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
  const isSelf = target.id === caller.userId;
  if (
    caller.role === "staff" &&
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
});
