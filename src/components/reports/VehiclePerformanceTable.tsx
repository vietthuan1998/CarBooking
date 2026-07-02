import { fCurrency } from "@/utils/helpers";
import type { VehiclePerformance } from "../../services/reportService";

interface Props {
  performance: VehiclePerformance[];
}

export function VehiclePerformanceTable({ performance }: Props) {
  const maxRevenue = Math.max(...performance.map((p) => p.total_revenue), 1);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-6 py-4">
        <h2 className="text-base font-semibold text-slate-900">
          Hiệu suất theo xe
        </h2>
        <p className="mt-0.5 text-xs text-slate-400">
          Tỷ lệ lấp đầy tính trên chuyến đã hoàn thành
        </p>
      </div>

      {performance.length === 0 ? (
        <div className="py-14 text-center text-sm text-slate-400">
          Không có dữ liệu trong khoảng thời gian này
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60">
                <th className="px-5 py-3 text-left font-medium text-slate-500">
                  Xe
                </th>
                <th className="px-4 py-3 text-center font-medium text-slate-500">
                  Chuyến
                </th>
                <th className="px-4 py-3 text-center font-medium text-slate-500">
                  Hoàn thành
                </th>
                <th className="px-4 py-3 text-center font-medium text-slate-500">
                  Booking
                </th>
                <th className="px-4 py-3 text-right font-medium text-slate-500">
                  Doanh thu
                </th>
                <th className="px-5 py-3 text-left font-medium text-slate-500 w-48">
                  Lấp đầy
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {performance.map((p) => {
                const barWidth =
                  maxRevenue > 0
                    ? Math.round((p.total_revenue / maxRevenue) * 100)
                    : 0;
                return (
                  <tr
                    key={p.id}
                    className="transition-colors hover:bg-slate-50/50"
                  >
                    <td className="px-5 py-4">
                      <div className="font-medium text-slate-900">
                        {p.vehicle_name}
                      </div>
                      <div className="font-mono text-xs text-slate-400">
                        {p.plate_number}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center text-slate-700">
                      {p.total_trips}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                        {p.completed_trips}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center text-slate-700">
                      {p.total_bookings}
                    </td>
                    <td className="px-4 py-4 text-right font-medium text-slate-900">
                      {fCurrency(p.total_revenue)}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-blue-500 transition-all"
                            style={{ width: `${barWidth}%` }}
                          />
                        </div>
                        <span className="w-10 text-right text-xs font-medium text-slate-600">
                          {p.occupancy_rate}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-200 bg-slate-50/60">
                <td className="px-5 py-3 text-sm font-semibold text-slate-700">
                  Tổng cộng
                </td>
                <td className="px-4 py-3 text-center text-sm font-semibold text-slate-700">
                  {performance.reduce((s, p) => s + p.total_trips, 0)}
                </td>
                <td className="px-4 py-3 text-center text-sm font-semibold text-emerald-700">
                  {performance.reduce((s, p) => s + p.completed_trips, 0)}
                </td>
                <td className="px-4 py-3 text-center text-sm font-semibold text-slate-700">
                  {performance.reduce((s, p) => s + p.total_bookings, 0)}
                </td>
                <td className="px-4 py-3 text-right text-sm font-semibold text-slate-900">
                  {fCurrency(
                    performance.reduce((s, p) => s + p.total_revenue, 0),
                  )}
                </td>
                <td className="px-5 py-3" />
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}
