import type { SupabaseClient } from "jsr:@supabase/supabase-js@2";
import { HttpError, orThrow500 } from "../../_shared/http.ts";
import { generateBookingCode } from "../../_shared/bookingCode.ts";
import type { ValidatedBookingRequest } from "./validate.ts";

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

/** Bản ghi gốc của booking online chờ xếp xe — dùng để check + rollback. */
export interface PendingBookingRow {
  id: string;
  status: string;
  trip_id: string | null;
  route_id: string;
  pickup_address: string;
  dropoff_address: string;
  seat_count: number | null;
  fare_amount: number;
}

/** Load booking online chờ xếp xe: phải còn pending và chưa gắn chuyến. */
export async function loadPendingBooking(
  supabase: SupabaseClient,
  bookingId: string,
): Promise<PendingBookingRow> {
  const { data: booking, error } = await supabase
    .from("bookings")
    .select(
      "id, status, trip_id, route_id, pickup_address, dropoff_address, seat_count, fare_amount",
    )
    .eq("id", bookingId)
    .maybeSingle();

  orThrow500(error);
  if (!booking) throw new HttpError(404, "Booking không tồn tại");
  if (booking.status !== "pending" || booking.trip_id) {
    throw new HttpError(
      409,
      "Booking đã được xử lý hoặc đã xếp xe trước đó",
    );
  }
  return booking as PendingBookingRow;
}

/**
 * Gán booking online pending vào chuyến: chốt ghế thật cho khách đã đăng ký.
 * Điều kiện `status=pending AND trip_id IS NULL` lặp lại trong câu UPDATE
 * để chống race 2 staff cùng gán — người thua nhận 409.
 * Trigger trg_log_booking_status tự ghi log pending → confirmed.
 */
export async function assignBookingToTrip(
  supabase: SupabaseClient,
  bookingId: string,
  request: ValidatedBookingRequest,
  fareAmount: number,
) {
  const { data: booking, error } = await supabase
    .from("bookings")
    .update({
      trip_id: request.trip_id,
      route_id: request.route_id,
      pickup_address: request.pickup_address,
      dropoff_address: request.dropoff_address,
      seat_count: request.seat_ids.length,
      fare_amount: fareAmount,
      status: "confirmed",
    })
    .eq("id", bookingId)
    .eq("status", "pending")
    .is("trip_id", null)
    .select()
    .maybeSingle();

  orThrow500(error);
  if (!booking) {
    throw new HttpError(
      409,
      "Booking vừa được người khác xử lý — tải lại trang để xem trạng thái mới",
    );
  }
  return booking;
}

/** Trả booking về trạng thái gốc khi giữ ghế thất bại (rollback luồng gán). */
export async function revertBookingAssignment(
  supabase: SupabaseClient,
  original: PendingBookingRow,
): Promise<void> {
  await supabase
    .from("bookings")
    .update({
      trip_id: null,
      route_id: original.route_id,
      pickup_address: original.pickup_address,
      dropoff_address: original.dropoff_address,
      seat_count: original.seat_count,
      fare_amount: original.fare_amount,
      status: "pending",
    })
    .eq("id", original.id);
}

export async function markSeatsBooked(
  supabase: SupabaseClient,
  tripSeatIds: string[],
  bookingId: string,
  // Luồng tạo mới: xóa booking vừa insert. Luồng gán: trả booking về pending.
  rollback: () => Promise<void>,
): Promise<void> {
  const { error } = await supabase
    .from("trip_seats")
    .update({ status: "booked", booking_id: bookingId })
    .in("id", tripSeatIds);

  if (error) {
    await rollback();
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
