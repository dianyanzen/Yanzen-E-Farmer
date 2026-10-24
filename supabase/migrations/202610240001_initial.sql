-- Yanzen E-Farmer: canonical baseline matching the connected Supabase project.
-- Run via a managed migration workflow, not repeatedly in an unreviewed SQL editor.
create extension if not exists pgcrypto;

create table if not exists public.farm_projects (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
 name text not null check (length(trim(name)) between 1 and 160),
 crop text not null default 'Timun',
 area_tumbak numeric(12,2) not null check (area_tumbak > 0),
 created_at timestamptz not null default now()
);

create table if not exists public.budget_items (
 id uuid primary key default gen_random_uuid(),
 project_id uuid not null references public.farm_projects(id) on delete cascade,
 user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
 name text not null check (length(trim(name)) between 1 and 160),
 category text not null default 'Lainnya',
 quantity numeric(14,3) not null check (quantity >= 0),
 unit text not null,
 unit_price numeric(16,2) not null check (unit_price >= 0),
 created_at timestamptz not null default now()
);

create table if not exists public.expenses (
 id uuid primary key default gen_random_uuid(),
 project_id uuid not null references public.farm_projects(id) on delete cascade,
 user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
 expense_date date not null default current_date,
 description text not null,
 amount numeric(16,2) not null check (amount >= 0),
 budget_item_id uuid references public.budget_items(id) on delete set null,
 receipt_number text,
 vendor text,
 note text,
 created_at timestamptz not null default now()
);

create index if not exists budget_items_project_idx on public.budget_items(project_id);
create index if not exists expenses_project_date_idx on public.expenses(project_id,expense_date);

alter table public.farm_projects enable row level security;
alter table public.budget_items enable row level security;
alter table public.expenses enable row level security;

revoke all on public.farm_projects,public.budget_items,public.expenses from anon;
grant select,insert,update,delete on public.farm_projects,public.budget_items,public.expenses to authenticated;

drop policy if exists "farm_projects_owner" on public.farm_projects;
create policy "farm_projects_owner" on public.farm_projects for all to authenticated
 using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
drop policy if exists "budget_items_owner" on public.budget_items;
create policy "budget_items_owner" on public.budget_items for all to authenticated
 using ((select auth.uid())=user_id and exists
   (select 1 from public.farm_projects p where p.id=project_id and p.user_id=(select auth.uid())))
 with check ((select auth.uid())=user_id and exists
   (select 1 from public.farm_projects p where p.id=project_id and p.user_id=(select auth.uid())));
drop policy if exists "expenses_owner" on public.expenses;
create policy "expenses_owner" on public.expenses for all to authenticated
 using ((select auth.uid())=user_id and exists
   (select 1 from public.farm_projects p where p.id=project_id and p.user_id=(select auth.uid())))
 with check ((select auth.uid())=user_id and exists
   (select 1 from public.farm_projects p where p.id=project_id and p.user_id=(select auth.uid())));
