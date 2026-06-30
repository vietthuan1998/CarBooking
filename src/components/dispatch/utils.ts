// src/features/dispatch/utils.ts
import type { Route } from "./types";

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
