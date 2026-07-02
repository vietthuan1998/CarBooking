-- =============================================================
-- XE GHEP HUE <-> DA NANG
-- Migration: schema + RLS + grants
-- =============================================================

-- ------------------------------------------------------------
-- EXTENSIONS
-- ------------------------------------------------------------
create extension if not exists "pgcrypto";


-- ------------------------------------------------------------
-- HELPER FUNCTION: lấy role của user hiện tại
-- SECURITY DEFINER để bypass RLS khi đọc profiles
-- ------------------------------------------------------------
create or replace function public.get_my_role()
returns text
language plpgsql
security definer
stable
as $$
begin
  return (select role from public.profiles where id = auth.uid());
end;
$$;

create or replace function public.is_admin_or_staff()
returns boolean
language plpgsql
security definer
stable
as $$
begin
  return get_my_role() in ('admin', 'staff');
end;
$$;


-- ============================================================
-- TABLES
-- ============================================================

-- ------------------------------------------------------------
-- profiles
-- ------------------------------------------------------------
create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  full_name   text        not null,
  phone       text        unique,
  role        text        not null default 'staff'
                check (role in ('admin', 'staff', 'driver')),
  status      text        not null default 'active'
                check (status in ('active', 'inactive')),
  created_at  timestamptz not null default now()
);

-- Tự động tạo profile khi user mới đăng ký
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.profiles (id, full_name, phone, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.raw_user_meta_data->>'phone',
    coalesce(new.raw_user_meta_data->>'role', 'staff')
  );
  return new;
end;
$$;

create trigger trg_on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- ------------------------------------------------------------
-- vehicles
-- ------------------------------------------------------------
create table public.vehicles (
  id           uuid        primary key default gen_random_uuid(),
  plate_number text        not null unique,
  vehicle_name text        not null,
  seat_count   integer     not null check (seat_count in (4, 7)),
  status       text        not null default 'active'
                 check (status in ('active', 'inactive', 'maintenance')),
  created_at   timestamptz not null default now()
);


-- ------------------------------------------------------------
-- seats — tự động insert sau khi tạo vehicle
-- ------------------------------------------------------------
create table public.seats (
  id          uuid        primary key default gen_random_uuid(),
  vehicle_id  uuid        not null references public.vehicles (id) on delete cascade,
  seat_code   text        not null,
  seat_order  integer     not null check (seat_order > 0),
  unique (vehicle_id, seat_code),
  unique (vehicle_id, seat_order),
  created_at  timestamptz not null default now()
);

create or replace function public.insert_seats_for_vehicle()
returns trigger
language plpgsql
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

create trigger trg_insert_seats
  after insert on public.vehicles
  for each row execute function public.insert_seats_for_vehicle();


-- ------------------------------------------------------------
-- routes
-- ------------------------------------------------------------
create table public.routes (
  id          uuid           primary key default gen_random_uuid(),
  route_name  text           not null,
  origin      text           not null,
  destination text           not null,
  base_price  numeric(12,2)  not null default 0 check (base_price >= 0),
  status      text           not null default 'active'
                check (status in ('active', 'inactive')),
  created_at  timestamptz    not null default now()
);


-- ------------------------------------------------------------
-- customers — không có tài khoản auth, staff quản lý
-- ------------------------------------------------------------
create table public.customers (
  id         uuid        primary key default gen_random_uuid(),
  full_name  text        not null,
  phone      text        not null,
  note       text,
  created_at timestamptz not null default now()
);


-- ------------------------------------------------------------
-- trips
-- ------------------------------------------------------------
create table public.trips (
  id                    uuid        primary key default gen_random_uuid(),
  trip_code             text        not null unique,
  route_id              uuid        not null references public.routes (id) on delete restrict,
  vehicle_id            uuid        not null references public.vehicles (id) on delete restrict,
  driver_id             uuid        references public.profiles (id) on delete set null,
  planned_departure_time timestamptz not null,
  actual_departure_time  timestamptz,
  actual_arrival_time    timestamptz,
  trip_status           text        not null default 'scheduled'
                          check (trip_status in ('scheduled','in_progress','completed','cancelled')),
  created_at            timestamptz not null default now()
);


