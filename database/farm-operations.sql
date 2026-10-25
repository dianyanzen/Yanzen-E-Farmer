-- Additive operations platform. Legacy budgets are preserved verbatim.
create schema if not exists farm_private;
revoke all on schema farm_private from public, anon;
grant usage on schema farm_private to authenticated;

create table public.farm_organizations (
 id uuid primary key default gen_random_uuid(), owner_id uuid not null references auth.users(id),
 name text not null check(length(trim(name)) between 1 and 160), created_at timestamptz not null default now()
);
create table public.farm_members (
 organization_id uuid not null references public.farm_organizations(id), user_id uuid not null references auth.users(id),
 role text not null check(role in ('manager','recorder','finance','reader')), primary key(organization_id,user_id)
);
-- Narrow membership lookup only; no data mutation, auth.uid() never supplied by client.
create function farm_private.role_for(org uuid) returns text language sql stable security definer set search_path='' as $$
 select case when o.owner_id=(select auth.uid()) then 'owner' else
 (select m.role from public.farm_members m where m.organization_id=o.id and m.user_id=(select auth.uid())) end
 from public.farm_organizations o where o.id=org and (select auth.uid()) is not null
$$;
revoke all on function farm_private.role_for(uuid) from public,anon;
grant execute on function farm_private.role_for(uuid) to authenticated;
alter table public.farm_organizations enable row level security;
alter table public.farm_members enable row level security;
create policy org_read on public.farm_organizations for select to authenticated using(owner_id=(select auth.uid()) or farm_private.role_for(id) is not null);
create policy org_add on public.farm_organizations for insert to authenticated with check(owner_id=(select auth.uid()));
create policy org_edit on public.farm_organizations for update to authenticated using(owner_id=(select auth.uid())) with check(owner_id=(select auth.uid()));
create policy member_read on public.farm_members for select to authenticated using(user_id=(select auth.uid()) or farm_private.role_for(organization_id)='owner');
create policy member_write on public.farm_members for all to authenticated using(farm_private.role_for(organization_id)='owner') with check(farm_private.role_for(organization_id)='owner');
create index farm_members_user_idx on public.farm_members(user_id);
create index farm_org_owner_idx on public.farm_organizations(owner_id);

create table public.farm_lands (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.farm_organizations(id),
 name text not null check(length(trim(name)) between 1 and 160), location text not null default '',
 original_area numeric not null check(original_area>0), original_unit text not null default 'ha',
 conversion_m2 numeric check(conversion_m2>0), area_m2 numeric generated always as (original_area*conversion_m2) stored,
 latitude numeric check(latitude between -90 and 90), longitude numeric check(longitude between -180 and 180),
 elevation_m numeric, notes text not null default '', created_at timestamptz not null default now(), unique(id,organization_id)
);
create table public.farm_blocks (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.farm_organizations(id),
 land_id uuid not null, name text not null check(length(trim(name)) between 1 and 160), area_m2 numeric not null check(area_m2>0),
 active_from date not null default current_date, active_to date, check(active_to is null or active_to>=active_from),
 created_at timestamptz not null default now(), unique(id,organization_id),
 foreign key(land_id,organization_id) references public.farm_lands(id,organization_id)
);
create table public.farm_cycles (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.farm_organizations(id),
 block_id uuid, name text not null check(length(trim(name)) between 1 and 160), commodity text not null,
 production_type text not null default 'seasonal' check(production_type in ('seasonal','perennial','fish','integrated')),
 variety text not null default '', start_date date, end_date date, area_m2 numeric check(area_m2>0),
 shared boolean not null default false, status text not null default 'active' check(status in ('active','closed')),
 legacy_project_id uuid unique references public.farm_projects(id), notes text not null default '',
 created_at timestamptz not null default now(), unique(id,organization_id),
 foreign key(block_id,organization_id) references public.farm_blocks(id,organization_id),
 check(end_date is null or start_date is null or end_date>=start_date)
);
create table public.farm_accounts (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.farm_organizations(id),
 name text not null check(length(trim(name)) between 1 and 160), unique(id,organization_id), created_at timestamptz not null default now()
);
create table public.farm_parties (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.farm_organizations(id),
 name text not null check(length(trim(name)) between 1 and 160), category text not null default 'group'
 check(category in ('group','employee','buyer','supplier')), employment_status text not null default '', job_role text not null default '',
 active boolean not null default true, notes text not null default '', unique(id,organization_id), created_at timestamptz not null default now()
);
create table public.farm_entries (
 id uuid primary key, organization_id uuid not null references public.farm_organizations(id),
 kind text not null check(kind in ('expense','income','capital','withdrawal','loan_in','loan_out','transfer','opening','labor','advance','settlement','advance_return','advance_apply','harvest','sale','shipping','activity','condition','stock_in','stock_use','asset','maintenance','lease')),
 entry_date date not null, title text not null check(length(trim(title)) between 1 and 200), cycle_id uuid, party_id uuid, account_id uuid, to_account_id uuid,
 parent_id uuid, advance_id uuid, amount numeric(18,2) not null default 0 check(amount>=0), quantity numeric(18,3) check(quantity>=0), unit text not null default '',
 details jsonb not null default '{}' check(jsonb_typeof(details)='object'),
 status text not null default 'posted' check(status in ('posted','void')), void_reason text,
 created_by uuid not null default auth.uid() references auth.users(id), created_at timestamptz not null default now(),
 unique(id,organization_id),
 foreign key(cycle_id,organization_id) references public.farm_cycles(id,organization_id),
 foreign key(party_id,organization_id) references public.farm_parties(id,organization_id),
 foreign key(account_id,organization_id) references public.farm_accounts(id,organization_id),
 foreign key(to_account_id,organization_id) references public.farm_accounts(id,organization_id),
 foreign key(parent_id,organization_id) references public.farm_entries(id,organization_id),
 foreign key(advance_id,organization_id) references public.farm_entries(id,organization_id)
);
create index farm_entries_org_date on public.farm_entries(organization_id,entry_date,id);
create index farm_entries_parent on public.farm_entries(parent_id);
create index farm_entries_advance on public.farm_entries(advance_id);
create index farm_entries_cycle on public.farm_entries(cycle_id);
create index farm_entries_party on public.farm_entries(party_id);
create index farm_entries_account on public.farm_entries(account_id);
create index farm_entries_to_account on public.farm_entries(to_account_id);
create index farm_entries_creator on public.farm_entries(created_by);
create index farm_blocks_land on public.farm_blocks(land_id);
create index farm_cycles_block on public.farm_cycles(block_id);

