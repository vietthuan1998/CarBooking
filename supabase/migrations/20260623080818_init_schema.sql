create extension if not exists pgcrypto;

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  phone text unique,
  role text not null default 'customer',
  status text not null default 'active',
  created_at timestamptz not null default now()
);

create table public.vehicles (
  id uuid primary key default gen_random_uuid(),
  plate_number text not null unique,
  vehicle_name text not null,
  seat_count integer not null check (seat_count > 0),
  status text not null default 'active'
);

create table public.routes (
  id uuid primary key default gen_random_uuid(),
  route_name text not null,
  origin text not null,
  destination text not null,
  status text not null default 'active'
);

create table public.seats (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references public.vehicles (id) on delete cascade,
  seat_code text not null,
  seat_order integer not null check (seat_order > 0),
  unique (vehicle_id, seat_code),
  unique (vehicle_id, seat_order)
);

create table public.trips (
  id uuid primary key default gen_random_uuid(),
  trip_code text not null unique,
  route_id uuid not null references public.routes (id) on delete restrict,
  vehicle_id uuid not null references public.vehicles (id) on delete restrict,
  driver_id uuid references public.profiles (id) on delete set null,
  planned_departure_time timestamptz not null,
  actual_departure_time timestamptz,
  actual_arrival_time timestamptz,
  trip_status text not null default 'scheduled'
);

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text not null,
  note text
);

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  booking_code text not null unique,
  customer_id uuid not null references public.customers (id) on delete restrict,
  trip_id uuid not null references public.trips (id) on delete restrict,
  seat_count integer not null check (seat_count > 0),
  pickup_address text not null,
  dropoff_address text not null,
  fare_amount numeric(12, 2) not null check (fare_amount >= 0),
  booking_source text not null default 'manual',
  status text not null default 'pending'
);

create table public.trip_seats (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips (id) on delete cascade,
  seat_id uuid not null references public.seats (id) on delete restrict,
  booking_id uuid references public.bookings (id) on delete set null,
  status text not null default 'available',
  unique (trip_id, seat_id)
);

create table public.booking_status_logs (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings (id) on delete cascade,
  old_status text,
  new_status text not null,
  changed_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.trip_driver_logs (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips (id) on delete cascade,
  old_driver_id uuid references public.profiles (id) on delete set null,
  new_driver_id uuid references public.profiles (id) on delete set null,
  changed_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.vehicle_locations (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references public.vehicles (id) on delete cascade,
  latitude numeric(10, 7) not null,
  longitude numeric(10, 7) not null,
  speed numeric(8, 2) not null default 0 check (speed >= 0),
  recorded_at timestamptz not null default now()
);

create index trips_route_id_idx on public.trips (route_id);
create index trips_vehicle_id_idx on public.trips (vehicle_id);
create index trips_driver_id_idx on public.trips (driver_id);
create index bookings_customer_id_idx on public.bookings (customer_id);
create index bookings_trip_id_idx on public.bookings (trip_id);
create index trip_seats_booking_id_idx on public.trip_seats (booking_id);
create index booking_status_logs_booking_id_idx on public.booking_status_logs (booking_id);
create index trip_driver_logs_trip_id_idx on public.trip_driver_logs (trip_id);
create index vehicle_locations_vehicle_recorded_idx on public.vehicle_locations (vehicle_id, recorded_at desc);

alter table public.profiles enable row level security;
alter table public.vehicles enable row level security;
alter table public.routes enable row level security;
alter table public.seats enable row level security;
alter table public.trips enable row level security;
alter table public.customers enable row level security;
alter table public.bookings enable row level security;
alter table public.trip_seats enable row level security;
alter table public.booking_status_logs enable row level security;
alter table public.trip_driver_logs enable row level security;
alter table public.vehicle_locations enable row level security;
