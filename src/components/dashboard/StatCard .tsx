// src/features/dashboard/components/StatCard.tsx
import type { ReactNode } from "react";

type StatCardProps = {
  title: string;
  value: number;
  label: string;
  icon: ReactNode;
  tone?: "blue" | "green" | "red";
};

const toneClasses = {
  blue: {
    icon: "bg-blue-50 text-blue-600",
    value: "text-blue-600",
  },
  green: {
    icon: "bg-emerald-50 text-emerald-600",
    value: "text-emerald-600",
  },
  red: {
    icon: "bg-red-50 text-red-600",
    value: "text-red-600",
  },
};

export function StatCard({
  title,
  value,
  label,
  icon,
  tone = "blue",
}: StatCardProps) {
  const classes = toneClasses[tone];

  return (
    <article className="rounded-2xl bg-white p-5 shadow-sm border border-slate-100">
      <div className="flex items-start justify-between gap-4">
        <span className="text-sm font-medium text-slate-500">{title}</span>

        <span
          className={`flex h-9 w-9 items-center justify-center rounded-xl ${classes.icon}`}
        >
          {icon}
        </span>
      </div>

      <div className={`mt-4 text-3xl font-bold leading-none ${classes.value}`}>
        {value}
      </div>

      <p className="mt-2 text-sm font-medium text-slate-500">{label}</p>
    </article>
  );
}