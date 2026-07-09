import type { SupabaseClient } from "jsr:@supabase/supabase-js@2";
import { HttpError, orThrow500 } from "./http.ts";
import type { ValidatedBookingRequest } from "./validate.ts";

function generateBookingCode(): string {
  return `BK-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

export async function insertBooking(
  supabase: SupabaseClient,
  request: ValidatedBookingRequest,
  customerId: string,
  fareAmount: number,
  plannedDepartureTime: string,
) {
  const { data: booking, error } = await supabase
    .from("bookings")
    .insert({
      booking_code: generateBookingCode(),
      customer_id: customerId,
      trip_id: request.trip_id,
      route_id: request.route_id,
      // = giờ chuyến, để dashboard lọc "khách trong ngày" trên 1 cột chung
      // với booking online (vốn không có trip)
      requested_departure_time: plannedDepartureTime,
      pickup_address: request.pickup_address,
      dropoff_address: request.dropoff_address,
      fare_amount: fareAmount,
      seat_count: request.seat_ids.length,
      booking_source: "manual",
      // Staff đặt ghế trực tiếp = đã chốt với khách → confirmed luôn.
      // Booking pending chỉ đến từ khách tự đăng ký (edge fn register-booking).
      status: "confirmed",
    })
    .select()
    .single();

  orThrow500(error);
  return booking;
}

export async function markSeatsBooked(
  supabase: SupabaseClient,
  tripSeatIds: string[],
  bookingId: string,
): Promise<void> {
  const { error } = await supabase
    .from("trip_seats")
    .update({ status: "booked", booking_id: bookingId })
    .in("id", tripSeatIds);

  if (error) {
    // Rollback booking
    await supabase.from("bookings").delete().eq("id", bookingId);
    throw new HttpError(500, error.message);
  }
}

export async function logBookingCreated(
  supabase: SupabaseClient,
  bookingId: string,
): Promise<void> {
  await supabase.from("booking_status_logs").insert({
    booking_id: bookingId,
    old_status: null,
    new_status: "confirmed",
  });
}
