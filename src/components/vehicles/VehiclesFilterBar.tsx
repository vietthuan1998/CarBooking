import { Search } from "lucide-react";
import type { StatusFilter } from "../../features/vehicles/types";

const FILTERS: StatusFilter[] = ["all", "active", "inactive"];

const FILTER_LABEL: Record<StatusFilter, string> = {
  all: "Tất cả",
  active: "Hoạt động",
  inactive: "Ngưng",
};

interface Props {
  statusFilter: StatusFilter;
  onStatusFilterChange: (status: StatusFilter) => void;
  counts: Record<StatusFilter, number>;
  search: string;
  onSearchChange: (value: string) => void;
}

export function VehiclesFilterBar({
  statusFilter,
  onStatusFilterChange,
  counts,
  search,
  onSearchChange,
}: Props) {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
        {FILTERS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onStatusFilterChange(s)}
            className={[
              "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
              statusFilter === s
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100",
            ].join(" ")}
          >
            {FILTER_LABEL[s]}
            <span
              className={[
                "ml-1.5 rounded-full px-1.5 py-0.5 text-xs",
                statusFilter === s
                  ? "bg-white/20 text-white"
                  : "bg-slate-100 text-slate-600",
              ].join(" ")}
            >
              {counts[s]}
            </span>
          </button>
        ))}
      </div>

      <div className="relative">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          type="text"
          placeholder="Tìm tên xe, biển số..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-56 rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm placeholder-slate-400 shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
        />
      </div>
    </div>
  );
}
