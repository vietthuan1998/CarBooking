import { supabase } from "../utils/supabase";

// Landing Page (khách chưa đăng nhập) — đăng ký qua edge fn công khai
// register-booking; danh sách tuyến dùng getActiveRoutes của bookingService
// (RLS cho anon SELECT routes active).

export interface RegisterBookingInput {
  route_id: string;
  /** ISO datetime — giờ khách muốn đi, staff dựa vào đây xếp xe sau. */
  requested_departure_time: string;
  seat_count: number;
  customer_name: string;
  customer_phone: string;
  note?: string;
  pickup_address?: string;
  dropoff_address?: string;
}

/**
 * Đăng ký chuyến: tạo booking pending source=online, CHƯA gắn xe/chuyến
 * (trip_id null). Trả về booking_code.
 */
export async function registerBooking(
  input: RegisterBookingInput,
): Promise<string> {
  const { data, error } = await supabase.functions.invoke("register-booking", {
    body: input,
  });
  if (error) {
    // Lấy message tiếng Việt từ body JSON của edge fn (như accountService)
    const context = (error as { context?: Response }).context;
    const message = await context?.json?.().then(
      (b: { error?: string }) => b?.error,
      () => undefined,
    );
    throw new Error(message ?? error.message);
  }
  if (data?.error) throw new Error(data.error);
  return data.booking_code as string;
}
