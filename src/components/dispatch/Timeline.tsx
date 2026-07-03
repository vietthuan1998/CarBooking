// src/features/dispatch/components/Timeline.tsx
import { getRouteColumn, timelinePercent } from "@/utils/helpers";
import type { Trip, Vehicle } from "../../features/dispatch/types";
import { TimeAxis } from "./TimeAxis";
import { TripBlock } from "./TripBlock";

const HOUR_GRID_MARKS = [8, 11, 14, 17];

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
              <TimeAxis />
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
                <div className="relative h-9 flex-1 rounded-lg bg-gray-50">
                  {HOUR_GRID_MARKS.map((h) => (
                    <div
                      key={h}
                      className="absolute bottom-0 top-0 w-px bg-gray-200"
                      style={{ left: `${timelinePercent(h * 60)}%` }}
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
