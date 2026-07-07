-- Cho phép tài xế tự đăng ký xe của mình qua app mobile.
-- Điều phối viên/admin duyệt (chuyển sang active) trước khi xe được đưa vào
-- vận hành. Mỗi tài xế chỉ đứng tên đúng 1 xe.

-- ------------------------------------------------------------
-- vehicles: thêm liên kết tới tài xế đứng tên
-- ------------------------------------------------------------
alter table public.vehicles
  add column driver_id uuid references public.profiles (id) on delete set null,
  add constraint vehicles_driver_id_unique unique (driver_id);

alter table public.vehicles
  drop constraint vehicles_status_check;

alter table public.vehicles
  add constraint vehicles_status_check
    check (status in ('active', 'inactive', 'maintenance', 'pending'));

-- ------------------------------------------------------------
-- seats: trigger tạo ghế phải chạy security definer để không bị RLS
-- chặn khi tài xế (không có quyền ghi seats) là người insert vehicle.
-- ------------------------------------------------------------
create or replace function public.insert_seats_for_vehicle()
returns trigger
language plpgsql
security definer
as $$
declare
  labels text[] := array['A1','A2','B1','B2','B3','C1','C2','C3'];
  i      integer;
begin
  for i in 1..(new.seat_count + 1) loop
    insert into public.seats (vehicle_id, seat_code, seat_order)
    values (new.id, labels[i], i);
  end loop;
  return new;
end;
$$;

-- ------------------------------------------------------------
-- vehicles: RLS cho tài xế tự đăng ký/xem/sửa xe của mình
-- ------------------------------------------------------------
create policy "vehicles: driver tự đăng ký xe của mình"
  on public.vehicles for insert
  with check (
    get_my_role() = 'driver'
    and driver_id = auth.uid()
    and status = 'pending'
  );

create policy "vehicles: driver xem xe của mình"
  on public.vehicles for select
  using (driver_id = auth.uid());

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
