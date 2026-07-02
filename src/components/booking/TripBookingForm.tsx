import { CustomerForm } from "./CustomerForm";
import { BookingFormFields } from "./BookingForm";
import type { BookingForm } from "@/features/booking/types";

interface Props {
  form: BookingForm;
  onFormChange: (updated: Partial<BookingForm>) => void;
  origin: string;
  destination: string;
  selectedCount: number;
  error: string | null;
  submitting: boolean;
  onReset: () => void;
  onSubmit: () => void;
}

export function TripBookingForm({
  form,
  onFormChange,
  origin,
  destination,
  selectedCount,
  error,
  submitting,
  onReset,
  onSubmit,
}: Props) {
  return (
    <div className="px-4 pb-4 border-t border-gray-100 pt-3 space-y-4">
      <CustomerForm form={form} onChange={onFormChange} />
      <BookingFormFields
        form={form}
        origin={origin}
        destination={destination}
        selectedCount={selectedCount}
        error={error}
        onChange={onFormChange}
      />
      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={onReset}
          className="flex-1 py-2 text-sm text-gray-600 hover:text-gray-900 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          Huỷ
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={submitting}
          className="flex-1 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
        >
          {submitting && (
            <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          )}
          {submitting ? "Đang xử lý..." : "Xác nhận đặt vé"}
        </button>
      </div>
    </div>
  );
}
