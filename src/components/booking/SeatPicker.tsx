import { useState } from "react";
import CarTopView from "../car/CarTopView";
import { fourSeatLayout, sevenSeatLayout } from "../car/SeatLayout";
import { Legend } from "./Legend";
import type { Seat, TripSeat } from "@/features/booking/types";

interface Props {
  seats: Seat[];
  tripSeats: TripSeat[];
  seatCount: number;
  selectedSeatOrders: number[];
  onSeatClick: (seatOrder: number) => void;
  onRemoveSeat: (seatOrder: number) => void;
  disabled?: boolean;
}

export function SeatPicker({
  seats,
  tripSeats,
  seatCount,
  selectedSeatOrders,
  onSeatClick,
  onRemoveSeat,
  disabled = false,
}: Props) {
  const layout = seatCount > 5 ? sevenSeatLayout : fourSeatLayout;
  const [openOrder, setOpenOrder] = useState<number | null>(null);

  const bookedOrders = disabled
    ? seats.map((s) => s.seat_order)
    : tripSeats
        .filter((ts) => ts.status !== "available")
        .map((ts) => seats.find((s) => s.id === ts.seat_id)?.seat_order ?? -1)
        .filter((o) => o !== -1);

  // Chỉ ghế thực sự có booking mới xem được thông tin — ghế bị disable
  // do chuyến không cho đặt (nhưng chưa ai đặt) thì không có gì để hiện.
  const bookingByOrder = new Map(
    tripSeats
      .filter((ts) => ts.status !== "available" && ts.booking)
      .map((ts) => [
        seats.find((s) => s.id === ts.seat_id)?.seat_order ?? -1,
        ts.booking!,
      ])
      .filter(([order]) => order !== -1),
  );

  const openBooking = openOrder !== null ? bookingByOrder.get(openOrder) : undefined;
  const openSeat = seats.find((s) => s.seat_order === openOrder);

  const handleSeatClick = (order: number) => {
    if (bookingByOrder.has(order)) {
      setOpenOrder((prev) => (prev === order ? null : order));
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

      <div className="relative">
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

        {openBooking && (
          <div className="absolute inset-x-2 top-2 z-20 bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-sm">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-medium text-gray-800">
                  Ghế {openSeat?.seat_code} · {openBooking.customer?.full_name ?? "—"}
                </p>
                {openBooking.customer?.phone && (
                  <a
                    href={`tel:${openBooking.customer.phone}`}
                    className="text-blue-600 hover:underline"
                  >
                    {openBooking.customer.phone}
                  </a>
                )}
              </div>
              <button
                onClick={() => setOpenOrder(null)}
                className="text-gray-400 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="mt-1.5 text-gray-500 text-xs space-y-0.5">
              <p>Đón: {openBooking.pickup_address}</p>
              <p>Trả: {openBooking.dropoff_address}</p>
              <p>Mã vé: {openBooking.booking_code}</p>
            </div>
          </div>
        )}
      </div>

      <Legend />

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
