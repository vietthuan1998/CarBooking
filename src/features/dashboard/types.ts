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
    plate_number: string;
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
  pickup_address: string;
  dropoff_address: string;
  fare_amount: number;
  // Số ghế khách muốn + ghi chú lần đặt (booking online từ landing page)
  seat_count: number | null;
  note: string | null;
  status: string;
  booking_source: string;
  // Giờ khách muốn đi (online) hoặc giờ chuyến (staff đặt) — cột lọc chung
  requested_departure_time: string | null;
  created_at: string | null;
  customer: {
    full_name: string;
    phone: string;
  } | null;
  route: {
    route_name: string;
    origin: string;
    destination: string;
  } | null;
  // NULL khi booking online chưa được xếp xe
  trip: {
    trip_code: string;
    trip_status: string;
  } | null;
};