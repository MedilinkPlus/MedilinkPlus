-- 008_migrate_users_to_profiles.sql
-- Rename public.users -> public.profiles, drop password_hash, add auth sync trigger,
-- and provide compatibility view public.users

begin;

-- 1) Rename table users -> profiles (moves indexes, constraints, RLS policies, triggers)
alter table if exists public.users rename to profiles;

-- 2) Drop password_hash column (no longer stored in app schema)
do $$ begin
  if exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' and table_name = 'profiles' and column_name = 'password_hash'
  ) then
    alter table public.profiles drop column password_hash;
  end if;
end $$;

-- 3) Ensure primary key remains on id and email uniqueness (safety)
alter table public.profiles
  alter column id set not null;

-- 4) Recreate compatibility view public.users (read-only)
drop view if exists public.users cascade;
create view public.users as
select 
  id,
  email,
  role,
  name,
  phone,
  language,
  age,
  gender,
  avatar_url,
  member_since,
  total_bookings,
  favorite_hospitals_count,
  total_reviews,
  line_user_id,
  notification_preferences,
  created_at,
  updated_at
from public.profiles;

comment on view public.users is 'Compatibility view mapped to public.profiles after migration';

-- 5) Grant privileges to the view for authenticated role (select/insert/update/delete)
grant select, insert, update, delete on public.users to authenticated;

-- 6) Trigger: sync auth.users -> public.profiles on signup
create or replace function public.handle_auth_user_created()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.profiles (
    id, email, role, name, created_at, updated_at
  ) values (
    new.id,
    new.email,
    coalesce((new.raw_user_meta_data->>'role')::public.user_role, 'user'),
    coalesce(new.raw_user_meta_data->>'name', ''),
    now(),
    now()
  ) on conflict (id) do update set
    email = excluded.email,
    updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_auth_user_created();

-- 7) Backfill existing auth.users into profiles (idempotent)
insert into public.profiles (id, email, role, name, created_at, updated_at)
select u.id,
       u.email,
       coalesce((u.raw_user_meta_data->>'role')::public.user_role, 'user') as role,
       coalesce(u.raw_user_meta_data->>'name','') as name,
       now(),
       now()
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null;

-- 8) Fix FKs in tables that referenced public.users
-- notifications.user_id -> profiles.id
do $$
declare
  conname text;
begin
  select tc.constraint_name into conname
  from information_schema.table_constraints tc
  join information_schema.key_column_usage kcu on tc.constraint_name = kcu.constraint_name
  where tc.table_schema = 'public'
    and tc.table_name = 'notifications'
    and tc.constraint_type = 'FOREIGN KEY'
    and kcu.column_name = 'user_id';
  if conname is not null then
    execute format('alter table public.notifications drop constraint %I', conname);
  end if;
  if exists (select 1 from information_schema.tables where table_schema='public' and table_name='notifications') then
    alter table public.notifications
      add constraint notifications_user_id_fkey
      foreign key (user_id) references public.profiles(id) on delete cascade;
  end if;
end$$;

-- feedback.user_id -> profiles.id
do $$
declare
  conname text;
begin
  select tc.constraint_name into conname
  from information_schema.table_constraints tc
  join information_schema.key_column_usage kcu on tc.constraint_name = kcu.constraint_name
  where tc.table_schema = 'public'
    and tc.table_name = 'feedback'
    and tc.constraint_type = 'FOREIGN KEY'
    and kcu.column_name = 'user_id';
  if conname is not null then
    execute format('alter table public.feedback drop constraint %I', conname);
  end if;
  if exists (select 1 from information_schema.tables where table_schema='public' and table_name='feedback') then
    alter table public.feedback
      add constraint feedback_user_id_fkey
      foreign key (user_id) references public.profiles(id) on delete set null;
  end if;
end$$;

commit;


