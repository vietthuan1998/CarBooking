-- Khách tự đăng ký chuyến từ Landing Page (edge fn register-booking):
-- booking pending source='online' chưa gắn ghế cụ thể (không giữ ghế),
-- nên cần lưu số ghế khách muốn + ghi chú của lần đặt để staff xử lý.
-- Ghi chú theo từng booking (mỗi lần đặt khách yêu cầu khác nhau),
-- khác với customers.note là ghi chú cố định về khách.

alter table public.bookings
  add column if not exists seat_count integer
    check (seat_count is null or seat_count between 1 and 7),
  add column if not exists note text;
