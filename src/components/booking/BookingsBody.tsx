import { TripColumn } from "./TripColumn";
import type { BookingForm, Trip } from "@/features/booking/types";
import type { Direction } from "@/hooks/useBookingsData";

interface Props {
  loading: boolean;
  totalTrips: number;
  trips: Record<Direction, Trip[]>;
  activeFormTripId: string | null;
  onFormOpen: (tripId: string | null) => void;
  form: BookingForm;
  onFormChange: (updated: Partial<BookingForm>) => void;
  onSuccess: (msg: string) => void;
  onError: (msg: string) => void;
}

export function BookingsBody({
  loading,
  totalTrips,
  trips,
  activeFormTripId,
  onFormOpen,
  form,
  onFormChange,
  onSuccess,
  onError,
}: Props) {
  return (
    <div className="px-6 py-5">
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
            <p className="text-sm text-gray-400">Đang tải chuyến xe...</p>
          </div>
        </div>
      ) : totalTrips === 0 ? (
        <div className="flex items-center justify-center py-20">
          <p className="text-sm text-gray-400">
            Không có chuyến xe nào trong ngày này
          </p>
        </div>
      ) : (
        <div className="flex gap-4">
          <TripColumn
            title="🚌 Huế → Đà Nẵng / Hội An"
            subtitle="Chiều đi"
            trips={trips.hue_to_dest}
            activeFormTripId={activeFormTripId}
            onFormOpen={onFormOpen}
            form={form}
            onFormChange={onFormChange}
            onSuccess={onSuccess}
            onError={onError}
          />

          <div className="mx-1 w-px self-stretch bg-gray-200" />

          <TripColumn
            title="🚌 Đà Nẵng / Hội An → Huế"
            subtitle="Chiều về"
            trips={trips.dest_to_hue}
            activeFormTripId={activeFormTripId}
            onFormOpen={onFormOpen}
            form={form}
            onFormChange={onFormChange}
            onSuccess={onSuccess}
            onError={onError}
          />
        </div>
      )}
    </div>
  );
}
