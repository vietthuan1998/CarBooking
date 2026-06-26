
import type { RunningTrip } from "../../features/dashboard/types";
import { TemporaryMap } from "../../components/dashboard/TemporaryMap";

type Props = {
  trips: RunningTrip[];
};

export function RunningTripsCard({ trips }: Props) {
  return (
    <section className="flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900">Chuyến đang chạy</h2>

        <button className="text-sm font-semibold text-slate-500 transition hover:text-blue-600">
          Xem tất cả
        </button>
      </div>

      <div className="mb-4 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
        <div className="h-[220px] w-full">
          <TemporaryMap />
        </div>
      </div>

      <div className="flex-1 space-y-3">
        {trips.length === 0 ? (
          <div className="flex min-h-[116px] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm font-medium text-slate-500">
            Chưa có chuyến đang chạy
          </div>
        ) : (
          trips.map((trip) => (
            <div
              key={trip.id}
              className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 transition hover:border-emerald-100 hover:bg-emerald-50/40"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-bold text-blue-600">
                    {trip.trip_code}
                  </p>

                  <p className="mt-1 text-sm font-medium text-slate-700">
                    {trip.route?.origin ?? "-"} →{" "}
                    {trip.route?.destination ?? "-"}
                  </p>

                  {trip.driver?.full_name && (
                    <p className="mt-1 text-xs text-slate-500">
                      Tài xế: {trip.driver.full_name}
                    </p>
                  )}
                </div>

                <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-600 ring-1 ring-emerald-100">
                  Đang chạy
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}