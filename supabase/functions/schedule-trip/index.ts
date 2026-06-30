// supabase/functions/schedule-trip/index.ts
//
// Chức năng: Tạo 1 chuyến xe (trip) mới cho việc điều phối.
// Lý do cần Edge Function (không cho client query trực tiếp):
//   - Phải kiểm tra "trùng lịch xe trong ngày" (1 xe không được gán 2 chuyến
//     cùng ngày, trừ các chuyến đã 'cancelled') TRƯỚC khi insert.
//   - Việc check + insert phải nguyên tử về mặt logic nghiệp vụ, nếu để
//     client tự check rồi insert riêng sẽ có race-condition / sai dữ liệu.
//
// Input (JSON body):
// {
//   "route_id": "uuid",
//   "vehicle_id": "uuid",
//   "planned_departure_time": "2026-06-30T07:30:00+07:00",
//   "trip_code": "TRIP-001"          // optional, tự sinh nếu không truyền
//   // "driver_id": "uuid"          // TODO: bật lại khi có chức năng gán tài xế
// }

import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      // Dùng service role để có quyền check toàn bộ trips + insert,
      // bất kể RLS của user đang gọi (vì logic check cần thấy hết dữ liệu).
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const body = await req.json();
    const {
      route_id,
      vehicle_id,
      planned_departure_time,
      trip_code,
      // driver_id, // TODO: bật lại khi có chức năng gán tài xế
    } = body ?? {};

    // ---- Validate input cơ bản ----
    if (!route_id || !vehicle_id || !planned_departure_time) {
      return jsonResponse(
        {
          error:
            "Thiếu dữ liệu bắt buộc: route_id, vehicle_id, planned_departure_time",
        },
        400,
      );
    }

    const departureDate = new Date(planned_departure_time);
    if (Number.isNaN(departureDate.getTime())) {
      return jsonResponse(
        { error: "planned_departure_time không hợp lệ" },
        400,
      );
    }

    // ---- Kiểm tra route & vehicle tồn tại và đang active ----
    const { data: route, error: routeError } = await supabase
      .from("routes")
      .select("id, route_name, origin, destination, status")
      .eq("id", route_id)
      .maybeSingle();

    if (routeError) {
      return jsonResponse({ error: routeError.message }, 500);
    }
    if (!route) {
      return jsonResponse({ error: "route_id không tồn tại" }, 404);
    }

    const { data: vehicle, error: vehicleError } = await supabase
      .from("vehicles")
      .select("id, vehicle_name, plate_number, status")
      .eq("id", vehicle_id)
      .maybeSingle();

    if (vehicleError) {
      return jsonResponse({ error: vehicleError.message }, 500);
    }
    if (!vehicle) {
      return jsonResponse({ error: "vehicle_id không tồn tại" }, 404);
    }

    // ---- Check trùng lịch xe trong ngày ----
    // Lấy khoảng đầu/cuối ngày (theo ngày của planned_departure_time) để so khớp.
    const dayStart = new Date(departureDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(departureDate);
    dayEnd.setHours(23, 59, 59, 999);

    const { data: conflictTrips, error: conflictError } = await supabase
      .from("trips")
      .select("id, trip_code, planned_departure_time, trip_status")
      .eq("vehicle_id", vehicle_id)
      .neq("trip_status", "cancelled")
      .gte("planned_departure_time", dayStart.toISOString())
      .lte("planned_departure_time", dayEnd.toISOString());

    if (conflictError) {
      return jsonResponse({ error: conflictError.message }, 500);
    }

    if (conflictTrips && conflictTrips.length > 0) {
      return jsonResponse(
        {
          error: "Xe đã được lên lịch cho 1 chuyến khác trong ngày này",
          conflicts: conflictTrips,
        },
        409,
      );
    }

    // ---- Insert trip ----
    const finalTripCode = trip_code && trip_code.trim().length > 0
      ? trip_code.trim()
      : `TRIP-${Date.now()}`;

    const { data: inserted, error: insertError } = await supabase
      .from("trips")
      .insert({
        trip_code: finalTripCode,
        route_id,
        vehicle_id,
        // driver_id: driver_id ?? null, // TODO: bật lại khi có chức năng gán tài xế
        planned_departure_time,
        trip_status: "scheduled",
      })
      .select()
      .single();

    if (insertError) {
      return jsonResponse({ error: insertError.message }, 500);
    }

    return jsonResponse({ trip: inserted }, 201);
  } catch (err) {
    return jsonResponse(
      { error: err instanceof Error ? err.message : "Unknown error" },
      500,
    );
  }
});
