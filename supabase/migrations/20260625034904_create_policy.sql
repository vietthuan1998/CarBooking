create policy "Users can view own profile"
on profiles
for select
using (
  auth.uid() = id
);

create policy "Users update own profile"
on profiles
for update
using (
  auth.uid() = id
);

create or replace function public.get_my_role()
returns text
language sql
stable
security definer
as $$
  select role
  from public.profiles
  where id = auth.uid();
$$;

create policy "Admin can read all profiles"
on profiles
for select
using (
  public.get_my_role() = 'admin'
);

create policy "Admin update all profiles"
on profiles
for update
using (
  public.get_my_role() = 'admin'
);

create policy "Manager read all profiles"
on profiles
for select
using (
  public.get_my_role() in ('admin', 'manager')
);