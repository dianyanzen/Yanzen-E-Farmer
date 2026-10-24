-- Yanzen E-Farmer V1. Run in Supabase SQL Editor after reviewing.
create extension if not exists pgcrypto;

create table if not exists public.musim_tanam (
 id uuid primary key default gen_random_uuid(),
 owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
 nama text not null check (length(trim(nama)) between 1 and 120),
 komoditas text not null default 'Timun',
 luas_tumbak numeric(12,2) not null check(luas_tumbak>0),
 tanggal_mulai date,
 created_at timestamptz not null default now(),
 unique(id,owner_id)
);
create table if not exists public.pengeluaran (
 id uuid primary key default gen_random_uuid(),
 owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
 musim_id uuid not null,
 kategori text not null check(length(trim(kategori)) between 1 and 80),
 nama text not null check(length(trim(nama)) between 1 and 160),
 jumlah numeric(14,3) not null check(jumlah>0),
 satuan text not null check(length(trim(satuan)) between 1 and 40),
 harga_satuan numeric(16,2) not null check(harga_satuan>=0),
 tanggal date not null default current_date,
 created_at timestamptz not null default now(),
 constraint pengeluaran_musim_owner_fk foreign key(musim_id,owner_id) references public.musim_tanam(id,owner_id) on delete cascade
);
create table if not exists public.hasil_panen (
 id uuid primary key default gen_random_uuid(),
 owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
 musim_id uuid not null,
 tanggal date not null,
 berat_kg numeric(14,3) not null check(berat_kg>0),
 harga_per_kg numeric(16,2) not null check(harga_per_kg>=0),
 created_at timestamptz not null default now(),
 constraint hasil_panen_musim_owner_fk foreign key(musim_id,owner_id) references public.musim_tanam(id,owner_id) on delete cascade
);
create index if not exists pengeluaran_owner_musim_idx on public.pengeluaran(owner_id,musim_id);
create index if not exists panen_owner_musim_idx on public.hasil_panen(owner_id,musim_id);

-- Prevent changing ownership or reassigning records to another season.
create or replace function public.guard_farmer_ownership() returns trigger
language plpgsql set search_path = '' as $$
begin
 if tg_op = 'INSERT' then
   if new.owner_id is distinct from (select auth.uid()) then raise exception 'Invalid owner'; end if;
 else
   if new.owner_id is distinct from old.owner_id then raise exception 'Cannot change owner'; end if;
 end if;
 return new;
end $$;
drop trigger if exists guard_musim_owner on public.musim_tanam;
create trigger guard_musim_owner before insert or update on public.musim_tanam for each row execute function public.guard_farmer_ownership();
drop trigger if exists guard_pengeluaran_owner on public.pengeluaran;
create trigger guard_pengeluaran_owner before insert or update on public.pengeluaran for each row execute function public.guard_farmer_ownership();
drop trigger if exists guard_panen_owner on public.hasil_panen;
create trigger guard_panen_owner before insert or update on public.hasil_panen for each row execute function public.guard_farmer_ownership();

alter table public.musim_tanam enable row level security;
alter table public.pengeluaran enable row level security;
alter table public.hasil_panen enable row level security;
revoke all on public.musim_tanam,public.pengeluaran,public.hasil_panen from anon;
grant select,insert,update,delete on public.musim_tanam,public.pengeluaran,public.hasil_panen to authenticated;
drop policy if exists musim_owner on public.musim_tanam;
create policy musim_owner on public.musim_tanam for all to authenticated using(owner_id=(select auth.uid())) with check(owner_id=(select auth.uid()));
drop policy if exists pengeluaran_owner on public.pengeluaran;
create policy pengeluaran_owner on public.pengeluaran for all to authenticated using(owner_id=(select auth.uid())) with check(owner_id=(select auth.uid()));
drop policy if exists panen_owner on public.hasil_panen;
create policy panen_owner on public.hasil_panen for all to authenticated using(owner_id=(select auth.uid())) with check(owner_id=(select auth.uid()));
