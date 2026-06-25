import { Seat } from "./Seat";
import type { CarLayout } from "./types";

interface SeatMapProps {
  layout: CarLayout;
  width: number;
  height: number;
  seatSize: number;
  selectedSeats: number[];
  disabledSeats: number[];
  onSeatClick?: (seatId: number) => void;
}

export function SeatMap({
  layout,
  width,
  height,
  seatSize,
  selectedSeats,
  disabledSeats,
  onSeatClick,
}: SeatMapProps) {
  return (
    <>
      {layout.seats.map((seat) => {
        const x = (seat.x / 100) * width;
        const y = (seat.y / 100) * height;

        return (
          <Seat
            key={seat.id}
            x={x}
            y={y}
            size={seatSize}
            label={seat.label ?? String(seat.id)}
            selected={selectedSeats.includes(seat.id)}
            disabled={disabledSeats.includes(seat.id)}
            isDriver={seat.isDriver}
            onClick={() => onSeatClick?.(seat.id)}
          />
        );
      })}
    </>
  );
}
