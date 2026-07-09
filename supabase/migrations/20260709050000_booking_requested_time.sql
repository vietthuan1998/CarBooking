-- Đổi mô hình đăng ký online: khách chọn NGÀY GIỜ mong muốn tự do thay vì
-- chọn chuyến có sẵn — staff dựa vào giờ đăng ký để xếp xe sau.
-- → booking online chưa gắn chuyến: trip_id cho phép null.
-- → requested_departure_time = giờ khách muốn đi; với booking staff đặt
--   trực tiếp thì set = planned_departure_time của chuyến, nhờ đó dashboard
--   lọc "khách trong ngày" trên một cột duy nhất cho cả hai nguồn.

alter table public.bookings alter column trip_id drop not null;

alter table public.bookings
  add column if not exists requested_departure_time timestamptz;

-- Backfill từ chuyến đã gắn
update public.bookings b
set requested_departure_time = t.planned_departure_time
from public.trips t
where t.id = b.trip_id
  and b.requested_departure_time is null;
