// Xác thực người gọi edge function: token hợp lệ + profile active + role nằm
// trong danh sách cho phép.
//
// Edge function chạy bằng service role (bypass toàn bộ RLS) nên BẮT BUỘC
// tự kiểm tra người gọi trước khi chạy nghiệp vụ — gateway verify_jwt không
// đủ vì anon key (nằm công khai trong bundle frontend) cũng là JWT hợp lệ.
// Dùng cho mọi function không cố ý public (register-booking public có chủ đích,
// get-pending-bookings dùng JWT user + RLS).

import type { SupabaseClient } from "jsr:@supabase/supabase-js@2";

export type Role = "admin" | "staff" | "driver";

export type CallerCheck =
  | { ok: true; userId: string; role: Role }
  | { ok: false; status: number; message: string };

/**
 * @param req request gốc (đọc header Authorization: Bearer <access_token>)
 * @param admin client service role (cần để getUser + đọc profiles bỏ qua RLS)
 * @param allowedRoles các role được phép gọi function này
 * @param forbiddenMessage message 403 riêng theo nghiệp vụ của function
 */
export async function verifyCaller(
  req: Request,
  admin: SupabaseClient,
  allowedRoles: Role[],
  forbiddenMessage = "Bạn không có quyền thực hiện thao tác này",
): Promise<CallerCheck> {
  const authHeader = req.headers.get("Authorization") ?? "";
  const token = authHeader.replace(/^Bearer\s+/i, "");
  if (!token) {
    return { ok: false, status: 401, message: "Thiếu Authorization token" };
  }

  // Anon key tuy là JWT hợp lệ nhưng không phải token của user nào
  // → getUser sẽ fail → chặn được request nặc danh.
  const { data: callerData, error: callerError } = await admin.auth.getUser(
    token,
  );
  if (callerError || !callerData?.user) {
    return {
      ok: false,
      status: 401,
      message: "Token không hợp lệ hoặc đã hết hạn",
    };
  }

  const { data: profile, error: profileError } = await admin
    .from("profiles")
    .select("role, status")
    .eq("id", callerData.user.id)
    .maybeSingle();
  if (profileError) {
    return { ok: false, status: 500, message: profileError.message };
  }
  if (
    !profile ||
    !allowedRoles.includes(profile.role) ||
    profile.status !== "active"
  ) {
    return { ok: false, status: 403, message: forbiddenMessage };
  }

  return { ok: true, userId: callerData.user.id, role: profile.role };
}
