import type { SupabaseClient } from "jsr:@supabase/supabase-js@2";
import { HttpError, orThrow500 } from "./http.ts";

export async function resolveCustomerId(
  supabase: SupabaseClient,
  params: {
    customer_id?: string;
    customer_name?: string;
    customer_phone?: string;
    customer_note?: string;
  },
): Promise<string> {
  const { customer_id, customer_name, customer_phone, customer_note } = params;

  if (customer_id) {
    const { data: existing, error } = await supabase
      .from("customers")
      .select("id")
      .eq("id", customer_id)
      .maybeSingle();

    orThrow500(error);
    if (!existing) throw new HttpError(404, "customer_id không tồn tại");
    return existing.id;
  }

  if (!customer_name?.trim()) throw new HttpError(400, "Thiếu customer_name");
  if (!customer_phone?.trim()) throw new HttpError(400, "Thiếu customer_phone");

  // Upsert theo số điện thoại
  const { data: upserted, error } = await supabase
    .from("customers")
    .upsert(
      {
        phone: customer_phone.trim(),
        full_name: customer_name.trim(),
        note: customer_note?.trim() ?? null,
      },
      { onConflict: "phone", ignoreDuplicates: false },
    )
    .select("id")
    .single();

  orThrow500(error);
  return upserted.id;
}
