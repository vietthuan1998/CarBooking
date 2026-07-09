// export function formatTime(iso: string) {
//   return new Date(iso).toLocaleTimeString("vi-VN", {
//     hour: "2-digit",
//     minute: "2-digit",
//   });
// }

import type { Route } from "@/features/dispatch/types";
import { TIMELINE_DAY_START, TIMELINE_DAY_SPAN } from "@/utils/constants";

export function formatDate(iso: string | undefined) {
  if (!iso) return "-";

  return new Date(iso).toLocaleDateString("vi-VN", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
  });
}

export function formatDateTime(iso?: string | null) {
  if (!iso) return "-";

  return new Date(iso).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export type RouteColumn = "from-hue" | "to-hue" | null;

export function formatTime(isoString: string | null): string {
  if (!isoString) return "--:--";
  const d = new Date(isoString);
  return d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
}

export function todayDateInputValue(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Phân loại route vào 1 trong 2 cột dựa trên chuỗi 'Huế':
 *  - Cột 1 (xuất phát từ Huế): origin chứa 'Huế'
 *  - Cột 2 (về Huế): destination chứa 'Huế'
 * Cách này không cần hardcode route_id, route mới thêm vào tự được phân loại đúng.
 */
export function getRouteColumn(
  route: Pick<Route, "origin" | "destination"> | null | undefined,
): RouteColumn {
  if (!route) return null;
  const origin = (route.origin ?? "").toLowerCase();
  const destination = (route.destination ?? "").toLowerCase();
  if (origin.includes("huế")) return "from-hue";
  if (destination.includes("huế")) return "to-hue";
  return null;
}

export type PresetKey = "7d" | "30d" | "this_month" | "last_month";

export const PRESETS: [PresetKey, string][] = [
  ["7d", "7 ngày"],
  ["30d", "30 ngày"],
  ["this_month", "Tháng này"],
  ["last_month", "Tháng trước"],
];

export function getPresetDates(key: PresetKey): [Date, Date] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  switch (key) {
    case "7d": {
      const s = new Date(today);
      s.setDate(s.getDate() - 6);
      return [s, new Date(today)];
    }
    case "30d": {
      const s = new Date(today);
      s.setDate(s.getDate() - 29);
      return [s, new Date(today)];
    }
    case "this_month":
      return [
        new Date(today.getFullYear(), today.getMonth(), 1),
        new Date(today.getFullYear(), today.getMonth() + 1, 0),
      ];
    case "last_month":
      return [
        new Date(today.getFullYear(), today.getMonth() - 1, 1),
        new Date(today.getFullYear(), today.getMonth(), 0),
      ];
  }
}

/** Phút trong ngày (theo giờ local của trình duyệt) của 1 mốc thời gian ISO. */
export function minutesOfDay(iso: string): number {
  const d = new Date(iso);
  return d.getHours() * 60 + d.getMinutes();
}

/** "HH:mm" (giờ local) từ 1 mốc thời gian ISO — đúng định dạng value của <input type="time">. */
export function timeInputValue(iso: string): string {
  const d = new Date(iso);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

/**
 * Vị trí % trên timeline ứng với 1 mốc phút trong ngày.
 * Mặc định khung 5h-20h; Timeline truyền dayStart/daySpan đã giãn
 * khi có chuyến ngoài khung.
 */
export function timelinePercent(
  minutes: number,
  dayStart: number = TIMELINE_DAY_START,
  daySpan: number = TIMELINE_DAY_SPAN,
): number {
  return ((minutes - dayStart) / daySpan) * 100;
}

export function toInputValue(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function fCurrency(n: number): string {
  return n.toLocaleString("vi-VN") + " đ";
}

/**
 * Tên hiển thị của profile. Account driver có thể được tạo chỉ với
 * email + mật khẩu (tên rỗng, driver tự cập nhật sau trên app mobile).
 */
export function displayName(name: string | null | undefined): string {
  return name?.trim() ? name : "(Chưa cập nhật)";
}
