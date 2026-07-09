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

// Mật khẩu mặc định khi reset tài khoản, theo role của tài khoản bị reset.
// Chỉ dùng để hiển thị — nguồn chuẩn là DEFAULT_PASSWORDS trong
// supabase/functions/reset-password/index.ts, đổi bên đó thì phải đổi cả đây.
export const DEFAULT_RESET_PASSWORDS: Record<
  "admin" | "staff" | "driver",
  string
> = {
  driver: "123456",
  staff: "111111",
  admin: "@dmin123",
};

// ---- Timeline điều phối xe ----
// Khung mặc định 05:00-20:00; Timeline tự giãn khi có chuyến ngoài khung
export const TIMELINE_DAY_START = 5 * 60; // 05:00
export const TIMELINE_DAY_END = 20 * 60; // 20:00
export const TIMELINE_DAY_SPAN = TIMELINE_DAY_END - TIMELINE_DAY_START;
export const TIMELINE_BLOCK_MINUTES = 120; // độ rộng khối hiển thị (không phải thời lượng thực)
// Khoảng nghỉ tối thiểu giữa 2 chuyến cùng xe — đồng bộ với MIN_GAP_MINUTES
// trong supabase/functions/schedule-trip/index.ts
export const TRIP_TURNAROUND_MINUTES = 150;
