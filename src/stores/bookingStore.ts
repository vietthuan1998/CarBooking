import { create } from "zustand";

export interface SelectedSeat {
  seatId: string;
  seatNumber: number;
}

export interface BookingState {
  tripId: string | null;
  selectedSeats: SelectedSeat[];
  totalPrice: number;
  setTrip: (tripId: string) => void;
  addSeat: (seat: SelectedSeat, pricePerSeat: number) => void;
  removeSeat: (seatId: string, pricePerSeat: number) => void;
  clearBooking: () => void;
  getTotalSeats: () => number;
}

export const useBookingStore = create<BookingState>((set, get) => ({
  tripId: null,
  selectedSeats: [],
  totalPrice: 0,

  setTrip: (tripId) =>
    set({
      tripId,
      selectedSeats: [],
      totalPrice: 0,
    }),

  addSeat: (seat, pricePerSeat) =>
    set((state) => {
      // Check if seat is already selected
      if (state.selectedSeats.some((s) => s.seatId === seat.seatId)) {
        return state;
      }
      return {
        selectedSeats: [...state.selectedSeats, seat],
        totalPrice: state.totalPrice + pricePerSeat,
      };
    }),

  removeSeat: (seatId, pricePerSeat) =>
    set((state) => ({
      selectedSeats: state.selectedSeats.filter((s) => s.seatId !== seatId),
      totalPrice: Math.max(0, state.totalPrice - pricePerSeat),
    })),

  clearBooking: () =>
    set({
      tripId: null,
      selectedSeats: [],
      totalPrice: 0,
    }),

  getTotalSeats: () => get().selectedSeats.length,
}));
