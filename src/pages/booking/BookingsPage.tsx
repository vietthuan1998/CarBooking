// src/pages/admin/BookingsPage.tsx

import { useCallback, useEffect, useState } from "react";
import { supabase } from "../../utils/supabase"; // adjust path
import { TripColumn } from "../../components/booking/TripColumn";
import { BookingModal } from "../../components/booking/BookingModal";
import { Toast } from "../../components/booking/Toast";
import type { Seat, Trip, TripSeat } from "../../components/booking/types";

type Direction = "hue_to_dest" | "dest_to_hue";

export default function BookingsPage() {
  const [trips, setTrips] = useState<Record<Direction, Trip[]>>({
    hue_to_dest: [],
    dest_to_hue: [],
  });
  const [loading, setLoading] = useState(true);
  const [loadingTripId, setLoadingTripId] = useState<string | null>(null);

  // Modal state
  const [activeTrip, setActiveTrip] = useState<Trip | null>(null);
  const [tripSeats, setTripSeats] = useState<TripSeat[]>([]);
  const [vehicleSeats, setVehicleSeats] = useState<Seat[]>([]);

  // Toast
  const [toast, setToast] = useState<{
    msg: string;
    type: "success" | "error";
  } | null>(null);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchTrips = useCallback(async () => {
    try {
      setLoading(true);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 2);
      const { data, error } = await supabase
        .from("trips")
        .select(
          `
        id, trip_code, planned_departure_time, trip_status,
        vehicle:vehicles(id, plate_number, vehicle_name, seat_count),
        route:routes(route_name, origin, destination)
      `,
        )
        .gte("planned_departure_time", today.toISOString())
        .lt("planned_departure_time", tomorrow.toISOString())
        .order("planned_departure_time");
      if (error) {
        console.error(error);
        return;
      }
      const all = (data ?? []) as unknown as Trip[];
      setTrips({
        hue_to_dest: all.filter((t) => t.route.origin === "Huế"),
        dest_to_hue: all.filter((t) => t.route.destination === "Huế"),
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  const handleBookClick = async (trip: Trip) => {
    setLoadingTripId(trip.id);

    const [tripSeatsRes, vehicleSeatsRes] = await Promise.all([
      supabase
        .from("trip_seats")
        .select(
          "id, seat_id, status, booking_id, seat:seats(id, seat_code, seat_order)",
        )
        .eq("trip_id", trip.id),
      supabase
        .from("seats")
        .select("id, seat_code, seat_order")
        .eq("vehicle_id", trip.vehicle.id)
        .order("seat_order"),
    ]);

    setLoadingTripId(null);

    if (tripSeatsRes.error || vehicleSeatsRes.error) {
      showToast("Không tải được dữ liệu ghế", "error");
      return;
    }

    setTripSeats((tripSeatsRes.data ?? []) as unknown as TripSeat[]);
    setVehicleSeats((vehicleSeatsRes.data ?? []) as Seat[]);
    setActiveTrip(trip);
  };

  const handleModalClose = () => {
    setActiveTrip(null);
    setTripSeats([]);
    setVehicleSeats([]);
  };

  const handleBookingSuccess = () => {
    handleModalClose();
    showToast("Đặt vé thành công! 🎉");
    fetchTrips();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">
            Quản lý đặt vé
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            {new Date().toLocaleDateString("vi-VN", {
              weekday: "long",
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })}
          </p>
        </div>
        <button
          onClick={fetchTrips}
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-blue-600 border border-gray-200 rounded-lg px-3 py-1.5 hover:border-blue-300 transition-colors"
        >
          ↻ Làm mới
        </button>
      </div>

      {/* Body */}
      <div className="px-6 py-5">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-gray-400">Đang tải chuyến xe...</p>
            </div>
          </div>
        ) : (
          <div className="flex gap-4">
            <TripColumn
              title="🚌 Huế → Đà Nẵng / Hội An"
              subtitle="Chiều đi"
              trips={trips.hue_to_dest}
              loadingTripId={loadingTripId}
              onBook={handleBookClick}
            />

            <div className="w-px bg-gray-200 self-stretch mx-1" />

            <TripColumn
              title="🚌 Đà Nẵng / Hội An → Huế"
              subtitle="Chiều về"
              trips={trips.dest_to_hue}
              loadingTripId={loadingTripId}
              onBook={handleBookClick}
            />
          </div>
        )}
      </div>

      {activeTrip && (
        <BookingModal
          trip={activeTrip}
          tripSeats={tripSeats}
          seats={vehicleSeats}
          onClose={handleModalClose}
          onSuccess={handleBookingSuccess}
        />
      )}

      {toast && <Toast msg={toast.msg} type={toast.type} />}
    </div>
  );
}
