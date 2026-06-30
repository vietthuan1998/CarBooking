// src/features/dispatch/useDispatchData.js
import { supabase } from "@/utils/supabase";
import { useCallback, useEffect, useState } from "react";
import type { CreateTripInput, Driver, Route, Trip, TripStatus, Vehicle } from "./types";

const EDGE_FUNCTION_URL =
  `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/schedule-trip`;

export function useDispatchData(selectedDate: string) {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]); // TODO: chưa dùng, chuẩn bị sẵn cho sau
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ---- CRUD trực tiếp: routes (đơn giản, không cần edge function) ----
  const fetchRoutes = useCallback(async () => {
    const { data, error: err } = await supabase
      .from("routes")
      .select("id, route_name, origin, destination, status")
      .eq("status", "active")
      .order("route_name");
    if (err) throw err;
    return data ?? [];
  }, []);

  // ---- CRUD trực tiếp: vehicles ----
  const fetchVehicles = useCallback(async () => {
    const { data, error: err } = await supabase
      .from("vehicles")
      .select("id, vehicle_name, plate_number, seat_count, status")
      .eq("status", "active")
      .order("vehicle_name");
    if (err) throw err;
    return data ?? [];
  }, []);

  // ---- CRUD trực tiếp: drivers (profiles role = 'driver') ----
  // TODO: chưa hiển thị trên UI, chuẩn bị sẵn dữ liệu cho lúc bật lại tính năng gán tài xế
  const fetchDrivers = useCallback(async () => {
    const { data, error: err } = await supabase
      .from("profiles")
      .select("id, full_name, phone, status")
      .eq("role", "driver")
      .eq("status", "active")
      .order("full_name");
    if (err) throw err;
    return data ?? [];
  }, []);

  // ---- CRUD trực tiếp: đọc trips trong ngày (kèm route + vehicle) ----
  const fetchTrips = useCallback(async (date: Date | string) => {
    // Parse as local time (append T00:00:00 so "YYYY-MM-DD" isn't treated as UTC midnight)
    const d = new Date(typeof date === "string" ? `${date}T00:00:00` : date);
    // Build UTC boundaries for the local calendar day so Supabase (UTC timestamptz) is filtered correctly
    const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0).toISOString();
    const dayEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999).toISOString();

    const { data, error: err } = await supabase
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

    if (err) throw err;
    return (data ?? []) as unknown as Trip[];
  }, []);

  const loadAll = useCallback(async (date: Date | string) => {
    setLoading(true);
    setError(null);
    try {
      const [routesData, vehiclesData, driversData, tripsData] = await Promise
        .all([
          fetchRoutes(),
          fetchVehicles(),
          fetchDrivers(),
          fetchTrips(date),
        ]);
      setRoutes(routesData);
      setVehicles(vehiclesData);
      setDrivers(driversData);
      setTrips(tripsData);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Đã có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  }, [fetchRoutes, fetchVehicles, fetchDrivers, fetchTrips]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadAll(selectedDate);
  }, [selectedDate, loadAll]);

  // ---- Tạo trip mới: gọi Edge Function (có check trùng lịch xe) ----
  const createTrip = useCallback(
    async ({ route_id, vehicle_id, planned_departure_time, trip_code }: CreateTripInput) => {
      // console.log("=====", planned_departure_time);
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      const res = await fetch(EDGE_FUNCTION_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          route_id,
          vehicle_id,
          planned_departure_time,
          trip_code,
          // driver_id, // TODO: bật lại khi có chức năng gán tài xế
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error ?? "Không thể tạo chuyến xe");
      }

      await loadAll(selectedDate);
      return json.trip;
    },
    [loadAll, selectedDate],
  );

  // ---- CRUD trực tiếp: cập nhật trạng thái trip (đơn giản, không cần edge function) ----
  const updateTripStatus = useCallback(
    async (tripId: string, trip_status: TripStatus) => {
      const { error: err } = await supabase
        .from("trips")
        .update({ trip_status })
        .eq("id", tripId);
      if (err) throw err;
      await loadAll(selectedDate);
    },
    [loadAll, selectedDate],
  );

  // ---- CRUD trực tiếp: xóa trip (đơn giản, không cần edge function) ----
  const deleteTrip = useCallback(
    async (tripId: string) => {
      const { error: err } = await supabase
        .from("trips")
        .delete()
        .eq("id", tripId);
      if (err) throw err;
      await loadAll(selectedDate);
    },
    [loadAll, selectedDate],
  );

  return {
    routes,
    vehicles,
    drivers,
    trips,
    loading,
    error,
    createTrip,
    updateTripStatus,
    deleteTrip,
    refresh: () => loadAll(selectedDate),
  };
}
