import { useEffect, useState } from "react";
import type { Customer } from "@/features/booking/types";
import { searchCustomers } from "@/services/bookingService";

interface Props {
  onSelect: (c: Customer) => void;
  onNewCustomer: () => void;
}

export function CustomerSearch({ onSelect, onNewCustomer }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query.length < 2) {
      const t = setTimeout(() => setResults([]), 0);
      return () => clearTimeout(t);
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        setResults(await searchCustomers(query));
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="relative">
      <input
        type="text"
        aria-label="Tìm khách hàng (tên hoặc SĐT)"
        placeholder="Tìm khách hàng (tên hoặc SĐT)..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
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
                onClick={() => {
                  onSelect(c);
                  setQuery("");
                  setResults([]);
                }}
              >
                <span className="font-medium text-gray-800">{c.full_name}</span>
                <span className="text-gray-500">{c.phone}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      <button
        type="button"
        onClick={onNewCustomer}
        className="mt-2 text-xs text-blue-600 hover:underline flex items-center gap-1"
      >
        <span>＋</span> Thêm khách hàng mới
      </button>
    </div>
  );
}
