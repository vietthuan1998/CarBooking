-- Cho phép mỗi booking chọn tuyến cụ thể (VD: Huế -> Đà Nẵng hoặc Huế -> Hội An)
-- độc lập với route_id của trip (trip giờ chỉ đại diện cho chiều chạy, không còn
-- gắn với 1 điểm đến cụ thể). Giá vé được tính từ routes.base_price của route này.
alter table public.bookings
  add column route_id uuid references public.routes (id) on delete restrict;

create index idx_bookings_route_id on public.bookings (route_id);
