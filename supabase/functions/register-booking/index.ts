// supabase/functions/register-booking/index.ts
//
// Function CÔNG KHAI (verify_jwt=false) cho Landing Page: khách tự đăng ký
// chuyến với NGÀY GIỜ mong muốn tự do — không chọn chuyến có sẵn. Booking
// tạo ra: status='pending', source='online', trip_id=NULL (chưa xếp xe),
// requested_departure_time = giờ khách muốn đi. Staff xem dashboard, gọi
// xác nhận rồi xếp xe/đặt ghế thật trên trang Bookings.
//
// POST body (JSON):
// { "route_id": "uuid", "requested_departure_time": "ISO datetime",
//   "seat_count": 1..7, "customer_name": "...", "customer_phone": "...",
//   "note"?: "...", "pickup_address"?: "...", "dropoff_address"?: "..." }
// → { booking_code }

import { createAdminClient } from "../_shared/adminClient.ts";

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

function str(v: unknown, maxLen: number): string {
  return typeof v === "string" ? v.trim().slice(0, maxLen) : "";
}

function generateBookingCode(): string {
  return `BK-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const admin = createAdminClient();

    const body = await req.json().catch(() => null);
    if (!body) return json({ error: "Request body không hợp lệ" }, 400);

    const routeId = str(body.route_id, 64);
    const requestedTime = str(body.requested_departure_time, 40);
    const name = str(body.customer_name, 120);
    const phone = str(body.customer_phone, 20).replace(/[\s.-]/g, "");
    const note = str(body.note, 500);
    const pickup = str(body.pickup_address, 300);
    const dropoff = str(body.dropoff_address, 300);
    const seatCount = Number(body.seat_count);

    if (!routeId) return json({ error: "Vui lòng chọn tuyến đi" }, 400);
    if (!name) return json({ error: "Vui lòng nhập họ và tên" }, 400);
    if (!/^\d{9,11}$/.test(phone)) {
      return json({ error: "Số điện thoại không hợp lệ" }, 400);
    }
    if (!Number.isInteger(seatCount) || seatCount < 1 || seatCount > 7) {
      return json({ error: "Số ghế không hợp lệ" }, 400);
    }
    const departure = new Date(requestedTime);
    if (Number.isNaN(departure.getTime())) {
      return json({ error: "Ngày giờ đi không hợp lệ" }, 400);
    }
    if (departure.getTime() <= Date.now()) {
      return json({ error: "Ngày giờ đi phải ở tương lai" }, 400);
    }
    // Chặn đăng ký quá xa (>60 ngày) — form public, tránh dữ liệu rác
    if (departure.getTime() > Date.now() + 60 * 24 * 60 * 60 * 1000) {
      return json({ error: "Chỉ nhận đăng ký trong vòng 60 ngày tới" }, 400);
    }

    const { data: route, error: routeError } = await admin
      .from("routes")
      .select("id, base_price, status")
      .eq("id", routeId)
      .maybeSingle();
    if (routeError) return json({ error: routeError.message }, 500);
    if (!route || route.status !== "active") {
      return json({ error: "Tuyến không tồn tại hoặc đã ngừng khai thác" }, 404);
    }

    // ---- Khách: khớp theo phone. KHÔNG overwrite tên khách cũ (form public,
    // ai cũng gọi được — tránh phá dữ liệu khách có sẵn) ----
    const { data: existing, error: findError } = await admin
      .from("customers")
      .select("id")
      .eq("phone", phone)
      .maybeSingle();
    if (findError) return json({ error: findError.message }, 500);

    let customerId = existing?.id;
    if (!customerId) {
      const { data: created, error: createError } = await admin
        .from("customers")
        .insert({ phone, full_name: name })
        .select("id")
        .single();
      if (createError) return json({ error: createError.message }, 500);
      customerId = created.id;
    }

    const bookingCode = generateBookingCode();
    const { error: insertError } = await admin.from("bookings").insert({
      booking_code: bookingCode,
      customer_id: customerId,
      trip_id: null, // staff xếp xe sau dựa vào requested_departure_time
      route_id: routeId,
      requested_departure_time: departure.toISOString(),
      pickup_address: pickup,
      dropoff_address: dropoff,
      fare_amount: Number(route.base_price) * seatCount,
      seat_count: seatCount,
      note: note || null,
      booking_source: "online",
      status: "pending",
    });
    if (insertError) return json({ error: insertError.message }, 500);

    return json({ booking_code: bookingCode }, 201);
  } catch (err) {
    return json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      500,
    );
  }
});
