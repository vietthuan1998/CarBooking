import { HttpError } from "../../_shared/http.ts";

export interface ValidatedBookingRequest {
  /** Có booking_id = gán booking online pending vào chuyến (không tạo mới). */
  booking_id?: string;
  customer_id?: string;
  customer_name?: string;
  customer_phone?: string;
  customer_note?: string;
  trip_id: string;
  seat_ids: string[];
  pickup_address: string;
  dropoff_address: string;
  route_id: string;
}

export function validateBookingRequest(
  body: Partial<ValidatedBookingRequest>,
): ValidatedBookingRequest {
  const {
    booking_id,
    customer_id,
    customer_name,
    customer_phone,
    customer_note,
    trip_id,
    seat_ids,
    pickup_address,
    dropoff_address,
    route_id,
  } = body;

  if (booking_id !== undefined && typeof booking_id !== "string") {
    throw new HttpError(400, "booking_id không hợp lệ");
  }
  if (!trip_id) throw new HttpError(400, "Thiếu trip_id");
  if (!Array.isArray(seat_ids) || seat_ids.length === 0) {
    throw new HttpError(400, "seat_ids phải là mảng có ít nhất 1 phần tử");
  }
  if (!pickup_address?.trim()) throw new HttpError(400, "Thiếu pickup_address");
  if (!dropoff_address?.trim()) {
    throw new HttpError(400, "Thiếu dropoff_address");
  }
  if (!route_id) throw new HttpError(400, "Thiếu route_id");

  return {
    booking_id,
    customer_id,
    customer_name,
    customer_phone,
    customer_note,
    trip_id,
    seat_ids,
    pickup_address: pickup_address.trim(),
    dropoff_address: dropoff_address.trim(),
    route_id,
  };
}
