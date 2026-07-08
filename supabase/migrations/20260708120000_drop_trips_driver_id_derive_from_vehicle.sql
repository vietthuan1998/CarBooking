-- Bỏ trips.driver_id — tài xế của chuyến suy ra từ xe của chuyến.
--
-- Từ 20260707100000, mỗi xe gắn cứng 1 tài xế (vehicles.driver_id unique),
-- nên gán driver_id riêng trên trips là thừa: tài xế = chủ xe của chuyến.
-- Web admin tạo chuyến chưa bao giờ gán driver_id (TODO trong schedule-trip)
-- → mọi policy lọc trips.driver_id = auth.uid() làm app tài xế trống dữ liệu.
--
-- Đổi ngữ nghĩa: "chuyến của tài xế" = "chuyến dùng xe của tài xế". Nếu xe
-- đổi chủ, chuyến cũ của xe được tính lại theo tài xế mới.
--
-- Lưu ý recursion (xem 20260707120000): vehicles có policy select của driver,
-- nếu policy trips subquery thẳng vào vehicles và ngược lại sẽ báo
-- "infinite recursion detected". Dùng hàm security definer (bypass RLS,
-- cùng pattern get_my_role) để cắt vòng phụ thuộc giữa các policy.

create or replace function public.owns_vehicle(v_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.vehicles
    where id = v_id and driver_id = auth.uid()
  );
$$;

-- ------------------------------------------------------------
-- vehicles: policy cũ dựa trên trips.driver_id, đã thừa vì
-- "vehicles: driver xem xe của mình" (driver_id = auth.uid()) bao trùm —
-- driver chỉ chạy chuyến bằng xe của chính mình.
-- ------------------------------------------------------------
drop policy if exists "vehicles: driver xem xe được phân công" on public.vehicles;

-- ------------------------------------------------------------
-- trips
-- ------------------------------------------------------------
drop policy if exists "trips: driver xem chuyến của mình" on public.trips;
create policy "trips: driver xem chuyến của mình"
  on public.trips for select
  using (
    get_my_role() = 'driver'
    and owns_vehicle(vehicle_id)
  );

drop policy if exists "trips: driver cập nhật trạng thái chuyến" on public.trips;
create policy "trips: driver cập nhật trạng thái chuyến"
  on public.trips for update
  using (
    get_my_role() = 'driver'
    and owns_vehicle(vehicle_id)
  )
  with check (
    owns_vehicle(vehicle_id)
    -- driver chỉ được đổi trip_status/actual_*, không được đổi các cột dưới đây
    -- (subquery phải alias bảng con — bug 21000, xem 20260706022643)
    and vehicle_id             = (select t.vehicle_id             from public.trips t where t.id = trips.id)
    and route_id               = (select t.route_id               from public.trips t where t.id = trips.id)
    and planned_departure_time = (select t.planned_departure_time from public.trips t where t.id = trips.id)
    and trip_code              = (select t.trip_code              from public.trips t where t.id = trips.id)
  );

-- ------------------------------------------------------------
-- trip_seats
-- ------------------------------------------------------------
drop policy if exists "trip_seats: driver xem ghế chuyến của mình" on public.trip_seats;
create policy "trip_seats: driver xem ghế chuyến của mình"
  on public.trip_seats for select
  using (
    get_my_role() = 'driver'
    and trip_id in (
      select t.id from public.trips t where owns_vehicle(t.vehicle_id)
    )
  );

-- ------------------------------------------------------------
-- bookings
-- ------------------------------------------------------------
drop policy if exists "bookings: driver xem booking trong chuyến của mình" on public.bookings;
create policy "bookings: driver xem booking trong chuyến của mình"
  on public.bookings for select
  using (
    get_my_role() = 'driver'
    and trip_id in (
      select t.id from public.trips t where owns_vehicle(t.vehicle_id)
    )
  );

-- ------------------------------------------------------------
-- customers
-- ------------------------------------------------------------
drop policy if exists "customers: driver xem khách trong chuyến của mình" on public.customers;
create policy "customers: driver xem khách trong chuyến của mình"
  on public.customers for select
  using (
    get_my_role() = 'driver'
    and id in (
      select b.customer_id
      from public.bookings b
      join public.trips t on t.id = b.trip_id
      where owns_vehicle(t.vehicle_id)
    )
  );

-- ------------------------------------------------------------
-- booking_status_logs
-- ------------------------------------------------------------
drop policy if exists "booking_logs: driver xem log chuyến của mình" on public.booking_status_logs;
create policy "booking_logs: driver xem log chuyến của mình"
  on public.booking_status_logs for select
  using (
    get_my_role() = 'driver'
    and booking_id in (
      select b.id from public.bookings b
      join public.trips t on t.id = b.trip_id
      where owns_vehicle(t.vehicle_id)
    )
  );

-- ------------------------------------------------------------
-- seats: ghế thuộc xe của mình, không cần đi vòng qua trips nữa
-- ------------------------------------------------------------
drop policy if exists "seats: driver xem ghế xe của mình" on public.seats;
create policy "seats: driver xem ghế xe của mình"
  on public.seats for select
  using (
    get_my_role() = 'driver'
    and owns_vehicle(vehicle_id)
  );

-- ------------------------------------------------------------
-- vehicle_locations
-- ------------------------------------------------------------
drop policy if exists "locations: driver insert vị trí xe của mình" on public.vehicle_locations;
create policy "locations: driver insert vị trí xe của mình"
  on public.vehicle_locations for insert
  with check (
    get_my_role() = 'driver'
    and owns_vehicle(vehicle_id)
    and exists (
      select 1 from public.trips t
      where t.vehicle_id = vehicle_locations.vehicle_id
        and t.trip_status = 'in_progress'
    )
  );

drop policy if exists "locations: driver xem vị trí xe của mình" on public.vehicle_locations;
create policy "locations: driver xem vị trí xe của mình"
  on public.vehicle_locations for select
  using (
    get_my_role() = 'driver'
    and owns_vehicle(vehicle_id)
  );

-- ------------------------------------------------------------
-- trip_driver_logs: log gán tài xế cho chuyến — không còn khái niệm này.
-- ------------------------------------------------------------
drop trigger if exists trg_log_trip_driver on public.trips;
drop function if exists public.log_trip_driver_change();
drop policy if exists "driver_logs: admin/staff toàn quyền" on public.trip_driver_logs;
drop policy if exists "driver_logs: driver xem log của mình" on public.trip_driver_logs;
drop table if exists public.trip_driver_logs;

-- ------------------------------------------------------------
-- trips.driver_id: index + cột (FK rơi theo cột)
-- ------------------------------------------------------------
drop index if exists public.idx_trips_driver_id;
alter table public.trips drop column if exists driver_id;
