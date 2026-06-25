create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.profiles (
    id,
    full_name,
    phone,
    role,
    status
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email, ''),
    new.raw_user_meta_data->>'phone',
    'customer',
    'active'
  );

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

