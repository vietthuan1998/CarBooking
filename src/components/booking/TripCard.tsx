import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";
import { SeatPicker } from "./SeatPicker";
import { CustomerForm } from "./CustomerForm";
import { BookingFormFields } from "./BookingForm";
import type { BookingForm, Seat, Trip, TripSeat } from "./types";
import { formatDate, formatTime } from "@/utils/helpers";

interface Props {
  trip: Trip;
  activeFormTripId: string | null;
  onFormOpen: (tripId: string | null) => void;
  form: BookingForm;
  onFormChange: (updated: Partial<BookingForm>) => void;
  onSuccess: (msg: string) => void;
  onError: (msg: string) => void;
}

export function TripCard({
  trip,
  activeFormTripId,
  onFormOpen,
  form,
  onFormChange,
  onSuccess,
  onError,
}: Props) {
  const [tripSeats, setTripSeats] = useState<TripSeat[]>([]);
  const [vehicleSeats, setVehicleSeats] = useState<Seat[]>([]);
  const [seatsLoading, setSeatsLoading] = useState(true);

  const [selectedSeatOrders, setSelectedSeatOrders] = useState<number[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isActive = activeFormTripId === trip.id;
  // Eager-load seats on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
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
      if (cancelled) return;
      if (!tripSeatsRes.error && !vehicleSeatsRes.error) {
        setTripSeats((tripSeatsRes.data ?? []) as unknown as TripSeat[]);
        setVehicleSeats((vehicleSeatsRes.data ?? []) as Seat[]);
      }
      setSeatsLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [trip.id, trip.vehicle.id]);

  const orderToSeatId = Object.fromEntries(
    vehicleSeats.map((s) => [s.seat_order, s.id]),
  );

  const handleSeatClick = (seatOrder: number) => {
    if (seatOrder === 1) return; // driver
    setSelectedSeatOrders((prev) => {
      const next = prev.includes(seatOrder)
        ? prev.filter((x) => x !== seatOrder)
        : [...prev, seatOrder];
      if (next.length > 0) onFormOpen(trip.id);
      else onFormOpen(null);
      return next;
    });
  };

  const handleReset = () => {
    setSelectedSeatOrders([]);
    onFormChange({
      customer_id: "",
      customer_name: "",
      customer_phone: "",
      customer_note: "",
      isNewCustomer: true,
      pickup_address: "",
      dropoff_address: "",
      fare_amount: "",
    });
    setFormError(null);
    onFormOpen(null);
  };

  const handleSubmit = async () => {
    setFormError(null);
    if (!form.customer_name || !form.customer_phone) {
      setFormError("Vui lòng nhập tên và SĐT khách hàng");
      return;
    }
    if (selectedSeatOrders.length === 0) {
      setFormError("Vui lòng chọn ít nhất 1 ghế");
      return;
    }
    if (!form.pickup_address || !form.dropoff_address) {
      setFormError("Vui lòng nhập địa chỉ đón và trả");
      return;
    }
    if (!form.fare_amount || isNaN(Number(form.fare_amount))) {
      setFormError("Vui lòng nhập giá vé hợp lệ");
      return;
    }

    setSubmitting(true);
    const selectedSeatIds = selectedSeatOrders
      .map((o) => orderToSeatId[o])
      .filter(Boolean);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-booking`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${
              session?.access_token ?? import.meta.env.VITE_SUPABASE_ANON_KEY
            }`,
            apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({
            customer_id: form.isNewCustomer ? undefined : form.customer_id,
            customer_name: form.isNewCustomer ? form.customer_name : undefined,
            customer_phone: form.isNewCustomer
              ? form.customer_phone
              : undefined,
            customer_note: form.isNewCustomer
              ? form.customer_note || undefined
              : undefined,
            trip_id: trip.id,
            seat_ids: selectedSeatIds,
            pickup_address: form.pickup_address,
            dropoff_address: form.dropoff_address,
            fare_amount: Number(form.fare_amount),
          }),
        },
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Có lỗi xảy ra");

      // Refresh trip_seats after booking
      const refreshed = await supabase
        .from("trip_seats")
        .select(
          "id, seat_id, status, booking_id, seat:seats(id, seat_code, seat_order)",
        )
        .eq("trip_id", trip.id);
      if (!refreshed.error) {
        setTripSeats((refreshed.data ?? []) as unknown as TripSeat[]);
      }

      handleReset();
      onSuccess("Đặt vé thành công! 🎉");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Có lỗi xảy ra";
      setFormError(msg);
      onError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const availableCount = tripSeats.filter(
    (ts) => ts.status === "available",
  ).length;
  const showForm = isActive && selectedSeatOrders.length > 0;

  return (
    <div className="rounded-xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow">
      {/* Card header */}
      <div className="flex items-start justify-between px-4 pt-4 pb-3">
        <div>
          <p className="text-xs font-mono text-gray-400">{trip.trip_code}</p>
          <p className="text-sm font-semibold text-gray-800 mt-0.5">
            {formatTime(trip.planned_departure_time)}
            <span className="ml-1.5 text-xs text-gray-400 font-normal">
              {formatDate(trip.planned_departure_time)}
            </span>
          </p>
          <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
            <span>🚗 {trip.vehicle.vehicle_name}</span>
            <span className="text-gray-300">·</span>
            <span>{trip.vehicle.plate_number}</span>
          </div>
        </div>
        <span
          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
            trip.trip_status === "scheduled"
              ? "bg-blue-50 text-blue-600"
              : trip.trip_status === "in_progress"
              ? "bg-green-50 text-green-600"
              : "bg-gray-100 text-gray-500"
          }`}
        >
          {trip.trip_status === "scheduled"
            ? "Đã lên lịch"
            : trip.trip_status === "in_progress"
            ? "Đang chạy"
            : trip.trip_status}
        </span>
      </div>

      {/* Seat picker */}
      <div className="px-4 pb-3 border-t border-gray-50 pt-3">
        {seatsLoading ? (
          <div className="flex items-center justify-center py-6">
            <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <SeatPicker
            seats={vehicleSeats}
            tripSeats={tripSeats}
            seatCount={trip.vehicle.seat_count}
            selectedSeatOrders={selectedSeatOrders}
            onSeatClick={handleSeatClick}
            onRemoveSeat={(o) =>
              setSelectedSeatOrders((p) => p.filter((x) => x !== o))
            }
          />
        )}
      </div>

      {/* Inline booking form — only shown when seats are selected */}
      {showForm && (
        <div className="px-4 pb-4 border-t border-gray-100 pt-3 space-y-4">
          <CustomerForm form={form} onChange={onFormChange} />
          <BookingFormFields
            form={form}
            origin={trip.route.origin}
            destination={trip.route.destination}
            selectedCount={selectedSeatOrders.length}
            error={formError}
            onChange={onFormChange}
          />
          <div className="flex gap-2 pt-1">
            <button
              onClick={handleReset}
              className="flex-1 py-2 text-sm text-gray-600 hover:text-gray-900 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              Huỷ
            </button>
            <button
              onClick={handleSubmit}
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
      )}

      {/* Footer hint when no seat selected */}
      {!seatsLoading && !showForm && (
        <div className="px-4 pb-3 text-center">
          <p className="text-xs text-gray-400">
            {availableCount > 0
              ? "Nhấn vào ghế để chọn và đặt vé"
              : "Không còn ghế trống"}
          </p>
        </div>
      )}
    </div>
  );
}
