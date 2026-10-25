# Farm Operations V2 — implementation and rollout

## Implemented

- Mobile home, land, record, history and report screens; existing budget and receipt routes retained.
- Organizations and membership (owner, manager, recorder, finance, reader). Membership is organization-wide; add a registered user's account ID without sharing passwords.
- Lands with explicitly confirmed local-unit conversion; dated block allocations, closing/repartitioning, crop/fish/perennial/integrated cycles and shared use. Existing projects become unlocated cycles until the owner confirms the physical land and conversion.
- Immutable operational records with explicit void reasons and database audit trail.
- Cash accounts, opening balance, operating expense, income, capital, owner withdrawals, loans and internal transfers.
- Group labor: number of people × units × rate; optional subset overtime. Assignment counts are not unique employee counts. For a lump-sum group contract use one group unit; rates are user input, not statutory payroll certification.
- Wage/operational advances and employee loans; settlements, advance application and returns; cash separated from cost recognition.
- Repeat harvest, sales, partial payments, receivables, shipment cost, stock lots and consumption, asset purchases, maintenance and leases.
- Private photo evidence with signed access links (separate storage migration).
- Complete database aggregates for cash, unpaid balances, per-cycle costs/sales, inventory, daily flows and labor costs; complete legacy budget summary.
- Manual local device drafts scoped by user and organization; retry-safe atomic transaction submission.
- Rule-based data completeness reminders. No invented weather, yield forecasts, disease diagnosis or dosage recommendations.
- Atomic legacy budget editing and retry-safe multi-item receipts.

## Explicit limits — do not describe these as completed

- No generative AI or voice transcription, external weather/soil integration, validated agronomy knowledge base, or automated disease diagnosis.
- Map link uses supplied coordinates; no GIS polygon editor or automatic geospatial acreage calculation.
- Offline drafts require the app to have loaded; no service-worker offline installation, automatic background sync, or multi-device conflict resolver.
- Roles are organization-wide, not per-location assignments. Adding members uses registered user IDs, not email invitation delivery.
- No automated statutory payroll, benefits, tax, depreciation, profit-sharing settlement, or advanced multi-sale shipment allocation.
- Expenses in old tables remain separate from the new cash ledger; budgets are never assumed paid. Legacy access remains owner-based.
- Shipping paid directly by the buyer is retained as third-party cost with zero business cost. Multiple-sale freight allocation is not automatic.
- Each active exclusive cycle reserves its block. Divide a block for simultaneous exclusive subareas; shared cycles are explicit. Historical block sizes are immutable; close and repartition instead.
- Cost/kg applies only to recorded harvest in kg. Operational margin is provisional, excluding unallocated general costs, depreciation and missing records.
- API reference lists currently paginate all accessible rows; a dedicated asynchronous reference search is needed for very large installations.

## Production status

The production migration attempt was rejected by automatic approval review because the schema/data/RLS/function change set has a broad blast radius. No production schema changes were applied. Do not merge/deploy this branch against production until migration approval and validation are complete. This is not a production release.

## Verification

- `npm test`: isolated PostgreSQL-compatible PGlite with mocked auth roles. Covers schema, tenant isolation, reader escalation, labor/overtime, idempotency, overpayments, advances, cash balance, harvest oversell, inventory overuse, batch rollback, immutable history, dated repartition and aggregate totals above 1,000 rows.
- `npm run test:ui`: mobile Chromium UI with a mocked API. Covers group labor, overtime, atomic payment payload, unit conversion and draft restoration. This is not an authenticated production end-to-end test.
- `npm run typecheck`, `npm run lint`, `npm run build`.
- Production baseline before attempted migration: one project, 24 budget items, Rp74,262,000, zero actual expense rows.

## Release procedure

1. Review migrations and this limitation list. Obtain explicit production migration approval following the auto-review rejection, or validate on a separately authorized staging database first.
2. Take a provider-supported backup and verify restoration procedures before production changes; no backup has been claimed by this implementation.
3. Apply the operations migration followed by photo-evidence migration. Both are additive; keep legacy tables.
4. Check original project/item counts and budget total, organization/cycle mappings, RLS/advisors and authenticated transactions.
5. Deploy this exact tested commit to the existing Vercel project. Do not publish a preview against a database missing the migrations as a functional demo.
6. Smoke-test login, owner/member access, create/void a test transaction in a dedicated test organization, photo access, budget export and cash reports.
7. If the app release fails, roll back the Vercel deployment. Keep additive tables intact; never drop tables holding new records as a rollback shortcut.

SQL in `database/` is the reviewed source for migrations. Migration files generated by Supabase CLI contain the same SQL. Do not execute both copies.
