// supabase/functions/schedule-trip/index.ts
//
// Chức năng: Tạo 1 chuyến xe (trip) mới cho việc điều phối.
// Lý do cần Edge Function (không cho client query trực tiếp):
//   - Phải kiểm tra "khoảng cách tối thiểu giữa 2 chuyến cùng xe trong ngày"
//     trước khi insert (xe cần ít nhất MIN_GAP_MINUTES = 150 phút = 2h30p
//     giữa 2 chuyến bất kỳ, trừ chuyến đã 'cancelled').
//   - Việc check + insert phải nguyên tử về mặt logic nghiệp vụ, nếu để
//     client tự check rồi insert riêng sẽ có race-condition / sai dữ liệu.
//
// Input (JSON body):
// {
//   "route_id": "uuid",
//   "vehicle_id": "uuid",
//   "planned_departure_time": "2026-06-30T07:30:00+07:00",
//   "trip_code": "TRIP-001"          // optional, tự sinh nếu không truyền
// }
//
// Tài xế của chuyến suy ra từ xe (vehicles.driver_id) — trips không còn cột driver_id.

import { createAdminClient } from "../_shared/adminClient.ts";
import { verifyCaller } from "../_shared/verifyCaller.ts";
import { json, servePost } from "../_shared/http.ts";
import { notifyTripDriver } from "../_shared/push.ts";

