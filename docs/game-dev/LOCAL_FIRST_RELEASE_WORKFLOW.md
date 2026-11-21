# YZ Farm Life — local-first release (2026-11-21)

## Environments and ownership

| Source | Branch | Target | Policy |
| --- | --- | --- | --- |
| Docker/local development | `develop/yz-farm-life` | Local Compose on port 3002 | Freely edit and test; never auto-release production |
| Stable E-Farmer website | `release/yz-e-farmer-web` | Vercel website | Preserve website pages, Supabase, farm operations and finance |
| Historical/default branch | `main` | Existing Git integration (must be reconfigured) | Do not push game-only changes to deploy web production |

Important: the source snapshot on `main` is **game-only**. It replaces `package.json`, strips Supabase dependencies and changes `next.config.ts` to `pageExtensions: ["game.ts", "game.tsx"]`. Do **not** merge `develop/yz-farm-life` wholesale into the web release branch. This would hide normal `page.tsx` and `layout.tsx` routes and risk losing E-Farmer functionality.

## Daily Docker workflow

```sh
git fetch origin
git switch develop/yz-farm-life
git pull --ff-only origin develop/yz-farm-life
cp .env.example .env              # initial setup only; create a strong unique POSTGRES_PASSWORD
docker compose up -d --build
docker compose ps
curl --fail http://127.0.0.1:3002/api/health
npm ci
npm run test:game
npm run typecheck
npm run lint
node scripts/game-release/verify-standalone.mjs
git add <reviewed-paths>
git commit -m "feat(game): describe the change"
git push -u origin develop/yz-farm-life
```

Do not replace an existing `.env` or delete the named PostgreSQL volume. Back up user saves before database migrations. Only localhost is published by Compose; use an approved HTTPS reverse proxy for outside access.

## Release request: explicit owner approval only

1. The owner says a specific tested game revision is **fixed / ready for release**.
2. Freeze its **full commit SHA** on `develop/yz-farm-life` and obtain green CI (game tests, types, lint, build, Docker).
3. Create a separate **integration branch starting from** `release/yz-e-farmer-web`, NOT from `develop/yz-farm-life`.
4. Port or cherry-pick the approved **game-core, NPC/world, public game assets and game UI** changes selectively. Preserve the web application's existing root layout, routes, `package.json` dependencies, environment contract and Supabase modules.
5. Implement an explicit **web game adapter** for authentication and saves. The Docker-local PostgreSQL connection is NOT suitable for Vercel. Use an approved persistent cloud database and web auth with documented migrations; do not copy game users, passwords, session tokens or secrets.
6. Run the E-Farmer website regression suite AND gameplay tests on the integrated branch. Verify `/`, `/login`, `/home`, `/anggaran`, `/game` and finance routes. A healthy Docker build alone is not sufficient.
7. Open a PR into `release/yz-e-farmer-web`. No automatic merges or production deployment without owner approval; record approved SHA and migration/rollback notes.
8. Stage the integrated **production build without assigning the domain**, test it, then promote that same build. If tests fail, keep or restore the last healthy release.

## Vercel migration step — required before first release

The currently connected Vercel production project is still deploying GitHub `main`; switch its **Production Branch** in Vercel > Project Settings > Git to `release/yz-e-farmer-web` and verify deployment controls/required checks before proceeding. This setting is NOT modified just by creating the branch. Ensure staging is isolated from production and do not assume a successful Docker build means the Vercel web build works.

If automatic production deployment on every merge is not desired, use protected merges plus a manually approved staged deploy (Vercel CLI or CI with restricted production environment). Keep credentials in Vercel/GitHub encrypted secrets, never in the repository.

## No-go conditions

- Web homepage or accounting routes are missing.
- Any build or automated test fails, or cloud saves/authentication cannot be verified.
- Database migration has no backup/rollback.
- User approval for the exact release commit is missing.
- Vercel shows `ERROR`, `BUILD_FAILED` or an unresolved provisioning problem.

Reference last known successful Vercel staging commit: `5b2d521f8337a7e45757151aeffdc1f5dceb1031`. The local-only merge SHA `e2d19a829494b147d4aa3c89ee37020621e0840c` must not be considered a successful web release.