-- ------------------------------------------------------------
-- bookings
-- ------------------------------------------------------------
create table public.bookings (
  id              uuid           primary key default gen_random_uuid(),
  booking_code    text           not null unique,
  customer_id     uuid           not null references public.customers (id) on delete restrict,
  trip_id         uuid           not null references public.trips (id) on delete restrict,
  pickup_address  text           not null,
  dropoff_address text           not null,
  fare_amount     numeric(12,2)  not null check (fare_amount >= 0),
  booking_source  text           not null default 'manual'
                    check (booking_source in ('manual','phone','online')),
  status          text           not null default 'pending'
                    check (status in ('pending','confirmed','cancelled','completed')),
  created_at      timestamptz    not null default now()
);
-- seat_count bỏ: derive từ trip_seats WHERE booking_id = ?


-- ------------------------------------------------------------
-- trip_seats — thêm locked_until để chống race condition
-- ------------------------------------------------------------
create table public.trip_seats (
  id           uuid        primary key default gen_random_uuid(),
  trip_id      uuid        not null references public.trips (id) on delete cascade,
  seat_id      uuid        not null references public.seats (id) on delete restrict,
  booking_id   uuid        references public.bookings (id) on delete set null,
  status       text        not null default 'available'
                 check (status in ('available','locked','booked')),
  locked_until timestamptz,
  unique (trip_id, seat_id),
  created_at   timestamptz not null default now()
);

-- Tự động populate trip_seats khi tạo trip
create or replace function public.populate_trip_seats()
returns trigger
language plpgsql
as $$
begin
  insert into public.trip_seats (trip_id, seat_id)
  select new.id, s.id
  from public.seats s
  where s.vehicle_id = new.vehicle_id;
  return new;
end;
$$;

create trigger trg_populate_trip_seats
  after insert on public.trips
  for each row execute function public.populate_trip_seats();


-- ------------------------------------------------------------
-- booking_status_logs
-- ------------------------------------------------------------
create table public.booking_status_logs (
  id          uuid        primary key default gen_random_uuid(),
  booking_id  uuid        not null references public.bookings (id) on delete cascade,
  old_status  text,
  new_status  text        not null,
  changed_by  uuid        references public.profiles (id) on delete set null,
  note        text,
  created_at  timestamptz not null default now()
);

-- Tự động ghi log khi booking.status thay đổi
create or replace function public.log_booking_status_change()
returns trigger
language plpgsql
security definer
as $$
begin
  if old.status is distinct from new.status then
    insert into public.booking_status_logs (booking_id, old_status, new_status, changed_by)
    values (new.id, old.status, new.status, auth.uid());
  end if;
  return new;
end;
$$;

create trigger trg_log_booking_status
  after update on public.bookings
  for each row execute function public.log_booking_status_change();


-- ------------------------------------------------------------
-- trip_driver_logs
-- ------------------------------------------------------------
create table public.trip_driver_logs (
  id             uuid        primary key default gen_random_uuid(),
  trip_id        uuid        not null references public.trips (id) on delete cascade,
  old_driver_id  uuid        references public.profiles (id) on delete set null,
  new_driver_id  uuid        references public.profiles (id) on delete set null,
  changed_by     uuid        references public.profiles (id) on delete set null,
  created_at     timestamptz not null default now()
);

-- Tự động ghi log khi trip.driver_id thay đổi
create or replace function public.log_trip_driver_change()
returns trigger
language plpgsql
security definer
as $$
begin
  if old.driver_id is distinct from new.driver_id then
    insert into public.trip_driver_logs (trip_id, old_driver_id, new_driver_id, changed_by)
    values (new.id, old.driver_id, new.driver_id, auth.uid());
  end if;
  return new;
end;
$$;

create trigger trg_log_trip_driver
  after update on public.trips
  for each row execute function public.log_trip_driver_change();


