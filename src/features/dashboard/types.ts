// src/features/dashboard/types.ts

export type DashboardStats = {
  totalTrips: number;
  runningTrips: number;
  upcomingTrips: number;
  totalCustomers: number;
  pendingBookings: number;
};

export type UpcomingTrip = {
  id: string;
  trip_code: string;
  planned_departure_time: string;
  trip_status: string;
  route: {
    route_name: string;
    origin: string;
    destination: string;
  } | null;
  vehicle: {
    seat_count: number;
  } | null;
  trip_seats: {
    status: string;
  }[];
};

export type RunningTrip = {
  id: string;
  trip_code: string;
  planned_departure_time: string;
  trip_status: string;
  route: {
    route_name: string;
    origin: string;
    destination: string;
  } | null;
  vehicle: {
    id: string;
    plate_number: string;
    vehicle_name: string;
  } | null;
  driver: {
    full_name: string;
    phone: string | null;
  } | null;
};

export type PendingBooking = {
  id: string;
  booking_code: string;
  seat_count: number;
  pickup_address: string;
  dropoff_address: string;
  fare_amount: number;
  status: string;
  created_at: string | null;
  customer: {
    full_name: string;
    phone: string;
  } | null;
  trip: {
    planned_departure_time: string;
    route: {
      route_name: string;
      origin: string;
      destination: string;
    } | null;
  } | null;
};