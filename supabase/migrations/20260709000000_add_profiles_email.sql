-- Thêm cột email vào profiles (mirror từ auth.users) để client hiển thị
-- email trong trang quản lý tài khoản — client không đọc được auth.users
-- của user khác nên phải lưu bản sao ở profiles.
-- Email chỉ để hiển thị, không cho sửa từ client (xem policy bên dưới).

alter table public.profiles add column if not exists email text;

-- Backfill từ auth.users cho các profile đã tồn tại.
update public.profiles p
set email = u.email
from auth.users u
where u.id = p.id
  and p.email is distinct from u.email;

-- Trigger tạo profile: lưu thêm email của user mới.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.profiles (id, full_name, phone, email, role, status)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.raw_user_meta_data->>'phone',
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'staff'),
    case
      when new.raw_app_meta_data->>'status' in ('active', 'inactive')
        then new.raw_app_meta_data->>'status'
      else 'inactive'
    end
  );
  return new;
end;
$$;

-- Chặn client sửa email (mirror read-only). Chỉ chặn request từ client
-- (jwt role anon/authenticated); service_role (edge fn) và SQL trực tiếp
-- (migration, dashboard) vẫn sửa được để sync khi email auth thay đổi.
create or replace function public.prevent_profile_email_change()
returns trigger
language plpgsql
as $$
begin
  if new.email is distinct from old.email
     and coalesce(auth.jwt()->>'role', '') in ('anon', 'authenticated')
  then
    raise exception 'Không thể thay đổi email';
  end if;
  return new;
end;
$$;

drop trigger if exists prevent_profile_email_change on public.profiles;
create trigger prevent_profile_email_change
  before update on public.profiles
  for each row
  execute function public.prevent_profile_email_change();