-- ------------------------------------------------------------
-- vehicle_locations
-- ------------------------------------------------------------
create table public.vehicle_locations (
  id          uuid           primary key default gen_random_uuid(),
  vehicle_id  uuid           not null references public.vehicles (id) on delete cascade,
  latitude    numeric(10,7)  not null,
  longitude   numeric(10,7)  not null,
  speed       numeric(8,2)   not null default 0 check (speed >= 0),
  recorded_at timestamptz    not null default now(),
  created_at  timestamptz    not null default now()
);


-- ============================================================
-- INDEXES
-- ============================================================
create index idx_trips_vehicle_id            on public.trips (vehicle_id);
create index idx_trips_driver_id             on public.trips (driver_id);
create index idx_trips_planned_departure     on public.trips (planned_departure_time);
create index idx_trips_status                on public.trips (trip_status);

create index idx_trip_seats_trip_id          on public.trip_seats (trip_id);
create index idx_trip_seats_booking_id       on public.trip_seats (booking_id);
create index idx_trip_seats_status           on public.trip_seats (status);
create index idx_trip_seats_locked_until     on public.trip_seats (locked_until)
  where locked_until is not null;

create index idx_bookings_trip_id            on public.bookings (trip_id);
create index idx_bookings_customer_id        on public.bookings (customer_id);
create index idx_bookings_status             on public.bookings (status);

create index idx_booking_logs_booking_id     on public.booking_status_logs (booking_id);
create index idx_vehicle_locations_vehicle   on public.vehicle_locations (vehicle_id, recorded_at desc);
create index idx_customers_phone             on public.customers (phone);


-- ============================================================
-- GRANTS — chỉ cho phép app dùng qua public schema
-- ============================================================
grant usage on schema public to authenticated, anon;

grant select, insert, update, delete on table
  public.profiles,
  public.vehicles,
  public.seats,
  public.routes,
  public.customers,
  public.trips,
  public.trip_seats,
  public.bookings,
  public.booking_status_logs,
  public.trip_driver_logs,
  public.vehicle_locations
to authenticated;

-- anon không cần ghi gì
grant select on table
  public.routes
to anon;

-- service_role dùng cho Edge Functions (bypass RLS, cần đủ GRANT-level)
grant all on all tables    in schema public to service_role;
grant all on all sequences in schema public to service_role;

grant execute on function public.get_my_role()      to authenticated;
grant execute on function public.is_admin_or_staff() to authenticated;


-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table public.profiles             enable row level security;
alter table public.vehicles             enable row level security;
alter table public.seats                enable row level security;
alter table public.routes               enable row level security;
alter table public.customers            enable row level security;
alter table public.trips                enable row level security;
alter table public.trip_seats           enable row level security;
alter table public.bookings             enable row level security;
alter table public.booking_status_logs  enable row level security;
alter table public.trip_driver_logs     enable row level security;
alter table public.vehicle_locations    enable row level security;


-- ------------------------------------------------------------
-- profiles
-- ------------------------------------------------------------
create policy "profiles: xem profile bản thân"
  on public.profiles for select
  using (id = auth.uid());

create policy "profiles: admin/staff xem tất cả"
  on public.profiles for select
  using (is_admin_or_staff());

create policy "profiles: tự cập nhật thông tin cá nhân"
  on public.profiles for update
  using (id = auth.uid())
  with check (
    id = auth.uid()
    -- không cho tự đổi role
    and role = (select role from public.profiles where id = auth.uid())
  );

create policy "profiles: admin quản lý tất cả"
  on public.profiles for all
  using (get_my_role() = 'admin');


-- ------------------------------------------------------------
-- vehicles
-- ------------------------------------------------------------
create policy "vehicles: admin/staff xem và quản lý"
  on public.vehicles for all
  using (is_admin_or_staff());

create policy "vehicles: driver xem xe được phân công"
  on public.vehicles for select
  using (
    get_my_role() = 'driver'
    and id in (
      select vehicle_id from public.trips
      where driver_id = auth.uid()
    )
  );


-- ------------------------------------------------------------
-- seats
-- ------------------------------------------------------------
create policy "seats: admin/staff toàn quyền"
  on public.seats for all
  using (is_admin_or_staff());

