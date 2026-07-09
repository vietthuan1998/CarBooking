// supabase/functions/cancel-booking/index.ts
//
// Hủy booking (admin/staff): set status='cancelled' + nhả ghế đã giữ.
// Chặn hủy khi chuyến đã khởi hành (in_progress/completed) — coi như khách
// đã được đón. Cần service role vì đổi status booking + trip_seats phải đi
// cùng nhau (client không có transaction).
//
// Input (JSON body): { "booking_id": "uuid" }

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
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace(/^Bearer\s+/i, "");
    if (!token) return json({ error: "Thiếu Authorization token" }, 401);

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // ---- Xác thực người gọi: admin/staff active ----
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
      !["admin", "staff"].includes(callerProfile.role) ||
      callerProfile.status !== "active"
    ) {
      return json({ error: "Chỉ admin/staff mới có quyền hủy booking" }, 403);
    }

    // ---- Validate input ----
    const body = await req.json().catch(() => null);
    const bookingId = body?.booking_id;
    if (typeof bookingId !== "string" || !bookingId) {
      return json({ error: "Thiếu booking_id" }, 400);
    }

    // ---- Load booking + trạng thái chuyến (trip NULL = online chưa xếp xe) ----
    const { data: booking, error: bookingError } = await admin
      .from("bookings")
      .select("id, status, trip:trips(id, trip_status)")
      .eq("id", bookingId)
      .maybeSingle();
    if (bookingError) return json({ error: bookingError.message }, 500);
    if (!booking) return json({ error: "Booking không tồn tại" }, 404);

    if (booking.status === "cancelled") {
      return json({ error: "Booking đã được hủy trước đó" }, 409);
    }
    if (booking.status === "completed") {
      return json({ error: "Booking đã hoàn thành, không thể hủy" }, 409);
    }
    // Đã gắn chuyến mà chuyến khởi hành rồi = khách đã được đón → không cho hủy.
    // Chưa xếp xe (trip null) thì hủy tự do.
    const trip = booking.trip as unknown as { trip_status: string } | null;
    if (trip && trip.trip_status !== "scheduled") {
      return json(
        { error: "Chuyến đã khởi hành hoặc kết thúc — không thể hủy booking" },
        409,
      );
    }

    // ---- Hủy booking rồi nhả ghế (rollback thủ công nếu nhả ghế lỗi) ----
    const oldStatus = booking.status;
    const { error: updateError } = await admin
      .from("bookings")
      .update({ status: "cancelled" })
      .eq("id", bookingId);
    if (updateError) return json({ error: updateError.message }, 500);

    const { error: seatError } = await admin
      .from("trip_seats")
      .update({ status: "available", booking_id: null })
      .eq("booking_id", bookingId);
    if (seatError) {
      // Rollback trạng thái booking để không kẹt ghế booked của booking cancelled
      await admin
        .from("bookings")
        .update({ status: oldStatus })
        .eq("id", bookingId);
      return json({ error: seatError.message }, 500);
    }

    return json({ ok: true }, 200);
  } catch (err) {
    return json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      500,
    );
  }
});
