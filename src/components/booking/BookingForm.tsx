import type { BookingForm, Route } from "@/features/booking/types";

interface Props {
  form: BookingForm;
  origin: string;
  destination: string;
  routes: Route[];
  selectedCount: number;
  error: string | null;
  onChange: (updated: Partial<BookingForm>) => void;
}

export function BookingFormFields({
  form,
  origin,
  destination,
  routes,
  selectedCount,
  error,
  onChange,
}: Props) {
  const selectedRoute = routes.find((r) => r.id === form.route_id) ?? null;
  const total = selectedRoute
    ? selectedRoute.base_price * selectedCount
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

      {/* Tuyến & giá vé */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">Tuyến đi</p>
        <select
          value={form.route_id}
          onChange={(e) => onChange({ route_id: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">-- Chọn tuyến --</option>
          {routes.map((r) => (
            <option key={r.id} value={r.id}>
              {r.route_name} ({r.base_price.toLocaleString("vi-VN")} VNĐ/ghế)
            </option>
          ))}
        </select>

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
