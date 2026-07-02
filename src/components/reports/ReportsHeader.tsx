import { BarChart3 } from "lucide-react";

interface Props {
  onRefresh: () => void;
}

export function ReportsHeader({ onRefresh }: Props) {
  return (
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
        type="button"
        onClick={onRefresh}
        className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
      >
        ↻ Làm mới
      </button>
    </div>
  );
}
