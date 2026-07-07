import { CarBody } from "./CarBody";
import { SeatMap } from "./SeatMap";
import type { CarLayout } from "../../features/car/types";

interface CarTopViewProps {
  layout: CarLayout;
  width?: number;
  height?: number;
  seatSize?: number;
  selectedSeats?: number[];
  disabledSeats?: number[];
  onSeatClick?: (seatId: number) => void;
}

const NO_SEATS: number[] = [];

export default function CarTopView({
  layout,
  width = 900,
  height = 450,
  seatSize = 50,
  selectedSeats = NO_SEATS,
  disabledSeats = NO_SEATS,
  onSeatClick,
}: CarTopViewProps) {
  return (
    <svg viewBox="0 0 960 476" width={width} height={height}>
      <CarBody />
      <SeatMap
        layout={layout}
        width={960}
        height={476}
        seatSize={seatSize}
        selectedSeats={selectedSeats}
        disabledSeats={disabledSeats}
        onSeatClick={onSeatClick}
      />
    </svg>
  );
}
{
  /**<div
      style={{
        width: "100%",
        maxWidth: 800,
        margin: "0 auto",
      }}
    >
      <CarTopView
        width={300}
        layout={sevenSeatLayout}
        seatSize={80}
        selectedSeats={selectedSeats}
        disabledSeats={[1, 5]}
        onSeatClick={(seatId) => {
          setSelectedSeats((prev) =>
            prev.includes(seatId)
              ? prev.filter((x) => x !== seatId)
              : [...prev, seatId],
          );
        }}
      />
      <CarTopView
        width={300}
        layout={fourSeatLayout}
        seatSize={80}
        selectedSeats={selectedSeats}
        disabledSeats={[1, 5]}
        onSeatClick={(seatId) => {
          setSelectedSeats((prev) =>
            prev.includes(seatId)
              ? prev.filter((x) => x !== seatId)
              : [...prev, seatId],
          );
        }}
      />
    </div> */
}
