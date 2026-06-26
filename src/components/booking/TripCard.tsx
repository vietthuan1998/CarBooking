import type { Trip } from "./types";
import { formatTime, formatDate } from "./utils";

interface Props {
  trip: Trip;
  loadingTripId: string | null;
  onBook: (trip: Trip) => void;
}

export function TripCard({ trip, loadingTripId, onBook }: Props) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow p-4">
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="text-xs font-mono text-gray-400">{trip.trip_code}</p>
          <p className="text-sm font-semibold text-gray-800 mt-0.5">
            {formatTime(trip.planned_departure_time)}
            <span className="ml-1.5 text-xs text-gray-400 font-normal">
              {formatDate(trip.planned_departure_time)}
            </span>
          </p>
        </div>
        <span
          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
            trip.trip_status === "scheduled"
              ? "bg-blue-50 text-blue-600"
              : trip.trip_status === "in_progress"
              ? "bg-green-50 text-green-600"
              : "bg-gray-100 text-gray-500"
          }`}
        >
          {trip.trip_status === "scheduled"
            ? "Đã lên lịch"
            : trip.trip_status === "in_progress"
            ? "Đang chạy"
            : trip.trip_status}
        </span>
      </div>

      <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
        <span className="flex items-center gap-1">
          🚗 {trip.vehicle.vehicle_name}
        </span>
        <span className="text-gray-300">·</span>
        <span>{trip.vehicle.plate_number}</span>
      </div>

      <button
        onClick={() => onBook(trip)}
        disabled={loadingTripId === trip.id}
        className="w-full py-1.5 text-xs font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 transition-colors"
      >
        {loadingTripId === trip.id ? "Đang tải..." : "Đặt vé"}
      </button>
    </div>
  );
}
