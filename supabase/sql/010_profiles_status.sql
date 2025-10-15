-- 010_profiles_status.sql
-- Add user_status enum and status column to public.profiles
-- Also add trigger to set profiles.status=active when auth.users gets email confirmed

begin;

-- 1) Enum for profile status
do $$ begin
  if not exists (select 1 from pg_type where typname = 'user_status') then
    create type user_status as enum ('pending','active','inactive','rejected');
  end if;
end $$;

-- 2) Add status column to profiles
do $$ begin
  if not exists (
    select 1 from information_schema.columns 
    where table_schema='public' and table_name='profiles' and column_name='status'
  ) then
    alter table public.profiles add column status user_status not null default 'active';
  end if;
end $$;

-- 3) RLS policies for profiles already exist; no change needed for status reads

-- 4) Trigger: when auth.users email is confirmed, set profile active (idempotent)
create or replace function public.activate_profile_on_email_confirm()
returns trigger
language plpgsql
security definer
as $$
begin
  if new.email_confirmed_at is not null then
    update public.profiles
    set status = 'active', updated_at = now()
    where id = new.id and status <> 'active';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_activate_profile_on_email_confirm on auth.users;
create trigger trg_activate_profile_on_email_confirm
after update of email_confirmed_at on auth.users
for each row execute function public.activate_profile_on_email_confirm();

commit;




