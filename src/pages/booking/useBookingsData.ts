import { useEffect, useState } from "react";
import { supabase } from "../../utils/supabase";
import type { Trip } from "../../components/booking/types";

export type Direction = "hue_to_dest" | "dest_to_hue";

export type TripStatus =
  | "all"
  | "scheduled"
  | "in_progress"
  | "completed"
  | "cancelled";

export function todayInputValue(): string {
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
  const [selectedDate, setSelectedDate] = useState<string>(todayInputValue());
  const [statusFilter, setStatusFilter] = useState<TripStatus>("all");
  const [refreshKey, setRefreshKey] = useState(0);

  // loading is derived: true whenever current deps don't match last fetched data
  const depsKey = `${selectedDate}|${statusFilter}|${refreshKey}`;
  const loading = fetchedData === null || fetchedData.depsKey !== depsKey;
  const trips = fetchedData?.trips ?? { hue_to_dest: [], dest_to_hue: [] };

  useEffect(() => {
    let cancelled = false;
    const key = `${selectedDate}|${statusFilter}|${refreshKey}`;

    async function load() {
      try {
        // Build local-time day boundaries → UTC for Supabase timestamptz
        const d = new Date(`${selectedDate}T00:00:00`);
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

        let query = supabase
          .from("trips")
          .select(
            `id, trip_code, planned_departure_time, trip_status,
           vehicle:vehicles(id, plate_number, vehicle_name, seat_count),
           route:routes(route_name, origin, destination)`,
          )
          .gte("planned_departure_time", dayStart)
          .lte("planned_departure_time", dayEnd)
          .order("planned_departure_time");

        if (statusFilter !== "all") {
          query = query.eq("trip_status", statusFilter);
        }

        const { data, error } = await query;
        if (cancelled) return;
        if (error) {
          console.error(error);
          return;
        }

        const all = (data ?? []) as unknown as Trip[];
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
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [selectedDate, statusFilter, refreshKey]);

  const totalTrips = trips.hue_to_dest.length + trips.dest_to_hue.length;

  return {
    trips,
    loading,
    totalTrips,
    selectedDate,
    setSelectedDate,
    statusFilter,
    setStatusFilter,
    refresh: () => setRefreshKey((k) => k + 1),
  };
}
