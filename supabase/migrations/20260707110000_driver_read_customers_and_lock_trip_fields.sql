-- 1) Driver xem được thông tin khách hàng có booking trên chuyến của mình
--    (để liên hệ trực tiếp với khách). Trước đây customers không có policy
--    nào cho driver nên app mobile không hiện được tên/SĐT khách.
create policy "customers: driver xem khách trong chuyến của mình"
  on public.customers for select
  using (
    get_my_role() = 'driver'
    and id in (
      select b.customer_id
      from public.bookings b
      join public.trips t on t.id = b.trip_id
      where t.driver_id = auth.uid()
    )
  );

-- 2) Khóa thêm planned_departure_time và trip_code trong policy update trips.
--    Policy cũ chỉ khóa vehicle_id/route_id/driver_id, driver vẫn sửa được
--    giờ khởi hành kế hoạch và mã chuyến.
--    Lưu ý: subquery phải alias bảng con (bug 21000, xem migration 20260706022643).
drop policy if exists "trips: driver cập nhật trạng thái chuyến" on public.trips;

create policy "trips: driver cập nhật trạng thái chuyến"
  on public.trips for update
  using (
    get_my_role() = 'driver'
    and driver_id = auth.uid()
  )
  with check (
    driver_id = auth.uid()
    -- driver chỉ được đổi trip_status/actual_*, không được đổi các cột dưới đây
    and vehicle_id             = (select t.vehicle_id             from public.trips t where t.id = trips.id)
    and route_id               = (select t.route_id               from public.trips t where t.id = trips.id)
    and driver_id              = (select t.driver_id              from public.trips t where t.id = trips.id)
    and planned_departure_time = (select t.planned_departure_time from public.trips t where t.id = trips.id)
    and trip_code              = (select t.trip_code              from public.trips t where t.id = trips.id)
  );
