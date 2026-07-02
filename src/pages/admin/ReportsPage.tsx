import { useCallback, useEffect, useTransition, useState } from "react";
import {
  BarChart3,
  Car,
  DollarSign,
  TicketCheck,
  TrendingUp,
} from "lucide-react";
import {
  type ReportOverview,
  type VehiclePerformance,
  getReportOverview,
  getVehiclePerformance,
} from "../../services/reportService";

type PresetKey = "7d" | "30d" | "this_month" | "last_month";

function getPresetDates(key: PresetKey): [Date, Date] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  switch (key) {
    case "7d": {
      const s = new Date(today);
      s.setDate(s.getDate() - 6);
      return [s, new Date(today)];
    }
    case "30d": {
      const s = new Date(today);
      s.setDate(s.getDate() - 29);
      return [s, new Date(today)];
    }
    case "this_month":
      return [
        new Date(today.getFullYear(), today.getMonth(), 1),
        new Date(today.getFullYear(), today.getMonth() + 1, 0),
      ];
    case "last_month":
      return [
        new Date(today.getFullYear(), today.getMonth() - 1, 1),
        new Date(today.getFullYear(), today.getMonth(), 0),
      ];
  }
}

function toInputValue(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function fCurrency(n: number): string {
  return n.toLocaleString("vi-VN") + " đ";
}

interface SummaryCardProps {
  title: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
  color: "emerald" | "blue" | "violet" | "amber";
}

const colorMap = {
  emerald: {
    bg: "bg-emerald-50",
    text: "text-emerald-600",
    val: "text-emerald-700",
  },
  blue: { bg: "bg-blue-50", text: "text-blue-600", val: "text-blue-700" },
  violet: {
    bg: "bg-violet-50",
    text: "text-violet-600",
    val: "text-violet-700",
  },
  amber: { bg: "bg-amber-50", text: "text-amber-600", val: "text-amber-700" },
};

function SummaryCard({ title, value, sub, icon, color }: SummaryCardProps) {
  const c = colorMap[color];
  return (
    <article className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <span className="text-sm font-medium text-slate-500">{title}</span>
        <span
          className={`flex h-9 w-9 items-center justify-center rounded-xl ${c.bg} ${c.text}`}
        >
          {icon}
        </span>
      </div>
      <div className={`mt-4 text-2xl font-bold leading-none ${c.val}`}>
        {value}
      </div>
      {sub && <p className="mt-2 text-xs text-slate-400">{sub}</p>}
    </article>
  );
}

export default function ReportsPage() {
  const [preset, setPreset] = useState<PresetKey>("this_month");
  const [[startDate, endDate], setRange] = useState<[Date, Date]>(() =>
    getPresetDates("this_month"),
  );

  const [isPending, startTransition] = useTransition();
  const [overview, setOverview] = useState<ReportOverview | null>(null);
  const [performance, setPerformance] = useState<VehiclePerformance[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    startTransition(async () => {
      setError(null);
      try {
        const [ov, perf] = await Promise.all([
          getReportOverview(startDate, endDate),
          getVehiclePerformance(startDate, endDate),
        ]);
        setOverview(ov);
        setPerformance(perf);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Không thể tải báo cáo");
      }
    });
  }, [startDate, endDate]);

  useEffect(() => {
    load();
  }, [load]);

  const applyPreset = (key: PresetKey) => {
    setPreset(key);
    setRange(getPresetDates(key));
  };

  const maxRevenue = Math.max(...performance.map((p) => p.total_revenue), 1);

  const presets: [PresetKey, string][] = [
    ["7d", "7 ngày"],
    ["30d", "30 ngày"],
    ["this_month", "Tháng này"],
    ["last_month", "Tháng trước"],
  ];

  return (
    <div className="mx-auto max-w-7xl">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 rounded-3xl border border-slate-200 bg-slate-50/80 p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50">
            <BarChart3 className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              Báo cáo & Thống kê
            </h1>
            <p className="text-sm text-slate-500">
              Hiệu suất vận hành và doanh thu
            </p>
          </div>
        </div>
        <button
          onClick={load}
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
        >
          ↻ Làm mới
        </button>
      </div>

      {/* Date range filter */}
      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-1 rounded-xl bg-slate-50 p-1">
            {presets.map(([key, label]) => (
              <button
                key={key}
                onClick={() => applyPreset(key)}
                className={[
                  "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                  preset === key
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-700",
                ].join(" ")}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 text-sm">
            <input
              type="date"
              value={toInputValue(startDate)}
              onChange={(e) => {
                setPreset("7d");
                setRange([new Date(`${e.target.value}T00:00:00`), endDate]);
              }}
              className="rounded-lg border border-slate-200 px-3 py-1.5 focus:border-blue-400 focus:outline-none"
            />
            <span className="text-slate-400">—</span>
            <input
              type="date"
              value={toInputValue(endDate)}
              onChange={(e) => {
                setPreset("7d");
                setRange([startDate, new Date(`${e.target.value}T00:00:00`)]);
              }}
              className="rounded-lg border border-slate-200 px-3 py-1.5 focus:border-blue-400 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {isPending ? (
        <div className="flex items-center justify-center py-24">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
        </div>
      ) : error ? (
        <div className="rounded-2xl bg-red-50 p-8 text-center text-sm text-red-600">
          {error}
        </div>
      ) : (
        <>
          {/* Summary cards */}
          <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              title="Tổng doanh thu"
              value={fCurrency(overview?.total_revenue ?? 0)}
              sub="Từ các booking đã xác nhận"
              icon={<DollarSign size={20} />}
              color="emerald"
            />
            <SummaryCard
              title="Tổng chuyến xe"
              value={String(overview?.total_trips ?? 0)}
              sub="Không tính chuyến đã hủy"
              icon={<Car size={20} />}
              color="blue"
            />
            <SummaryCard
              title="Tổng booking"
              value={String(overview?.total_bookings ?? 0)}
              sub="Booking đã xác nhận"
              icon={<TicketCheck size={20} />}
              color="violet"
            />
            <SummaryCard
              title="Doanh thu TB/booking"
              value={fCurrency(overview?.avg_revenue_per_booking ?? 0)}
              sub="Trung bình mỗi lần đặt vé"
              icon={<TrendingUp size={20} />}
              color="amber"
            />
          </section>

          {/* Vehicle performance */}
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
        </>
      )}
    </div>
  );
}
