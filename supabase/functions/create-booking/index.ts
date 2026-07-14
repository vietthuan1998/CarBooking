// supabase/functions/create-booking/index.ts
//
// Tạo booking nguyên tử: upsert customer → insert booking → cập nhật trip_seats.
//
// Input (JSON body):
// {
//   "booking_id": "uuid",            // GÁN booking online pending vào chuyến
//                                     //   (bỏ qua customer_* — khách đã có sẵn)
//   // HOẶC tạo booking mới:
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
//   "route_id": "uuid"                // tuyến cụ thể khách chọn (VD: Huế -> Hội An),
//                                      // fare_amount = routes.base_price * số ghế
// }

import { createAdminClient } from "../_shared/adminClient.ts";
import { verifyCaller } from "../_shared/verifyCaller.ts";
import { json, servePost } from "../_shared/http.ts";
import { notifyTripDriver } from "../_shared/push.ts";
import { validateBookingRequest } from "./lib/validate.ts";
import { resolveCustomerId } from "./lib/customer.ts";
import { assertTripBookable, getAvailableTripSeats } from "./lib/trip.ts";
import { resolveBookingRoute } from "./lib/route.ts";
import {
  assignBookingToTrip,
  insertBooking,
  loadPendingBooking,
  logBookingCreated,
  markSeatsBooked,
  revertBookingAssignment,
} from "./lib/booking.ts";

servePost(async (req: Request) => {
  const supabase = createAdminClient();

  // Service role bypass RLS → phải tự chặn người gọi không phải admin/staff.
  const caller = await verifyCaller(
    req,
    supabase,
    ["admin", "staff"],
    "Chỉ admin/staff mới có quyền đặt vé",
  );
  if (!caller.ok) return json({ error: caller.message }, caller.status);

  const body = await req.json().catch(() => null);
  if (!body) return json({ error: "Request body không hợp lệ" }, 400);
  const request = validateBookingRequest(body);

  const trip = await assertTripBookable(supabase, request.trip_id);
  const tripSeats = await getAvailableTripSeats(
    supabase,
    request.trip_id,
    request.seat_ids,
  );
  const route = await resolveBookingRoute(supabase, request.route_id, trip);

  const fareAmount = Number(route.base_price) * request.seat_ids.length;
  const tripSeatIds = tripSeats.map((ts) => ts.id);

  // ---- Luồng GÁN: booking online pending đã có khách, chỉ chốt chuyến + ghế ----
  if (request.booking_id) {
    const original = await loadPendingBooking(supabase, request.booking_id);
    const booking = await assignBookingToTrip(
      supabase,
      request.booking_id,
      request,
      fareAmount,
    );
    await markSeatsBooked(
      supabase,
      tripSeatIds,
      booking.id,
      () => revertBookingAssignment(supabase, original),
    );
    // Không log tay: trigger trg_log_booking_status đã ghi pending → confirmed.
    await notifyTripDriver(supabase, request.trip_id, {
      title: "Có khách mới trên chuyến của bạn",
      body:
        `${trip.trip_code}: ${request.seat_ids.length} ghế vừa được đặt (khách online).`,
    });
    return json({ booking }, 200);
  }

  // ---- Luồng TẠO MỚI ----
  const customerId = await resolveCustomerId(supabase, request);
  const booking = await insertBooking(
    supabase,
    request,
    customerId,
    fareAmount,
    trip.planned_departure_time,
  );

  await markSeatsBooked(supabase, tripSeatIds, booking.id, async () => {
    await supabase.from("bookings").delete().eq("id", booking.id);
  });
  await logBookingCreated(supabase, booking.id);

  await notifyTripDriver(supabase, request.trip_id, {
    title: "Có khách mới trên chuyến của bạn",
    body: `${trip.trip_code}: ${request.seat_ids.length} ghế vừa được đặt.`,
  });

  return json({ booking }, 201);
});
