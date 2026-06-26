import type { Trip } from "./types";
import { TripCard } from "./TripCard";

interface Props {
  title: string;
  subtitle: string;
  trips: Trip[];
  loadingTripId: string | null;
  onBook: (trip: Trip) => void;
}

export function TripColumn({
  title,
  subtitle,
  trips,
  loadingTripId,
  onBook,
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
            loadingTripId={loadingTripId}
            onBook={onBook}
          />
        ))}
      </div>
    </div>
  );
}
