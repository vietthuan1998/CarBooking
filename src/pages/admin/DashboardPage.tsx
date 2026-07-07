import {useState} from "react";
import { CalendarDays, Car, Clock, Users, TicketCheck } from "lucide-react";
import { useDashboard } from "../../hooks/useDashboard";
import { StatCard } from "../../components/dashboard/StatCard";
import { UpcomingTripsCard } from "../../components/dashboard/UpcomingTripsCard";
import { RunningTripsCard } from "../../components/dashboard/RunningTripsCard";
import { PendingBookingsTable } from "../../components/dashboard/PendingBookingsTable";

export function DashboardPage() {

  const [selectedDate] = useState(new Date());

  const {
    stats,
    upcomingTrips,
    runningTrips,
    pendingBookings,
    loading,
    errorMessage,
  } = useDashboard(selectedDate);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-slate-600">
        Đang tải dashboard...
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-red-600">
        {errorMessage}
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 rounded-3xl border border-slate-200 bg-slate-50/80 p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
            Xin chào, Điều phối viên
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Quản lý chuyến xe trong ngày
          </p>
        </div>

        <button type="button" className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-100">
          <CalendarDays size={18} />
          Hôm nay
        </button>
      </div>

      <section className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          title="Tổng chuyến"
          value={stats?.totalTrips ?? 0}
          label="Chuyến"
          icon={<Car size={20} />}
        />
        <StatCard
          title="Đang chạy"
          value={stats?.runningTrips ?? 0}
          label="Chuyến"
          icon={<Car size={20} />}
          tone="green"
        />
        <StatCard
          title="Sắp xuất phát"
          value={stats?.upcomingTrips ?? 0}
          label="Chuyến"
          icon={<Clock size={20} />}
          tone="blue"
        />
        <StatCard
          title="Tổng khách"
          value={stats?.totalCustomers ?? 0}
          label="Khách"
          icon={<Users size={20} />}
          tone="green"
        />
        <StatCard
          title="Booking chờ xử lý"
          value={stats?.pendingBookings ?? 0}
          label="Booking"
          icon={<TicketCheck size={20} />}
          tone="red"
        />
      </section>

      <section className="mb-8 grid gap-4 xl:grid-cols-[2fr_1fr]">
        <UpcomingTripsCard trips={upcomingTrips} />
        <RunningTripsCard trips={runningTrips} />
      </section>

      <PendingBookingsTable bookings={pendingBookings} />
    </main>
  );
}