create table public.farm_audit (
 id bigint generated always as identity primary key, organization_id uuid not null references public.farm_organizations(id),
 actor uuid, entity text not null, record_id uuid not null, operation text not null,
 before_data jsonb, after_data jsonb, created_at timestamptz not null default now()
);
alter table public.farm_audit enable row level security;
create policy audit_read on public.farm_audit for select to authenticated using(farm_private.role_for(organization_id) in ('owner','manager','finance'));
-- Trigger-only audit writer; no direct application write privilege.
create function farm_private.audit_change() returns trigger language plpgsql security definer set search_path='' as $$
begin
 insert into public.farm_audit(organization_id,actor,entity,record_id,operation,before_data,after_data)
 values(new.organization_id,auth.uid(),tg_table_name,new.id,tg_op,case when tg_op='UPDATE' then to_jsonb(old) else null end,to_jsonb(new));
 return new;
end $$;
revoke all on function farm_private.audit_change() from public,anon,authenticated;

do $$ declare t text; begin
 foreach t in array array['farm_lands','farm_blocks','farm_cycles','farm_accounts','farm_parties','farm_entries'] loop
 execute format('alter table public.%I enable row level security',t);
 execute format('create index %I on public.%I(organization_id)',t||'_org_idx',t);
 execute format('create policy read_member on public.%I for select to authenticated using (farm_private.role_for(organization_id) is not null)',t);
 execute format('create policy insert_member on public.%I for insert to authenticated with check (farm_private.role_for(organization_id) in (''owner'',''manager'',''recorder'',''finance''))',t);
 execute format('create policy update_member on public.%I for update to authenticated using (farm_private.role_for(organization_id) in (''owner'',''manager'',''finance'')) with check (farm_private.role_for(organization_id) in (''owner'',''manager'',''finance''))',t);
 execute format('create trigger audit_change after insert or update on public.%I for each row execute function farm_private.audit_change()',t);
 execute format('revoke all on public.%I from anon,authenticated',t);
 execute format('grant select,insert,update on public.%I to authenticated',t);
 end loop;
end $$;
revoke all on public.farm_organizations,public.farm_members,public.farm_audit from authenticated;
grant select,insert,update on public.farm_organizations to authenticated;
grant select,insert,update,delete on public.farm_members to authenticated;
grant select on public.farm_audit to authenticated;
revoke all on public.farm_audit,public.farm_members,public.farm_organizations from anon;

