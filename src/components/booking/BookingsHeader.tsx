import type { TripStatus } from "@/hooks/useBookingsData";

const STATUS_LABELS: Record<TripStatus, string> = {
  all: "Tất cả",
  scheduled: "Chờ xuất phát",
  in_progress: "Đang chạy",
  completed: "Hoàn thành",
  cancelled: "Đã hủy",
};

interface Props {
  totalTrips: number;
  selectedDate: string;
  onDateChange: (date: string) => void;
  statusFilter: TripStatus;
  onStatusFilterChange: (status: TripStatus) => void;
  onRefresh: () => void;
}

export function BookingsHeader({
  totalTrips,
  selectedDate,
  onDateChange,
  statusFilter,
  onStatusFilterChange,
  onRefresh,
}: Props) {
  return (
    <div className="border-b border-gray-100 bg-white px-6 py-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">
            Quản lý đặt vé
          </h1>
          <p className="mt-0.5 text-xs text-gray-400">
            {totalTrips} chuyến{totalTrips !== 1 ? "" : ""} ·{" "}
            {new Date(`${selectedDate}T00:00:00`).toLocaleDateString(
              "vi-VN",
              {
                weekday: "long",
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              },
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-500 transition-colors hover:border-blue-300 hover:text-blue-600"
        >
          ↻ Làm mới
        </button>
      </div>

      {/* Filter bar */}
      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
        {/* Date picker */}
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => onDateChange(e.target.value)}
          className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
        />

        {/* Status filter */}
        <div className="flex gap-1 rounded-xl bg-gray-100 p-1">
          {(Object.keys(STATUS_LABELS) as TripStatus[]).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onStatusFilterChange(s)}
              className={[
                "rounded-lg px-2.5 py-1 text-xs font-medium transition-colors",
                statusFilter === s
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700",
              ].join(" ")}
            >
              {STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
