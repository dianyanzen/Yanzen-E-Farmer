-- Add grouped, multi-item bon/struk metadata.
-- Existing one-row expenses remain valid and printable.
alter table public.expenses add column if not exists receipt_group uuid;
alter table public.expenses add column if not exists quantity numeric(14,3);
alter table public.expenses add column if not exists unit text;
alter table public.expenses add column if not exists unit_price numeric(16,2);
alter table public.expenses add column if not exists line_position integer;
create index if not exists expenses_receipt_group_idx on public.expenses(receipt_group) where receipt_group is not null;

do $$
begin
 if not exists (select 1 from pg_constraint where conname='expenses_receipt_quantity_check' and conrelid='public.expenses'::regclass)
 then alter table public.expenses add constraint expenses_receipt_quantity_check check(quantity is null or quantity>0); end if;
 if not exists (select 1 from pg_constraint where conname='expenses_receipt_unit_price_check' and conrelid='public.expenses'::regclass)
 then alter table public.expenses add constraint expenses_receipt_unit_price_check check(unit_price is null or unit_price>=0); end if;
 if not exists (select 1 from pg_constraint where conname='expenses_line_position_check' and conrelid='public.expenses'::regclass)
 then alter table public.expenses add constraint expenses_line_position_check check(line_position is null or (line_position>=1 and line_position<=50)); end if;
 if not exists (select 1 from pg_constraint where conname='expenses_line_total_check' and conrelid='public.expenses'::regclass)
 then alter table public.expenses add constraint expenses_line_total_check check(quantity is null or unit_price is null or abs(amount-round(quantity*unit_price,2)) < 0.01); end if;
end $$;