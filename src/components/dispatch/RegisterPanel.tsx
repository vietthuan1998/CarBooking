// src/features/dispatch/components/RegisterPanel.tsx
import { useMemo, useState } from "react";
import type { Trip, Vehicle } from "../../features/dispatch/types";
import { timeInputValue } from "@/utils/helpers";

interface RegisterPanelProps {
  title: string;
  color: "teal" | "violet";
  vehicles: Vehicle[];
  trips: Trip[];
  onRegister: (times: Record<string, string>) => void | Promise<void>;
}

export function RegisterPanel({
  title,
  color,
  vehicles,
  trips,
  onRegister,
}: RegisterPanelProps) {
  const [search, setSearch] = useState<string>("");
  // Chỉ lưu giá trị người dùng tự gõ (override) — không lưu giờ đã đăng ký sẵn.
  const [times, setTimes] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState<boolean>(false);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return vehicles;
    return vehicles.filter((v) =>
      `${v.vehicle_name} ${v.plate_number}`.toLowerCase().includes(q),
    );
  }, [search, vehicles]);

  // Giờ đã đăng ký hiện có cho mỗi xe (chiều này, ngày đang chọn) — 1 giờ/xe
  // (nếu xe có nhiều chuyến thì lấy chuyến sớm nhất).
  const registeredTimeByVehicle = useMemo(() => {
    const map = new Map<string, string>();
    for (const t of trips) {
      if (t.trip_status === "cancelled") continue;
      const time = timeInputValue(t.planned_departure_time);
      const current = map.get(t.vehicle_id);
      if (!current || time < current) map.set(t.vehicle_id, time);
    }
    return map;
  }, [trips]);

  // Giờ hiển thị trên ô input: ưu tiên giá trị người dùng đang gõ, nếu chưa
  // gõ gì thì hiển thị giờ đã đăng ký sẵn (thay vì để trống).
  const displayedTime = (vehicleId: string) =>
    times[vehicleId] ?? registeredTimeByVehicle.get(vehicleId) ?? "";

  // Chỉ tính là "mới" khi người dùng đã gõ và khác với giờ đã đăng ký.
  const isChanged = (vehicleId: string) => {
    const typed = times[vehicleId];
    if (!typed) return false;
    return registeredTimeByVehicle.get(vehicleId) !== typed;
  };

  const changedCount = vehicles.filter((v) => isChanged(v.id)).length;

  const submit = async () => {
    const changed = Object.fromEntries(
      Object.entries(times).filter(([vehicleId]) => isChanged(vehicleId)),
    );
    if (Object.keys(changed).length === 0) return;
    setSubmitting(true);
    try {
      await onRegister(changed);
      setTimes((prev) => {
        const next = { ...prev };
        for (const vehicleId of Object.keys(changed)) delete next[vehicleId];
        return next;
      });
      setSearch("");
    } finally {
      setSubmitting(false);
    }
  };

  const dot = color === "teal" ? "bg-teal-400" : "bg-violet-400";

  return (
    <div className="flex flex-col rounded-xl border border-gray-200 bg-white">
      <div className="flex items-center gap-2 border-b border-gray-100 px-4 py-3">
        <span className={`h-2.5 w-2.5 rounded-full ${dot}`} />
        <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
      </div>

      <div className="flex flex-col p-3">
        <input
          type="search"
          aria-label="Tìm xe theo tên hoặc biển số"
          placeholder="Tìm xe theo tên hoặc biển số…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-2 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
        />

        <div className="h-64 overflow-y-auto rounded-lg border border-gray-100">
          {visible.length === 0 && (
            <p className="py-6 text-center text-sm text-gray-400">
              Không tìm thấy xe nào
            </p>
          )}
          {visible.map((v) => (
            <label
              key={v.id}
              className={`flex cursor-pointer items-center justify-between gap-2 border-b border-gray-100 px-3 py-2 last:border-b-0 ${
                isChanged(v.id) ? "bg-blue-50/60" : "hover:bg-gray-50"
              }`}
            >
              <div className="min-w-0">
                <div className="truncate text-sm font-medium text-gray-900">
                  {v.vehicle_name}{" "}
                  <span className="font-normal text-gray-500">
                    ({v.plate_number})
                  </span>
                </div>
                <div className="text-xs text-gray-400">
                  {v.seat_count} ghế
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                <input
                  type="time"
                  value={displayedTime(v.id)}
                  onChange={(e) =>
                    setTimes((prev) => ({
                      ...prev,
                      [v.id]: e.target.value,
                    }))}
                  className="rounded-lg border border-gray-300 bg-white px-2 py-1 text-sm focus:border-blue-500 focus:outline-none"
                />
                {isChanged(v.id) && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setTimes((prev) => {
                        const next = { ...prev };
                        delete next[v.id];
                        return next;
                      });
                    }}
                    className="text-gray-400 hover:text-red-500"
                    title="Bỏ giờ vừa nhập"
                  >
                    ✕
                  </button>
                )}
              </div>
            </label>
          ))}
        </div>

        <button
          type="button"
          onClick={submit}
          disabled={changedCount === 0 || submitting}
          className={`mt-3 rounded-lg px-4 py-2 text-sm font-medium transition ${
            changedCount > 0 && !submitting
              ? "bg-blue-600 text-white hover:bg-blue-700 active:scale-95"
              : "cursor-not-allowed bg-gray-100 text-gray-400"
          }`}
        >
          {submitting
            ? "Đang đăng ký..."
            : changedCount > 0
            ? `Đăng ký ${changedCount} chuyến`
            : "Nhập giờ cho ít nhất 1 xe"}
        </button>
      </div>
    </div>
  );
}
