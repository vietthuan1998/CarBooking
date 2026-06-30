import { useState } from "react";
import { SeatPicker } from "./SeatPicker";
import { CustomerForm } from "./CustomerForm";
import { INITIAL_FORM } from "./types";
import type { BookingForm, Seat, Trip, TripSeat } from "./types";
import { supabase } from "@/utils/supabase";
import { BookingFormFields } from "./BookingForm";
import { formatDate, formatTime } from "@/utils/helpers";

interface Props {
  trip: Trip;
  tripSeats: TripSeat[];
  seats: Seat[];
  onClose: () => void;
  onSuccess: () => void;
}

export function BookingModal({
  trip,
  tripSeats,
  seats,
  onClose,
  onSuccess,
}: Props) {
  const [form, setForm] = useState<BookingForm>(INITIAL_FORM);
  const [selectedSeatOrders, setSelectedSeatOrders] = useState<number[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const orderToSeatId = Object.fromEntries(
    seats.map((s) => [s.seat_order, s.id]),
  );

  const handleSeatClick = (seatOrder: number) => {
    if (seatOrder === 1) return; // tài xế
    setSelectedSeatOrders((prev) =>
      prev.includes(seatOrder)
        ? prev.filter((x) => x !== seatOrder)
        : [...prev, seatOrder],
    );
  };

  const handleFormChange = (updated: Partial<BookingForm>) => {
    setForm((f) => ({ ...f, ...updated }));
  };

  const handleSubmit = async () => {
    setError(null);
    if (!form.customer_name || !form.customer_phone) {
      setError("Vui lòng nhập tên và SĐT khách hàng");
      return;
    }
    if (selectedSeatOrders.length === 0) {
      setError("Vui lòng chọn ít nhất 1 ghế");
      return;
    }
    if (!form.pickup_address || !form.dropoff_address) {
      setError("Vui lòng nhập địa chỉ đón và trả");
      return;
    }
    if (!form.fare_amount || isNaN(Number(form.fare_amount))) {
      setError("Vui lòng nhập giá vé hợp lệ");
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
      onSuccess();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Có lỗi xảy ra");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h3 className="font-semibold text-gray-900">
              {trip.route.origin} → {trip.route.destination}
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              {formatTime(trip.planned_departure_time)} ·{" "}
              {formatDate(trip.planned_departure_time)} ·{" "}
              {trip.vehicle.vehicle_name} · {trip.vehicle.plate_number}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <SeatPicker
            seats={seats}
            tripSeats={tripSeats}
            seatCount={trip.vehicle.seat_count}
            selectedSeatOrders={selectedSeatOrders}
            onSeatClick={handleSeatClick}
            onRemoveSeat={(o) =>
              setSelectedSeatOrders((p) => p.filter((x) => x !== o))
            }
          />

          <div className="space-y-4">
            <CustomerForm form={form} onChange={handleFormChange} />
            <BookingFormFields
              form={form}
              origin={trip.route.origin}
              destination={trip.route.destination}
              selectedCount={selectedSeatOrders.length}
              error={error}
              onChange={handleFormChange}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Huỷ
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-5 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 transition-colors flex items-center gap-2"
          >
            {submitting && (
              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            {submitting ? "Đang xử lý..." : "Xác nhận đặt vé"}
          </button>
        </div>
      </div>
    </div>
  );
}
