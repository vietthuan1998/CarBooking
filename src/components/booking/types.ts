export interface Vehicle {
  id: string;
  plate_number: string;
  vehicle_name: string;
  seat_count: number;
}

export interface Seat {
  id: string;
  seat_code: string;
  seat_order: number;
}

export interface Trip {
  id: string;
  trip_code: string;
  planned_departure_time: string;
  trip_status: string;
  vehicle: Vehicle;
  route: { route_name: string; origin: string; destination: string };
}

export interface TripSeat {
  id: string;
  seat_id: string;
  status: "available" | "locked" | "booked";
  booking_id: string | null;
  seat: Seat;
}

export interface Customer {
  id: string;
  full_name: string;
  phone: string;
  note?: string;
}

export interface BookingForm {
  customer_id: string;
  customer_name: string;
  customer_phone: string;
  customer_note: string;
  isNewCustomer: boolean;
  pickup_address: string;
  dropoff_address: string;
  fare_amount: string;
}

export const INITIAL_FORM: BookingForm = {
  customer_id: "",
  customer_name: "",
  customer_phone: "",
  customer_note: "",
  isNewCustomer: true,
  pickup_address: "",
  dropoff_address: "",
  fare_amount: "",
};
