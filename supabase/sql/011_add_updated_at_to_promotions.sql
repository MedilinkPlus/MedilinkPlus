-- 011_add_updated_at_to_promotions.sql
-- Add updated_at column and auto-update trigger to promotions table

begin;

-- 1) Add updated_at column if not exists
do $$ begin
  if not exists (
    select 1 from information_schema.columns 
    where table_schema='public' and table_name='promotions' and column_name='updated_at'
  ) then
    alter table public.promotions add column updated_at timestamptz default now();
  end if;
end $$;

-- 2) Update existing rows to have updated_at = created_at
update public.promotions
set updated_at = created_at
where updated_at is null;

-- 3) Make updated_at NOT NULL
alter table public.promotions
alter column updated_at set not null,
alter column updated_at set default now();

-- 4) Create trigger function for auto-updating updated_at
create or replace function update_promotions_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- 5) Create trigger
drop trigger if exists trg_update_promotions_updated_at on public.promotions;
create trigger trg_update_promotions_updated_at
before update on public.promotions
for each row
execute function update_promotions_updated_at();

commit;


