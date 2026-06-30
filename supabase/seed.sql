-- ============================================================
-- SEED: Routes, Vehicles, Seats, Trips cho hệ thống Huế <-> Đà Nẵng / Hội An
-- Chạy file này trong Supabase SQL Editor
-- ID do Supabase tự sinh, dùng DO block để lấy lại id sau khi insert
-- ============================================================

do $$
declare
  -- routes
  r1 uuid; r2 uuid; r3 uuid; r4 uuid;
  -- vehicles
  v1 uuid; v2 uuid; v3 uuid; v4 uuid;
  -- trips hôm nay
  t1 uuid; t2 uuid; t3 uuid; t4 uuid;
  -- trips ngày mai
  t5 uuid; t6 uuid; t7 uuid; t8 uuid;
  today date := current_date;
begin

  -- ── 1. ROUTES ─────────────────────────────────────────────
  insert into public.routes (route_name, origin, destination, status) values
    ('Huế → Đà Nẵng', 'Huế',     'Đà Nẵng', 'active'),
    ('Huế → Hội An',  'Huế',     'Hội An',  'active'),
    ('Đà Nẵng → Huế', 'Đà Nẵng', 'Huế',     'active'),
    ('Hội An → Huế',  'Hội An',  'Huế',     'active')
  on conflict do nothing;

  select id into r1 from public.routes where origin = 'Huế'     and destination = 'Đà Nẵng' limit 1;
  select id into r2 from public.routes where origin = 'Huế'     and destination = 'Hội An'  limit 1;
  select id into r3 from public.routes where origin = 'Đà Nẵng' and destination = 'Huế'     limit 1;
  select id into r4 from public.routes where origin = 'Hội An'  and destination = 'Huế'     limit 1;

  -- ── 2. VEHICLES ───────────────────────────────────────────
  insert into public.vehicles (plate_number, vehicle_name, seat_count, status) values
    ('75A-12345', 'Ford Transit 7 chỗ',   7, 'active'),
    ('75A-67890', 'Toyota Innova 4 chỗ',  4, 'active'),
    ('43A-11111', 'Hyundai Starex 7 chỗ', 7, 'active'),
    ('43A-22222', 'Toyota Vios 4 chỗ',    4, 'active')
  on conflict (plate_number) do nothing;

  select id into v1 from public.vehicles where plate_number = '75A-12345';
  select id into v2 from public.vehicles where plate_number = '75A-67890';
  select id into v3 from public.vehicles where plate_number = '43A-11111';
  select id into v4 from public.vehicles where plate_number = '43A-22222';

  -- ── 3. SEATS xe 7 chỗ (v1, v3) ───────────────────────────
  -- seat_order 1 = tài xế, 2-7 = khách
  insert into public.seats (vehicle_id, seat_code, seat_order) values
    (v1, 'T',  1), (v1, 'A1', 2), (v1, 'A2', 3), (v1, 'A3', 4),
    (v1, 'B1', 5), (v1, 'B2', 6), (v1, 'B3', 7),
    (v3, 'T',  1), (v3, 'A1', 2), (v3, 'A2', 3), (v3, 'A3', 4),
    (v3, 'B1', 5), (v3, 'B2', 6), (v3, 'B3', 7)
  on conflict (vehicle_id, seat_code) do nothing;

  -- ── 4. SEATS xe 4 chỗ (v2, v4) ───────────────────────────
  insert into public.seats (vehicle_id, seat_code, seat_order) values
    (v2, 'T',  1), (v2, 'A1', 2), (v2, 'A2', 3), (v2, 'A3', 4),
    (v4, 'T',  1), (v4, 'A1', 2), (v4, 'A2', 3), (v4, 'A3', 4)
  on conflict (vehicle_id, seat_code) do nothing;

  -- ── 5. TRIPS hôm nay ──────────────────────────────────────
  insert into public.trips (trip_code, route_id, vehicle_id, planned_departure_time, trip_status) values
    ('HUE-DN-' || to_char(today, 'YYYYMMDD') || '-01', r1, v1, (today || ' 07:00:00')::timestamptz, 'scheduled'),
    ('HUE-HA-' || to_char(today, 'YYYYMMDD') || '-01', r2, v2, (today || ' 08:00:00')::timestamptz, 'scheduled'),
    ('DN-HUE-' || to_char(today, 'YYYYMMDD') || '-01', r3, v3, (today || ' 13:00:00')::timestamptz, 'scheduled'),
    ('HA-HUE-' || to_char(today, 'YYYYMMDD') || '-01', r4, v4, (today || ' 14:00:00')::timestamptz, 'scheduled')
  on conflict (trip_code) do nothing;

  select id into t1 from public.trips where trip_code = 'HUE-DN-' || to_char(today, 'YYYYMMDD') || '-01';
  select id into t2 from public.trips where trip_code = 'HUE-HA-' || to_char(today, 'YYYYMMDD') || '-01';
  select id into t3 from public.trips where trip_code = 'DN-HUE-' || to_char(today, 'YYYYMMDD') || '-01';
  select id into t4 from public.trips where trip_code = 'HA-HUE-' || to_char(today, 'YYYYMMDD') || '-01';

  -- ── 6. TRIPS ngày mai ─────────────────────────────────────
  insert into public.trips (trip_code, route_id, vehicle_id, planned_departure_time, trip_status) values
    ('HUE-DN-' || to_char(today+1, 'YYYYMMDD') || '-01', r1, v1, ((today+1) || ' 07:00:00')::timestamptz, 'scheduled'),
    ('HUE-HA-' || to_char(today+1, 'YYYYMMDD') || '-01', r2, v2, ((today+1) || ' 08:00:00')::timestamptz, 'scheduled'),
    ('DN-HUE-' || to_char(today+1, 'YYYYMMDD') || '-01', r3, v3, ((today+1) || ' 13:00:00')::timestamptz, 'scheduled'),
    ('HA-HUE-' || to_char(today+1, 'YYYYMMDD') || '-01', r4, v4, ((today+1) || ' 14:00:00')::timestamptz, 'scheduled')
  on conflict (trip_code) do nothing;

  select id into t5 from public.trips where trip_code = 'HUE-DN-' || to_char(today+1, 'YYYYMMDD') || '-01';
  select id into t6 from public.trips where trip_code = 'HUE-HA-' || to_char(today+1, 'YYYYMMDD') || '-01';
  select id into t7 from public.trips where trip_code = 'DN-HUE-' || to_char(today+1, 'YYYYMMDD') || '-01';
  select id into t8 from public.trips where trip_code = 'HA-HUE-' || to_char(today+1, 'YYYYMMDD') || '-01';

  -- ── 7. TRIP_SEATS: ghế cho tất cả trips ──────────────────
  insert into public.trip_seats (trip_id, seat_id, status)
  select trips.trip_id, s.id, 'available'
  from (
    values
      (t1, v1), (t2, v2), (t3, v3), (t4, v4),
      (t5, v1), (t6, v2), (t7, v3), (t8, v4)
  ) as trips(trip_id, vehicle_id)
  join public.seats s on s.vehicle_id = trips.vehicle_id
  on conflict (trip_id, seat_id) do nothing;

end $$;