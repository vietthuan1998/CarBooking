import { supabase } from "./supabase";

/**
 * Gọi Supabase Edge Function và ném Error với message tiếng Việt từ server.
 *
 * Edge Function trả lỗi qua body JSON { error: "..." } kể cả khi status
 * không phải 2xx; supabase-js không tự parse nội dung đó vào `error`,
 * nên phải tự đọc lại response body để lấy thông báo lỗi cụ thể.
 * `fallbackMessage` dùng khi server không trả message (lỗi mạng, timeout...).
 */
export async function invokeEdgeFunction<T = Record<string, unknown>>(
  name: string,
  body: object,
  fallbackMessage?: string,
): Promise<T> {
  const { data, error } = await supabase.functions.invoke(name, { body });
  if (error) {
    const context = (error as { context?: Response }).context;
    const message = await context?.json?.().then(
      (b: { error?: string }) => b?.error,
      () => undefined,
    );
    throw new Error(message ?? fallbackMessage ?? error.message, {
      cause: error,
    });
  }
  const dataError = (data as { error?: string } | null)?.error;
  if (dataError) throw new Error(dataError);
  return data as T;
}
