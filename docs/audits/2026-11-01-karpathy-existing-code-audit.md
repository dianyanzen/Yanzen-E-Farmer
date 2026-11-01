# Karpathy-inspired Existing Code Audit — 2026-11-01

## Scope and evidence
Read-only static audit of selected source files on `main`: `package.json`, `README.md`, `docs/OPERATIONS-V2.md`, `tsconfig.json`, `src/app/api/farm/route.ts`, `src/components/farm/workspace.tsx`, `src/lib/farm/model.ts`, `src/lib/supabase/{server,browser}.ts`, `src/proxy.ts`, `src/app/{layout,globals.css,brand-overrides.css,login/page.tsx,home/page.tsx,auth/signout/route.ts,manifest.ts}`, `src/components/{brand-logo,farm-account-bar,farm-bottom-nav}.tsx`, `tests/{database,ui}.mjs`, `database/farm-operations.sql`, and `supabase/migrations/202610240001_initial.sql`.

**Limitations:** This is a broad targeted static audit, **not** a full repository inventory, runtime penetration test, production smoke test, or a successful execution of lint/typecheck/build/tests. Live Supabase, Vercel and browser integrations were not tested. Findings below distinguish verified code properties from risk hypotheses.

## Findings and recommended action

### P1 — Production verification and recovery evidence
**Evidence:** `docs/OPERATIONS-V2.md` explicitly says no provider backup or authenticated customer-browser test is claimed. `README.md` similarly notes the E2E gap.
**Risk:** production regressions or restore failures may go undetected.
**Action:** document backup ownership, restoration drill, deployment commit, and authenticated staging smoke tests. Use a dedicated test organization; never mutate real transactions for testing.
**Acceptance:** dated restore verification and role-based E2E results attached to release checklist.

### P1 — Legacy versus V2 financial reporting semantics
**Evidence:** `docs/OPERATIONS-V2.md` explicitly states old `expenses` remain separate from the V2 cash ledger. `README.md` describes legacy budgets/expenses.
**Risk:** reporting omissions or double counting if figures are combined without explicit mapping.
**Action:** define revenue/cost/cashflow/provisional margin rules; write fixture-based reconciliation tests before implementing integration.
**Acceptance:** known legacy and V2 fixtures reconcile with no double count.

### P2 — Expensive reference fetching on every GET
**Evidence:** `src/app/api/farm/route.ts` uses an `all()` loop of 500-row pages for each entity table, then calls `all("farm_entries")` even when the history list itself is paginated at 50.
**Risk:** latency, excessive payload, and resource use as records grow.
**Action:** instrument timing/row counts; introduce targeted reference search or bounded server-side filtering while preserving the picker semantics.
**Acceptance:** verified behavior with 1k/10k reference records and no missing valid choices.

### P2 — Monolithic operational workspace
**Evidence:** `src/components/farm/workspace.tsx` is approximately 1,793 lines and combines fetching, draft state, forms, calculations, rendering and navigation.
**Risk:** regression-prone feature work and difficult isolated testing.
**Action:** extract one stable unit at a time (e.g., pure labor calculation and its tests), avoiding wholesale rewrite.
**Acceptance:** behavior parity and existing UI tests remain green.

### P2 — Draft storage privacy and lifecycle
**Evidence:** `workspace.tsx` stores draft values and payment metadata in browser `localStorage`, scoped by user and organization ID.
**Risk:** sensitive notes may remain on shared devices; stale drafts may be restored.
**Action:** add explicit clear-draft UX and retention guidance; verify logout/account-switch behavior and test malformed drafts.
**Acceptance:** documented retention, clear action and recovery tests.

### P2 — CSS cascade maintainability
**Evidence:** `src/app/layout.tsx` imports five stylesheets; `globals.css` contains repeated base selectors and successive additive overrides.
**Risk:** conflicting selectors and mobile visual regressions.
**Action:** use screenshot diffs at 360/390/430/768/1280px; consolidate only proven duplicates.
**Acceptance:** screenshots reviewed and no new overflow, brand regressions or inaccessible controls.

### P2 — Validate operational API failure boundaries
**Evidence:** `src/app/api/farm/route.ts` uses Zod and RLS-backed Supabase queries; `GET` returns generic 503 on failures, and POST catches parse errors.
**Risk:** clients cannot distinguish transient network failures from configuration or authorization errors; monitoring is limited.
**Action:** add structured server-side error categories without leaking secrets; verify no permission bypass and preserve user-friendly messages.
**Acceptance:** authenticated negative-path tests and actionable server telemetry.

### P3 — No real integration E2E evidence
**Evidence:** `tests/ui.mjs` runs Chromium against a mock API; `tests/database.mjs` uses PGlite with simulated auth roles.
**Risk:** environment-specific cookie/session/storage/deployment problems are not covered.
**Action:** add a small staging-only E2E suite for login/logout, permissions, finance, evidence access and export.
**Acceptance:** repeatable CI run against authorized staging.

## Positive controls observed
- `tsconfig.json` has `strict: true`.
- `package.json` exposes lint, typecheck, build, database tests and UI tests.
- Database tests assert tenant isolation, RLS, idempotency, atomic rollback, harvest oversell, stock overuse, advances and labor arithmetic.
- SQL enables RLS, uses scoped organization roles, and sets empty `search_path` on security-definer functions reviewed.
- Brand logo, favicon metadata and mobile navigation are explicitly implemented.

## Recommended sequence
1. **P1** Backup/recovery and authenticated staging smoke tests.
2. **P1** Financial reconciliation specification and regression fixtures.
3. **P2** API reference performance measurements and targeted optimization.
4. **P2** Extract pure workspace logic with tests; review drafts.
5. **P2/P3** UI screenshots, accessibility and staging E2E.

## Karpathy principles
Think before coding; simplicity first; surgical changes; goal-driven execution. No code or production schema was changed by this audit.
