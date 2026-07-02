// src/features/dispatch/components/TripCard.tsx
import { STATUS_BADGE_CLASS, STATUS_LABEL } from "../../utils/constants";
import type { Trip } from "../../features/dispatch/types";
import { formatTime } from "./utils";

interface TripCardProps {
  trip: Trip;
  onCancel: (tripId: string) => void;
  onComplete: (tripId: string) => void;
  onDelete: (tripId: string) => void;
}

export function TripCard({
  trip,
  onCancel,
  onComplete,
  onDelete,
}: TripCardProps) {
  const statusClass =
    STATUS_BADGE_CLASS[trip.trip_status] ?? "bg-gray-100 text-gray-700";
  const canAct =
    trip.trip_status !== "cancelled" && trip.trip_status !== "completed";

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-900">
          {formatTime(trip.planned_departure_time)} · {trip.trip_code}
        </span>
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusClass}`}
        >
          {STATUS_LABEL[trip.trip_status] ?? trip.trip_status}
        </span>
      </div>

      <div className="mt-1 text-sm text-gray-600">
        {trip.routes?.route_name ?? "—"}
      </div>

      <div className="mt-1 text-sm text-gray-500">
        🚐 {trip.vehicles?.vehicle_name} ({trip.vehicles?.plate_number}) ·{" "}
        {trip.vehicles?.seat_count} ghế
      </div>

      {/* TODO: hiển thị tài xế khi bật lại chức năng gán driver_id */}
      <div className="mt-1 text-xs text-gray-400">Tài xế: chưa gán</div>

      {canAct && (
        <div className="mt-2 flex gap-2">
          <button
            onClick={() => onComplete(trip.id)}
            className="rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-100"
          >
            Hoàn thành
          </button>
          <button
            onClick={() => onCancel(trip.id)}
            className="rounded-md bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700 hover:bg-amber-100"
          >
            Hủy chuyến
          </button>
          <button
            onClick={() => onDelete(trip.id)}
            className="rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-100"
          >
            Xóa
          </button>
        </div>
      )}
    </div>
  );
}
