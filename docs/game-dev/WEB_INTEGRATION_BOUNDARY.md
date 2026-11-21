# Web integration boundary — YZ E-Farmer

This branch preserves the full YZ E-Farmer website as it existed before the Docker-only game rewrite. Its current starting commit is `5b2d521f8337a7e45757151aeffdc1f5dceb1031`.

**Never merge `develop/yz-farm-life` directly into this branch.** That branch builds only the standalone game. A straight merge would replace the web build scripts, Next.js page extension detection, app root layout, and Supabase dependencies.

### Selective integration procedure

After the owner approves an exact full 40-character game SHA:

```bash
git fetch origin
git switch release/yz-e-farmer-web
git pull --ff-only origin release/yz-e-farmer-web
bash scripts/game-release/stage-web-integration.sh FULL_APPROVED_GAME_SHA
```

The script creates `integrate/yz-game-<short-sha>`, stages game-core and art/assets, and **does not commit, push, deploy, or alter production**. It deliberately does not overwrite `src/app/page.tsx`, `src/app/layout.tsx`, website login, existing finance routes, or Supabase authentication modules.

The staged changes are **not expected to build unchanged**. Codex must reconcile the game UI props, web access control, database adapter and dependencies, then regenerate the lockfile. Preserve game saves by defining explicit schema migrations and backups instead of moving Docker's PostgreSQL volume to Vercel.

### Acceptance checks

- E-Farmer pages: `/`, `/login`, `/home`, `/anggaran`, finance/bon.
- Game: `/game`, Phaser fallback, maps, NPC dialogue, tools, sleep/day progression, save/load.
- Typecheck, lint, full test suites and production build.
- No local-only credentials or direct local PostgreSQL dependency in web runtime.
- Staging `READY` and verified account/save behavior.
- PR reviewed and explicit user approval recorded **before promotion**.

The Vercel project's Git production branch currently remains `main`; it **must** be switched to the protected web release path through Vercel Git settings before first production publication. The mere existence of this branch does not reconfigure Vercel. This procedure never changes Vercel settings or production by itself.
