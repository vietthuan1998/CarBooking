-- FCM push notification cho app mobile (driver):
-- app đăng ký token thiết bị vào bảng này sau khi login, edge function
-- (_shared/push.ts) đọc token theo user_id bằng service role để gửi push.
-- Bảng riêng thay vì cột trên profiles vì 1 user có thể nhiều thiết bị
-- và token FCM xoay vòng (app upsert lại khi onTokenRefresh).

create table public.device_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  token text not null unique,
  platform text check (platform in ('android', 'ios')),
  updated_at timestamptz not null default now()
);

create index device_tokens_user_id_idx on public.device_tokens (user_id);

alter table public.device_tokens enable row level security;

-- Mỗi user chỉ thao tác token của chính mình (app mobile upsert/delete).
-- Edge fn gửi push dùng service role nên bypass RLS, không cần policy đọc chéo.
create policy "Users manage own device tokens"
  on public.device_tokens
  for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- Bảng mới không tự expose qua Data API (auto_expose_new_tables tắt) → grant tường minh.
grant select, insert, update, delete on table public.device_tokens to authenticated;
grant all on table public.device_tokens to service_role;
