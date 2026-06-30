import { formatDateTime } from "@/utils/helpers";
import type { PendingBooking } from "../../features/dashboard/types";

type Props = {
  bookings: PendingBooking[];
};

export function PendingBookingsTable({ bookings }: Props) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-slate-900">
          Booking chờ xử lý
        </h2>
        <button className="text-sm font-medium text-slate-500 transition hover:text-slate-700">
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
                Ngày đi
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Số ghế
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Trạng thái
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {bookings.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-8 text-center text-sm font-medium text-slate-500"
                >
                  Chưa có booking nào
                </td>
              </tr>
            ) : (
              bookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-slate-50">
                  <td className="whitespace-nowrap px-4 py-4 text-sm font-semibold text-slate-900">
                    {booking.booking_code}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">
                    {booking.customer?.full_name}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">
                    {booking.customer?.phone}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">
                    {booking.trip?.route?.origin} →{" "}
                    {booking.trip?.route?.destination}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">
                    {formatDateTime(booking.trip?.planned_departure_time)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">
                    {booking.seat_count}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4">
                    <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-700">
                      NEW
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
