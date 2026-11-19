# Pasirluyu — Empat Timun dan Satu Nama

A complete first chapter on the existing Pasirluyu map, based on the supplied
Bandung story package. Built on the asset-library branch and its Stage 1 base.
This change does not release the game to production or open Cimincrang.

## Playthrough

1. Open YZ Phone → Pesan and accept Inggit's four-cucumber order.
2. Face farm plots, till, plant and water. Sleep and water across three growth
   days, then harvest four cucumbers.
3. Face Inggit at (19,7): four cucumbers consumed, 160 G paid exactly once.
4. Face Ryan at (13,8): compare the two canal marks.
5. Face Nani at (16,11): view the photo and learn the name Cimincrang.
6. Defer the choice, or entrust the original to Nani / leave a copy at the warung.
   Nani keeps the original in either case. The immutable choice and completion day
   are saved. Revisit Nani and Inggit for distinct follow-ups.
7. Continue farming and sell spare cucumbers. Travel remains locked.

The objective strip and phone journal show the current step. Native modal dialogs
contain keyboard focus, allow Escape to defer/dismiss, and scroll on small screens.

## Save compatibility and economy

The table envelope and `data.version` stay **1**. New fields are additive:
`photoSeen`, `photoChoice` (null/nani/warung), `completedDay`. `safeLoad` defaults
missing fields without changing old day, money, inventory, plots or story flags.
Old `sarisStory` alone does not imply the photo was seen. Completed legacy orders
are normalized as accepted without paying again. Malformed/unknown saves are
rejected and not overwritten. No database migration or production mutation needed.

Important transitions save immediately; movement retains debounced autosave.
Failed writes lock gameplay and stop queued writes. Retry saves the in-memory
state instead of reloading and losing it. Wait for **Tersimpan** before closing:
closing during an in-flight request can still lose an unconfirmed change.
Concurrent tabs/devices are not merged.

Harvest now adds inventory only. Delivery pays 160 G for four; voluntary sales
pay 25 G each. Four cucumbers are reserved during an accepted, pending order.
Existing balances are not recalculated during migration.

## Assets

Reuses A01/A03/C01/C08 runtime character atlas and cucumber tiles. The only added
illustration comes unchanged from the supplied Explore ZIP. Source and SHA-256:
`game-assets/catalog/pasirluyu-story.json`. Presented as fiction. No generated
assets needed. Full ZIP, SQLite, unused assets and private references are not loaded.

## Verification

- `npm run test:game`: actual four-cucumber loop, prerequisite gates, one-time
  reward, deferred and both immutable photo choices, legacy migration, invalid
  saves, explicit sales; local PostgreSQL-compatible JSONB roundtrips and RLS
  owner/other-account/anonymous tests using the existing migration.
- `npm run test:game:ui`: real React component with test-only cloud transport and
  Next adapters. Desktop keyboard planting-to-ending, reload/deferred choice,
  Enter activation, journal, failed-save retry, mobile touch alternate ending and
  viewport check. No auth bypass or fixture route ships in the application.
- Windows: set `FARM_TEST_CHROME` to installed Chrome/Edge. Linux: existing
  `tests/browser-path.mjs` provides Chromium; system browser libraries required.
  `FARM_GAME_UI_OUTPUT` selects the screenshot folder.
- TypeScript, lint, production build. Two unrelated pre-existing unused Link
  warnings remain outside this change.

Hosted authenticated playthrough is still a release gate: browser tests mock cloud
transport and do not prove hosted auth/network. Hosted ownership policies were
inspected read-only; no player saves were read or changed. Upstream PRs #14/#15
remain unmerged.

## Later stages

Tiled loader, coordinate conversion, portrait camera, travel, calendar/weather,
generic quest engine, NPC schedules, additional crops, other chapters and Selepas
Senja professions. This chapter keeps the current 24×16/20px world so existing crop
coordinates remain valid.
