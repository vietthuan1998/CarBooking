import type { ReactNode } from "react";

interface Props {
  title: string;
  value: string;
  sub?: string;
  icon: ReactNode;
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

export function SummaryCard({ title, value, sub, icon, color }: Props) {
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
