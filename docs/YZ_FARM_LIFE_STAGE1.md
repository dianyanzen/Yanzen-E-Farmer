# YZ Farm Life — Stage 1 (Playable Vertical Slice)

**Status:** prototype branch `feat/yz-farm-life-stage1`. The game is an additive, authenticated `/game` route. Do **not** merge or deploy to production until QA is complete.

## Product vision
An original pixel-art urban-farming life simulation, inspired by the gameplay simplicity of Game Boy Advance farming games. It is not a clone of their code or assets. A small garden is embedded in a Bandung-inspired fictional city, Pasirluyu, Regol, Kota Bandung. The world is open-ended, with authored narrative branching, NPC memories, and a phone accessible inside the playfield like a diegetic game object.

## Stage 1 mechanics
- 480×320 pixel canvas, responsive nearest-neighbor scaling, no additional JavaScript dependencies.
- W/A/S/D or arrows to walk; E/Space interacts with the tile in front or an adjacent NPC; P opens/closes YZ Phone; Escape exits overlays.
- Mobile D-pad + action button + phone button.
- Farm tools: hoe → seed → water → sleep → grow over three watered nights → harvest. Harvest earns fictional G currency.
- Yanzen (A01) is the playable farmer. The first map uses three of the 31 catalog NPCs.
  - Ryan (A03) follows the old irrigation canal.
  - Nani (C01) remembers the neighborhood's history.
  - Inggit (C08) orders four cucumbers for her market stall.
- YZ Phone: in-world incoming notification, Chat, Kebunku/Jurnal, IKD (fictional character identity), Jelajah. The phone interrupts movement while open.
- One-character save data via Supabase Auth, public.yz_game_saves with per-user RLS. Autosave is debounced after state changes and manual save is available.
- The browser never receives database secrets or service-role credentials. If saving fails, further writes are disabled until reload to avoid overwriting old progress.

## Database
SQL migration: `supabase/migrations/20261116000100_yz_game_saves.sql`. A single JSONB record per authenticated user is intentional for the small prototype. Later stages should normalize world events and inventories when concurrency or larger saves require it. All game values are **fictional**, kept separate from operational tables.

## 32 visual references inventory
Drive folder: private owner-managed visual reference folder (URL deliberately excluded from public repository).
- A01–A16 (16 reference sheets)
- C01–C16 (16 reference sheets, including C08.jpg)
- Total 32; source sheets are 31 PNG + 1 JPG, roughly 80 MB before optimization.
- Stage 1 only uses simplified *original pixel approximations* for 3 NPCs; portraits are **not yet imported**. Real sprite atlas conversion, license/visual QA, and detailed character bible remain Stage 2. Do not upload full 80 MB reference sheets to the runtime.

## Acceptance checks
- [ ] Build, TypeScript, and ESLint pass.
- [ ] Test keyboard movement and collision against shops/NPCs.
- [ ] Test mobile directional controls, interaction, phone open/close.
- [ ] Test hoe/seed/water/three nights/harvest and quest reward.
- [ ] Test authenticated save, refresh restore and cross-device resume.
- [ ] Verify RLS: user A cannot read or update user B's save; unauthenticated caller cannot see saves.
- [ ] Verify no mutation of real E-Farmer farm tables.
- [ ] Test reduced motion, landscape on mobile, loading and outage handling.

## What Stage 1 does not promise
No 32 animated NPCs yet, no real IKD integration, no LLM-generated dialogue, no full town simulation, no offline mode or production-ready economy. The game can run without Phaser for this lightweight proof of concept; Phaser can replace the renderer later without rewriting the deterministic game state and story rules.

## Bandung Atlas expansion
See `docs/YZ_FARM_LIFE_BANDUNG_ATLAS.md`. Starting farm is a fictional farm in the **real Pasirluyu kelurahan**, Regol kecamatan, Bandung city. All 30 official district names and seven Regol kelurahan are registered in `src/lib/game/bandung-locations.ts` for the in-phone map browser; only the Pasirluyu starter scene is actually playable.
