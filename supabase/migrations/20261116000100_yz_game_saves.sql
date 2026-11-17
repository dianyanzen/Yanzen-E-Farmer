-- YZ Farm Life Stage 1. Isolated game state, never writes to real farm records.
-- Store at most one private save slot per authenticated user.
create table if not exists public.yz_game_saves (
  user_id uuid primary key references auth.users(id) on delete cascade,
  version smallint not null default 1 check (version = 1),
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  constraint yz_game_save_object check (jsonb_typeof(data) = 'object'),
  constraint yz_game_save_limit check (octet_length(data::text) <= 131072)
);

alter table public.yz_game_saves enable row level security;
revoke all on public.yz_game_saves from public, anon, authenticated;
grant select, insert, update on public.yz_game_saves to authenticated;

create policy "yz_game_select_own" on public.yz_game_saves
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "yz_game_insert_own" on public.yz_game_saves
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "yz_game_update_own" on public.yz_game_saves
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

comment on table public.yz_game_saves is
  'Private fictional YZ Farm Life save data. Never mix with financial or operational farm ledgers.';
