# YZ Farm Life — standalone self-hosted game

This checkout packages only YZ Farm Life, based on PR #28 commit `65574b4550c45080243b8e00a31acbb52e7eadf0`. The production build exposes the game, its login page, and game-only APIs; it does not build the Yanzen E-Farmer website routes.

- Phaser 4 is the primary renderer at `/game`; Canvas is also available for comparison at `/game/canvas` and remains the automatic fallback if Phaser cannot initialize. `/game/phaser` stays available as the PR preview alias.
- 4 authentic outdoor zones (Kebun Yanzen, Gang Pasirluyu, Pasar Tradisional, and Bantaran Sungai) match the 2×2 master pixel-art atlas and are documented in [docs/game-dev/PASIRLUYU_EMPAT_LOKASI_VISUAL_ATLAS.md](docs/game-dev/PASIRLUYU_EMPAT_LOKASI_VISUAL_ATLAS.md).
- Farming, NPCs, quests, YZ Phone, sleep, and version-1 game saves remain in the existing game state model.
- Local email/password accounts and isolated game saves use a dedicated PostgreSQL database.
- Runtime does not depend on Supabase or Vercel.

## Run locally with Docker Compose

Requires Docker Engine and the Compose v2 plugin. Copy `.env.example` to `.env`, set a unique strong `POSTGRES_PASSWORD`, then run:

```powershell
docker compose up -d --build
docker compose ps
Invoke-RestMethod http://localhost:3002/api/health
```

Open `http://localhost:3002` on the host. Only the dedicated proxy publishes this loopback port; the app and PostgreSQL stay on a private internal Docker network. Production cookies require HTTPS; use an approved HTTPS reverse proxy for remote access rather than exposing the app port directly.

See [self-hosted operations](docs/game-dev/SELF_HOSTED_OPERATIONS.md) for update, backup, restore, and rollback instructions.

## Validation

```powershell
npm ci
npm run typecheck
npm run lint
npm run build
```
