import { supabase } from "../utils/supabase";
import type { Profile } from "./authService";

export type { Profile };

export interface AccountFormInput {
  full_name: string;
  phone: string;
  role: Profile["role"];
  status: Profile["status"];
}

export interface CreateAccountInput {
  email: string;
  password: string;
  full_name: string;
  phone: string;
  role: Profile["role"];
}

/**
 * Lấy danh sách profiles. RLS quyết định phạm vi thấy được:
 * - staff/admin: thấy tất cả profiles.
 * - Component tự lọc thêm theo role hiển thị phù hợp với từng viewer.
 */
export async function getProfiles(): Promise<Profile[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, phone, role, status, created_at")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function updateProfile(
  id: string,
  input: Partial<AccountFormInput>,
): Promise<Profile> {
  const { data, error } = await supabase
    .from("profiles")
    .update(input)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

/**
 * Tạo tài khoản mới qua Edge Function (chỉ admin).
 * Không dùng supabase.auth.signUp() ở client vì sẽ tự đăng nhập vào tài
 * khoản mới tạo, làm mất phiên đăng nhập hiện tại của admin.
 */
export async function createAccount(
  input: CreateAccountInput,
): Promise<Profile> {
  const data = await invokeAccountFunction("create-account", input);
  return data.profile as Profile;
}

/**
 * Đặt lại mật khẩu một tài khoản về giá trị mặc định theo role (qua Edge
 * Function — cần service role để đổi mật khẩu user khác). Server tự kiểm tra
 * quyền: admin reset được tất cả, staff chỉ reset chính mình và driver.
 * Trả về mật khẩu mới để hiển thị cho người thao tác.
 */
export async function resetPassword(userId: string): Promise<string> {
  const data = await invokeAccountFunction("reset-password", {
    user_id: userId,
  });
  return data.new_password as string;
}

async function invokeAccountFunction(
  name: string,
  body: object,
): Promise<Record<string, unknown>> {
  const { data, error } = await supabase.functions.invoke(name, { body });
  if (error) {
    // Edge Function trả lỗi qua body JSON { error: "..." } kể cả khi status
    // không phải 2xx; supabase-js không tự parse nội dung đó vào `error`,
    // nên phải tự đọc lại response body để lấy thông báo lỗi tiếng Việt cụ thể.
    const context = (error as { context?: Response }).context;
    const message = await context?.json?.().then(
      (b: { error?: string }) => b?.error,
      () => undefined,
    );
    throw new Error(message ?? error.message);
  }
  if (data?.error) throw new Error(data.error);
  return data;
}
