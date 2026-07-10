import { supabase } from "../utils/supabase";
import { invokeEdgeFunction } from "../utils/edgeFunctions";
import type { Profile } from "./authService";

export type { Profile };

export interface AccountFormInput {
  full_name: string;
  // "" nghĩa là xóa SĐT: gửi null (phone unique, '' đụng nhau còn NULL thì không)
  phone: string | null;
  role: Profile["role"];
  status: Profile["status"];
}

export interface CreateAccountInput {
  email: string;
  password: string;
  full_name: string;
  phone: string | null;
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
    .select("id, full_name, phone, email, role, status, created_at")
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
  const data = await invokeEdgeFunction("create-account", input);
  return data.profile as Profile;
}

/**
 * Đặt lại mật khẩu một tài khoản về giá trị mặc định theo role (qua Edge
 * Function — cần service role để đổi mật khẩu user khác). Server tự kiểm tra
 * quyền: admin reset được tất cả, staff chỉ reset chính mình và driver.
 * Trả về mật khẩu mới để hiển thị cho người thao tác.
 */
export async function resetPassword(userId: string): Promise<string> {
  const data = await invokeEdgeFunction("reset-password", {
    user_id: userId,
  });
  return data.new_password as string;
}
