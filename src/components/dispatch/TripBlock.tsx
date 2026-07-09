// src/features/dispatch/components/TripBlock.tsx
import type { RouteColumn } from "@/utils/helpers";
import { formatTime, minutesOfDay, timelinePercent } from "@/utils/helpers";
import { TIMELINE_BLOCK_MINUTES } from "@/utils/constants";
import type { Trip } from "../../features/dispatch/types";

interface TripBlockProps {
  trip: Trip;
  direction: RouteColumn;
  conflict: boolean;
  selected: boolean;
  dayStart: number;
  daySpan: number;
  onClick: () => void;
}

export function TripBlock({
  trip,
  direction,
  conflict,
  selected,
  dayStart,
  daySpan,
  onClick,
}: TripBlockProps) {
  const width = (TIMELINE_BLOCK_MINUTES / daySpan) * 100;
  // Clamp để block luôn nằm gọn trong track (chuyến sát nửa đêm bị đẩy lùi
  // vào trong một chút thay vì tràn ra ngoài trục)
  const left = Math.max(
    0,
    Math.min(
      100 - width,
      timelinePercent(
        minutesOfDay(trip.planned_departure_time),
        dayStart,
        daySpan,
      ),
    ),
  );
  const palette = direction === "from-hue"
    ? "bg-teal-100 text-teal-800 border-teal-500"
    : "bg-violet-100 text-violet-800 border-violet-500";
  const cancelled = trip.trip_status === "cancelled";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`absolute bottom-1 top-1 flex items-center justify-center gap-1 overflow-hidden whitespace-nowrap rounded-md border px-1 text-xs font-medium transition
        ${palette}
        ${cancelled ? "opacity-40 line-through" : ""}
        ${conflict ? "border-2 border-red-500" : ""}
        ${selected ? "ring-2 ring-blue-400 ring-offset-1" : ""}`}
      style={{ left: `${left}%`, width: `${width}%` }}
      title={`${trip.trip_code} · ${trip.vehicles?.vehicle_name ?? ""}`}
    >
      {formatTime(trip.planned_departure_time)}
      {trip.trip_status === "completed" && <span aria-hidden>✓</span>}
    </button>
  );
}
