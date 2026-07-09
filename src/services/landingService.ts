import { invokeEdgeFunction } from "../utils/edgeFunctions";

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
  const data = await invokeEdgeFunction("register-booking", input);
  return data.booking_code as string;
}
