import type { UpcomingTrip } from "../../features/dashboard/types";

type Props = {
  trips: UpcomingTrip[];
};

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getAvailableSeats(trip: UpcomingTrip) {
  const totalSeats = trip.vehicle?.seat_count ?? 0;
  const assignedSeats = trip.trip_seats.filter(
    (seat) => seat.status === "assigned"
  ).length;

  return Math.max(totalSeats - assignedSeats, 0);
}

export function UpcomingTripsCard({ trips }: Props) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-slate-900">Chuyến sắp xuất phát</h2>
        <button className="text-sm font-medium text-slate-500 transition hover:text-slate-700">
          Xem tất cả
        </button>
      </div>

      <div className="space-y-4">
        {trips.map((trip) => (
          <div
            className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4 shadow-sm transition hover:border-slate-300 hover:bg-white"
            key={trip.id}
          >
            <div>
              <strong className="text-sm font-semibold text-slate-900">{trip.trip_code}</strong>
              <p className="mt-1 text-sm text-slate-600">
                {trip.route?.origin} → {trip.route?.destination}
              </p>
            </div>

            <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm font-medium text-slate-700">{formatTime(trip.planned_departure_time)}</div>
              <div className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
                Còn {getAvailableSeats(trip)} ghế
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}