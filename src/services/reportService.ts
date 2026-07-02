import { supabase } from "../utils/supabase";

export interface ReportOverview {
  total_revenue: number;
  total_bookings: number;
  total_trips: number;
  avg_revenue_per_booking: number;
}

export interface VehiclePerformance {
  id: string;
  vehicle_name: string;
  plate_number: string;
  seat_count: number;
  total_trips: number;
  completed_trips: number;
  total_bookings: number;
  total_revenue: number;
  occupancy_rate: number;
}

function toRangeISO(start: Date, end: Date) {
  const s = new Date(start.getFullYear(), start.getMonth(), start.getDate(), 0, 0, 0, 0);
  const e = new Date(end.getFullYear(), end.getMonth(), end.getDate(), 23, 59, 59, 999);
  return { startISO: s.toISOString(), endISO: e.toISOString() };
}

export async function getReportOverview(
  start: Date,
  end: Date,
): Promise<ReportOverview> {
  const { startISO, endISO } = toRangeISO(start, end);

  const [tripsRes, bookingsRes] = await Promise.all([
    supabase
      .from("trips")
      .select("id", { count: "exact", head: true })
      .gte("planned_departure_time", startISO)
      .lte("planned_departure_time", endISO)
      .neq("trip_status", "cancelled"),
    supabase
      .from("bookings")
      .select("fare_amount, trip:trips!inner(planned_departure_time)")
      .gte("trips.planned_departure_time", startISO)
      .lte("trips.planned_departure_time", endISO)
      .neq("status", "cancelled"),
  ]);

  if (tripsRes.error) throw tripsRes.error;
  if (bookingsRes.error) throw bookingsRes.error;

  const totalRevenue = (bookingsRes.data ?? []).reduce(
    (sum, b) => sum + Number(b.fare_amount ?? 0),
    0,
  );
  const totalBookings = bookingsRes.data?.length ?? 0;
  const totalTrips = tripsRes.count ?? 0;

  return {
    total_revenue: totalRevenue,
    total_bookings: totalBookings,
    total_trips: totalTrips,
    avg_revenue_per_booking: totalBookings > 0
      ? Math.round(totalRevenue / totalBookings)
      : 0,
  };
}

export async function getVehiclePerformance(
  start: Date,
  end: Date,
): Promise<VehiclePerformance[]> {
  const { startISO, endISO } = toRangeISO(start, end);

  const [vehiclesRes, tripsRes] = await Promise.all([
    supabase
      .from("vehicles")
      .select("id, vehicle_name, plate_number, seat_count")
      .order("vehicle_name"),
    supabase
      .from("trips")
      .select("id, vehicle_id, trip_status")
      .gte("planned_departure_time", startISO)
      .lte("planned_departure_time", endISO)
      .neq("trip_status", "cancelled"),
  ]);

  if (vehiclesRes.error) throw vehiclesRes.error;
  if (tripsRes.error) throw tripsRes.error;

  const vehicles = vehiclesRes.data ?? [];
  const trips = tripsRes.data ?? [];
  const tripIds = trips.map((t) => t.id);

  let bookings: Array<{ trip_id: string; fare_amount: number | null }> = [];
  let tripSeatCounts: Record<string, number> = {};
  if (tripIds.length > 0) {
    const [bookingsRes, tripSeatsRes] = await Promise.all([
      supabase
        .from("bookings")
        .select("trip_id, fare_amount")
        .in("trip_id", tripIds)
        .neq("status", "cancelled"),
      supabase
        .from("trip_seats")
        .select("trip_id")
        .in("trip_id", tripIds)
        .eq("status", "booked"),
    ]);
    if (bookingsRes.error) throw bookingsRes.error;
    if (tripSeatsRes.error) throw tripSeatsRes.error;
    bookings = bookingsRes.data ?? [];
    (tripSeatsRes.data ?? []).forEach((ts) => {
      tripSeatCounts[ts.trip_id] = (tripSeatCounts[ts.trip_id] ?? 0) + 1;
    });
  }

  // Build lookup maps
  const tripsByVehicle: Record<string, typeof trips> = {};
  trips.forEach((t) => {
    if (!tripsByVehicle[t.vehicle_id]) tripsByVehicle[t.vehicle_id] = [];
    tripsByVehicle[t.vehicle_id].push(t);
  });

  const bookingsByTrip: Record<string, typeof bookings> = {};
  bookings.forEach((b) => {
    if (!bookingsByTrip[b.trip_id]) bookingsByTrip[b.trip_id] = [];
    bookingsByTrip[b.trip_id].push(b);
  });

  return vehicles.map((v) => {
    const vTrips = tripsByVehicle[v.id] ?? [];
    const completedTrips = vTrips.filter((t) => t.trip_status === "completed");

    let totalRevenue = 0;
    let totalBookings = 0;
    let totalBookedSeats = 0;

    vTrips.forEach((t) => {
      (bookingsByTrip[t.id] ?? []).forEach((b) => {
        totalRevenue += Number(b.fare_amount ?? 0);
        totalBookings += 1;
      });
      totalBookedSeats += tripSeatCounts[t.id] ?? 0;
    });

    const passengerSeats = v.seat_count - 1; // trừ ghế tài xế
    const maxSeats = completedTrips.length * passengerSeats;
    const occupancyRate = maxSeats > 0
      ? Math.min(100, Math.round((totalBookedSeats / maxSeats) * 100))
      : 0;

    return {
      id: v.id,
      vehicle_name: v.vehicle_name,
      plate_number: v.plate_number,
      seat_count: v.seat_count,
      total_trips: vTrips.length,
      completed_trips: completedTrips.length,
      total_bookings: totalBookings,
      total_revenue: totalRevenue,
      occupancy_rate: occupancyRate,
    };
  });
}
