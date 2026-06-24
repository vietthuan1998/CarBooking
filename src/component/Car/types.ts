export interface SeatPosition {
  id: number;
  x: number;
  y: number;
  label?: string;
  isDriver?: boolean;
}

export interface CarLayout {
  seats: SeatPosition[];
}
