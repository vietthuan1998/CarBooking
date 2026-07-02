import { useCallback, useEffect, useTransition, useState } from "react";
import {
  type ReportOverview,
  type VehiclePerformance,
  getReportOverview,
  getVehiclePerformance,
} from "../../services/reportService";
import { ReportsHeader } from "../../components/reports/ReportsHeader";
import { DateRangeFilter } from "../../components/reports/DateRangeFilter";
import { SummaryCardsSection } from "../../components/reports/SummaryCardsSection";
import { VehiclePerformanceTable } from "../../components/reports/VehiclePerformanceTable";
import { getPresetDates, type PresetKey } from "../../components/reports/utils";

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

  return (
    <div className="mx-auto max-w-7xl">
      <ReportsHeader onRefresh={load} />

      <DateRangeFilter
        preset={preset}
        startDate={startDate}
        endDate={endDate}
        onPresetChange={applyPreset}
        onStartDateChange={(d) => {
          setPreset("7d");
          setRange([d, endDate]);
        }}
        onEndDateChange={(d) => {
          setPreset("7d");
          setRange([startDate, d]);
        }}
      />

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
          <SummaryCardsSection overview={overview} />
          <VehiclePerformanceTable performance={performance} />
        </>
      )}
    </div>
  );
}
