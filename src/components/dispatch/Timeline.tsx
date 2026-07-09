// src/features/dispatch/components/Timeline.tsx
import { getRouteColumn, minutesOfDay, timelinePercent } from "@/utils/helpers";
import {
  TIMELINE_BLOCK_MINUTES,
  TIMELINE_DAY_END,
  TIMELINE_DAY_START,
} from "@/utils/constants";
import type { Trip, Vehicle } from "../../features/dispatch/types";
import { TimeAxis } from "./TimeAxis";
import { TripBlock } from "./TripBlock";

/**
 * Khung giờ hiển thị: mặc định 05:00-20:00, tự giãn (làm tròn theo giờ)
 * khi có chuyến ngoài khung để block không văng ra ngoài trục.
 */
function timelineRange(trips: Trip[]) {
  const starts = trips.map((t) => minutesOfDay(t.planned_departure_time));
  const dayStart = Math.min(
    TIMELINE_DAY_START,
    ...starts.map((m) => Math.floor(m / 60) * 60),
  );
  // Cap 24:00: block của chuyến sát nửa đêm sẽ được TripBlock clamp vào trong
  const dayEnd = Math.min(
    24 * 60,
    Math.max(
      TIMELINE_DAY_END,
      ...starts.map((m) => Math.ceil((m + TIMELINE_BLOCK_MINUTES) / 60) * 60),
    ),
  );
  return { dayStart, dayEnd, daySpan: dayEnd - dayStart };
}

/** Mốc giờ trên trục: chia đều ~5 khoảng, luôn có mốc đầu và cuối khung. */
function hourMarks(dayStart: number, dayEnd: number): number[] {
  const startHour = dayStart / 60;
  const endHour = dayEnd / 60;
  const step = Math.max(1, Math.round((endHour - startHour) / 5));
  const marks: number[] = [];
  for (let h = startHour; h <= endHour; h += step) marks.push(h);
  const last = marks[marks.length - 1];
  if (last < endHour) {
    if (endHour - last < step / 2) marks[marks.length - 1] = endHour;
    else marks.push(endHour);
  }
  return marks;
}

interface TimelineProps {
  trips: Trip[];
  vehicles: Vehicle[];
  conflictIds: Set<string>;
  selectedTripId: string | null;
  onSelect: (tripId: string) => void;
}

export function Timeline({
  trips,
  vehicles,
  conflictIds,
  selectedTripId,
  onSelect,
}: TimelineProps) {
  const rows = vehicles.filter((v) =>
    trips.some((t) => t.vehicle_id === v.id)
  );
  const { dayStart, daySpan, dayEnd } = timelineRange(trips);
  const marks = hourMarks(dayStart, dayEnd);

  return (
    <div className="rounded-xl border border-gray-200 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 px-4 py-3">
        <h2 className="text-sm font-semibold text-gray-900">
          Lịch chạy trong ngày{" "}
          <span className="font-normal text-gray-400">
            · {rows.length} xe · {trips.length} chuyến
          </span>
        </h2>
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-teal-300" /> Huế →
            ĐN/Hội An
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-violet-300" />{" "}
            ĐN/Hội An → Huế
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm border-2 border-red-400 bg-white" />
            {" "}
            Trùng lịch
          </span>
        </div>
      </div>

      {rows.length === 0
        ? (
          <p className="py-10 text-center text-sm text-gray-400">
            Chưa có xe nào đăng ký giờ chạy hôm nay — nhập giờ ở khối bên trên
            để bắt đầu.
          </p>
        )
        : (
          <div className="max-h-96 overflow-y-auto p-4 pt-0">
            <div className="sticky top-0 z-10 bg-white pt-4">
              <TimeAxis marks={marks} dayStart={dayStart} daySpan={daySpan} />
            </div>
            {rows.map((v) => (
              <div
                key={v.id}
                className="flex items-center border-t border-gray-100 py-1.5"
              >
                <div className="w-36 shrink-0 pr-3">
                  <div className="truncate text-sm font-medium text-gray-900">
                    {v.vehicle_name}
                  </div>
                  <div className="truncate text-xs text-gray-400">
                    {v.plate_number}
                  </div>
                </div>
                <div className="relative h-9 flex-1 overflow-hidden rounded-lg bg-gray-50">
                  {marks.slice(1, -1).map((h) => (
                    <div
                      key={h}
                      className="absolute bottom-0 top-0 w-px bg-gray-200"
                      style={{ left: `${timelinePercent(h * 60, dayStart, daySpan)}%` }}
                    />
                  ))}
                  {trips
                    .filter((t) => t.vehicle_id === v.id)
                    .map((t) => (
                      <TripBlock
                        key={t.id}
                        trip={t}
                        direction={getRouteColumn(t.routes)}
                        conflict={conflictIds.has(t.id)}
                        selected={t.id === selectedTripId}
                        dayStart={dayStart}
                        daySpan={daySpan}
                        onClick={() => onSelect(t.id)}
                      />
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}
    </div>
  );
}
