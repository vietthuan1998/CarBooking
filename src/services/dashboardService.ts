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
      .eq("trip_status", "in_progress")
      .gte("planned_departure_time", startISO)
      .lte("planned_departure_time", endISO),

    supabase
      .from("trips")
      .select("id", { count: "exact", head: true })
      .in("trip_status", ["scheduled"])
      .gte("planned_departure_time", startISO)
      .lte("planned_departure_time", endISO),

    // Lọc theo requested_departure_time (không join trips): booking online
    // từ landing chưa được xếp xe nên trip_id NULL, join inner sẽ bỏ sót.
    supabase
      .from("bookings")
      .select("id")
      .neq("status", "cancelled")
      .gte("requested_departure_time", startISO)
      .lte("requested_departure_time", endISO),

    supabase
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending")
      .gte("requested_departure_time", startISO)
      .lte("requested_departure_time", endISO),
  ]);

  if (totalTripsResult.error) throw totalTripsResult.error;
  if (runningTripsResult.error) throw runningTripsResult.error;
  if (upcomingTripsResult.error) throw upcomingTripsResult.error;
  if (bookingsTodayResult.error) throw bookingsTodayResult.error;
  if (pendingBookingsResult.error) throw pendingBookingsResult.error;

  const totalCustomers = bookingsTodayResult.data?.length ?? 0;

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
    .in("trip_status", ["scheduled"])
    .gte("planned_departure_time", startISO)
    .lte("planned_departure_time", endISO)
    .order("planned_departure_time", { ascending: true })
    .limit(3);

  if (error) throw error;

  return data as unknown as UpcomingTrip[];
}

export async function getRunningTrips(date: Date): Promise<RunningTrip[]> {
  const { startISO, endISO } = getDayRange(date);

  // trips không còn cột driver_id (migration 20260708120000) — tài xế của
  // chuyến suy ra từ chủ xe (vehicles.driver_id), nên embed driver qua vehicle.
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
        vehicle_name,
        driver:profiles (
          full_name,
          phone
        )
      )
    `,
    )
    .eq("trip_status", "in_progress")
    .gte("planned_departure_time", startISO)
    .lte("planned_departure_time", endISO)
    .order("planned_departure_time", { ascending: true })
    .limit(2);

  if (error) throw error;

  type Row = Omit<RunningTrip, "driver" | "vehicle"> & {
    vehicle:
      | (NonNullable<RunningTrip["vehicle"]> & {
          driver: RunningTrip["driver"];
        })
      | null;
  };

  return ((data as unknown as Row[]) ?? []).map(({ vehicle, ...trip }) => ({
    ...trip,
    vehicle: vehicle
      ? {
          id: vehicle.id,
          plate_number: vehicle.plate_number,
          vehicle_name: vehicle.vehicle_name,
        }
      : null,
    driver: vehicle?.driver ?? null,
  }));
}

/** Khách trong ngày (pending trước, confirmed sau) theo requested_departure_time. */
export async function getPendingBookings2(date: Date) {
  const { startISO, endISO } = getDayRange(date);
  try {
    const { data, error } = await supabase.functions.invoke(
      "get-pending-bookings",
      {
        body: { start: startISO, end: endISO },
      },
    );
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching pending bookings:", error);
    throw error;
  }
}

