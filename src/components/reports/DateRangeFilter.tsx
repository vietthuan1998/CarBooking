import { PRESETS, toInputValue, type PresetKey } from "./utils";

interface Props {
  preset: PresetKey;
  startDate: Date;
  endDate: Date;
  onPresetChange: (key: PresetKey) => void;
  onStartDateChange: (d: Date) => void;
  onEndDateChange: (d: Date) => void;
}

export function DateRangeFilter({
  preset,
  startDate,
  endDate,
  onPresetChange,
  onStartDateChange,
  onEndDateChange,
}: Props) {
  return (
    <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-1 rounded-xl bg-slate-50 p-1">
          {PRESETS.map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => onPresetChange(key)}
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
            onChange={(e) =>
              onStartDateChange(new Date(`${e.target.value}T00:00:00`))
            }
            className="rounded-lg border border-slate-200 px-3 py-1.5 focus:border-blue-400 focus:outline-none"
          />
          <span className="text-slate-400">—</span>
          <input
            type="date"
            value={toInputValue(endDate)}
            onChange={(e) =>
              onEndDateChange(new Date(`${e.target.value}T00:00:00`))
            }
            className="rounded-lg border border-slate-200 px-3 py-1.5 focus:border-blue-400 focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
}
