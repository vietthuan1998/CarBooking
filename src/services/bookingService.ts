import { supabase } from "@/utils/supabase";

export interface Booking {
  id: string;
  booking_code: string;
  customer_id: string;
  trip_id: string;
  pickup_address: string;
  dropoff_address: string;
  fare_amount: number;
  booking_source: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
}

export interface BookingWithDetails extends Booking {
  customer?: {
    id: string;
    full_name: string;
    phone: string;
    note?: string;
  };
  trip?: {
    id: string;
    trip_code: string;
    planned_departure_time: string;
    trip_status: string;
    vehicle?: { plate_number: string; vehicle_name: string; seat_count: number };
    route?: { route_name: string; origin: string; destination: string };
  };
  trip_seats?: Array<{
    seat_id: string;
    seat?: { seat_code: string; seat_order: number };
  }>;
}

export async function getUserBookings(customerId: string): Promise<BookingWithDetails[]> {
  const { data, error } = await supabase
    .from("bookings")
    .select(`
      *,
      customer:customers(id, full_name, phone, note),
      trip:trips(id, trip_code, planned_departure_time, trip_status,
        vehicle:vehicles(plate_number, vehicle_name, seat_count),
        route:routes(route_name, origin, destination)
      ),
      trip_seats(seat_id, seat:seats(seat_code, seat_order))
    `)
    .eq("customer_id", customerId)
    .order("id", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function cancelBooking(bookingId: string): Promise<void> {
  const { error } = await supabase
    .from("bookings")
    .update({ status: "cancelled" })
    .eq("id", bookingId);

  if (error) throw error;
}

export interface TripSeatRow {
  id: string;
  seat_id: string;
  status: "available" | "locked" | "booked";
  booking_id: string | null;
  seat: { id: string; seat_code: string; seat_order: number } | null;
}

export async function getTripSeatsWithBookings(tripId: string): Promise<TripSeatRow[]> {
  const { data, error } = await supabase
    .from("trip_seats")
    .select("id, seat_id, status, booking_id, seat:seats(id, seat_code, seat_order)")
    .eq("trip_id", tripId)
    .order("seat_id");

  if (error) throw error;
  return (data ?? []) as unknown as TripSeatRow[];
}
