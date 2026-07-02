-- customers.phone cần unique constraint để upsert(onConflict: "phone") trong
-- create-booking hoạt động (Postgres yêu cầu ON CONFLICT khớp với một
-- unique/exclusion constraint có sẵn, index thường không đủ).

drop index if exists public.idx_customers_phone;

alter table public.customers
  add constraint customers_phone_key unique (phone);
