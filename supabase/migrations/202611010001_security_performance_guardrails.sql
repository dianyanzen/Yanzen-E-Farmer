-- Security/performance guardrails, checked against production schema on 2026-11-01.
-- Keep member_read intact; replace the FOR ALL owner policy with write-only policies
-- so SELECT is evaluated by a single permissive policy.
drop policy if exists member_write on public.farm_members;
drop policy if exists member_insert on public.farm_members;
drop policy if exists member_update on public.farm_members;
drop policy if exists member_delete on public.farm_members;

create policy member_insert on public.farm_members
 for insert to authenticated
 with check (farm_private.role_for(organization_id) = 'owner');

create policy member_update on public.farm_members
 for update to authenticated
 using (farm_private.role_for(organization_id) = 'owner')
 with check (farm_private.role_for(organization_id) = 'owner');

create policy member_delete on public.farm_members
 for delete to authenticated
 using (farm_private.role_for(organization_id) = 'owner');

-- Composite FK indexes (the first column is the referencing ID; matches FK order).
-- Existing single-column indexes stay in place until query plans justify pruning.
create index if not exists farm_audit_org_fk_idx on public.farm_audit (organization_id);
create index if not exists farm_blocks_land_org_fk_idx on public.farm_blocks (land_id, organization_id);
create index if not exists farm_cycles_block_org_fk_idx on public.farm_cycles (block_id, organization_id);
create index if not exists farm_entries_account_org_fk_idx on public.farm_entries (account_id, organization_id);
create index if not exists farm_entries_advance_org_fk_idx on public.farm_entries (advance_id, organization_id);
create index if not exists farm_entries_cycle_org_fk_idx on public.farm_entries (cycle_id, organization_id);
create index if not exists farm_entries_parent_org_fk_idx on public.farm_entries (parent_id, organization_id);
create index if not exists farm_entries_party_org_fk_idx on public.farm_entries (party_id, organization_id);
create index if not exists farm_entries_to_account_org_fk_idx on public.farm_entries (to_account_id, organization_id);
