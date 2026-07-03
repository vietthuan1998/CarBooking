// src/features/dispatch/types.ts

export type TripStatus =
  | "scheduled"
  | "in_progress"
  | "completed"
  | "cancelled";

export interface Route {
  id: string;
  route_name: string;
  origin: string;
  destination: string;
  base_price: number;
  status: string;
}

export interface Vehicle {
  id: string;
  vehicle_name: string;
  plate_number: string;
  seat_count: number;
  status: string;
}

export interface Driver {
  id: string;
  full_name: string;
  phone: string | null;
  status: string;
}

export interface Trip {
  id: string;
  trip_code: string;
  route_id: string;
  vehicle_id: string;
  driver_id: string | null;
  planned_departure_time: string;
  actual_departure_time: string | null;
  actual_arrival_time: string | null;
  trip_status: TripStatus;
  routes: Pick<Route, "id" | "route_name" | "origin" | "destination"> | null;
  vehicles:
    | Pick<Vehicle, "id" | "vehicle_name" | "plate_number" | "seat_count">
    | null;
}

export interface CreateTripInput {
  route_id: string;
  vehicle_id: string;
  planned_departure_time: string;
  trip_code?: string;
  // driver_id?: string; // TODO: bật lại khi có chức năng gán tài xế
}
