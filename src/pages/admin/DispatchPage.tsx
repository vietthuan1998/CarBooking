// src/pages/admin/DispatchPage.tsx
import { useMemo, useState } from "react";
import { DispatchHeader } from "@/components/dispatch/DispatchHeader";
import { RegisterPanel } from "@/components/dispatch/RegisterPanel";
import { Timeline } from "@/components/dispatch/Timeline";
import { SelectedTripBar } from "@/components/dispatch/SelectedTripBar";
import { useDispatchColumns } from "@/hooks/useDispatchColumns";
import { useDispatchData } from "@/hooks/useDispatchData";
import { minutesOfDay, todayDateInputValue } from "@/utils/helpers";
import { TRIP_TURNAROUND_MINUTES } from "@/utils/constants";
import type { CreateTripInput, Route } from "@/features/dispatch/types";

function pickDefaultRoute(routesInColumn: Route[]): Route | null {
  if (routesInColumn.length === 0) return null;
  return [...routesInColumn].sort((a, b) => a.base_price - b.base_price)[0];
}

export default function DispatchPage() {
  const [selectedDate, setSelectedDate] = useState<string>(
    todayDateInputValue(),
  );
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [registerError, setRegisterError] = useState<string | null>(null);

  const {
    routes,
    vehicles,
    trips,
    loading,
    error,
    createTrips,
    updateTripStatus,
    deleteTrip,
  } = useDispatchData(selectedDate);

  const { fromHueRoutes, toHueRoutes, fromHueTrips, toHueTrips } =
    useDispatchColumns(routes, trips);

  // Trùng lịch: 2 chuyến cùng xe (bất kể tuyến) cách nhau dưới thời gian quay đầu tối thiểu
  const conflictIds = useMemo(() => {
    const ids = new Set<string>();
    const byVehicle = new Map<string, typeof trips>();
    for (const t of trips) {
      if (t.trip_status === "cancelled") continue;
      const list = byVehicle.get(t.vehicle_id) ?? [];
      list.push(t);
      byVehicle.set(t.vehicle_id, list);
    }
    for (const list of byVehicle.values()) {
      const sorted = [...list].sort(
        (a, b) =>
          minutesOfDay(a.planned_departure_time) -
          minutesOfDay(b.planned_departure_time),
      );
      for (let i = 1; i < sorted.length; i++) {
        const gap =
          minutesOfDay(sorted[i].planned_departure_time) -
          minutesOfDay(sorted[i - 1].planned_departure_time);
        if (gap < TRIP_TURNAROUND_MINUTES) {
          ids.add(sorted[i - 1].id);
          ids.add(sorted[i].id);
        }
      }
    }
    return ids;
  }, [trips]);

  const handleRegister = async (
    routesInColumn: Route[],
    times: Record<string, string>,
  ) => {
    setRegisterError(null);
    const defaultRoute = pickDefaultRoute(routesInColumn);
    if (!defaultRoute) {
      setRegisterError("Chưa cấu hình tuyến cho chiều này");
      return;
    }

    const inputs: CreateTripInput[] = Object.entries(times)
      .filter(([, time]) => time)
      .map(([vehicleId, time]) => ({
        route_id: defaultRoute.id,
        vehicle_id: vehicleId,
        planned_departure_time: new Date(
          `${selectedDate}T${time}:00`,
        ).toISOString(),
      }));
    if (inputs.length === 0) return;

    const failures = await createTrips(inputs);
    if (failures.length > 0) {
      setRegisterError(
        `Có ${failures.length}/${
          inputs.length
        } chuyến không đăng ký được: ${failures
          .map((f) => f.error)
          .join("; ")}`,
      );
    }
  };

  const selectedTrip = trips.find((t) => t.id === selectedTripId) ?? null;

  const handleComplete = (tripId: string) => {
    updateTripStatus(tripId, "completed");
    setSelectedTripId(null);
  };
  const handleCancel = (tripId: string) => {
    updateTripStatus(tripId, "cancelled");
    setSelectedTripId(null);
  };
  const handleDelete = async (tripId: string) => {
    if (!window.confirm("Xóa chuyến này?")) return;
    try {
      await deleteTrip(tripId);
      setSelectedTripId(null);
    } catch (err: unknown) {
      setRegisterError(
        err instanceof Error ? err.message : "Không thể xóa chuyến",
      );
    }
  };

  return (
    <div className="mx-auto max-w-6xl p-4">
      <DispatchHeader
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
      />

      {(error || registerError) && (
        <div className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error || registerError}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-gray-400">Đang tải dữ liệu...</p>
      ) : (
        <>
          <div className="mb-4 grid gap-4 lg:grid-cols-2">
            <RegisterPanel
              title="Huế → Đà Nẵng - Hội An"
              color="teal"
              vehicles={vehicles}
              trips={fromHueTrips}
              onRegister={(times) => handleRegister(fromHueRoutes, times)}
            />
            <RegisterPanel
              title="Đà Nẵng - Hội An → Huế"
              color="violet"
              vehicles={vehicles}
              trips={toHueTrips}
              onRegister={(times) => handleRegister(toHueRoutes, times)}
            />
          </div>

          <Timeline
            trips={trips}
            vehicles={vehicles}
            conflictIds={conflictIds}
            selectedTripId={selectedTripId}
            onSelect={(id) =>
              setSelectedTripId(id === selectedTripId ? null : id)
            }
          />

          {selectedTrip && (
            <SelectedTripBar
              trip={selectedTrip}
              onComplete={() => handleComplete(selectedTrip.id)}
              onCancel={() => handleCancel(selectedTrip.id)}
              onDelete={() => handleDelete(selectedTrip.id)}
            />
          )}

          {conflictIds.size > 0 && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              ⚠ Có {conflictIds.size} chuyến cùng xe cách nhau dưới 2h30 — xe có
              thể không kịp quay đầu giữa 2 chuyến. Các khối viền đỏ trên
              timeline.
            </div>
          )}
        </>
      )}
    </div>
  );
}
