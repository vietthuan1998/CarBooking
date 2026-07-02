// src/pages/admin/BookingsPage.tsx

import { useEffect, useState } from "react";
import { supabase } from "../../utils/supabase";
import { TripColumn } from "../../components/booking/TripColumn";
import { Toast } from "../../components/booking/Toast";
import { INITIAL_FORM } from "../../components/booking/types";
import type { BookingForm, Trip } from "../../components/booking/types";

type Direction = "hue_to_dest" | "dest_to_hue";

type TripStatus = "all" | "scheduled" | "in_progress" | "completed" | "cancelled";

const STATUS_LABELS: Record<TripStatus, string> = {
  all: "Tất cả",
  scheduled: "Chờ xuất phát",
  in_progress: "Đang chạy",
  completed: "Hoàn thành",
  cancelled: "Đã hủy",
};

function todayInputValue(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

type FetchedData = {
  trips: Record<Direction, Trip[]>;
  depsKey: string;
};

export default function BookingsPage() {
  const [fetchedData, setFetchedData] = useState<FetchedData | null>(null);
  const [activeFormTripId, setActiveFormTripId] = useState<string | null>(null);
  const [sharedForm, setSharedForm] = useState<BookingForm>(INITIAL_FORM);
  const handleFormChange = (updated: Partial<BookingForm>) =>
    setSharedForm((f) => ({ ...f, ...updated }));
  const [toast, setToast] = useState<{
    msg: string;
    type: "success" | "error";
  } | null>(null);

  // Filters
  const [selectedDate, setSelectedDate] = useState<string>(todayInputValue());
  const [statusFilter, setStatusFilter] = useState<TripStatus>("all");
  const [refreshKey, setRefreshKey] = useState(0);

  // loading is derived: true whenever current deps don't match last fetched data
  const depsKey = `${selectedDate}|${statusFilter}|${refreshKey}`;
  const loading = fetchedData === null || fetchedData.depsKey !== depsKey;
  const trips = fetchedData?.trips ?? { hue_to_dest: [], dest_to_hue: [] };

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    let cancelled = false;
    const key = `${selectedDate}|${statusFilter}|${refreshKey}`;

    async function load() {
      try {
        // Build local-time day boundaries → UTC for Supabase timestamptz
        const d = new Date(`${selectedDate}T00:00:00`);
        const dayStart = new Date(
          d.getFullYear(),
          d.getMonth(),
          d.getDate(),
          0,
          0,
          0,
          0,
        ).toISOString();
        const dayEnd = new Date(
          d.getFullYear(),
          d.getMonth(),
          d.getDate(),
          23,
          59,
          59,
          999,
        ).toISOString();

        let query = supabase
          .from("trips")
          .select(
            `id, trip_code, planned_departure_time, trip_status,
           vehicle:vehicles(id, plate_number, vehicle_name, seat_count),
           route:routes(route_name, origin, destination)`,
          )
          .gte("planned_departure_time", dayStart)
          .lte("planned_departure_time", dayEnd)
          .order("planned_departure_time");

        if (statusFilter !== "all") {
          query = query.eq("trip_status", statusFilter);
        }

        const { data, error } = await query;
        if (cancelled) return;
        if (error) {
          console.error(error);
          return;
        }

        const all = (data ?? []) as unknown as Trip[];
        setFetchedData({
          trips: {
            hue_to_dest: all.filter((t) => t.route.origin === "Huế"),
            dest_to_hue: all.filter((t) => t.route.destination === "Huế"),
          },
          depsKey: key,
        });
      } catch (err) {
        console.error(err);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [selectedDate, statusFilter, refreshKey]);

  const totalTrips = trips.hue_to_dest.length + trips.dest_to_hue.length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b border-gray-100 bg-white px-6 py-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">
              Quản lý đặt vé
            </h1>
            <p className="mt-0.5 text-xs text-gray-400">
              {totalTrips} chuyến{totalTrips !== 1 ? "" : ""} ·{" "}
              {new Date(`${selectedDate}T00:00:00`).toLocaleDateString(
                "vi-VN",
                {
                  weekday: "long",
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                },
              )}
            </p>
          </div>
          <button
            onClick={() => setRefreshKey((k) => k + 1)}
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-500 transition-colors hover:border-blue-300 hover:text-blue-600"
          >
            ↻ Làm mới
          </button>
        </div>

        {/* Filter bar */}
        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
          {/* Date picker */}
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
          />

          {/* Status filter */}
          <div className="flex gap-1 rounded-xl bg-gray-100 p-1">
            {(Object.keys(STATUS_LABELS) as TripStatus[]).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={[
                  "rounded-lg px-2.5 py-1 text-xs font-medium transition-colors",
                  statusFilter === s
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700",
                ].join(" ")}
              >
                {STATUS_LABELS[s]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="px-6 py-5">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
              <p className="text-sm text-gray-400">Đang tải chuyến xe...</p>
            </div>
          </div>
        ) : totalTrips === 0 ? (
          <div className="flex items-center justify-center py-20">
            <p className="text-sm text-gray-400">
              Không có chuyến xe nào trong ngày này
            </p>
          </div>
        ) : (
          <div className="flex gap-4">
            <TripColumn
              title="🚌 Huế → Đà Nẵng / Hội An"
              subtitle="Chiều đi"
              trips={trips.hue_to_dest}
              activeFormTripId={activeFormTripId}
              onFormOpen={setActiveFormTripId}
              form={sharedForm}
              onFormChange={handleFormChange}
              onSuccess={(msg) => showToast(msg, "success")}
              onError={(msg) => showToast(msg, "error")}
            />

            <div className="mx-1 w-px self-stretch bg-gray-200" />

            <TripColumn
              title="🚌 Đà Nẵng / Hội An → Huế"
              subtitle="Chiều về"
              trips={trips.dest_to_hue}
              activeFormTripId={activeFormTripId}
              onFormOpen={setActiveFormTripId}
              form={sharedForm}
              onFormChange={handleFormChange}
              onSuccess={(msg) => showToast(msg, "success")}
              onError={(msg) => showToast(msg, "error")}
            />
          </div>
        )}
      </div>

      {toast && <Toast msg={toast.msg} type={toast.type} />}
    </div>
  );
}
