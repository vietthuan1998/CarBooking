import { supabase } from "@/utils/supabase";

export interface Trip {
  id: string;
  vehicle_id: string;
  route_id: string;
  driver_id: string | null;
  departure_time: string;
  arrival_time: string;
  fare_price: number;
  available_seats: number;
  trip_status: "scheduled" | "in_transit" | "completed" | "cancelled";
  created_at: string;
  // With joined data
  vehicle?: {
    id: string;
    plate_number: string;
    seat_count: number;
  };
  route?: {
    id: string;
    origin: string;
    destination: string;
  };
}

export interface TripWithSeats extends Trip {
  seats: SeatInfo[];
  booked_seats: number;
}

export interface SeatInfo {
  seat_number: number;
  is_available: boolean;
  booking_id?: string;
}

/**
 * Fetch available trips for a specific route and date
 */
export async function fetchTrips(routeId: string, departureDate: string) {
  try {
    const { data, error } = await supabase
      .from("trips")
      .select(
        `
        *,
        vehicle:vehicles(*),
        route:routes(*)
      `,
      )
      .eq("route_id", routeId)
      .eq("trip_status", "scheduled")
      .gte("departure_time", `${departureDate}T00:00:00`)
      .lt("departure_time", `${departureDate}T23:59:59`)
      .order("departure_time", { ascending: true });

    if (error) throw error;
    return data as TripWithSeats[];
  } catch (error) {
    console.error("Error fetching trips:", error);
    throw error;
  }
}

/**
 * Get a single trip with all seat information
 */
export async function getTripDetails(tripId: string): Promise<TripWithSeats> {
  try {
    // Get trip info
    const { data: tripData, error: tripError } = await supabase
      .from("trips")
      .select(
        `
        *,
        vehicle:vehicles(*),
        route:routes(*)
      `,
      )
      .eq("id", tripId)
      .single();

    if (tripError) throw tripError;

    // Get all seats for the vehicle
    const { data: seatsData, error: seatsError } = await supabase
      .from("seats")
      .select("*")
      .eq("vehicle_id", tripData.vehicle_id)
      .order("seat_number", { ascending: true });

    if (seatsError) throw seatsError;

    // Get booked seats for this trip
    const { data: bookingsData, error: bookingsError } = await supabase
      .from("trip_seats")
      .select("seat_id, bookings(id)")
      .eq("trip_id", tripId)
      .neq("bookings", null);

    if (bookingsError) throw bookingsError;

    const bookedSeatIds = new Set(bookingsData?.map((b) => b.seat_id) || []);

    const seats: SeatInfo[] = seatsData.map((seat) => ({
      seat_number: seat.seat_number,
      is_available: !bookedSeatIds.has(seat.id),
      booking_id: bookedSeatIds.has(seat.id) ? "booked" : undefined,
    }));

    const booked_seats =
      seatsData.length - seats.filter((s) => s.is_available).length;

    return {
      ...tripData,
      seats,
      booked_seats,
    };
  } catch (error) {
    console.error("Error fetching trip details:", error);
    throw error;
  }
}

/**
 * Fetch all routes (origin-destination pairs)
 */
export async function fetchRoutes() {
  try {
    const { data, error } = await supabase
      .from("routes")
      .select("*")
      .order("origin", { ascending: true });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching routes:", error);
    throw error;
  }
}

/**
 * Get route by ID
 */
export async function getRoute(routeId: string) {
  try {
    const { data, error } = await supabase
      .from("routes")
      .select("*")
      .eq("id", routeId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching route:", error);
    throw error;
  }
}
