import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { formatDateTime } from "@/utils/helpers";
import type { PendingBooking } from "../../features/dashboard/types";

type Props = {
  bookings: PendingBooking[];
  onCancel: (booking: PendingBooking) => Promise<void>;
};

export function PendingBookingsTable({ bookings, onCancel }: Props) {
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Copy mã để dán vào ô "Mã booking online" trên trang Đặt vé (gán vào chuyến)
  const handleCopy = async (booking: PendingBooking) => {
    try {
      await navigator.clipboard.writeText(booking.booking_code);
      setCopiedId(booking.id);
      setTimeout(() => setCopiedId((id) => (id === booking.id ? null : id)), 1500);
    } catch {
      // clipboard bị chặn (http/quyền) — staff vẫn bôi đen copy tay được
    }
  };

  const handleCancel = async (booking: PendingBooking) => {
    setCancellingId(booking.id);
    try {
      await onCancel(booking);
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-slate-900">
          Khách trong ngày
        </h2>
        <button
          type="button"
          className="text-sm font-medium text-slate-500 transition hover:text-slate-700"
        >
          Xem tất cả
        </button>
      </div>

      <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-slate-50">
        <table className="min-w-full divide-y divide-slate-200 text-left">
          <thead className="bg-slate-100">
            <tr>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Mã booking
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Khách hàng
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                SĐT
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Tuyến
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Giờ đi
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                Ghế
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Ghi chú
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Trạng thái
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {bookings.length === 0 ? (
              <tr>
                <td
                  colSpan={9}
                  className="px-4 py-8 text-center text-sm font-medium text-slate-500"
                >
                  Chưa có booking nào
                </td>
              </tr>
            ) : (
              bookings.map((booking) => {
                // Chưa xếp xe (trip null) thì hủy thoải mái; đã gắn chuyến
                // thì chỉ hủy khi chuyến chưa khởi hành (khách chưa được đón)
                const cancellable =
                  !booking.trip || booking.trip.trip_status === "scheduled";
                const pending = booking.status === "pending";
                return (
                  <tr key={booking.id} className="hover:bg-slate-50">
                    <td className="whitespace-nowrap px-4 py-4 text-sm font-semibold text-slate-900">
                      <span className="inline-flex items-center gap-1.5">
                        {booking.booking_code}
                        <button
                          type="button"
                          onClick={() => handleCopy(booking)}
                          title="Copy mã — dán vào ô 'Mã booking online' trên trang Đặt vé để gán vào chuyến"
                          className="text-slate-400 transition-colors hover:text-slate-700"
                        >
                          {copiedId === booking.id ? (
                            <Check className="h-3.5 w-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">
                      {booking.customer?.full_name}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">
                      {booking.customer?.phone}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">
                      {booking.route?.origin} → {booking.route?.destination}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">
                      {formatDateTime(booking.requested_departure_time)}
                      {/* {!booking.trip && (
                        <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                          chưa xếp xe
                        </span>
                      )} */}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-center text-sm text-slate-600">
                      {booking.seat_count ?? "—"}
                    </td>
                    <td
                      className="max-w-48 truncate px-4 py-4 text-sm text-slate-600"
                      title={booking.note ?? undefined}
                    >
                      {booking.note ?? "—"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4">
                      <span
                        className={[
                          "inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide",
                          pending
                            ? "bg-amber-100 text-amber-700"
                            : "bg-emerald-100 text-emerald-700",
                        ].join(" ")}
                      >
                        {pending ? "Chờ xử lý" : "Đã xác nhận"}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-right">
                      <button
                        type="button"
                        disabled={!cancellable || cancellingId === booking.id}
                        onClick={() => handleCancel(booking)}
                        title={
                          cancellable
                            ? "Hủy booking này"
                            : "Chuyến đã khởi hành — khách đã được đón, không thể hủy"
                        }
                        className="rounded-xl border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-300 disabled:hover:bg-transparent"
                      >
                        {cancellingId === booking.id ? "Đang hủy..." : "Hủy"}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
