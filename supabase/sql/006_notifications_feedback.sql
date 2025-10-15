-- 006_notifications_feedback.sql
-- MediLink+ notifications & feedback tables, indexes, RLS, publication

-- Extensions (ensure pgcrypto for UUID if not already)
create extension if not exists pgcrypto;

-- =============================
-- Notifications
-- =============================
-- Enum-like constraints via CHECK for portability
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  type text not null check (type in ('info','success','warning','error','reservation','payment','system')),
  title text not null,
  message text not null,
  is_read boolean not null default false,
  action_url text,
  created_at timestamptz not null default now(),
  expires_at timestamptz
);

-- Indexes
create index if not exists idx_notifications_user_created_at on public.notifications (user_id, created_at desc);
create index if not exists idx_notifications_user_is_read on public.notifications (user_id, is_read);
create index if not exists idx_notifications_expires_at on public.notifications (expires_at);

-- RLS
alter table public.notifications enable row level security;

-- Owner can manage own notifications
create policy if not exists notifications_select_own
  on public.notifications for select
  using (auth.uid() = user_id);

create policy if not exists notifications_insert_own
  on public.notifications for insert
  with check (auth.uid() = user_id);

create policy if not exists notifications_update_own
  on public.notifications for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy if not exists notifications_delete_own
  on public.notifications for delete
  using (auth.uid() = user_id);

-- Admin full access (admin users table role)
create policy if not exists notifications_admin_all
  on public.notifications for all
  using (exists (
    select 1 from public.users u where u.id = auth.uid() and u.role = 'admin'
  ))
  with check (exists (
    select 1 from public.users u where u.id = auth.uid() and u.role = 'admin'
  ));

-- Add to realtime publication
alter publication supabase_realtime add table public.notifications;

-- =============================
-- Feedback
-- =============================
create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  type text not null check (type in ('bug','feature','improvement','general')),
  title text not null,
  description text not null,
  priority text not null default 'medium' check (priority in ('low','medium','high','critical')),
  category text not null default 'other' check (category in ('ui','ux','performance','security','other')),
  user_agent text,
  page_url text,
  screenshot_url text,
  status text not null default 'pending' check (status in ('pending','in_progress','resolved','rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Simple trigger to auto-update updated_at
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Attach trigger
create trigger trg_feedback_set_updated_at
before update on public.feedback
for each row execute function public.set_updated_at();

-- Indexes
create index if not exists idx_feedback_user_created_at on public.feedback (user_id, created_at desc);
create index if not exists idx_feedback_status on public.feedback (status);
create index if not exists idx_feedback_priority on public.feedback (priority);
create index if not exists idx_feedback_category on public.feedback (category);

-- RLS
alter table public.feedback enable row level security;

-- Users can insert their own feedback
create policy if not exists feedback_insert_self
  on public.feedback for insert
  with check (auth.uid() = user_id);

-- Users can read their own feedback; admins can read all
create policy if not exists feedback_select_own
  on public.feedback for select
  using (
    (user_id is not null and auth.uid() = user_id)
    or exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin')
  );

-- Owners can update their feedback while pending; admins can always update
create policy if not exists feedback_update_own_or_admin
  on public.feedback for update
  using (
    (auth.uid() = user_id and status in ('pending','in_progress'))
    or exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin')
  )
  with check (
    (auth.uid() = user_id and status in ('pending','in_progress'))
    or exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin')
  );

-- Only admins can delete feedback
create policy if not exists feedback_delete_admin
  on public.feedback for delete
  using (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin'));

-- Add to realtime publication (optional)
alter publication supabase_realtime add table public.feedback;

-- Grants (Supabase default roles). Optional explicit grants can be added if needed.
