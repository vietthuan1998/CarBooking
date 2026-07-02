import { TripCard } from "./TripCard";
import type { BookingForm, Trip } from "@/features/booking/types";

interface Props {
  title: string;
  subtitle: string;
  trips: Trip[];
  activeFormTripId: string | null;
  onFormOpen: (tripId: string | null) => void;
  form: BookingForm;
  onFormChange: (updated: Partial<BookingForm>) => void;
  onSuccess: (msg: string) => void;
  onError: (msg: string) => void;
}

export function TripColumn({
  title,
  subtitle,
  trips,
  activeFormTripId,
  onFormOpen,
  form,
  onFormChange,
  onSuccess,
  onError,
}: Props) {
  return (
    <div className="flex-1 min-w-0">
      <div className="mb-3">
        <h2 className="text-base font-semibold text-gray-800">{title}</h2>
        <p className="text-xs text-gray-400">{subtitle}</p>
      </div>
      <div className="space-y-3">
        {trips.length === 0 && (
          <div className="rounded-xl border border-dashed border-gray-200 p-6 text-center text-sm text-gray-400">
            Không có chuyến nào hôm nay
          </div>
        )}
        {trips.map((trip) => (
          <TripCard
            key={trip.id}
            trip={trip}
            activeFormTripId={activeFormTripId}
            onFormOpen={onFormOpen}
            form={form}
            onFormChange={onFormChange}
            onSuccess={onSuccess}
            onError={onError}
          />
        ))}
      </div>
    </div>
  );
}
