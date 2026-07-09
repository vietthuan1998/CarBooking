import { useEffect, useState } from "react";
import type { BookingForm, Customer } from "@/features/booking/types";
import { searchCustomersByPhone } from "@/services/bookingService";

interface Props {
  form: BookingForm;
  onChange: (updated: Partial<BookingForm>) => void;
}

/**
 * Ô SĐT là điểm nhập duy nhất: gõ số → autocomplete khách có sẵn theo phone;
 * chọn thì liên kết customer_id + tự điền tên (ghi chú để trống — mỗi lần đặt
 * khách có yêu cầu khác nhau); sửa lại SĐT/tên thì bỏ liên kết và submit sẽ
 * upsert khách theo phone (server tự khớp nếu SĐT đã tồn tại).
 */
export function CustomerForm({ form, onChange }: Props) {
  const [results, setResults] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);

  const phone = form.customer_phone.trim();
  const linked = !form.isNewCustomer && !!form.customer_id;

  useEffect(() => {
    // Đã liên kết khách có sẵn thì không search nữa (setTimeout 0 để tránh
    // setState đồng bộ trong effect — như CustomerSearch cũ)
    if (linked || phone.length < 3) {
      const t = setTimeout(() => setResults([]), 0);
      return () => clearTimeout(t);
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        setResults(await searchCustomersByPhone(phone));
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [phone, linked]);

  const handleSelect = (c: Customer) => {
    onChange({
      customer_id: c.id,
      customer_name: c.full_name,
      customer_phone: c.phone,
      customer_note: "",
      isNewCustomer: false,
    });
    setResults([]);
  };

  // Sửa SĐT/tên = bỏ liên kết khách có sẵn (submit sẽ upsert theo phone)
  const unlink = { customer_id: "", isNewCustomer: true };

  return (
    <div>
      <p className="text-sm font-medium text-gray-700 mb-2">Khách hàng</p>
      <div className="space-y-2">
        <div className="relative">
          <input
            aria-label="Số điện thoại khách hàng"
            placeholder="Số điện thoại *"
            value={form.customer_phone}
            onChange={(e) =>
              onChange({ customer_phone: e.target.value, ...unlink })
            }
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {loading && (
            <div className="absolute right-3 top-2.5">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          {results.length > 0 && (
            <ul className="absolute z-20 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto">
              {results.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    className="w-full px-3 py-2 hover:bg-blue-50 cursor-pointer text-sm flex justify-between items-center text-left"
                    onClick={() => handleSelect(c)}
                  >
                    <span className="font-medium text-gray-800">
                      {c.full_name}
                    </span>
                    <span className="text-gray-500">{c.phone}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {linked && (
            <p className="mt-1 text-xs text-emerald-600">
              ✓ Khách có sẵn — sửa SĐT hoặc tên sẽ chuyển thành khách mới.
            </p>
          )}
        </div>
        <input
          aria-label="Họ và tên khách hàng"
          placeholder="Họ và tên *"
          value={form.customer_name}
          onChange={(e) => onChange({ customer_name: e.target.value, ...unlink })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          aria-label="Ghi chú"
          placeholder="Ghi chú (tùy chọn)"
          value={form.customer_note}
          onChange={(e) => onChange({ customer_note: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );
}
