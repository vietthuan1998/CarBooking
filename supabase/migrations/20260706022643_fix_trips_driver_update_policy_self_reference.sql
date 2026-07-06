-- Sửa lỗi 21000 (more than one row returned by a subquery used as an expression)
-- khi update trips.trip_status và bảng trips có >= 2 dòng.
--
-- Nguyên nhân: policy cũ dùng subquery không alias
--   (select vehicle_id from public.trips where id = trips.id)
-- "trips.id" bị Postgres phân giải vào chính bảng trong subquery (scope trong được
-- ưu tiên), thành "where id = id" -> luôn đúng với mọi dòng -> subquery trả về cả
-- bảng thay vì đúng 1 dòng tương ứng.
--
-- Fix: alias bảng con để "trips.id" (ngoài) tham chiếu đúng về dòng đang được check.
drop policy if exists "trips: driver cập nhật trạng thái chuyến" on public.trips;

create policy "trips: driver cập nhật trạng thái chuyến"
  on public.trips for update
  using (
    get_my_role() = 'driver'
    and driver_id = auth.uid()
  )
  with check (
    driver_id = auth.uid()
    -- driver chỉ được đổi trip_status, không được đổi vehicle/route/driver
    and vehicle_id = (select t.vehicle_id from public.trips t where t.id = trips.id)
    and route_id   = (select t.route_id   from public.trips t where t.id = trips.id)
    and driver_id  = (select t.driver_id  from public.trips t where t.id = trips.id)
  );
