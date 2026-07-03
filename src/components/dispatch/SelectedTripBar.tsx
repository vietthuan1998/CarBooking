// src/features/dispatch/components/SelectedTripBar.tsx
import { STATUS_BADGE_CLASS, STATUS_LABEL } from "../../utils/constants";
import { formatTime } from "@/utils/helpers";
import type { Trip } from "../../features/dispatch/types";

interface SelectedTripBarProps {
  trip: Trip;
  onComplete: () => void;
  onCancel: () => void;
  onDelete: () => void;
}

export function SelectedTripBar({
  trip,
  onComplete,
  onCancel,
  onDelete,
}: SelectedTripBarProps) {
  const statusClass = STATUS_BADGE_CLASS[trip.trip_status] ??
    "bg-gray-100 text-gray-700";
  const canAct = trip.trip_status !== "cancelled" &&
    trip.trip_status !== "completed";

  return (
    <div className="mt-4 flex flex-wrap items-center gap-2 rounded-xl border border-gray-200 bg-white p-3 text-sm">
      <span className="font-medium text-gray-900">
        {formatTime(trip.planned_departure_time)}
      </span>
      <span className="text-gray-500">
        {trip.vehicles?.vehicle_name} ({trip.vehicles?.plate_number}) ·{" "}
        {trip.routes?.route_name ?? "—"}
      </span>
      <span
        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusClass}`}
      >
        {STATUS_LABEL[trip.trip_status] ?? trip.trip_status}
      </span>

      {canAct && (
        <div className="ml-auto flex gap-2">
          <button
            type="button"
            onClick={onComplete}
            className="rounded-lg bg-emerald-50 px-3 py-1.5 text-emerald-700 hover:bg-emerald-100"
          >
            Hoàn thành
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg bg-amber-50 px-3 py-1.5 text-amber-700 hover:bg-amber-100"
          >
            Hủy chuyến
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="rounded-lg bg-red-50 px-3 py-1.5 text-red-700 hover:bg-red-100"
          >
            Xóa
          </button>
        </div>
      )}
      {!canAct && (
        <button
          type="button"
          onClick={onDelete}
          className="ml-auto rounded-lg bg-red-50 px-3 py-1.5 text-red-700 hover:bg-red-100"
        >
          Xóa
        </button>
      )}
    </div>
  );
}
