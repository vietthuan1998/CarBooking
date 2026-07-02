import { SeatPicker } from "./SeatPicker";
import { TripCardHeader } from "./TripCardHeader";
import type { BookingForm, Trip } from "./types";
import { TripBookingForm } from "./TripBookingForm";
import { useTripBooking } from "@/hooks/useTripBooking";

interface Props {
  trip: Trip;
  activeFormTripId: string | null;
  onFormOpen: (tripId: string | null) => void;
  form: BookingForm;
  onFormChange: (updated: Partial<BookingForm>) => void;
  onSuccess: (msg: string) => void;
  onError: (msg: string) => void;
}

export function TripCard({
  trip,
  activeFormTripId,
  onFormOpen,
  form,
  onFormChange,
  onSuccess,
  onError,
}: Props) {
  const isActive = activeFormTripId === trip.id;

  const {
    tripSeats,
    vehicleSeats,
    seatsLoading,
    selectedSeatOrders,
    formError,
    submitting,
    handleSeatClick,
    handleRemoveSeat,
    handleReset,
    handleSubmit,
  } = useTripBooking({
    trip,
    form,
    onFormOpen,
    onFormChange,
    onSuccess,
    onError,
  });

  const availableCount = tripSeats.filter(
    (ts) => ts.status === "available",
  ).length;
  const showForm = isActive && selectedSeatOrders.length > 0;

  return (
    <div className="rounded-xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow">
      <TripCardHeader trip={trip} />

      {/* Seat picker */}
      <div className="px-4 pb-3 border-t border-gray-50 pt-3">
        {seatsLoading ? (
          <div className="flex items-center justify-center py-6">
            <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <SeatPicker
            seats={vehicleSeats}
            tripSeats={tripSeats}
            seatCount={trip.vehicle.seat_count}
            selectedSeatOrders={selectedSeatOrders}
            onSeatClick={handleSeatClick}
            onRemoveSeat={handleRemoveSeat}
          />
        )}
      </div>

      {/* Inline booking form — only shown when seats are selected */}
      {showForm && (
        <TripBookingForm
          form={form}
          onFormChange={onFormChange}
          origin={trip.route.origin}
          destination={trip.route.destination}
          selectedCount={selectedSeatOrders.length}
          error={formError}
          submitting={submitting}
          onReset={handleReset}
          onSubmit={handleSubmit}
        />
      )}

      {/* Footer hint when no seat selected */}
      {!seatsLoading && !showForm && (
        <div className="px-4 pb-3 text-center">
          <p className="text-xs text-gray-400">
            {availableCount > 0
              ? "Nhấn vào ghế để chọn và đặt vé"
              : "Không còn ghế trống"}
          </p>
        </div>
      )}
    </div>
  );
}
