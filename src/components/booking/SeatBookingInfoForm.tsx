import type { Seat, SeatBookingInfo } from "@/features/booking/types";

const STATUS_LABEL: Record<string, string> = {
  pending: "Chờ xử lý",
  confirmed: "Đã xác nhận",
  cancelled: "Đã hủy",
  completed: "Hoàn thành",
};

interface Props {
  seats: Seat[];
  booking: SeatBookingInfo;
  onClose: () => void;
}

// Hiển thị lại đúng bố cục của form đăng ký (CustomerForm + BookingFormFields)
// nhưng ở chế độ chỉ xem, đổ sẵn dữ liệu của ghế đã đặt — thay vì popup nổi.
// 1 khách có thể đặt nhiều ghế trong cùng 1 booking nên `seats` là danh sách
// tất cả ghế thuộc booking đó, không chỉ riêng ghế vừa bấm.
export function SeatBookingInfoForm({ seats, booking, onClose }: Props) {
  const seatLabel = seats.map((s) => s.seat_code).join(", ");

  return (
    <div className="px-4 pb-4 border-t border-gray-100 pt-3 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-700">
          Thông tin đặt ghế {seatLabel}
        </p>
        <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-600">
          {STATUS_LABEL[booking.status] ?? booking.status}
        </span>
      </div>

      {/* Khách hàng */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">Khách hàng</p>
        <div className="space-y-2">
          <input
            readOnly
            aria-label="Họ và tên"
            value={booking.customer?.full_name ?? ""}
            placeholder="Họ và tên"
            className="w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-700"
          />
          <input
            readOnly
            aria-label="Số điện thoại"
            value={booking.customer?.phone ?? ""}
            placeholder="Số điện thoại"
            className="w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-700"
          />
        </div>
      </div>

      {/* Địa điểm */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-700">Địa điểm</p>
        <input
          readOnly
          aria-label="Địa chỉ đón"
          value={booking.pickup_address}
          placeholder="Địa chỉ đón"
          className="w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-700"
        />
        <input
          readOnly
          aria-label="Địa chỉ trả"
          value={booking.dropoff_address}
          placeholder="Địa chỉ trả"
          className="w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-700"
        />
      </div>

      <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
        <span className="text-xs text-gray-500">
          Mã vé: {booking.booking_code} · {seats.length} ghế
        </span>
        <span className="text-sm font-semibold text-gray-800">
          {booking.fare_amount.toLocaleString("vi-VN")} VNĐ
        </span>
      </div>

      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 py-2 text-sm text-gray-600 hover:text-gray-900 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          Đóng
        </button>
      </div>
    </div>
  );
}
