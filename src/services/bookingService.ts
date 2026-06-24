import { supabase } from "@/utils/supabase";

interface TripSeatResponse {
  seat_id: string;
  seats?: {
    seat_number: number;
  };
}

export interface Booking {
  id: string;
  user_id: string;
  trip_id: string;
  total_price: number;
  booking_status: "confirmed" | "pending" | "cancelled" | "completed";
  created_at: string;
  updated_at: string;
}

export interface BookingWithDetails extends Booking {
  trip?: {
    id: string;
    departure_time: string;
    arrival_time: string;
    fare_price: number;
    vehicle?: {
      plate_number: string;
      seat_count: number;
    };
    route?: {
      origin: string;
      destination: string;
    };
  };
  seats?: Array<{
    seat_number: number;
  }>;
}

/**
 * Create a new booking with selected seats
 */
export async function createBooking(
  userId: string,
  tripId: string,
  seatIds: string[],
  totalPrice: number,
): Promise<Booking> {
  try {
    // Start transaction: create booking
    const { data: bookingData, error: bookingError } = await supabase
      .from("bookings")
      .insert({
        user_id: userId,
        trip_id: tripId,
        total_price: totalPrice,
        booking_status: "confirmed",
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (bookingError) throw bookingError;

    // Add trip_seats records
    const tripSeatsRecords = seatIds.map((seatId) => ({
      trip_id: tripId,
      seat_id: seatId,
      booking_id: bookingData.id,
    }));

    const { error: tripSeatsError } = await supabase
      .from("trip_seats")
      .insert(tripSeatsRecords);

    if (tripSeatsError) throw tripSeatsError;

    return bookingData;
  } catch (error) {
    console.error("Error creating booking:", error);
    throw error;
  }
}

/**
 * Get all bookings for a user
 */
export async function getUserBookings(
  userId: string,
): Promise<BookingWithDetails[]> {
  try {
    const { data, error } = await supabase
      .from("bookings")
      .select(
        `
        *,
        trip:trips(
          *,
          vehicle:vehicles(*),
          route:routes(*)
        ),
        trip_seats(seat_id, seats(seat_number))
      `,
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Transform trip_seats structure
    return (data || []).map((booking) => ({
      ...booking,
      seats:
        booking.trip_seats?.map((ts) => ({
          seat_number: ts.seats?.seat_number,
        })) || [],
    }));
  } catch (error) {
    console.error("Error fetching user bookings:", error);
    throw error;
  }
}

/**
 * Get a single booking with details
 */
export async function getBookingDetails(
  bookingId: string,
): Promise<BookingWithDetails> {
  try {
    const { data, error } = await supabase
      .from("bookings")
      .select(
        `
        *,
        trip:trips(
          *,
          vehicle:vehicles(*),
          route:routes(*)
        ),
        trip_seats(seat_id, seats(seat_number))
      `,
      )
      .eq("id", bookingId)
      .single();

    if (error) throw error;

    return {
      ...data,
      seats:
        data.trip_seats?.map((ts: TripSeatResponse) => ({
          seat_number: ts.seats?.seat_number,
        })) || [],
    };
  } catch (error) {
    console.error("Error fetching booking details:", error);
    throw error;
  }
}

/**
 * Cancel a booking
 */
export async function cancelBooking(bookingId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from("bookings")
      .update({
        booking_status: "cancelled",
        updated_at: new Date().toISOString(),
      })
      .eq("id", bookingId);

    if (error) throw error;
  } catch (error) {
    console.error("Error cancelling booking:", error);
    throw error;
  }
}

/**
 * Get trip seats with booking info
 */
export async function getTripSeatsWithBookings(tripId: string) {
  try {
    const { data, error } = await supabase
      .from("trip_seats")
      .select(
        `
        seat_id,
        seat:seats(seat_number),
        booking:bookings(id, user_id, booking_status)
      `,
      )
      .eq("trip_id", tripId);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching trip seats:", error);
    throw error;
  }
}
