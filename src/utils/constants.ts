// src/features/dispatch/constants.ts
import type { TripStatus } from "../features/dispatch/types";

export const STATUS_LABEL: Record<TripStatus, string> = {
  scheduled: "Đã lên lịch",
  in_progress: "Đang chạy",
  completed: "Hoàn thành",
  cancelled: "Đã hủy",
};

export const STATUS_BADGE_CLASS: Record<TripStatus, string> = {
  scheduled: "bg-blue-100 text-blue-700",
  in_progress: "bg-amber-100 text-amber-700",
  completed: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-700",
};