create function farm_private.validate_area() returns trigger language plpgsql set search_path='' as $$
declare capacity numeric; used numeric; begin
 if tg_op='UPDATE' and new.organization_id<>old.organization_id then raise exception 'Usaha tidak boleh diganti'; end if;
 if tg_table_name='farm_blocks' then
  if tg_op='UPDATE' and (new.land_id<>old.land_id or new.area_m2<>old.area_m2) then raise exception 'Ukuran blok bersejarah tidak dapat diubah; buat pembagian baru setelah menutup penggunaan'; end if;
  select area_m2 into capacity from public.farm_lands where id=new.land_id for update;
  select coalesce(max(total),0) into used from (
 select (select coalesce(sum(b.area_m2),0) from public.farm_blocks b where b.land_id=new.land_id and b.id<>new.id and d.at_date between b.active_from and coalesce(b.active_to,'9999-12-31')) total
 from (select new.active_from as at_date union select active_from from public.farm_blocks where land_id=new.land_id and active_from between new.active_from and coalesce(new.active_to,'9999-12-31')) d) totals;
 if tg_op='UPDATE' and new.active_to is not null and exists(select 1 from public.farm_cycles where block_id=new.id and (end_date is null or end_date>new.active_to)) then raise exception 'Selesaikan budidaya sebelum mengakhiri pembagian'; end if;
  if capacity is null or used+new.area_m2>capacity then raise exception 'Luas blok melebihi lahan atau konversi belum dikonfirmasi'; end if;
 elsif tg_table_name='farm_cycles' and new.block_id is not null then
  select area_m2 into capacity from public.farm_blocks where id=new.block_id for update;
  if not exists(select 1 from public.farm_blocks where id=new.block_id and new.start_date>=active_from and (active_to is null or new.end_date<=active_to)) then raise exception 'Periode di luar masa penggunaan bagian lahan'; end if;
  if new.area_m2 is null or new.start_date is null or new.area_m2>capacity then raise exception 'Isi luas dan tanggal budidaya sesuai blok'; end if;
  if exists(select 1 from public.farm_cycles c where c.block_id=new.block_id and c.id<>new.id
   and daterange(c.start_date,c.end_date,'[]') && daterange(new.start_date,new.end_date,'[]')
   and (not c.shared or not new.shared)) then raise exception 'Periode bertumpang tindih. Tutup periode sebelumnya atau tandai penggunaan bersama pada keduanya'; end if;
 elsif tg_table_name='farm_lands' and tg_op='UPDATE' then
  select coalesce(max(total),0) into used from(select (select coalesce(sum(b.area_m2),0) from public.farm_blocks b where b.land_id=new.id and d.active_from between b.active_from and coalesce(b.active_to,'9999-12-31')) total from public.farm_blocks d where d.land_id=new.id) t;
  if new.original_area*new.conversion_m2<used or (used>0 and new.conversion_m2 is null) then raise exception 'Luas kurang dari total blok'; end if;
 end if;
 return new;
end $$;
create trigger validate_land before update on public.farm_lands for each row execute function farm_private.validate_area();
create trigger validate_block before insert or update on public.farm_blocks for each row execute function farm_private.validate_area();
create trigger validate_cycle before insert or update on public.farm_cycles for each row execute function farm_private.validate_area();

