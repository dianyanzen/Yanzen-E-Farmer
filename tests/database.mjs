process.on("uncaughtException", (e) => {
  console.error(e.message, e.where || "");
  process.exit(1);
});
import { PGlite } from "@electric-sql/pglite";
import { readFile } from "node:fs/promises";
import assert from "node:assert/strict";
const db = new PGlite();
await db.exec(
  `create role anon; create role authenticated; create schema auth; create table auth.users(id uuid primary key); create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$; grant usage on schema auth to authenticated; grant execute on function auth.uid() to authenticated; insert into auth.users values('10000000-0000-0000-0000-000000000001'),('10000000-0000-0000-0000-000000000002');`,
);
await db.exec(
  (
    await readFile("supabase/migrations/202610240001_initial.sql", "utf8")
  ).replace("create extension if not exists pgcrypto;", ""),
);
await db.exec(
  await readFile("supabase/migrations/202610240002_receipts.sql", "utf8"),
);
await db.exec(await readFile("database/farm-operations.sql", "utf8"));
console.log("Schema compiled");
await db.exec(
  `set role authenticated; set request.jwt.claim.sub='10000000-0000-0000-0000-000000000001';`,
);
const one = async (q, args = []) => (await db.query(q, args)).rows[0];
const org = (
  await one(
    "insert into farm_organizations(owner_id,name) values(auth.uid(),'Test') returning id",
  )
).id;
const account = (
  await one(
    "insert into farm_accounts(organization_id,name) values($1,'Kas') returning id",
    [org],
  )
).id;
const party = (
  await one(
    "insert into farm_parties(organization_id,name) values($1,'Tim petik') returning id",
    [org],
  )
).id;
const land = (
  await one(
    "insert into farm_lands(organization_id,name,original_area,original_unit,conversion_m2) values($1,'Lahan',1,'ha',10000) returning id",
    [org],
  )
).id;
const block = (
  await one(
    "insert into farm_blocks(organization_id,land_id,name,area_m2,active_from) values($1,$2,'A',10000,'2026-01-01') returning id",
    [org, land],
  )
).id;
await assert.rejects(
  one(
    "insert into farm_blocks(organization_id,land_id,name,area_m2,active_from) values($1,$2,'B',1,'2026-01-01')",
    [org, land],
  ),
  /melebihi/,
);
const cycle = (
  await one(
    "insert into farm_cycles(organization_id,block_id,name,commodity,start_date,area_m2) values($1,$2,'Timun','Timun','2026-10-01',10000) returning id",
    [org, block],
  )
).id;
await assert.rejects(
  one(
    "insert into farm_cycles(organization_id,block_id,name,commodity,start_date,area_m2) values($1,$2,'Padi','Padi','2026-10-02',1000)",
    [org, block],
  ),
  /bertumpang/,
);
const save = async (row) =>
  (
    await one("select farm_save_entries($1::jsonb) result", [
      JSON.stringify([row]),
    ])
  ).result[0];
const base = {
  organization_id: org,
  entry_date: "2026-10-24",
  cycle_id: cycle,
  party_id: party,
};
const labor = {
  ...base,
  id: crypto.randomUUID(),
  kind: "labor",
  title: "Petik",
  details: {
    lines: [
      {
        job: "Petik",
        people: 30,
        units: 1,
        rate: 70000,
        overtime_people: 10,
        overtime_hours: 2,
        overtime_rate: 15000,
      },
    ],
  },
};
assert.equal(Number((await save(labor)).amount), 2400000);
assert.equal(Number((await save(labor)).amount), 2400000);
await assert.rejects(save({ ...labor, title: "different" }), /berbeda/);
const adv = await save({
  ...base,
  id: crypto.randomUUID(),
  kind: "advance",
  title: "Uang muka",
  amount: 300000,
  account_id: account,
  details: { advance_type: "wage" },
});
await save({
  ...base,
  id: crypto.randomUUID(),
  kind: "advance_apply",
  title: "Potong uang muka",
  amount: 300000,
  parent_id: labor.id,
  advance_id: adv.id,
});
await save({
  ...base,
  id: crypto.randomUUID(),
  kind: "settlement",
  title: "Pelunasan",
  amount: 2100000,
  parent_id: labor.id,
  account_id: account,
});
await assert.rejects(
  save({
    ...base,
    id: crypto.randomUUID(),
    kind: "settlement",
    title: "Berlebih",
    amount: 1,
    parent_id: labor.id,
    account_id: account,
  }),
  /melebihi/,
);
const report = (await one("select farm_report($1) result", [org])).result;
assert.equal(Number(report.cash[0].balance), -2400000);
assert.equal(report.outstanding.length, 0);
const harvest = await save({
  ...base,
  id: crypto.randomUUID(),
  kind: "harvest",
  title: "Panen",
  quantity: 100,
  unit: "kg",
});
await save({
  ...base,
  id: crypto.randomUUID(),
  kind: "sale",
  title: "Jual",
  quantity: 60,
  unit: "kg",
  parent_id: harvest.id,
  details: { unit_price: 5000 },
});
await assert.rejects(
  save({
    ...base,
    id: crypto.randomUUID(),
    kind: "sale",
    title: "Jual lebih",
    quantity: 50,
    unit: "kg",
    parent_id: harvest.id,
    details: { unit_price: 5000 },
  }),
  /melebihi/,
);

