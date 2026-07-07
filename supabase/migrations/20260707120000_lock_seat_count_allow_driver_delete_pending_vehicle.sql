-- Khóa seat_count khi driver sửa xe pending: seats đã được trigger tạo theo
-- seat_count lúc insert, đổi seat_count sau đó sẽ lệch dữ liệu ghế.
-- Driver muốn đổi loại xe thì xóa đăng ký (khi còn pending) và đăng ký lại
-- → thêm policy delete cho driver.
--
-- Lưu ý: KHÔNG khóa seat_count bằng subquery self-reference trong with check
-- (kiểu migration 20260706022643) — vehicles có policy select chứa sublink
-- ("driver xem xe được phân công" subquery vào trips) nên Postgres sẽ báo
-- "infinite recursion detected in policy for relation vehicles".
-- Dùng trigger so sánh old/new thay thế.

drop policy if exists "vehicles: driver cập nhật xe của mình khi chưa duyệt" on public.vehicles;

create policy "vehicles: driver cập nhật xe của mình khi chưa duyệt"
  on public.vehicles for update
  using (
    get_my_role() = 'driver'
    and driver_id = auth.uid()
    and status = 'pending'
  )
  with check (
    driver_id = auth.uid()
    and status = 'pending'
  );

-- Chặn driver đổi seat_count (admin/staff/service_role không bị ảnh hưởng)
create or replace function public.prevent_driver_seat_count_change()
returns trigger
language plpgsql
as $$
begin
  if new.seat_count is distinct from old.seat_count
     and public.get_my_role() = 'driver' then
    raise exception 'Không thể đổi số ghế. Hãy xóa xe và đăng ký lại.';
  end if;
  return new;
end;
$$;

create trigger trg_prevent_driver_seat_count_change
  before update on public.vehicles
  for each row execute function public.prevent_driver_seat_count_change();

-- seats FK on delete cascade nên ghế bị xóa theo xe (cascade không bị RLS chặn);
-- trips FK on delete restrict nên xe đã có chuyến không thể xóa nhầm.
drop policy if exists "vehicles: driver xóa xe của mình khi chưa duyệt" on public.vehicles;

create policy "vehicles: driver xóa xe của mình khi chưa duyệt"
  on public.vehicles for delete
  using (
    get_my_role() = 'driver'
    and driver_id = auth.uid()
    and status = 'pending'
  );
