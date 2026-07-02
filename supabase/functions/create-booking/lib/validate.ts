import { HttpError } from "./http.ts";

export interface ValidatedBookingRequest {
  customer_id?: string;
  customer_name?: string;
  customer_phone?: string;
  customer_note?: string;
  trip_id: string;
  seat_ids: string[];
  pickup_address: string;
  dropoff_address: string;
  fare_amount: number;
}

// deno-lint-ignore no-explicit-any
export function validateBookingRequest(body: any): ValidatedBookingRequest {
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

  if (!trip_id) throw new HttpError(400, "Thiếu trip_id");
  if (!Array.isArray(seat_ids) || seat_ids.length === 0) {
    throw new HttpError(400, "seat_ids phải là mảng có ít nhất 1 phần tử");
  }
  if (!pickup_address?.trim()) throw new HttpError(400, "Thiếu pickup_address");
  if (!dropoff_address?.trim()) throw new HttpError(400, "Thiếu dropoff_address");
  if (fare_amount == null || isNaN(Number(fare_amount)) || Number(fare_amount) < 0) {
    throw new HttpError(400, "fare_amount không hợp lệ");
  }

  return {
    customer_id,
    customer_name,
    customer_phone,
    customer_note,
    trip_id,
    seat_ids,
    pickup_address: pickup_address.trim(),
    dropoff_address: dropoff_address.trim(),
    fare_amount: Number(fare_amount),
  };
}
