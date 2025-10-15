-- 009_delete_auth_users_not_in_profiles.sql
-- Delete all auth.users that do not have a corresponding row in public.profiles

begin;

-- Optional: Preview orphan auth users before deletion
-- select u.id, u.email, u.created_at
-- from auth.users u
-- left join public.profiles p on p.id = u.id
-- where p.id is null;

-- Delete orphan users from Supabase Auth
delete from auth.users u
where not exists (
  select 1 from public.profiles p where p.id = u.id
);

commit;


