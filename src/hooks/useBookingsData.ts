import { useEffect, useState } from "react";
import { getActiveRoutes, getTripsByDate } from "@/services/bookingService";
import type { Route, Trip } from "@/features/booking/types";

export type Direction = "hue_to_dest" | "dest_to_hue";

export type TripStatus =
  | "all"
  | "scheduled"
  | "in_progress"
  | "completed"
  | "cancelled";

function todayInputValue(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

type FetchedData = {
  trips: Record<Direction, Trip[]>;
  depsKey: string;
};

export function useBookingsData() {
  const [fetchedData, setFetchedData] = useState<FetchedData | null>(null);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(todayInputValue);
  const [statusFilter, setStatusFilter] = useState<TripStatus>("all");
  const [refreshKey, setRefreshKey] = useState(0);

  // Danh sách tuyến (kèm base_price) để khách chọn tuyến cụ thể lúc đặt vé.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await getActiveRoutes();
        if (!cancelled) setRoutes(data);
      } catch (err) {
        console.error(err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // loading is derived: true whenever current deps don't match last fetched data
  const depsKey = `${selectedDate}|${statusFilter}|${refreshKey}`;
  const loading = fetchedData === null || fetchedData.depsKey !== depsKey;
  const trips = fetchedData?.trips ?? { hue_to_dest: [], dest_to_hue: [] };

  useEffect(() => {
    let cancelled = false;
    const key = `${selectedDate}|${statusFilter}|${refreshKey}`;

    (async () => {
      try {
        const all = await getTripsByDate(
          selectedDate,
          statusFilter === "all" ? undefined : statusFilter,
        );
        if (cancelled) return;
        setFetchedData({
          trips: {
            hue_to_dest: all.filter((t) => t.route.origin === "Huế"),
            dest_to_hue: all.filter((t) => t.route.destination === "Huế"),
          },
          depsKey: key,
        });
      } catch (err) {
        console.error(err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedDate, statusFilter, refreshKey]);

  const totalTrips = trips.hue_to_dest.length + trips.dest_to_hue.length;

  return {
    trips,
    routes,
    loading,
    totalTrips,
    selectedDate,
    setSelectedDate,
    statusFilter,
    setStatusFilter,
    refresh: () => setRefreshKey((k) => k + 1),
  };
}
