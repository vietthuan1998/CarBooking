import { SeatPicker } from "./SeatPicker";
import { TripCardHeader } from "./TripCardHeader";
import type { BookingForm, Route, Trip } from "@/features/booking/types";
import { TripBookingForm } from "./TripBookingForm";
import { useTripBooking } from "@/hooks/useTripBooking";
import { getRouteColumn } from "@/utils/helpers";

interface Props {
  trip: Trip;
  routes: Route[];
  activeFormTripId: string | null;
  onFormOpen: (tripId: string | null) => void;
  form: BookingForm;
  onFormChange: (updated: Partial<BookingForm>) => void;
  onSuccess: (msg: string) => void;
  onError: (msg: string) => void;
}

export function TripCard({
  trip,
  routes,
  activeFormTripId,
  onFormOpen,
  form,
  onFormChange,
  onSuccess,
  onError,
}: Props) {
  const isActive = activeFormTripId === trip.id;

  // Các tuyến cùng chiều với chuyến này (VD: Huế → Đà Nẵng, Huế → Hội An)
  // để khách chọn điểm đến cụ thể và tính giá vé tương ứng.
  const directionRoutes = routes.filter(
    (r) => getRouteColumn(r) === getRouteColumn(trip.route),
  );

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

  // Chỉ chuyến 'scheduled' mới cho đặt vé — chuyến khác vẫn hiển thị ghế
  // (giữ nguyên bộ lọc trạng thái) nhưng ghế bị disable, không bấm chọn được.
  const isBookable = trip.trip_status === "scheduled";

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
            disabled={!isBookable}
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
          routes={directionRoutes}
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
            {!isBookable
              ? trip.trip_status === "cancelled"
                ? "Chuyến đã hủy — không thể đặt vé"
                : trip.trip_status === "completed"
                ? "Chuyến đã hoàn thành — không thể đặt vé"
                : "Chuyến đang chạy — không thể đặt vé"
              : availableCount > 0
              ? "Nhấn vào ghế để chọn và đặt vé"
              : "Không còn ghế trống"}
          </p>
        </div>
      )}
    </div>
  );
}
