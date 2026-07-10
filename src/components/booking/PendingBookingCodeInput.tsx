import { useEffect, useState } from "react";
import type { BookingForm, Route } from "@/features/booking/types";
import { findPendingBookingByCode } from "@/services/bookingService";

interface Props {
  /** Các tuyến cùng chiều với chuyến — chặn gán booking đăng ký chiều ngược. */
  routes: Route[];
  form: BookingForm;
  onChange: (updated: Partial<BookingForm>) => void;
}

type LookupStatus = "idle" | "loading" | "notfound" | "wrong_direction";

/** Xóa dữ liệu autofill khi bỏ gán / đổi mã. */
const CLEAR_ASSIGN: Partial<BookingForm> = {
  booking_id: "",
  booking_code: "",
  customer_id: "",
  customer_name: "",
  customer_phone: "",
  customer_note: "",
  isNewCustomer: true,
  pickup_address: "",
  dropoff_address: "",
  route_id: "",
};

/**
 * Ô dán mã booking online (BK-...) từ dashboard: tra bản pending chưa xếp xe
 * theo mã, tự điền khách/địa chỉ/tuyến từ đăng ký của khách. Submit sẽ gán
 * booking đó vào chuyến (gửi booking_id) thay vì tạo booking mới —
 * staff không phải nhập lại rồi hủy bản pending nữa.
 */
export function PendingBookingCodeInput({ routes, form, onChange }: Props) {
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<LookupStatus>("idle");

  // Debounce tra mã: chỉ chạy khi có mã và chưa gán (gán xong thì dừng).
  useEffect(() => {
    const trimmed = code.trim();
    if (!trimmed || form.booking_id) return;

    const timer = setTimeout(async () => {
      setStatus("loading");
      try {
        const b = await findPendingBookingByCode(trimmed);
        if (!b) {
          setStatus("notfound");
          return;
        }
        if (!routes.some((r) => r.id === b.route_id)) {
          setStatus("wrong_direction");
          return;
        }
        setStatus("idle");
        onChange({
          booking_id: b.id,
          booking_code: b.booking_code,
          customer_id: b.customer?.id ?? "",
          customer_name: b.customer?.full_name ?? "",
          customer_phone: b.customer?.phone ?? "",
          customer_note: b.note ?? "",
          isNewCustomer: false,
          pickup_address: b.pickup_address,
          dropoff_address: b.dropoff_address,
          route_id: b.route_id,
        });
      } catch {
        setStatus("notfound");
      }
    }, 400);
    return () => clearTimeout(timer);
    // routes/onChange ổn định theo trip card, chỉ cần chạy lại khi mã đổi
    // hoặc trạng thái gán đổi (bỏ gán → tra lại mã đang nhập).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, form.booking_id]);

  const handleInput = (value: string) => {
    setCode(value);
    setStatus("idle");
    // Đang gán mà sửa/xóa mã → bỏ gán, xóa dữ liệu đã autofill
    if (form.booking_id) onChange(CLEAR_ASSIGN);
  };

  return (
    <div>
      <p className="text-sm font-medium text-gray-700 mb-2">Mã booking</p>
      <div className="relative">
        <input
          aria-label="Mã booking online chờ xếp xe"
          placeholder="Nhập Mã Booking"
          value={code}
          onChange={(e) => handleInput(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {status === "loading" && (
          <div className="absolute right-3 top-2.5">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>
      {status === "notfound" && (
        <p className="mt-1 text-xs text-red-600">
          Không tìm thấy booking chờ xếp xe với mã này (mã sai hoặc đã xử lý).
        </p>
      )}
      {status === "wrong_direction" && (
        <p className="mt-1 text-xs text-red-600">
          Booking này đăng ký tuyến ngược chiều với chuyến đang chọn.
        </p>
      )}
    </div>
  );
}
