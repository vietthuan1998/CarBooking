import { useCallback, useEffect, useState } from "react";
import type {
  BookingForm,
  Seat,
  Trip,
  TripSeat,
} from "@/features/booking/types";
import {
  createBooking,
  getTripSeatsWithBookings,
} from "@/services/bookingService";

interface Args {
  trip: Trip;
  form: BookingForm;
  onFormOpen: (tripId: string | null) => void;
  onFormChange: (updated: Partial<BookingForm>) => void;
  onSuccess: (msg: string) => void;
  onError: (msg: string) => void;
}

export function useTripBooking({
  trip,
  form,
  onFormOpen,
  onFormChange,
  onSuccess,
  onError,
}: Args) {
  const [tripSeats, setTripSeats] = useState<TripSeat[]>([]);
  const [vehicleSeats, setVehicleSeats] = useState<Seat[]>([]);
  const [seatsLoading, setSeatsLoading] = useState(true);

  const [selectedSeatOrders, setSelectedSeatOrders] = useState<number[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadSeats = useCallback(async () => {
    const rows = await getTripSeatsWithBookings(trip.id);
    setTripSeats(rows as unknown as TripSeat[]);
    // Derive vehicle seats from joined trip_seats data (trigger đảm bảo đủ ghế)
    const vSeats: Seat[] = rows
      .filter((r) => r.seat !== null)
      .map((r) => ({
        id: r.seat_id,
        seat_code: r.seat!.seat_code,
        seat_order: r.seat!.seat_order,
      }))
      .sort((a, b) => a.seat_order - b.seat_order);
    setVehicleSeats(vSeats);
  }, [trip.id]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await loadSeats();
      } catch {
        // lỗi load ghế — giữ nguyên state rỗng
      } finally {
        if (!cancelled) setSeatsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [trip.id, loadSeats]);

  const orderToSeatId = Object.fromEntries(
    vehicleSeats.map((s) => [s.seat_order, s.id]),
  );

  const handleSeatClick = (seatOrder: number) => {
    if (seatOrder === 1) return; // driver
    // Tính `next` trước rồi mới gọi onFormOpen ở ngoài — không được gọi
    // setState của component khác (BookingsPage) bên trong updater function
    // của setSelectedSeatOrders, vì updater phải thuần (React có thể gọi lại
    // nó bất kỳ lúc nào, kể cả trong lúc render), nếu không sẽ gây lỗi
    // "Cannot update a component while rendering a different component".
    const next = selectedSeatOrders.includes(seatOrder)
      ? selectedSeatOrders.filter((x) => x !== seatOrder)
      : [...selectedSeatOrders, seatOrder];
    setSelectedSeatOrders(next);
    onFormOpen(next.length > 0 ? trip.id : null);
  };

  const handleRemoveSeat = (seatOrder: number) =>
    setSelectedSeatOrders((p) => p.filter((x) => x !== seatOrder));

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
      route_id: "",
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
    if (!form.route_id) {
      setFormError("Vui lòng chọn tuyến đi");
      return;
    }

    setSubmitting(true);
    const selectedSeatIds = selectedSeatOrders
      .map((o) => {
        return orderToSeatId[o];
      })
      .filter(Boolean);
    try {
      await createBooking({
        customer_id: form.isNewCustomer ? undefined : form.customer_id,
        customer_name: form.isNewCustomer ? form.customer_name : undefined,
        customer_phone: form.isNewCustomer ? form.customer_phone : undefined,
        customer_note: form.isNewCustomer
          ? form.customer_note || undefined
          : undefined,
        trip_id: trip.id,
        seat_ids: selectedSeatIds,
        pickup_address: form.pickup_address,
        dropoff_address: form.dropoff_address,
        route_id: form.route_id,
      });

      await loadSeats();
      handleReset();
      onSuccess("Đặt vé thành công!");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Có lỗi xảy ra";
      setFormError(msg);
      onError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return {
    tripSeats,
    vehicleSeats,
    seatsLoading,
    selectedSeatOrders,
    formError,
    submitting,
    handleSeatClick,
    handleRemoveSeat,
    handleReset,
    handleSubmit,
  };
}
