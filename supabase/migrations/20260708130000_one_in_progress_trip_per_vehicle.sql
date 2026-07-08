-- Mỗi xe chỉ được 1 chuyến đang chạy tại 1 thời điểm.
--
-- Trước đây tài xế có thể nhấn "Bắt đầu chuyến" trên nhiều chuyến của cùng
-- 1 xe (VD chuyến Huế 9:00 và chuyến ĐN 12:00) → nhiều chuyến in_progress
-- song song. Check ở app không đủ vì race condition (2 request đồng thời
-- cùng thấy "chưa có chuyến chạy" rồi cùng update thành công).
--
-- Partial unique index: atomic ở tầng DB, phủ mọi client (app driver,
-- web admin, API). Client bắt lỗi 23505 để hiển thị thông báo thân thiện.

create unique index uniq_trips_one_in_progress_per_vehicle
  on public.trips (vehicle_id)
  where trip_status = 'in_progress';
