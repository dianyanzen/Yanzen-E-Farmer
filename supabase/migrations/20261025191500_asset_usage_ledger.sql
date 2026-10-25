-- Additional asset usage ledger. Additive, retains all existing rows and policies.
ALTER TABLE public.farm_entries DROP CONSTRAINT IF EXISTS farm_entries_kind_check;
ALTER TABLE public.farm_entries ADD CONSTRAINT farm_entries_kind_check CHECK (kind IN ('expense','income','capital','withdrawal','loan_in','loan_out','transfer','opening','labor','advance','settlement','advance_return','advance_apply','harvest','sale','shipping','activity','condition','stock_in','stock_use','asset','asset_use','maintenance','lease'));
create or replace function farm_private.validate_entry() returns trigger language plpgsql set search_path='' as $$
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
 if new.kind in ('harvest','activity','condition','stock_use','asset_use') then new.amount:=0; end if;
  if new.kind='asset_use' then
   if new.parent_id is null then raise exception 'Pilih aset yang digunakan'; end if;
   if nullif(trim(coalesce(new.details->>'operator','')),'') is null then raise exception 'Isi pemakai atau penanggung jawab aset'; end if;
   if coalesce((new.details->>'hours')::numeric,0)<=0 or (new.details->>'hours')::numeric>100000 then raise exception 'Durasi penggunaan tidak valid'; end if;
  end if;
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
   elsif new.kind='asset_use' and p.kind<>'asset' then raise exception 'Pemakaian harus terkait aset';
  elsif new.kind not in ('sale','shipping','maintenance','asset_use','activity','condition') then raise exception 'Referensi tidak didukung'; end if;
 end if;
 if new.advance_id is not null and new.kind<>'advance_apply' then raise exception 'Referensi uang muka tidak sesuai'; end if;
 if new.amount<0 or new.amount>99999999999999 or new.amount::text='NaN' or new.quantity::text='NaN' then raise exception 'Nilai di luar batas'; end if;
 return new;
end $$;

CREATE INDEX IF NOT EXISTS farm_entries_asset_usage_parent_idx ON public.farm_entries(parent_id,entry_date) WHERE kind='asset_use' AND status='posted';
