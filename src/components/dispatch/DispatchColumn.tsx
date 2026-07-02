// src/features/dispatch/components/DispatchColumn.tsx
import type {
  CreateTripInput,
  Route,
  Trip,
  Vehicle,
} from "../../features/dispatch/types";
import { CreateTripForm } from "./CreateTripForm";
import { TripCard } from "./TripCard";

interface DispatchColumnProps {
  title: string;
  routesInColumn: Route[];
  vehicles: Vehicle[];
  trips: Trip[];
  onSubmit: (input: CreateTripInput) => Promise<Trip>;
  onCancel: (tripId: string) => void;
  onComplete: (tripId: string) => void;
  onDelete: (tripId: string) => void;
}

export function DispatchColumn({
  title,
  routesInColumn,
  vehicles,
  trips,
  onSubmit,
  onCancel,
  onComplete,
  onDelete,
}: DispatchColumnProps) {
  return (
    <div className="flex-1 rounded-xl border border-gray-200 bg-white p-4">
      <h2 className="mb-3 text-base font-semibold text-gray-900">{title}</h2>

      <CreateTripForm
        routesInColumn={routesInColumn}
        vehicles={vehicles}
        onSubmit={onSubmit}
        columnLabel={title}
      />

      {trips.length === 0 ? (
        <p className="py-6 text-center text-sm text-gray-400">
          Chưa có chuyến nào trong ngày này
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {trips.map((trip) => (
            <TripCard
              key={trip.id}
              trip={trip}
              onCancel={onCancel}
              onComplete={onComplete}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