create function farm_private.validate_entry() returns trigger language plpgsql set search_path='' as $$
declare p public.farm_entries; a public.farm_entries; paid numeric; used numeric; l jsonb; n numeric; base numeric:=0; overtime numeric:=0; assignments numeric:=0; r text;
begin
 r:=farm_private.role_for(new.organization_id);
 perform pg_advisory_xact_lock(hashtextextended('entry:'||new.id::text,0));
 if tg_op='UPDATE' then
  if (to_jsonb(new)-'status'-'void_reason')<>(to_jsonb(old)-'status'-'void_reason') or old.status<>'posted' or new.status<>'void' or length(trim(coalesce(new.void_reason,'')))<3 then
   raise exception 'Catatan tidak dapat ditimpa; batalkan dengan alasan lalu catat pengganti'; end if;
  if exists(select 1 from public.farm_entries where (parent_id=new.id or advance_id=new.id) and status='posted') then raise exception 'Batalkan transaksi terkait terlebih dahulu'; end if;
  return new;
 end if;
 if new.status<>'posted' or new.created_by is distinct from auth.uid() then raise exception 'Identitas pencatat tidak valid'; end if;
 if new.kind in ('advance','advance_return','advance_apply','capital','withdrawal','loan_in','loan_out','transfer','opening','settlement') and r not in ('owner','manager','finance') then raise exception 'Transaksi ini memerlukan akses keuangan'; end if;
 if new.cycle_id is not null and new.kind not in ('settlement','advance_apply','advance_return') and not exists(select 1 from public.farm_cycles where id=new.cycle_id and (status='active' or new.entry_date<=end_date)) then raise exception 'Budidaya sudah ditutup'; end if;
 if new.quantity::text in ('NaN','Infinity','-Infinity') or new.amount::text in ('NaN','Infinity','-Infinity') then raise exception 'Nilai harus berhingga'; end if;
 if new.kind='labor' then
  if jsonb_typeof(new.details->'lines') is distinct from 'array' or jsonb_array_length(new.details->'lines') not between 1 and 50 then raise exception 'Isi 1–50 baris pekerja'; end if;
  for l in select value from jsonb_array_elements(new.details->'lines') loop
   if coalesce(l->>'job','')='' or coalesce((l->>'people')::numeric,0)<=0 or (l->>'people')::numeric<>trunc((l->>'people')::numeric)
    or coalesce((l->>'rate')::numeric,-1)<0 or coalesce((l->>'units')::numeric,0)<=0 then raise exception 'Jumlah, satuan kerja, dan tarif tidak valid'; end if;
   if coalesce((l->>'overtime_people')::numeric,0)<>trunc(coalesce((l->>'overtime_people')::numeric,0)) or coalesce((l->>'overtime_people')::numeric,0)<0 or coalesce((l->>'overtime_people')::numeric,0)>(l->>'people')::numeric
    or coalesce((l->>'overtime_hours')::numeric,0)<0 or coalesce((l->>'overtime_rate')::numeric,0)<0 then raise exception 'Lembur tidak valid'; end if;
   assignments:=assignments+(l->>'people')::numeric;
   base:=base+(l->>'people')::numeric*(l->>'rate')::numeric*(l->>'units')::numeric;
   overtime:=overtime+coalesce((l->>'overtime_people')::numeric,0)*coalesce((l->>'overtime_hours')::numeric,0)*coalesce((l->>'overtime_rate')::numeric,0);
  end loop;
  new.amount:=round(base+overtime,2); new.details:=new.details||jsonb_build_object('base',base,'overtime',overtime,'assignments',assignments);
 end if;
 if new.kind in ('sale','harvest','stock_in','stock_use') and (new.quantity is null or new.quantity<=0 or new.unit='') then raise exception 'Jumlah dan satuan wajib diisi'; end if;
 if new.kind='shipping' and new.details->>'payer'='pembeli' then new.details:=new.details||jsonb_build_object('third_party_cost',new.amount);new.amount:=0; end if;
 if new.kind='sale' then
  n:=(new.details->>'unit_price')::numeric;
  if n is null or n<0 or coalesce((new.details->>'discount')::numeric,0)<0 then raise exception 'Harga/potongan tidak valid'; end if;
  new.amount:=round(new.quantity*n-coalesce((new.details->>'discount')::numeric,0),2);
 end if;
 if new.kind in ('harvest','activity','condition','stock_use') then new.amount:=0; end if;
 if new.kind in ('income','capital','withdrawal','loan_in','loan_out','advance','advance_return','settlement','transfer','opening') and new.account_id is null then raise exception 'Pilih kas atau rekening'; end if;
 if new.kind='transfer' and (new.to_account_id is null or new.to_account_id=new.account_id) then raise exception 'Pilih rekening tujuan berbeda'; end if;
 if new.kind<>'transfer' and new.to_account_id is not null then raise exception 'Rekening tujuan hanya untuk transfer'; end if;
 if new.kind='advance' and (new.party_id is null or coalesce(new.details->>'advance_type','') not in ('wage','employee_loan','operational')) then raise exception 'Pilih penerima dan jenis uang muka'; end if;
 if new.kind in ('settlement','advance_return','advance_apply','stock_use') then
  perform pg_advisory_xact_lock(hashtextextended('entry:'||new.parent_id::text,0));
  select * into p from public.farm_entries where id=new.parent_id and organization_id=new.organization_id;
  if not found or p.status<>'posted' then raise exception 'Catatan sumber tidak tersedia'; end if;
  if new.entry_date<p.entry_date then raise exception 'Tanggal mendahului catatan sumber'; end if;
  select coalesce(sum(amount),0) into paid from public.farm_entries where parent_id=p.id and status='posted' and kind in ('settlement','advance_apply','advance_return');
  if new.kind='settlement' then
   if p.kind not in ('expense','labor','shipping','sale','stock_in','asset','maintenance','lease') or new.amount<=0 or paid+new.amount>p.amount then raise exception 'Pembayaran melebihi tagihan atau sumber tidak valid'; end if;
  elsif new.kind='advance_return' then
   select coalesce(sum(amount),0) into used from public.farm_entries where advance_id=p.id and status='posted';
   if p.kind<>'advance' or new.amount<=0 or paid+used+new.amount>p.amount then raise exception 'Pengembalian melebihi saldo uang muka'; end if;
  elsif new.kind='advance_apply' then
   perform pg_advisory_xact_lock(hashtextextended('entry:'||new.advance_id::text,0));
   select * into a from public.farm_entries where id=new.advance_id and organization_id=new.organization_id;
   if not found or a.kind<>'advance' or a.status<>'posted' or a.party_id is distinct from p.party_id then raise exception 'Penerima uang muka harus sesuai tagihan'; end if;
   if (a.details->>'advance_type'='wage' and p.kind<>'labor') or (a.details->>'advance_type'='employee_loan') or p.kind not in ('expense','labor','shipping','stock_in','maintenance','lease') then raise exception 'Jenis uang muka tidak sesuai penggunaan'; end if;
   select coalesce(sum(amount),0) into used from public.farm_entries where status='posted' and (advance_id=a.id or (parent_id=a.id and kind='advance_return'));
   if new.amount<=0 or used+new.amount>a.amount or paid+new.amount>p.amount then raise exception 'Melebihi saldo uang muka atau tagihan'; end if;
  else
   if p.kind<>'stock_in' or new.unit<>p.unit then raise exception 'Pilih stok masuk dengan satuan sama'; end if;
   select coalesce(sum(quantity),0) into used from public.farm_entries where parent_id=p.id and kind='stock_use' and status='posted';
   if used+new.quantity>p.quantity then raise exception 'Pemakaian melebihi stok'; end if;
  end if;
 elsif new.parent_id is not null then
  perform pg_advisory_xact_lock(hashtextextended('entry:'||new.parent_id::text,0));
  select * into p from public.farm_entries where id=new.parent_id and organization_id=new.organization_id;
  if not found or p.status<>'posted' then raise exception 'Referensi tidak tersedia'; end if;
  if new.entry_date<p.entry_date then raise exception 'Tanggal mendahului referensi'; end if;
  if new.kind='sale' then
   if p.kind<>'harvest' or p.unit<>new.unit or p.cycle_id is distinct from new.cycle_id then raise exception 'Panen/satuan/budidaya tidak sesuai'; end if;
   select coalesce(sum(quantity),0) into used from public.farm_entries where parent_id=p.id and kind='sale' and status='posted';
   if used+new.quantity>p.quantity then raise exception 'Penjualan melebihi panen'; end if;
  elsif new.kind='shipping' and p.kind<>'sale' then raise exception 'Pengiriman harus terkait penjualan';
  elsif new.kind='maintenance' and p.kind<>'asset' then raise exception 'Perawatan harus terkait aset';
  elsif new.kind not in ('sale','shipping','maintenance','activity','condition') then raise exception 'Referensi tidak didukung'; end if;
 end if;
 if new.advance_id is not null and new.kind<>'advance_apply' then raise exception 'Referensi uang muka tidak sesuai'; end if;
 if new.amount<0 or new.amount>99999999999999 or new.amount::text='NaN' or new.quantity::text='NaN' then raise exception 'Nilai di luar batas'; end if;
 return new;
