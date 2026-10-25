create function farm_private.storage_org(object_name text) returns uuid language sql immutable set search_path='' as $$
 select case when split_part(object_name,'/',1) ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then split_part(object_name,'/',1)::uuid else null end
$$;
revoke all on function farm_private.storage_org(text) from public,anon;
grant execute on function farm_private.storage_org(text) to authenticated;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('farm-evidence','farm-evidence',false,5242880,array['image/jpeg','image/png','image/webp']) on conflict(id) do nothing;
create policy farm_evidence_read on storage.objects for select to authenticated using(bucket_id='farm-evidence' and farm_private.role_for(farm_private.storage_org(name)) is not null);
create policy farm_evidence_insert on storage.objects for insert to authenticated with check(bucket_id='farm-evidence' and farm_private.role_for(farm_private.storage_org(name)) in ('owner','manager','recorder','finance'));
create policy farm_evidence_delete on storage.objects for delete to authenticated using(bucket_id='farm-evidence' and farm_private.role_for(farm_private.storage_org(name)) in ('owner','manager'));