// Failed multi-row save rolls back the entire batch.
const atomicId = crypto.randomUUID();
await assert.rejects(
  one("select farm_save_entries($1::jsonb)", [
    JSON.stringify([
      { ...base, id: atomicId, kind: "expense", title: "Atomic", amount: 100 },
      {
        ...base,
        id: crypto.randomUUID(),
        kind: "settlement",
        title: "Invalid",
        amount: 101,
        parent_id: atomicId,
        account_id: account,
      },
    ]),
  ]),
  /melebihi/,
);
assert.equal(
  (await db.query("select id from farm_entries where id=$1", [atomicId])).rows
    .length,
  0,
);
// Preserve immutable history; a settled cost cannot be voided before its children.
await assert.rejects(
  one("update farm_entries set amount=1 where id=$1", [labor.id]),
  /ditimpa/,
);
await assert.rejects(
  one(
    "update farm_entries set status='void',void_reason='Koreksi' where id=$1",
    [labor.id],
  ),
  /terkait/,
);
// Repartition a physical land after all cycles end, retaining the old block.
await one(
  "update farm_cycles set status='closed',end_date='2026-10-31' where id=$1",
  [cycle],
);
await one("update farm_blocks set active_to='2026-10-31' where id=$1", [block]);
await one(
  "insert into farm_blocks(organization_id,land_id,name,area_m2,active_from) values($1,$2,'Pembagian baru',10000,'2026-11-01')",
  [org, land],
);
// Complete aggregation above API page limits and atomic budget saves.
const project = (
  await one(
    "insert into farm_projects(user_id,name,crop,area_tumbak) values(auth.uid(),'Budget','Timun',1150) returning id",
  )
).id;
await db.query(
  "insert into budget_items(project_id,user_id,name,category,quantity,unit,unit_price) select $1,auth.uid(),'Item','Uji',1,'unit',100 from generate_series(1,1005)",
  [project],
);
const budgets = (await one("select farm_budget_summary() result")).result;
assert.equal(Number(budgets[0].budget), 100500);
const item = (await one("select id from budget_items limit 1")).id;
await assert.rejects(
  one("select farm_save_budget($1,$2::jsonb)", [
    project,
    JSON.stringify([
      {
        id: item,
        name: "Changed",
        category: "Uji",
        quantity: 1,
        unit: "unit",
        unit_price: 200,
      },
      {
        id: crypto.randomUUID(),
        name: "Missing",
        category: "Uji",
        quantity: 1,
        unit: "unit",
        unit_price: 1,
      },
    ]),
  ]),
  /tidak tersedia/,
);
assert.equal(
  Number(
    (await one("select unit_price from budget_items where id=$1", [item]))
      .unit_price,
  ),
  100,
);
// Inventory cannot be consumed twice beyond remaining stock.
const stock = await save({
  organization_id: org,
  id: crypto.randomUUID(),
  entry_date: "2026-11-01",
  kind: "stock_in",
  title: "Pupuk",
  quantity: 10,
  unit: "kg",
  amount: 100000,
});
await save({
  organization_id: org,
  id: crypto.randomUUID(),
  entry_date: "2026-11-01",
  kind: "stock_use",
  title: "Pakai",
  quantity: 6,
  unit: "kg",
  parent_id: stock.id,
});
await assert.rejects(
  save({
    organization_id: org,
    id: crypto.randomUUID(),
    entry_date: "2026-11-01",
    kind: "stock_use",
    title: "Pakai lebih",
    quantity: 5,
    unit: "kg",
    parent_id: stock.id,
  }),
  /melebihi stok/,
);
// Reader cannot write or escalate their own membership.
await one(
  "insert into farm_members(organization_id,user_id,role) values($1,'10000000-0000-0000-0000-000000000002','reader')",
  [org],
);
await db.exec(
  "set request.jwt.claim.sub='10000000-0000-0000-0000-000000000002'",
);
await assert.rejects(
  save({
    organization_id: org,
    id: crypto.randomUUID(),
    entry_date: "2026-11-01",
    kind: "expense",
    title: "Reader write",
    amount: 1,
  }),
  /row-level security/,
);
assert.equal(
  (
    await db.query(
      "update farm_members set role='owner' where organization_id=$1 returning *",
      [org],
    )
  ).rows.length,
  0,
);
await db.exec(
  "set request.jwt.claim.sub='10000000-0000-0000-0000-000000000001'",
);
await one("delete from farm_members where organization_id=$1", [org]);
// A recorder can create a child record without UPDATE permission on its source.
await one(
  "insert into farm_members(organization_id,user_id,role) values($1,'10000000-0000-0000-0000-000000000002','recorder')",
  [org],
);
await db.exec(
  "set request.jwt.claim.sub='10000000-0000-0000-0000-000000000002'",
);
await save({
  organization_id: org,
  id: crypto.randomUUID(),
  entry_date: "2026-11-01",
  kind: "stock_use",
  title: "Recorder use",
  quantity: 1,
  unit: "kg",
  parent_id: stock.id,
});
await db.exec(
  "set request.jwt.claim.sub='10000000-0000-0000-0000-000000000001'",
);
await one("delete from farm_members where organization_id=$1", [org]);
console.log(
  "PASS: atomic rollback, immutable history, repartition, 1005-row totals, atomic budgets, inventory, role escalation",
);
await db.exec(
  "set request.jwt.claim.sub='10000000-0000-0000-0000-000000000002'",
);
assert.equal((await db.query("select * from farm_entries")).rows.length, 0);
await assert.rejects(
  one("insert into farm_accounts(organization_id,name) values($1,'Intruder')", [
    org,
  ]),
  /row-level security/,
);
assert.equal(
  (await one("select farm_report($1) result", [org])).result.cash.length,
  0,
);
console.log(
  "PASS: isolation, area, overlap, labor/overtime, idempotency, advances, settlement, cash, harvest/sale constraints",
);
await db.close();