end $$;
create trigger validate_entry before insert or update on public.farm_entries for each row execute function farm_private.validate_entry();

-- Idempotent, atomic batch; RLS and triggers apply to every row.
create function public.farm_save_entries(rows jsonb) returns jsonb language plpgsql security invoker set search_path='' as $$
declare row jsonb; saved public.farm_entries; existing public.farm_entries; result jsonb:='[]'; org uuid; begin
 if auth.uid() is null then raise exception 'Silakan masuk'; end if;
 if jsonb_typeof(rows) is distinct from 'array' or jsonb_array_length(rows) not between 1 and 100 then raise exception 'Transaksi tidak valid'; end if;
 for row in select value from jsonb_array_elements(rows) loop
  org:=(row->>'organization_id')::uuid;
  perform pg_advisory_xact_lock(hashtextextended(org::text||':'||(row->>'id'),0));
  select * into existing from public.farm_entries where id=(row->>'id')::uuid;
  if found then
   if existing.organization_id<>org or existing.created_by<>auth.uid() then raise exception 'Identitas transaksi sudah digunakan'; end if;
   if existing.details->'_request' is distinct from row then raise exception 'Isi percobaan ulang berbeda. Muat catatan sebelum mengubahnya'; end if;
   result:=result||jsonb_build_array(to_jsonb(existing)); continue;
  end if;
  insert into public.farm_entries(id,organization_id,kind,entry_date,title,cycle_id,party_id,account_id,to_account_id,parent_id,advance_id,amount,quantity,unit,details)
  values((row->>'id')::uuid,org,row->>'kind',(row->>'entry_date')::date,row->>'title',nullif(row->>'cycle_id','')::uuid,
   nullif(row->>'party_id','')::uuid,nullif(row->>'account_id','')::uuid,nullif(row->>'to_account_id','')::uuid,
   nullif(row->>'parent_id','')::uuid,nullif(row->>'advance_id','')::uuid,coalesce((row->>'amount')::numeric,0),nullif(row->>'quantity','')::numeric,
   coalesce(row->>'unit',''),coalesce(row->'details','{}')||jsonb_build_object('_request',row)) returning * into saved;
  result:=result||jsonb_build_array(to_jsonb(saved));
 end loop;
 return result;
end $$;
revoke all on function public.farm_save_entries(jsonb) from public,anon;
grant execute on function public.farm_save_entries(jsonb) to authenticated;

