import type { BookingForm } from "./types";

interface Props {
  form: BookingForm;
  origin: string;
  destination: string;
  selectedCount: number;
  error: string | null;
  onChange: (updated: Partial<BookingForm>) => void;
}

export function BookingFormFields({
  form,
  origin,
  destination,
  selectedCount,
  error,
  onChange,
}: Props) {
  const total =
    selectedCount > 0 && form.fare_amount && !isNaN(Number(form.fare_amount))
      ? Number(form.fare_amount) * selectedCount
      : null;

  return (
    <div className="space-y-4">
      {/* Địa điểm */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-700">Địa điểm</p>
        <input
          placeholder={`Địa chỉ đón (tại ${origin}) *`}
          value={form.pickup_address}
          onChange={(e) => onChange({ pickup_address: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          placeholder={`Địa chỉ trả (tại ${destination}) *`}
          value={form.dropoff_address}
          onChange={(e) => onChange({ dropoff_address: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Giá vé */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">Giá vé</p>
        <div className="relative">
          <input
            type="number"
            placeholder="150000"
            value={form.fare_amount}
            onChange={(e) => onChange({ fare_amount: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 pr-12"
          />
          <span className="absolute right-3 top-2 text-xs text-gray-400">
            VNĐ
          </span>
        </div>
        {total !== null && (
          <p className="text-xs text-gray-500 mt-1">
            Tổng: {total.toLocaleString("vi-VN")} VNĐ ({selectedCount} ghế)
          </p>
        )}
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}
    </div>
  );
}
