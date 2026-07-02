import { useState } from "react";
import { Toast } from "../../components/booking/Toast";
import { BookingsHeader } from "../../components/booking/BookingsHeader";
import { BookingsBody } from "../../components/booking/BookingsBody";
import { INITIAL_FORM } from "@/features/booking/types";
import type { BookingForm } from "@/features/booking/types";
import { useBookingsData } from "@/hooks/useBookingsData";

export default function BookingsPage() {
  const {
    trips,
    loading,
    totalTrips,
    selectedDate,
    setSelectedDate,
    statusFilter,
    setStatusFilter,
    refresh,
  } = useBookingsData();

  const [activeFormTripId, setActiveFormTripId] = useState<string | null>(null);
  const [sharedForm, setSharedForm] = useState<BookingForm>(INITIAL_FORM);
  const handleFormChange = (updated: Partial<BookingForm>) =>
    setSharedForm((f) => ({ ...f, ...updated }));
  const [toast, setToast] = useState<{
    msg: string;
    type: "success" | "error";
  } | null>(null);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <BookingsHeader
        totalTrips={totalTrips}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        onRefresh={refresh}
      />

      <BookingsBody
        loading={loading}
        totalTrips={totalTrips}
        trips={trips}
        activeFormTripId={activeFormTripId}
        onFormOpen={setActiveFormTripId}
        form={sharedForm}
        onFormChange={handleFormChange}
        onSuccess={(msg) => showToast(msg, "success")}
        onError={(msg) => showToast(msg, "error")}
      />

      {toast && <Toast msg={toast.msg} type={toast.type} />}
    </div>
  );
}
