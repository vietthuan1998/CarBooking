import { Search } from "lucide-react";
import type { RoleFilter } from "../../features/accounts/types";

const ROLE_LABEL: Record<RoleFilter, string> = {
  all: "Tất cả",
  admin: "Admin",
  staff: "Staff",
  driver: "Tài xế",
};

interface Props {
  roleOptions: RoleFilter[];
  roleFilter: RoleFilter;
  onRoleFilterChange: (role: RoleFilter) => void;
  counts: Partial<Record<RoleFilter, number>>;
  search: string;
  onSearchChange: (value: string) => void;
}

export function AccountsFilterBar({
  roleOptions,
  roleFilter,
  onRoleFilterChange,
  counts,
  search,
  onSearchChange,
}: Props) {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {roleOptions.length > 1 && (
        <div className="flex gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
          {roleOptions.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => onRoleFilterChange(r)}
              className={[
                "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                roleFilter === r
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100",
              ].join(" ")}
            >
              {ROLE_LABEL[r]}
              <span
                className={[
                  "ml-1.5 rounded-full px-1.5 py-0.5 text-xs",
                  roleFilter === r
                    ? "bg-white/20 text-white"
                    : "bg-slate-100 text-slate-600",
                ].join(" ")}
              >
                {counts[r] ?? 0}
              </span>
            </button>
          ))}
        </div>
      )}

      <div className="relative">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          type="text"
          aria-label="Tìm họ tên, SĐT"
          placeholder="Tìm họ tên, SĐT..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-56 rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm placeholder-slate-400 shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
        />
      </div>
    </div>
  );
}
