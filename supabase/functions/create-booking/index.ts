// supabase/functions/create-booking/index.ts
//
// Tạo booking nguyên tử: upsert customer → insert booking → cập nhật trip_seats.
//
// Input (JSON body):
// {
//   "customer_id": "uuid",           // khách đã có trong hệ thống
//   // HOẶC:
//   "customer_name": "Nguyễn Văn A", // khách mới
//   "customer_phone": "0901234567",
//   "customer_note": "...",           // optional
//
//   "trip_id": "uuid",
//   "seat_ids": ["uuid", ...],
//   "pickup_address": "...",
//   "dropoff_address": "...",
//   "fare_amount": 150000
// }

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

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const body = await req.json().catch(() => null);
    if (!body) return json({ error: "Request body không hợp lệ" }, 400);

    const {
      customer_id,
      customer_name,
      customer_phone,
      customer_note,
      trip_id,
      seat_ids,
      pickup_address,
      dropoff_address,
      fare_amount,
    } = body;

    // ── Validate bắt buộc ──
    if (!trip_id) return json({ error: "Thiếu trip_id" }, 400);
    if (!Array.isArray(seat_ids) || seat_ids.length === 0) {
      return json({ error: "seat_ids phải là mảng có ít nhất 1 phần tử" }, 400);
    }
    if (!pickup_address?.trim()) return json({ error: "Thiếu pickup_address" }, 400);
    if (!dropoff_address?.trim()) return json({ error: "Thiếu dropoff_address" }, 400);
    if (fare_amount == null || isNaN(Number(fare_amount)) || Number(fare_amount) < 0) {
      return json({ error: "fare_amount không hợp lệ" }, 400);
    }

    // ── Resolve customer ──
    let resolvedCustomerId: string;

    if (customer_id) {
      const { data: existing, error: cErr } = await supabase
        .from("customers")
        .select("id")
        .eq("id", customer_id)
        .maybeSingle();
      if (cErr) return json({ error: cErr.message }, 500);
      if (!existing) return json({ error: "customer_id không tồn tại" }, 404);
      resolvedCustomerId = existing.id;
    } else {
      if (!customer_name?.trim()) return json({ error: "Thiếu customer_name" }, 400);
      if (!customer_phone?.trim()) return json({ error: "Thiếu customer_phone" }, 400);

      // Upsert theo số điện thoại
      const { data: upserted, error: upsertErr } = await supabase
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

      if (upsertErr) return json({ error: upsertErr.message }, 500);
      resolvedCustomerId = upserted.id;
    }

    // ── Kiểm tra trip tồn tại và đang scheduled ──
    const { data: trip, error: tripErr } = await supabase
      .from("trips")
      .select("id, trip_status")
      .eq("id", trip_id)
      .maybeSingle();

    if (tripErr) return json({ error: tripErr.message }, 500);
    if (!trip) return json({ error: "trip_id không tồn tại" }, 404);
    if (trip.trip_status !== "scheduled") {
      return json({ error: `Chuyến xe không thể đặt (trạng thái: ${trip.trip_status})` }, 409);
    }

    // ── Kiểm tra ghế còn trống ──
    const { data: tripSeats, error: seatErr } = await supabase
      .from("trip_seats")
      .select("id, seat_id, status")
      .eq("trip_id", trip_id)
      .in("seat_id", seat_ids);

    if (seatErr) return json({ error: seatErr.message }, 500);

    // Mỗi seat_id phải có trip_seat tương ứng
    if (tripSeats.length !== seat_ids.length) {
      const found = tripSeats.map((ts) => ts.seat_id);
      const missing = (seat_ids as string[]).filter((id) => !found.includes(id));
      return json({ error: `Ghế không thuộc chuyến này: ${missing.join(", ")}` }, 400);
    }

    const taken = tripSeats.filter((ts) => ts.status !== "available");
    if (taken.length > 0) {
      return json({ error: `Một số ghế đã được đặt. Vui lòng chọn lại.` }, 409);
    }

    // ── Sinh booking_code ──
    const bookingCode = `BK-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

    // ── Insert booking ──
    const { data: booking, error: bookingErr } = await supabase
      .from("bookings")
      .insert({
        booking_code: bookingCode,
        customer_id: resolvedCustomerId,
        trip_id,
        pickup_address: pickup_address.trim(),
        dropoff_address: dropoff_address.trim(),
        fare_amount: Number(fare_amount),
        booking_source: "manual",
        status: "pending",
      })
      .select()
      .single();

    if (bookingErr) return json({ error: bookingErr.message }, 500);

    // ── Cập nhật trip_seats: đánh dấu booked ──
    const tripSeatIds = tripSeats.map((ts) => ts.id);
    const { error: updateErr } = await supabase
      .from("trip_seats")
      .update({ status: "booked", booking_id: booking.id })
      .in("id", tripSeatIds);

    if (updateErr) {
      // Rollback booking
      await supabase.from("bookings").delete().eq("id", booking.id);
      return json({ error: updateErr.message }, 500);
    }

    // ── Ghi booking_status_log ──
    await supabase.from("booking_status_logs").insert({
      booking_id: booking.id,
      old_status: null,
      new_status: "pending",
    });

    return json({ booking }, 201);
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : "Unknown error" }, 500);
  }
});