-- Cash movement is independent of expense recognition. Advances never count twice.
create view public.farm_cash_movements with (security_invoker=true) as
 select e.id,e.organization_id,e.entry_date,e.account_id,
 case when e.kind in ('income','capital','loan_in','opening','advance_return') then e.amount
 when e.kind='settlement' and p.kind='sale' then e.amount else -e.amount end as amount
 from public.farm_entries e left join public.farm_entries p on p.id=e.parent_id
 where e.status='posted' and e.kind in ('income','capital','loan_in','opening','advance_return','withdrawal','loan_out','advance','settlement','transfer')
 union all select id,organization_id,entry_date,to_account_id,amount from public.farm_entries where status='posted' and kind='transfer';
grant select on public.farm_cash_movements to authenticated;
revoke all on public.farm_cash_movements from anon;
create function public.farm_report(org uuid, date_from date default '1900-01-01', date_to date default '9999-12-31') returns jsonb language sql security invoker set search_path='' as $$
 select jsonb_build_object(
 'cash',coalesce((select jsonb_agg(x) from (select a.id,a.name,coalesce(sum(m.amount),0) balance from public.farm_accounts a left join public.farm_cash_movements m on m.account_id=a.id and m.entry_date<=date_to where a.organization_id=org group by a.id,a.name) x),'[]'),
 'cash_in',coalesce((select sum(amount) from public.farm_cash_movements where organization_id=org and entry_date between date_from and date_to and amount>0 and id not in(select id from public.farm_entries where kind='transfer')),0),
 'cash_out',coalesce((select -sum(amount) from public.farm_cash_movements where organization_id=org and entry_date between date_from and date_to and amount<0 and id not in(select id from public.farm_entries where kind='transfer')),0),
 'by_kind',coalesce((select jsonb_agg(x) from (select kind,count(*) count,sum(amount) amount from public.farm_entries where organization_id=org and status='posted' and entry_date between date_from and date_to group by kind) x),'[]'),
 'harvests',coalesce((select jsonb_agg(x) from(select cycle_id,unit,sum(quantity) quantity from public.farm_entries where organization_id=org and kind='harvest' and status='posted' and entry_date between date_from and date_to group by cycle_id,unit) x),'[]'),
 'outstanding',coalesce((select jsonb_agg(x) from(select e.id,e.kind,e.title,e.party_id,e.entry_date,e.amount-coalesce((select sum(c.amount) from public.farm_entries c where c.status='posted' and c.entry_date<=date_to and (c.parent_id=e.id and c.kind in('settlement','advance_apply','advance_return') or c.advance_id=e.id)),0) remaining from public.farm_entries e where e.organization_id=org and e.status='posted' and e.entry_date<=date_to and e.kind in('expense','labor','shipping','sale','stock_in','asset','maintenance','lease','advance')) x where x.remaining>0),'[]'))
$$;
revoke all on function public.farm_report(uuid,date,date) from public,anon;
grant execute on function public.farm_report(uuid,date,date) to authenticated;

-- Owner workspaces from actual existing owners; no guessed account identifiers.
insert into public.farm_organizations(owner_id,name) select distinct user_id,'Usaha Saya' from public.farm_projects;
insert into public.farm_accounts(organization_id,name) select id,'Kas tunai' from public.farm_organizations;
insert into public.farm_cycles(organization_id,name,commodity,legacy_project_id,notes)
 select o.id,p.name,p.crop,p.id,'Impor anggaran lama. Hubungkan lahan dan konfirmasi satuan sebelum menghitung produktivitas.'
 from public.farm_projects p join public.farm_organizations o on o.owner_id=p.user_id;
create index if not exists farm_projects_user_idx on public.farm_projects(user_id);
create index if not exists budget_items_user_idx on public.budget_items(user_id);
create index if not exists expenses_user_idx on public.expenses(user_id);
create index if not exists expenses_budget_ref_idx on public.expenses(budget_item_id);

create function public.farm_create_organization(org_name text,request_id uuid) returns uuid language plpgsql security invoker set search_path='' as $$
declare existing public.farm_organizations; begin
 if auth.uid() is null then raise exception 'Silakan masuk'; end if;
 perform pg_advisory_xact_lock(hashtextextended(request_id::text,0));
 select * into existing from public.farm_organizations where id=request_id;
 if found then
  if existing.owner_id<>auth.uid() or existing.name<>org_name then raise exception 'Identitas usaha sudah digunakan'; end if;
  return existing.id;
 end if;
 insert into public.farm_organizations(id,owner_id,name) values(request_id,auth.uid(),org_name);
 insert into public.farm_accounts(organization_id,name) values(request_id,'Kas tunai');
 return request_id;
end $$;
revoke all on function public.farm_create_organization(text,uuid) from public,anon;
grant execute on function public.farm_create_organization(text,uuid) to authenticated;

