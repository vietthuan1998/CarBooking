-- Chuẩn hóa profiles.phone: chuỗi rỗng/toàn khoảng trắng → NULL.
-- phone có unique constraint; NULL không đụng nhau nhưng '' = '' nên
-- người thứ 2 để trống phone sẽ dính 23505 (signup dính qua handle_new_user
-- làm rollback cả insert auth.users, GoTrue chỉ báo "Database error saving
-- new user"). Normalize ở DB để mọi đường ghi (signup, edge fn, client
-- update) đều về một dạng.

-- Dọn dữ liệu cũ.
update public.profiles
set phone = null
where trim(phone) = '';

create or replace function public.normalize_profile_phone()
returns trigger
language plpgsql
as $$
begin
  new.phone := nullif(trim(new.phone), '');
  return new;
end;
$$;

drop trigger if exists normalize_profile_phone on public.profiles;
create trigger normalize_profile_phone
  before insert or update on public.profiles
  for each row
  execute function public.normalize_profile_phone();
