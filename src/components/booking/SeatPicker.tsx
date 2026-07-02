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
}

export function SeatPicker({
  seats,
  tripSeats,
  seatCount,
  selectedSeatOrders,
  onSeatClick,
  onRemoveSeat,
}: Props) {
  const layout = seatCount > 5 ? sevenSeatLayout : fourSeatLayout;

  const bookedOrders = tripSeats
    .filter((ts) => ts.status !== "available")
    .map((ts) => seats.find((s) => s.id === ts.seat_id)?.seat_order ?? -1)
    .filter((o) => o !== -1);

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

      <div className="rounded-xl border border-gray-100 bg-gray-50 p-2 flex justify-center">
        <CarTopView
          layout={layout}
          width={260}
          height={140}
          seatSize={80}
          selectedSeats={selectedSeatOrders}
          disabledSeats={bookedOrders}
          onSeatClick={onSeatClick}
        />
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
