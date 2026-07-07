import { useCallback, useEffect, useState, useTransition } from "react";
import type {
  CreateTripInput,
  Driver,
  Route,
  Trip,
  TripStatus,
  Vehicle,
} from "@/features/dispatch/types";
import {
  deleteTrip as deleteTripRequest,
  getActiveDrivers,
  getActiveRoutes,
  getActiveVehicles,
  getTripsByDate,
  scheduleTrip,
  updateTripStatus as updateTripStatusRequest,
} from "@/services/dispatchService";

export function useDispatchData(selectedDate: string) {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]); // TODO: chưa dùng, chuẩn bị sẵn cho sau
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const loadAll = useCallback((date: Date | string) => {
    startTransition(async () => {
      setError(null);
      try {
        const [routesData, vehiclesData, driversData, tripsData] = await Promise
          .all([
            getActiveRoutes(),
            getActiveVehicles(),
            getActiveDrivers(),
            getTripsByDate(date),
          ]);
        setRoutes(routesData);
        setVehicles(vehiclesData);
        setDrivers(driversData);
        setTrips(tripsData);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Đã có lỗi xảy ra");
      }
    });
  }, []);

  useEffect(() => {
    loadAll(selectedDate);
  }, [selectedDate, loadAll]);

  // ---- Tạo 1 trip mới (scheduleTrip đã ném Error với message tiếng Việt) ----
  const createTrip = useCallback(
    async (input: CreateTripInput) => {
      const trip = await scheduleTrip(input);
      loadAll(selectedDate);
      return trip;
    },
    [loadAll, selectedDate],
  );

  // ---- Đăng ký hàng loạt: tạo nhiều trip cùng lúc (VD: nhiều xe cho 1 chiều),
  // gọi tuần tự để server check trùng lịch xe chính xác giữa các trip mới tạo,
  // rồi chỉ reload dữ liệu 1 lần ở cuối. Trả về danh sách lỗi (nếu có) theo từng input.
  const createTrips = useCallback(
    async (inputs: CreateTripInput[]) => {
      const failures: { input: CreateTripInput; error: string }[] = [];
      for (const input of inputs) {
        try {
          await scheduleTrip(input);
        } catch (err: unknown) {
          failures.push({
            input,
            error: err instanceof Error
              ? err.message
              : "Không thể tạo chuyến xe",
          });
        }
      }
      loadAll(selectedDate);
      return failures;
    },
    [loadAll, selectedDate],
  );

  const updateTripStatus = useCallback(
    async (tripId: string, trip_status: TripStatus) => {
      await updateTripStatusRequest(tripId, trip_status);
      loadAll(selectedDate);
    },
    [loadAll, selectedDate],
  );

  const deleteTrip = useCallback(
    async (tripId: string) => {
      await deleteTripRequest(tripId);
      loadAll(selectedDate);
    },
    [loadAll, selectedDate],
  );

  return {
    routes,
    vehicles,
    drivers,
    trips,
    loading: isPending,
    error,
    createTrip,
    createTrips,
    updateTripStatus,
    deleteTrip,
    refresh: () => loadAll(selectedDate),
  };
}
