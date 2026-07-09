// Client service role dùng trong edge function: bypass toàn bộ RLS.
// Function nào dùng client này BẮT BUỘC tự verify caller (verifyCaller.ts)
// trừ khi cố ý public (register-booking).
// Riêng get-pending-bookings KHÔNG dùng client này — nó tạo client anon key
// + forward JWT user để query chạy dưới RLS của người gọi.

import { createClient, SupabaseClient } from "jsr:@supabase/supabase-js@2";

export function createAdminClient(): SupabaseClient {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
}
