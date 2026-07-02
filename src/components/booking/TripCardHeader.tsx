import type { Trip } from "./types";
import { formatDate, formatTime } from "@/utils/helpers";

const STATUS_LABEL: Record<string, string> = {
  scheduled: "Đã lên lịch",
  in_progress: "Đang chạy",
};

const STATUS_CLASS: Record<string, string> = {
  scheduled: "bg-blue-50 text-blue-600",
  in_progress: "bg-green-50 text-green-600",
};

interface Props {
  trip: Trip;
}

export function TripCardHeader({ trip }: Props) {
  return (
    <div className="flex items-start justify-between px-4 pt-4 pb-3">
      <div>
        <p className="text-xs font-mono text-gray-400">{trip.trip_code}</p>
        <p className="text-sm font-semibold text-gray-800 mt-0.5">
          {formatTime(trip.planned_departure_time)}
          <span className="ml-1.5 text-xs text-gray-400 font-normal">
            {formatDate(trip.planned_departure_time)}
          </span>
        </p>
        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
          <span>🚗 {trip.vehicle.vehicle_name}</span>
          <span className="text-gray-300">·</span>
          <span>{trip.vehicle.plate_number}</span>
        </div>
      </div>
      <span
        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
          STATUS_CLASS[trip.trip_status] ?? "bg-gray-100 text-gray-500"
        }`}
      >
        {STATUS_LABEL[trip.trip_status] ?? trip.trip_status}
      </span>
    </div>
  );
}
