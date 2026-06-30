// src/features/dispatch/components/DispatchHeader.tsx
interface DispatchHeaderProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
}

export function DispatchHeader({
  selectedDate,
  onDateChange,
}: DispatchHeaderProps) {
  return (
    <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <h1 className="text-xl font-bold text-gray-900">
        Điều phối xe trong ngày
      </h1>
      <input
        type="date"
        value={selectedDate}
        onChange={(e) => onDateChange(e.target.value)}
        className="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
      />
    </div>
  );
}
