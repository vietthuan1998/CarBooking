// src/features/dispatch/api.ts
import axios from "axios";
import type { CreateTripInput, Trip } from "./types";
import { edgeFunctionClient } from "@/utils/axiosClient";

interface ScheduleTripResponse {
  trip: Trip;
}

interface ScheduleTripErrorResponse {
  error: string;
  conflicts?: unknown[];
}

/**
 * Gọi Edge Function 'schedule-trip' để tạo chuyến mới.
 * Toàn bộ logic check trùng lịch xe nằm ở server (Deno), client chỉ gửi input.
 */
export async function scheduleTrip(input: CreateTripInput): Promise<Trip> {
  try {
    const { data } = await edgeFunctionClient.post<ScheduleTripResponse>(
      "/schedule-trip",
      {
        route_id: input.route_id,
        vehicle_id: input.vehicle_id,
        planned_departure_time: input.planned_departure_time,
        trip_code: input.trip_code,
        // driver_id: input.driver_id, // TODO: bật lại khi có chức năng gán tài xế
      },
    );
    return data.trip;
  } catch (err) {
    if (axios.isAxiosError<ScheduleTripErrorResponse>(err)) {
      const message = err.response?.data?.error ?? "Không thể tạo chuyến xe";
      throw new Error(message, { cause: err });
    }
    throw err;
  }
}
