-- Landing Page (khách chưa đăng nhập) load danh sách tuyến trực tiếp từ
-- client bằng anon key (getActiveRoutes). Trước đây routes chỉ có policy
-- cho admin/staff/driver → anon nhận mảng rỗng (RLS giấu dòng, không lỗi).
-- Chỉ mở SELECT các tuyến active — tuyến ngừng khai thác không lộ ra ngoài.

create policy "routes: công khai xem tuyến active (landing page)"
  on public.routes for select
  to anon
  using (status = 'active');
