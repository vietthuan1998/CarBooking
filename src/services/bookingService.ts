import axios from "axios";
import { supabase } from "@/utils/supabase";
import { edgeFunctionClient } from "@/utils/axiosClient";
import type { Customer, Route, Trip } from "@/features/booking/types";

export interface TripSeatRow {
  id: string;
  seat_id: string;
  status: "available" | "locked" | "booked";
  booking_id: string | null;
  seat: { id: string; seat_code: string; seat_order: number } | null;
  booking: {
    id: string;
    booking_code: string;
    pickup_address: string;
    dropoff_address: string;
    status: string;
    fare_amount: number;
    customer: { full_name: string; phone: string } | null;
  } | null;
}

export async function getTripSeatsWithBookings(tripId: string): Promise<TripSeatRow[]> {
  const { data, error } = await supabase
    .from("trip_seats")
    .select(`
      id, seat_id, status, booking_id,
      seat:seats(id, seat_code, seat_order),
      booking:bookings(id, booking_code, pickup_address, dropoff_address, status, fare_amount,
        customer:customers(full_name, phone)
      )
    `)
    .eq("trip_id", tripId)
    .order("seat_id");

  if (error) throw error;
  return (data ?? []) as unknown as TripSeatRow[];
}

// Danh sách tuyến active (kèm base_price) để khách chọn tuyến cụ thể lúc đặt vé.
export async function getActiveRoutes(): Promise<Route[]> {
  const { data, error } = await supabase
    .from("routes")
    .select("id, route_name, origin, destination, base_price")
    .eq("status", "active")
    .order("route_name");
  if (error) throw error;
  return (data ?? []) as unknown as Route[];
}

export async function getTripsByDate(
  date: string,
  trip_status?: "scheduled" | "in_progress" | "completed" | "cancelled",
): Promise<Trip[]> {
  // Build local-time day boundaries → UTC for Supabase timestamptz
  const d = new Date(`${date}T00:00:00`);
  const dayStart = new Date(
    d.getFullYear(),
    d.getMonth(),
    d.getDate(),
    0,
    0,
    0,
    0,
  ).toISOString();
  const dayEnd = new Date(
    d.getFullYear(),
    d.getMonth(),
    d.getDate(),
    23,
    59,
    59,
    999,
  ).toISOString();

  let query = supabase
    .from("trips")
    .select(
      `id, trip_code, planned_departure_time, trip_status,
       vehicle:vehicles(id, plate_number, vehicle_name, seat_count),
       route:routes(route_name, origin, destination)`,
    )
    .gte("planned_departure_time", dayStart)
    .lte("planned_departure_time", dayEnd)
    .order("planned_departure_time");

  if (trip_status) {
    query = query.eq("trip_status", trip_status);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as unknown as Trip[];
}

export async function searchCustomers(
  query: string,
  limit = 6,
): Promise<Customer[]> {
  const { data, error } = await supabase
    .from("customers")
    .select("id, full_name, phone, note")
    .or(`full_name.ilike.%${query}%,phone.ilike.%${query}%`)
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

/** Autocomplete ô SĐT trong form đặt vé: chỉ khớp theo số điện thoại. */
export async function searchCustomersByPhone(
  query: string,
  limit = 5,
): Promise<Customer[]> {
  const { data, error } = await supabase
    .from("customers")
    .select("id, full_name, phone, note")
    .ilike("phone", `%${query}%`)
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export interface CreateBookingInput {
  // Khách mới: name/phone/note. Khách đã có: customer_id.
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

// Đặt vé qua Edge Function (upsert customer + check ghế + insert booking
// nguyên tử ở server). Ném Error với message tiếng Việt từ server nếu lỗi.
export async function createBooking(input: CreateBookingInput): Promise<void> {
  try {
    await edgeFunctionClient.post("/create-booking", input);
  } catch (err: unknown) {
    throw new Error(edgeErrorMessage(err), { cause: err });
  }
}

// Hủy booking qua Edge Function (đổi status + nhả ghế phải đi cùng nhau).
// Server chặn hủy khi chuyến đã khởi hành (khách đã được đón) — trả 409.
export async function cancelBooking(bookingId: string): Promise<void> {
  try {
    await edgeFunctionClient.post("/cancel-booking", { booking_id: bookingId });
  } catch (err: unknown) {
    throw new Error(edgeErrorMessage(err), { cause: err });
  }
}

function edgeErrorMessage(err: unknown): string {
  return axios.isAxiosError(err)
    ? (err.response?.data?.error ?? err.message)
    : err instanceof Error
    ? err.message
    : "Có lỗi xảy ra";
}
