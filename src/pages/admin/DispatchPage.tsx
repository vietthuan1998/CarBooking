// src/features/dispatch/DispatchBoard.tsx
import { useState } from "react";
import { DispatchHeader } from "@/components/dispatch/DispatchHeader";
import { useDispatchColumns } from "@/hooks/useDispatchColumns";
import { DispatchColumn } from "@/components/dispatch/DispatchColumn";
import { todayDateInputValue } from "@/utils/helpers";
import { useDispatchData } from "@/hooks/useDispatchData";

export default function DispatchBoard() {
  const [selectedDate, setSelectedDate] = useState<string>(
    todayDateInputValue(),
  );

  const {
    routes,
    vehicles,
    trips,
    loading,
    error,
    createTrip,
    updateTripStatus,
    deleteTrip,
  } = useDispatchData(selectedDate);

  const { fromHueRoutes, toHueRoutes, fromHueTrips, toHueTrips } =
    useDispatchColumns(routes, trips);

  const handleCancel = (tripId: string) =>
    updateTripStatus(tripId, "cancelled");
  const handleComplete = (tripId: string) =>
    updateTripStatus(tripId, "completed");
  const handleDelete = (tripId: string) => {
    if (window.confirm("Xóa chuyến này?")) deleteTrip(tripId);
  };

  return (
    <div className="mx-auto max-w-6xl p-4">
      <DispatchHeader
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
      />

      {error && (
        <div className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-gray-400">Đang tải dữ liệu...</p>
      ) : (
        <div className="flex flex-col gap-4 sm:flex-row">
          <DispatchColumn
            title="Huế → Đà Nẵng - Hội An"
            routesInColumn={fromHueRoutes}
            vehicles={vehicles}
            trips={fromHueTrips}
            onSubmit={createTrip}
            onCancel={handleCancel}
            onComplete={handleComplete}
            onDelete={handleDelete}
          />
          <DispatchColumn
            title="Đà Nẵng - Hội An → Huế"
            routesInColumn={toHueRoutes}
            vehicles={vehicles}
            trips={toHueTrips}
            onSubmit={createTrip}
            onCancel={handleCancel}
            onComplete={handleComplete}
            onDelete={handleDelete}
          />
        </div>
      )}
    </div>
  );
}