-- Immutable tenancy, dates and reference identities even through direct Data API calls.
create function farm_private.guard_entity() returns trigger language plpgsql set search_path='' as $$
begin
 if new.id<>old.id or new.organization_id<>old.organization_id then raise exception 'Identitas dan usaha tidak boleh diganti'; end if;
 if tg_table_name='farm_cycles' then
  if (to_jsonb(new)-'status'-'end_date'-'notes')<>(to_jsonb(old)-'status'-'end_date'-'notes') and not (old.block_id is null and old.legacy_project_id is not null and new.legacy_project_id=old.legacy_project_id and new.name=old.name and new.commodity=old.commodity and not exists(select 1 from public.farm_entries where cycle_id=old.id)) then raise exception 'Identitas budidaya bersejarah tidak dapat ditimpa'; end if;
  if old.status='closed' then raise exception 'Budidaya sudah ditutup'; end if;
  if new.status='closed' and new.end_date is null then raise exception 'Tanggal selesai wajib diisi'; end if;
  if exists(select 1 from public.farm_entries where cycle_id=new.id and status='posted' and entry_date>new.end_date) then raise exception 'Tanggal selesai mendahului catatan operasional'; end if;
 end if;
 return new;
end $$;
do $$ declare t text; begin
 foreach t in array array['farm_lands','farm_blocks','farm_cycles','farm_accounts','farm_parties'] loop
 execute format('create trigger guard_entity before update on public.%I for each row execute function farm_private.guard_entity()',t);
 end loop;
end $$;

create function public.farm_save_budget(project uuid,changes jsonb) returns void language plpgsql security invoker set search_path='' as $$
declare x jsonb; begin
 perform 1 from public.farm_projects where id=project for update;
 if not found then raise exception 'Proyek tidak tersedia'; end if;
 if jsonb_typeof(changes) is distinct from 'array' or jsonb_array_length(changes)>1000 then raise exception 'Perubahan tidak valid'; end if;
 for x in select value from jsonb_array_elements(changes) loop
 update public.budget_items set name=x->>'name',category=x->>'category',quantity=(x->>'quantity')::numeric,unit=x->>'unit',unit_price=(x->>'unit_price')::numeric where id=(x->>'id')::uuid and project_id=project;
 if not found then raise exception 'Rincian tidak tersedia'; end if;
 end loop;
end $$;
revoke all on function public.farm_save_budget(uuid,jsonb) from public,anon;
grant execute on function public.farm_save_budget(uuid,jsonb) to authenticated;

create table public.farm_receipt_requests(id uuid primary key,user_id uuid not null default auth.uid() references auth.users(id),payload jsonb not null);
alter table public.farm_receipt_requests enable row level security;
create policy own_receipt_requests on public.farm_receipt_requests for all to authenticated using(user_id=(select auth.uid())) with check(user_id=(select auth.uid()));
revoke all on public.farm_receipt_requests from anon,authenticated;
grant select,insert on public.farm_receipt_requests to authenticated;
create index farm_receipt_requests_user on public.farm_receipt_requests(user_id);
create function public.farm_save_receipt(receipt_id uuid,items jsonb) returns jsonb language plpgsql security invoker set search_path='' as $$
declare x jsonb; result jsonb; begin
 if auth.uid() is null or jsonb_typeof(items) is distinct from 'array' or jsonb_array_length(items) not between 1 and 50 then raise exception 'Bon tidak valid'; end if;
 perform pg_advisory_xact_lock(hashtextextended(receipt_id::text,0));
 select jsonb_agg(jsonb_build_object('id',id)) into result from public.expenses where receipt_group=receipt_id;
 if result is not null then
 if not exists(select 1 from public.farm_receipt_requests where id=receipt_id and payload=items) then raise exception 'Percobaan ulang berbeda. Periksa bon yang sudah tersimpan'; end if;
 return result; end if;
 insert into public.farm_receipt_requests(id,payload) values(receipt_id,items);
 for x in select value from jsonb_array_elements(items) loop
 if x->>'receipt_group'<>receipt_id::text then raise exception 'Identitas bon berbeda'; end if;
 if nullif(x->>'budget_item_id','') is not null and not exists(select 1 from public.budget_items where id=(x->>'budget_item_id')::uuid and project_id=(x->>'project_id')::uuid) then raise exception 'Referensi anggaran berbeda'; end if;
 insert into public.expenses(project_id,expense_date,description,quantity,unit,unit_price,amount,line_position,budget_item_id,receipt_group,receipt_number,vendor,note)
 values((x->>'project_id')::uuid,(x->>'expense_date')::date,x->>'description',(x->>'quantity')::numeric,x->>'unit',(x->>'unit_price')::numeric,
 round((x->>'quantity')::numeric*(x->>'unit_price')::numeric,2),(x->>'line_position')::int,nullif(x->>'budget_item_id','')::uuid,receipt_id,x->>'receipt_number',x->>'vendor',x->>'note');
 end loop;
 select jsonb_agg(jsonb_build_object('id',id)) into result from public.expenses where receipt_group=receipt_id;
 return result;
