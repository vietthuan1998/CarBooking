// src/features/dispatch/components/TimeAxis.tsx
import { timelinePercent } from "@/utils/helpers";

interface TimeAxisProps {
  marks: number[];
  dayStart: number;
  daySpan: number;
}

export function TimeAxis({ marks, dayStart, daySpan }: TimeAxisProps) {
  return (
    <div className="flex border-b border-gray-100 pb-1">
      <div className="w-36 shrink-0" />
      <div className="relative h-5 flex-1 text-xs text-gray-400">
        {marks.map((h) => (
          <span
            key={h}
            className="absolute -translate-x-1/2"
            style={{ left: `${timelinePercent(h * 60, dayStart, daySpan)}%` }}
          >
            {String(h).padStart(2, "0")}:00
          </span>
        ))}
      </div>
    </div>
  );
}