create policy "seats: driver xem ghế xe của mình"
  on public.seats for select
  using (
    get_my_role() = 'driver'
    and vehicle_id in (
      select vehicle_id from public.trips
      where driver_id = auth.uid()
    )
  );


-- ------------------------------------------------------------
-- routes
-- ------------------------------------------------------------
create policy "routes: admin/staff toàn quyền"
  on public.routes for all
  using (is_admin_or_staff());

create policy "routes: driver xem"
  on public.routes for select
  using (get_my_role() = 'driver');


-- ------------------------------------------------------------
-- customers
-- ------------------------------------------------------------
create policy "customers: admin/staff toàn quyền"
  on public.customers for all
  using (is_admin_or_staff());


-- ------------------------------------------------------------
-- trips
-- ------------------------------------------------------------
create policy "trips: admin/staff toàn quyền"
  on public.trips for all
  using (is_admin_or_staff());

create policy "trips: driver xem chuyến của mình"
  on public.trips for select
  using (
    get_my_role() = 'driver'
    and driver_id = auth.uid()
  );

create policy "trips: driver cập nhật trạng thái chuyến"
  on public.trips for update
  using (
    get_my_role() = 'driver'
    and driver_id = auth.uid()
  )
  with check (
    driver_id = auth.uid()
    -- driver chỉ được đổi trip_status, không được đổi vehicle/route/driver
    and vehicle_id = (select vehicle_id from public.trips where id = trips.id)
    and route_id   = (select route_id   from public.trips where id = trips.id)
    and driver_id  = (select driver_id  from public.trips where id = trips.id)
  );


-- ------------------------------------------------------------
-- trip_seats
-- ------------------------------------------------------------
create policy "trip_seats: admin/staff toàn quyền"
  on public.trip_seats for all
  using (is_admin_or_staff());

create policy "trip_seats: driver xem ghế chuyến của mình"
  on public.trip_seats for select
  using (
    get_my_role() = 'driver'
    and trip_id in (
      select id from public.trips where driver_id = auth.uid()
    )
  );


-- ------------------------------------------------------------
-- bookings
-- ------------------------------------------------------------
create policy "bookings: admin/staff toàn quyền"
  on public.bookings for all
  using (is_admin_or_staff());

create policy "bookings: driver xem booking trong chuyến của mình"
  on public.bookings for select
  using (
    get_my_role() = 'driver'
    and trip_id in (
      select id from public.trips where driver_id = auth.uid()
    )
  );


-- ------------------------------------------------------------
-- booking_status_logs
-- ------------------------------------------------------------
create policy "booking_logs: admin/staff toàn quyền"
  on public.booking_status_logs for all
  using (is_admin_or_staff());

create policy "booking_logs: driver xem log chuyến của mình"
  on public.booking_status_logs for select
  using (
    get_my_role() = 'driver'
    and booking_id in (
      select b.id from public.bookings b
      join public.trips t on t.id = b.trip_id
      where t.driver_id = auth.uid()
    )
  );


-- ------------------------------------------------------------
-- trip_driver_logs
-- ------------------------------------------------------------
create policy "driver_logs: admin/staff toàn quyền"
  on public.trip_driver_logs for all
  using (is_admin_or_staff());

create policy "driver_logs: driver xem log của mình"
  on public.trip_driver_logs for select
  using (
    get_my_role() = 'driver'
    and (old_driver_id = auth.uid() or new_driver_id = auth.uid())
  );


-- ------------------------------------------------------------
-- vehicle_locations
-- ------------------------------------------------------------
create policy "locations: admin/staff toàn quyền"
  on public.vehicle_locations for all
  using (is_admin_or_staff());

create policy "locations: driver insert vị trí xe của mình"
  on public.vehicle_locations for insert
  with check (
    get_my_role() = 'driver'
    and vehicle_id in (
      select vehicle_id from public.trips
      where driver_id = auth.uid()
        and trip_status = 'in_progress'
    )
  );

create policy "locations: driver xem vị trí xe của mình"
  on public.vehicle_locations for select
  using (
    get_my_role() = 'driver'
    and vehicle_id in (
      select vehicle_id from public.trips
      where driver_id = auth.uid()
    )
  );