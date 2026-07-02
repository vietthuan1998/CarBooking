import { supabase } from "../utils/supabase";

import type {
  DashboardStats,
  RunningTrip,
  // PendingBooking,
  UpcomingTrip,
} from "../features/dashboard/types";
function getDayRange(date: Date) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);

  const end = new Date(date);
  end.setHours(23, 59, 59, 999);

  return {
    startISO: start.toISOString(),
    endISO: end.toISOString(),
  };
}

export async function getDashboardStats(date: Date): Promise<DashboardStats> {
  const { startISO, endISO } = getDayRange(date);

  const [
    totalTripsResult,
    runningTripsResult,
    upcomingTripsResult,
    bookingsTodayResult,
    pendingBookingsResult,
  ] = await Promise.all([
    supabase
      .from("trips")
      .select("id", { count: "exact", head: true })
      .gte("planned_departure_time", startISO)
      .lte("planned_departure_time", endISO),

    supabase
      .from("trips")
      .select("id", { count: "exact", head: true })
      .eq("trip_status", "running")
      .gte("planned_departure_time", startISO)
      .lte("planned_departure_time", endISO),

    supabase
      .from("trips")
      .select("id", { count: "exact", head: true })
      .in("trip_status", ["scheduled", "waiting"])
      .gte("planned_departure_time", startISO)
      .lte("planned_departure_time", endISO),

    supabase
      .from("bookings")
      .select(
        `
        seat_count,
        trip:trips!inner (
          planned_departure_time
        )
      `,
      )
      .neq("status", "cancelled")
      .gte("trips.planned_departure_time", startISO)
      .lte("trips.planned_departure_time", endISO),

    supabase
      .from("bookings")
      .select(
        `
        id,
        trip:trips!inner (
          planned_departure_time
        )
      `,
        { count: "exact", head: true },
      )
      .eq("status", "pending")
      .gte("trips.planned_departure_time", startISO)
      .lte("trips.planned_departure_time", endISO),
  ]);

  if (totalTripsResult.error) throw totalTripsResult.error;
  if (runningTripsResult.error) throw runningTripsResult.error;
  if (upcomingTripsResult.error) throw upcomingTripsResult.error;
  if (bookingsTodayResult.error) throw bookingsTodayResult.error;
  if (pendingBookingsResult.error) throw pendingBookingsResult.error;

  const totalCustomers = bookingsTodayResult.data?.reduce((sum, booking) => {
    return sum + Number(booking.seat_count || 0);
  }, 0) ?? 0;

  return {
    totalTrips: totalTripsResult.count ?? 0,
    runningTrips: runningTripsResult.count ?? 0,
    upcomingTrips: upcomingTripsResult.count ?? 0,
    totalCustomers,
    pendingBookings: pendingBookingsResult.count ?? 0,
  };
}

export async function getUpcomingTrips(date: Date): Promise<UpcomingTrip[]> {
  const { startISO, endISO } = getDayRange(date);

  const { data, error } = await supabase
    .from("trips")
    .select(
      `
      id,
      trip_code,
      planned_departure_time,
      trip_status,
      route:routes (
        route_name,
        origin,
        destination
      ),
      vehicle:vehicles (
        plate_number,
        seat_count
      ),
      trip_seats (
        status
      )
    `,
    )
    .in("trip_status", ["scheduled", "waiting"])
    .gte("planned_departure_time", startISO)
    .lte("planned_departure_time", endISO)
    .order("planned_departure_time", { ascending: true })
    .limit(3);

  if (error) throw error;

  return data as unknown as UpcomingTrip[];
}

export async function getRunningTrips(date: Date): Promise<RunningTrip[]> {
  const { startISO, endISO } = getDayRange(date);

  const { data, error } = await supabase
    .from("trips")
    .select(
      `
      id,
      trip_code,
      planned_departure_time,
      trip_status,
      route:routes (
        route_name,
        origin,
        destination
      ),
      vehicle:vehicles (
        id,
        plate_number,
        vehicle_name
      ),
      driver:profiles (
        full_name,
        phone
      )
    `,
    )
    .eq("trip_status", "running")
    .gte("planned_departure_time", startISO)
    .lte("planned_departure_time", endISO)
    .order("planned_departure_time", { ascending: true })
    .limit(2);

  if (error) throw error;

  return data as unknown as RunningTrip[];
}

export async function getPendingBookings2() {
  try {
    const { data, error } = await supabase.functions.invoke(
      "getPendingBookings",
      {
        body: { name: "Functions" },
      },
    );
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching pending bookings:", error);
    throw error;
  }
}

export async function getPendingBookings() {
  const { data, error } = await supabase
    .from("bookings")
    .select(
      `
      id,
      booking_code,
      seat_count,
      pickup_address,
      dropoff_address,
      fare_amount,
      status,
      created_at,
      customer:customers (
        id,
        full_name,
        phone,
        note
      ),
      trip:trips (
        id,
        trip_code,
        planned_departure_time,
        trip_status,
        route:routes (
          id,
          route_name,
          origin,
          destination
        )
      )
    `,
    )
    .in("status", ["pending", "NEW"])
    .limit(10);

  if (error) throw error;

  return data ?? [];
}
