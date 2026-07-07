import axios from "axios";
import { supabase } from "@/utils/supabase";
import { edgeFunctionClient } from "@/utils/axiosClient";
import type {
  CreateTripInput,
  Driver,
  Route,
  Trip,
  TripStatus,
  Vehicle,
} from "@/features/dispatch/types";

export async function getActiveRoutes(): Promise<Route[]> {
  const { data, error } = await supabase
    .from("routes")
    .select("id, route_name, origin, destination, base_price, status")
    .eq("status", "active")
    .order("route_name");
  if (error) throw error;
  return data ?? [];
}

export async function getActiveVehicles(): Promise<Vehicle[]> {
  const { data, error } = await supabase
    .from("vehicles")
    .select("id, vehicle_name, plate_number, seat_count, status")
    .eq("status", "active")
    .order("vehicle_name");
  if (error) throw error;
  return data ?? [];
}

// Drivers = profiles có role 'driver'.
// TODO: chưa hiển thị trên UI, chuẩn bị sẵn cho lúc bật lại tính năng gán tài xế
export async function getActiveDrivers(): Promise<Driver[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, phone, status")
    .eq("role", "driver")
    .eq("status", "active")
    .order("full_name");
  if (error) throw error;
  return data ?? [];
}

export async function getTripsByDate(date: Date | string): Promise<Trip[]> {
  // Parse as local time (append T00:00:00 so "YYYY-MM-DD" isn't treated as UTC midnight)
  const d = new Date(typeof date === "string" ? `${date}T00:00:00` : date);
  // Build UTC boundaries for the local calendar day so Supabase (UTC timestamptz) is filtered correctly
  const dayStart = new Date(
    d.getFullYear(),
    d.getMonth(),
    d.getDate(),
    0,
    0,
    0,
    0,
  ).toISOString();
  const dayEnd = new Date(
    d.getFullYear(),
    d.getMonth(),
    d.getDate(),
    23,
    59,
    59,
    999,
  ).toISOString();

  const { data, error } = await supabase
    .from("trips")
    .select(
      `
        id,
        trip_code,
        route_id,
        vehicle_id,
        driver_id,
        planned_departure_time,
        actual_departure_time,
        actual_arrival_time,
        trip_status,
        routes:route_id ( id, route_name, origin, destination ),
        vehicles:vehicle_id ( id, vehicle_name, plate_number, seat_count )
      `,
    )
    .gte("planned_departure_time", dayStart)
    .lte("planned_departure_time", dayEnd)
    .order("planned_departure_time");

  if (error) throw error;
  return (data ?? []) as unknown as Trip[];
}

// Tạo trip qua Edge Function (check trùng lịch xe + vị trí xe ở server,
// không cho client tự check + insert vì sẽ race-condition).
export async function scheduleTrip(
  { route_id, vehicle_id, planned_departure_time, trip_code }: CreateTripInput,
): Promise<Trip> {
  try {
    const { data } = await edgeFunctionClient.post<{ trip: Trip }>(
      "/schedule-trip",
      {
        route_id,
        vehicle_id,
        planned_departure_time,
        trip_code,
        // driver_id, // TODO: bật lại khi có chức năng gán tài xế
      },
    );
    return data.trip;
  } catch (err: unknown) {
    const message = axios.isAxiosError(err)
      ? (err.response?.data?.error ?? err.message)
      : err instanceof Error
      ? err.message
      : "Không thể tạo chuyến xe";
    throw new Error(message, { cause: err });
  }
}

export async function updateTripStatus(
  tripId: string,
  trip_status: TripStatus,
): Promise<void> {
  const { error } = await supabase
    .from("trips")
    .update({ trip_status })
    .eq("id", tripId);
  if (error) throw error;
}

export async function deleteTrip(tripId: string): Promise<void> {
  const { error } = await supabase.from("trips").delete().eq("id", tripId);
  if (error) {
    if (error.code === "23503") {
      throw new Error(
        "Không thể xóa chuyến này vì đã có khách đặt vé. Hãy hủy chuyến thay vì xóa.",
      );
    }
    throw error;
  }
}
