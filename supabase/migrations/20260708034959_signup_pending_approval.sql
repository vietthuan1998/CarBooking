-- Tài khoản tự đăng ký (public signup) phải chờ admin kích hoạt mới dùng được.
--
-- status đọc từ raw_APP_meta_data chứ KHÔNG phải raw_user_meta_data:
-- user_metadata do người đăng ký tự gửi lên được (POST /auth/v1/signup),
-- ai cũng có thể tự nhét "status":"active"; app_metadata thì chỉ admin API /
-- service role set được (edge fn create-account, seed).
-- → signup công khai không có app_metadata.status ⇒ default 'inactive'.
-- → edge fn create-account set app_metadata {"status":"active"} ⇒ admin tạo
--   thì active ngay như trước.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.profiles (id, full_name, phone, role, status)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.raw_user_meta_data->>'phone',
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