servePost(async (req: Request) => {
  // Service role: bypass RLS để check toàn bộ trips + insert,
  // bất kể RLS của user đang gọi (vì logic check cần thấy hết dữ liệu).
  const supabase = createAdminClient();

  // Service role bypass RLS → phải tự chặn người gọi không phải admin/staff.
  const caller = await verifyCaller(
    req,
    supabase,
    ["admin", "staff"],
    "Chỉ admin/staff mới có quyền tạo chuyến xe",
  );
  if (!caller.ok) {
    return json({ error: caller.message }, caller.status);
  }

  const body = await req.json();
  const {
    route_id,
    vehicle_id,
    planned_departure_time,
    trip_code,
  } = body ?? {};

  // ---- Validate input cơ bản ----
  if (!route_id || !vehicle_id || !planned_departure_time) {
    return json(
      {
        error:
          "Thiếu dữ liệu bắt buộc: route_id, vehicle_id, planned_departure_time",
      },
      400,
    );
  }

  const departureDate = new Date(planned_departure_time);
  if (Number.isNaN(departureDate.getTime())) {
    return json(
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
    return json({ error: routeError.message }, 500);
  }
  if (!route) {
    return json({ error: "route_id không tồn tại" }, 404);
  }

  const { data: vehicle, error: vehicleError } = await supabase
    .from("vehicles")
    .select("id, vehicle_name, plate_number, status")
    .eq("id", vehicle_id)
    .maybeSingle();

  if (vehicleError) {
    return json({ error: vehicleError.message }, 500);
  }
  if (!vehicle) {
    return json({ error: "vehicle_id không tồn tại" }, 404);
  }

  // ---- Check khoảng cách tối thiểu + trình tự vị trí xe ----
  // Rule 1: Khoảng cách ≥ 2h30p giữa 2 chuyến liên tiếp cùng xe.
  // Rule 2: Sau chuyến trước, xe đang ở điểm đến của chuyến đó.
  //         Chuyến mới phải xuất phát từ đúng điểm đó.
  //         (Ví dụ: xe 10:00 Huế→ĐN → xe đang ở ĐN → 12:31 không thể xuất phát từ Huế)
  const MIN_GAP_MINUTES = 150; // 2h30p

  const dayStart = new Date(departureDate);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(departureDate);
  dayEnd.setHours(23, 59, 59, 999);

  // Lấy kèm thông tin tuyến (origin/destination) để check vị trí xe
  const { data: existingTrips, error: existingError } = await supabase
    .from("trips")
    .select(
      "id, trip_code, planned_departure_time, trip_status, route:routes(origin, destination)",
    )
    .eq("vehicle_id", vehicle_id)
    .neq("trip_status", "cancelled")
    .gte("planned_departure_time", dayStart.toISOString())
    .lte("planned_departure_time", dayEnd.toISOString())
    .order("planned_departure_time");

  if (existingError) {
    return json({ error: existingError.message }, 500);
  }

  const fmt = (d: Date) =>
    d.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Ho_Chi_Minh",
    });

  interface TripRow {
    id: string;
    trip_code: string;
    planned_departure_time: string;
    route: { origin: string; destination: string } | null;
  }

  const sorted = (existingTrips ?? []) as unknown as TripRow[];
  const newMs = departureDate.getTime();

  // Trùng giờ chính xác (cùng xe, cùng thời điểm xuất phát): phải chặn riêng
  // vì prevTrip/nextTrip bên dưới dùng so sánh strict (<, >) nên bỏ sót ca
  // bằng nhau — nếu không có check này, đăng ký trùng y hệt sẽ lọt qua và
  // tạo 2 trip giống hệt nhau cho cùng 1 xe.
  const exactDuplicate = sorted.find(
    (t) => new Date(t.planned_departure_time).getTime() === newMs,
  );
  if (exactDuplicate) {
    return json(
      {
        error: `Xe đã có chuyến ${exactDuplicate.trip_code} lúc ${
          fmt(new Date(exactDuplicate.planned_departure_time))
        } — không thể tạo chuyến trùng giờ.`,
        conflict: exactDuplicate,
        min_gap_minutes: MIN_GAP_MINUTES,
      },
      409,
    );
  }

  // Chuyến ngay trước chuyến mới (theo thời gian)
  const prevTrip = [...sorted]
    .reverse()
    .find((t) => new Date(t.planned_departure_time).getTime() < newMs);

  // Chuyến ngay sau chuyến mới (theo thời gian)
  const nextTrip = sorted.find(
    (t) => new Date(t.planned_departure_time).getTime() > newMs,
  );

  // ── Kiểm tra so với chuyến TRƯỚC ──
  if (prevTrip) {
    const prevMs = new Date(prevTrip.planned_departure_time).getTime();
    const gapMinutes = (newMs - prevMs) / (1000 * 60);

    if (gapMinutes < MIN_GAP_MINUTES) {
      const earliest = new Date(prevMs + MIN_GAP_MINUTES * 60 * 1000);
      return json(
        {
          error: `Xe cần nghỉ ít nhất 2h30p giữa 2 chuyến. ` +
            `Chuyến ${prevTrip.trip_code} lúc ${
              fmt(new Date(prevTrip.planned_departure_time))
            }, ` +
            `sớm nhất có thể thêm chuyến từ ${fmt(earliest)}.`,
          conflict: prevTrip,
          min_gap_minutes: MIN_GAP_MINUTES,
          earliest_allowed: earliest.toISOString(),
        },
        409,
      );
    }

    // Sau chuyến trước, xe đang ở điểm đến của chuyến đó.
    const prevDest = prevTrip.route?.destination;
    if (prevDest && prevDest !== route.origin) {
      return json(
        {
          error: `Sau chuyến ${prevTrip.trip_code}, xe đang ở ${prevDest}. ` +
            `Không thể tạo chuyến xuất phát từ ${route.origin}.`,
          conflict: prevTrip,
        },
        409,
      );
    }
  }

  // ── Kiểm tra so với chuyến SAU ──
  if (nextTrip) {
    const nextMs = new Date(nextTrip.planned_departure_time).getTime();
    const gapMinutes = (nextMs - newMs) / (1000 * 60);

    if (gapMinutes < MIN_GAP_MINUTES) {
      return json(
        {
          error:
            `Chuyến ${nextTrip.trip_code} lúc ${
              fmt(new Date(nextTrip.planned_departure_time))
            } ` +
            `chỉ cách chuyến mới ${
              Math.round(gapMinutes)
            } phút (cần tối thiểu 2h30p).`,
          conflict: nextTrip,
          min_gap_minutes: MIN_GAP_MINUTES,
        },
        409,
      );
    }

    // Sau chuyến mới, xe sẽ ở điểm đến của chuyến mới.
    // Chuyến tiếp theo phải xuất phát từ đúng điểm đó.
    const nextOrigin = nextTrip.route?.origin;
    if (nextOrigin && route.destination !== nextOrigin) {
      return json(
        {
          error: `Sau chuyến mới, xe sẽ ở ${route.destination} ` +
            `nhưng chuyến ${nextTrip.trip_code} xuất phát từ ${nextOrigin}. ` +
            `Vị trí không khớp.`,
          conflict: nextTrip,
        },
        409,
      );
    }
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
      planned_departure_time,
      trip_status: "scheduled",
    })
    .select()
    .single();

  if (insertError) {
    return json({ error: insertError.message }, 500);
  }

  // Báo cho tài xế (chủ xe) — không throw, trip đã tạo xong thì push lỗi kệ nó.
  const departureText = departureDate.toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    timeZone: "Asia/Ho_Chi_Minh",
  });
  await notifyTripDriver(supabase, inserted.id, {
    title: "Chuyến mới được xếp cho xe của bạn",
    body:
      `${finalTripCode}: ${route.origin} → ${route.destination}, xuất phát ${departureText}`,
  });

  return json({ trip: inserted }, 201);
});
