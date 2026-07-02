// src/features/dispatch/components/CreateTripForm.tsx

import { useState } from "react";
import type * as React from "react";
import type {
  CreateTripInput,
  Route,
  Trip,
  Vehicle,
} from "../../features/dispatch/types";
import { todayDateInputValue } from "./utils";

interface CreateTripFormProps {
  routesInColumn: Route[];
  vehicles: Vehicle[];
  onSubmit: (input: CreateTripInput) => Promise<Trip>;
  columnLabel: string;
}

export function CreateTripForm({
  routesInColumn,
  vehicles,
  onSubmit,
  columnLabel,
}: CreateTripFormProps) {
  const [routeId, setRouteId] = useState<string>("");
  const [vehicleId, setVehicleId] = useState<string>("");
  const [time, setTime] = useState<string>("");
  const [tripCode, setTripCode] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  const selectedDate = todayDateInputValue();

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);

    if (!routeId || !vehicleId || !time) {
      setFormError("Vui lòng chọn đầy đủ tuyến, xe và giờ chạy");
      return;
    }

    // Convert local time to UTC ISO so Supabase stores the correct moment.
    // Without this, "15:30" (Vietnam UTC+7) would be saved as 15:30 UTC → displayed as 22:30.
    const plannedDepartureTime = new Date(
      `${selectedDate}T${time}:00`,
    ).toISOString();

    setSubmitting(true);
    try {
      await onSubmit({
        route_id: routeId,
        vehicle_id: vehicleId,
        planned_departure_time: plannedDepartureTime,
        trip_code: tripCode || undefined,
      });
      setRouteId("");
      setVehicleId("");
      setTime("");
      setTripCode("");
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Không thể tạo chuyến xe",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-4 rounded-lg border border-dashed border-gray-300 bg-gray-50 p-3"
    >
      <p className="mb-2 text-xs font-medium text-gray-500">
        Thêm chuyến mới · {columnLabel}
      </p>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <select
          value={routeId}
          onChange={(e) => setRouteId(e.target.value)}
          className="rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
        >
          <option value="">-- Chọn tuyến --</option>
          {routesInColumn.map((r) => (
            <option key={r.id} value={r.id}>
              {r.route_name}
            </option>
          ))}
        </select>

        <select
          value={vehicleId}
          onChange={(e) => setVehicleId(e.target.value)}
          className="rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
        >
          <option value="">-- Chọn xe --</option>
          {vehicles.map((v) => (
            <option key={v.id} value={v.id}>
              {v.vehicle_name} ({v.plate_number})
            </option>
          ))}
        </select>

        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
        />

        <input
          type="text"
          placeholder="Mã chuyến (tùy chọn)"
          value={tripCode}
          onChange={(e) => setTripCode(e.target.value)}
          className="rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
        />
      </div>

      {/* TODO: thêm select tài xế khi bật lại chức năng gán driver_id (profiles role='driver') */}

      {formError && (
        <p className="mt-2 text-xs font-medium text-red-600">{formError}</p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="mt-2 w-full rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {submitting ? "Đang tạo..." : "Tạo chuyến"}
      </button>
    </form>
  );
}
