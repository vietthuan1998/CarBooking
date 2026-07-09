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
//   "route_id": "uuid"                // tuyến cụ thể khách chọn (VD: Huế -> Hội An),
//                                      // fare_amount = routes.base_price * số ghế
// }

import { createClient } from "jsr:@supabase/supabase-js@2";
import { corsHeaders, HttpError, json } from "./lib/http.ts";
import { validateBookingRequest } from "./lib/validate.ts";
import { resolveCustomerId } from "./lib/customer.ts";
import { assertTripBookable, getAvailableTripSeats } from "./lib/trip.ts";
import { resolveBookingRoute } from "./lib/route.ts";
import {
  insertBooking,
  logBookingCreated,
  markSeatsBooked,
} from "./lib/booking.ts";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const body = await req.json().catch(() => null);
    if (!body) return json({ error: "Request body không hợp lệ" }, 400);
    const request = validateBookingRequest(body);

    const customerId = await resolveCustomerId(supabase, request);

    const trip = await assertTripBookable(supabase, request.trip_id);
    const tripSeats = await getAvailableTripSeats(
      supabase,
      request.trip_id,
      request.seat_ids,
    );
    const route = await resolveBookingRoute(supabase, request.route_id, trip);

    const fareAmount = Number(route.base_price) * request.seat_ids.length;
    const booking = await insertBooking(
      supabase,
      request,
      customerId,
      fareAmount,
      trip.planned_departure_time,
    );

    await markSeatsBooked(supabase, tripSeats.map((ts) => ts.id), booking.id);
    await logBookingCreated(supabase, booking.id);

    return json({ booking }, 201);
  } catch (err) {
    if (err instanceof HttpError) {
      return json({ error: err.message }, err.status);
    }
    return json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      500,
    );
  }
});