end $$;
revoke all on function public.farm_save_receipt(uuid,jsonb) from public,anon;
grant execute on function public.farm_save_receipt(uuid,jsonb) to authenticated;

create or replace function public.duplicate_farm_project(source_project_id uuid,new_name text) returns uuid language plpgsql security invoker set search_path='' as $$
declare new_id uuid; begin
 if auth.uid() is null or length(trim(new_name)) not between 1 and 160 then raise exception 'Nama proyek tidak valid'; end if;
 insert into public.farm_projects(user_id,name,crop,area_tumbak) select auth.uid(),trim(new_name),crop,area_tumbak from public.farm_projects where id=source_project_id and user_id=auth.uid() returning id into new_id;
 if new_id is null then raise exception 'Proyek tidak ditemukan'; end if;
 insert into public.budget_items(project_id,user_id,name,category,quantity,unit,unit_price) select new_id,auth.uid(),name,category,quantity,unit,unit_price from public.budget_items where project_id=source_project_id;
 return new_id;
end $$;
revoke all on function public.duplicate_farm_project(uuid,text) from public,anon;
grant execute on function public.duplicate_farm_project(uuid,text) to authenticated;

create function public.farm_analysis(org uuid,date_from date default '1900-01-01',date_to date default '9999-12-31') returns jsonb language sql security invoker set search_path='' as $$
 with e as (select * from public.farm_entries where organization_id=org and status='posted'),
 costs as (select cycle_id,amount cost from e where kind in('expense','labor','shipping','maintenance','lease') and entry_date between date_from and date_to
 union all select x.cycle_id,round(x.quantity*p.amount/nullif(p.quantity,0),2) from e x join e p on p.id=x.parent_id where x.kind='stock_use' and x.entry_date between date_from and date_to)
 select jsonb_build_object(
 'cycles',coalesce((select jsonb_agg(x) from(select c.id,c.name,c.commodity,c.area_m2,
 coalesce((select sum(cost) from costs where cycle_id=c.id),0) costs,
 coalesce((select sum(amount) from e where cycle_id=c.id and kind='sale' and entry_date between date_from and date_to),0) sales,
 coalesce((select sum(quantity) from e where cycle_id=c.id and kind='harvest' and unit='kg' and entry_date between date_from and date_to),0) harvest_kg
 from public.farm_cycles c where c.organization_id=org) x),'[]'),
 'inventory',coalesce((select jsonb_agg(x) from(select p.id,p.title,p.unit,p.quantity-coalesce((select sum(quantity) from e where kind='stock_use' and parent_id=p.id and entry_date<=date_to),0) remaining from e p where p.kind='stock_in' and p.entry_date<=date_to) x),'[]'),
 'labor',coalesce((select jsonb_agg(x) from(select l->>'job' job,l->>'basis' basis,sum((l->>'people')::numeric) assignments,
 sum((l->>'people')::numeric*(l->>'units')::numeric*(l->>'rate')::numeric) base,
 sum(coalesce((l->>'overtime_people')::numeric,0)*coalesce((l->>'overtime_hours')::numeric,0)*coalesce((l->>'overtime_rate')::numeric,0)) overtime
 from e cross join lateral jsonb_array_elements(e.details->'lines') l where e.kind='labor' and e.entry_date between date_from and date_to group by l->>'job',l->>'basis') x),'[]'),
 'daily',coalesce((select jsonb_agg(x order by x.entry_date) from(select entry_date,sum(case when amount>0 then amount else 0 end) incoming,sum(case when amount<0 then -amount else 0 end) outgoing
 from public.farm_cash_movements where organization_id=org and entry_date between date_from and date_to and id not in(select id from e where kind='transfer') group by entry_date) x),'[]'))
$$;
revoke all on function public.farm_analysis(uuid,date,date) from public,anon;
grant execute on function public.farm_analysis(uuid,date,date) to authenticated;

create function public.farm_budget_summary() returns jsonb language sql security invoker set search_path='' as $$
 select coalesce(jsonb_agg(x),'[]') from(select p.id,p.name,p.area_tumbak,
 coalesce((select sum(quantity*unit_price) from public.budget_items b where b.project_id=p.id),0) budget,
 coalesce((select sum(amount) from public.expenses e where e.project_id=p.id),0) spent
 from public.farm_projects p) x
$$;
revoke all on function public.farm_budget_summary() from public,anon;
grant execute on function public.farm_budget_summary() to authenticated;

alter table public.farm_lands add constraint finite_land check(original_area::text not in ('NaN','Infinity','-Infinity') and conversion_m2::text not in ('NaN','Infinity','-Infinity'));
alter table public.farm_blocks add constraint finite_block check(area_m2::text not in ('NaN','Infinity','-Infinity'));
alter table public.farm_cycles add constraint finite_cycle check(area_m2::text not in ('NaN','Infinity','-Infinity'));
