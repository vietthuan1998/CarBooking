import type { SupabaseClient } from "jsr:@supabase/supabase-js@2";
import { HttpError, orThrow500 } from "../../_shared/http.ts";

interface TripWithRoute {
  id: string;
  trip_status: string;
  planned_departure_time: string;
  route: { origin: string; destination: string } | null;
}

export async function assertTripBookable(
  supabase: SupabaseClient,
  tripId: string,
): Promise<TripWithRoute> {
  const { data: trip, error } = await supabase
    .from("trips")
    .select(
      "id, trip_status, planned_departure_time, route:routes(origin, destination)",
    )
    .eq("id", tripId)
    .maybeSingle();

  orThrow500(error);
  if (!trip) throw new HttpError(404, "trip_id không tồn tại");
  if (trip.trip_status !== "scheduled") {
    throw new HttpError(
      409,
      `Chuyến xe không thể đặt (trạng thái: ${trip.trip_status})`,
    );
  }
  return trip as unknown as TripWithRoute;
}

export async function getAvailableTripSeats(
  supabase: SupabaseClient,
  tripId: string,
  seatIds: string[],
) {
  const { data: tripSeats, error } = await supabase
    .from("trip_seats")
    .select("id, seat_id, status")
    .eq("trip_id", tripId)
    .in("seat_id", seatIds);

  orThrow500(error);

  // Mỗi seat_id phải có trip_seat tương ứng
  if (tripSeats.length !== seatIds.length) {
    const found = tripSeats.map((ts) => ts.seat_id);
    const missing = seatIds.filter((id) => !found.includes(id));
    throw new HttpError(
      400,
      `Ghế không thuộc chuyến này: ${missing.join(", ")}`,
    );
  }

  const taken = tripSeats.filter((ts) => ts.status !== "available");
  if (taken.length > 0) {
    throw new HttpError(409, "Một số ghế đã được đặt. Vui lòng chọn lại.");
  }

  return tripSeats;
}
