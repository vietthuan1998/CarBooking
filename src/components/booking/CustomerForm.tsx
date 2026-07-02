import { CustomerSearch } from "./CustomerSearch";
import type { BookingForm, Customer } from "@/features/booking/types";

interface Props {
  form: BookingForm;
  onChange: (updated: Partial<BookingForm>) => void;
}

export function CustomerForm({ form, onChange }: Props) {
  const handleSelectExisting = (c: Customer) => {
    onChange({
      customer_id: c.id,
      customer_name: c.full_name,
      customer_phone: c.phone,
      customer_note: c.note ?? "",
      isNewCustomer: false,
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium text-gray-700">Khách hàng</p>
        <button
          onClick={() =>
            onChange({ isNewCustomer: !form.isNewCustomer, customer_id: "" })
          }
          className="text-xs text-blue-600 hover:underline"
        >
          {form.isNewCustomer ? "Tìm KH có sẵn" : "Thêm KH mới"}
        </button>
      </div>

      {/* Tìm KH có sẵn */}
      {!form.isNewCustomer && (
        <div className="mb-3">
          {form.customer_id ? (
            <div className="flex items-center justify-between bg-blue-50 rounded-lg px-3 py-2">
              <div>
                <p className="text-sm font-medium text-blue-800">
                  {form.customer_name}
                </p>
                <p className="text-xs text-blue-600">{form.customer_phone}</p>
              </div>
              <button
                onClick={() =>
                  onChange({
                    customer_id: "",
                    customer_name: "",
                    customer_phone: "",
                  })
                }
                className="text-blue-400 hover:text-blue-700 text-xs"
              >
                Đổi
              </button>
            </div>
          ) : (
            <CustomerSearch
              onSelect={handleSelectExisting}
              onNewCustomer={() => onChange({ isNewCustomer: true })}
            />
          )}
        </div>
      )}

      {/* Nhập KH mới */}
      {form.isNewCustomer && (
        <div className="space-y-2">
          <input
            placeholder="Họ và tên *"
            value={form.customer_name}
            onChange={(e) => onChange({ customer_name: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            placeholder="Số điện thoại *"
            value={form.customer_phone}
            onChange={(e) => onChange({ customer_phone: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            placeholder="Ghi chú (tùy chọn)"
            value={form.customer_note}
            onChange={(e) => onChange({ customer_note: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}
    </div>
  );
}
