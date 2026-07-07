import CarTopView from "../car/CarTopView";
import { fourSeatLayout, sevenSeatLayout } from "../car/SeatLayout";
import { Legend } from "./Legend";
import type { Seat, SeatBookingInfo, TripSeat } from "@/features/booking/types";

interface Props {
  seats: Seat[];
  tripSeats: TripSeat[];
  seatCount: number;
  selectedSeatOrders: number[];
  onSeatClick: (seatOrder: number) => void;
  onRemoveSeat: (seatOrder: number) => void;
  onViewBooking: (seats: Seat[], booking: SeatBookingInfo) => void;
  disabled?: boolean;
}

export function SeatPicker({
  seats,
  tripSeats,
  seatCount,
  selectedSeatOrders,
  onSeatClick,
  onRemoveSeat,
  onViewBooking,
  disabled = false,
}: Props) {
  const layout = seatCount > 5 ? sevenSeatLayout : fourSeatLayout;

  const bookedOrders = disabled
    ? seats.map((s) => s.seat_order)
    : tripSeats
        .filter((ts) => ts.status !== "available")
        .map((ts) => seats.find((s) => s.id === ts.seat_id)?.seat_order ?? -1)
        .filter((o) => o !== -1);

  // Chỉ ghế thực sự có booking mới xem được thông tin — ghế bị disable
  // do chuyến không cho đặt (nhưng chưa ai đặt) thì không có gì để hiện.
  const bookingByOrder = new Map<number, SeatBookingInfo>(
    tripSeats
      .filter((ts) => ts.status !== "available" && ts.booking)
      .map(
        (ts): [number, SeatBookingInfo] => [
          seats.find((s) => s.id === ts.seat_id)?.seat_order ?? -1,
          ts.booking!,
        ],
      )
      .filter(([order]) => order !== -1),
  );

  const handleSeatClick = (order: number) => {
    const booking = bookingByOrder.get(order);
    if (booking) {
      // 1 khách có thể đặt nhiều ghế trong cùng 1 booking — gom hết các ghế
      // chung booking_id lại để hiển thị đầy đủ (không chỉ riêng ghế vừa bấm).
      const seatsInBooking = tripSeats
        .filter((ts) => ts.booking?.id === booking.id)
        .map((ts) => seats.find((s) => s.id === ts.seat_id))
        .filter((s): s is Seat => Boolean(s))
        .sort((a, b) => a.seat_order - b.seat_order);
      if (seatsInBooking.length > 0) onViewBooking(seatsInBooking, booking);
      return;
    }
    if (!disabled) onSeatClick(order);
  };

  const availableCount = tripSeats.filter(
    (ts) => ts.status === "available",
  ).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium text-gray-700">Chọn ghế</p>
        <span className="text-xs text-gray-400">
          {availableCount} ghế trống · {selectedSeatOrders.length} đang chọn
        </span>
      </div>

      <div
        className={`rounded-xl border border-gray-100 bg-gray-50 p-2 flex justify-center ${
          disabled ? "opacity-50" : ""
        }`}
      >
        <CarTopView
          layout={layout}
          width={260}
          height={140}
          seatSize={80}
          selectedSeats={selectedSeatOrders}
          disabledSeats={bookedOrders}
          onSeatClick={handleSeatClick}
        />
      </div>

      <Legend />
      {bookingByOrder.size > 0 && (
        <p className="mt-1 text-[11px] text-gray-400">
          Bấm vào ghế đã đặt (màu xám) để xem thông tin đặt ghế
        </p>
      )}

      {selectedSeatOrders.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {selectedSeatOrders.map((o) => {
            const seat = seats.find((s) => s.seat_order === o);
            return (
              <span
                key={o}
                className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium"
              >
                Ghế {seat?.seat_code ?? o}
                <button
                  type="button"
                  aria-label={`Bỏ chọn ghế ${seat?.seat_code ?? o}`}
                  onClick={() => onRemoveSeat(o)}
                  className="hover:text-green-900"
                >
                  ✕
                </button>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
