insert into public.routes (route_name, origin, destination, base_price, status)
values
  ('Huế - Đà Nẵng',  'Huế',      'Đà Nẵng', 150000, 'active'),
  ('Đà Nẵng - Huế',  'Đà Nẵng',  'Huế',      150000, 'active'),
  ('Huế - Hội An',   'Huế',      'Hội An',   250000, 'active'),
  ('Hội An - Huế',   'Hội An',   'Huế',      250000, 'active');

-- Tài khoản admin mặc định: admin@admin.com / @dmin123
-- Trigger handle_new_user tự tạo public.profiles từ raw_user_meta_data
-- (phải có "role": "admin", thiếu thì trigger default về 'staff').
insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  phone_change,
  phone_change_token,
  email_change_token_current,
  email_change_confirm_status,
  reauthentication_token,
  is_sso_user,
  is_anonymous
) values (
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000001',
  'authenticated',
  'authenticated',
  'admin@admin.com',
  extensions.crypt('@dmin123', extensions.gen_salt('bf')),
  now(),
  '', '', '', '',
  '{"provider": "email", "providers": ["email"], "status": "active"}',
  '{"sub": "00000000-0000-0000-0000-000000000001", "email": "admin@admin.com", "full_name": "Administrator", "role": "admin", "email_verified": true, "phone_verified": false}',
  now(),
  now(),
  '', '', '',
  0,
  '',
  false,
  false
);
