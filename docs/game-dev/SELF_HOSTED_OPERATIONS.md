# YZ Farm Life self-hosting

The Compose stack contains only a game app, its dedicated PostgreSQL database, and a small Nginx proxy. The proxy listens on loopback at `GAME_PORT` (default `3002`); PostgreSQL and the app have no host-published ports and stay on a private internal Compose network. Only the proxy also joins the ingress network. The stack does not configure Apache, publish PostgreSQL, or use Supabase/Vercel. For access from other machines, use an approved HTTPS reverse-proxy configuration; production session cookies require HTTPS. Do not expose this port directly to the internet.

## Initial setup

Requirements: Docker Engine with the Compose v2 plugin, Git, and a free loopback TCP port for the game.

1. Copy `.env.example` to `.env`. Set `POSTGRES_PASSWORD` to a unique random value of at least 32 characters. Keep `.env` out of source control and backups shared outside the server.
2. Check that the selected game port is unused. The default is `3002`.
3. Build and start only this Compose project:

   ```powershell
   docker compose up -d --build
   docker compose ps
   Invoke-RestMethod http://localhost:3002/api/health
   ```

4. Open `http://localhost:3002` on the server and register the first local game account. The application and database must both show `healthy` before accepting users.
5. `/game` opens Phaser by default. `/game/canvas` keeps the Canvas renderer available for comparison and fallback testing.

For an optional Windows LAN port proxy, run `deploy/enable-game-lan.ps1` in elevated PowerShell. Supply the host's LAN IPv4 address and the display names of existing inbound firewall allow rules; the helper validates those rules before adding the game-specific rules:

```powershell
$listenAddress = Read-Host 'Host LAN IPv4 address'
$sourceRules = @(Read-Host 'Existing inbound allow-rule display name')
.\deploy\enable-game-lan.ps1 -ListenAddress $listenAddress -SourceRuleNames $sourceRules
```

The first PostgreSQL start creates only the `yz_game_users`, `yz_game_sessions`, and `yz_game_saves` tables in this dedicated database. The initialization script runs only when the named game volume is first created.

## Update

Back up the game database first. Review the incoming changes and database migrations, then update the checked-out game branch and rebuild only this stack:

```powershell
git status --short
git pull --ff-only
docker compose up -d --build app
docker compose ps
Invoke-RestMethod http://localhost:3002/api/health
```

Apply later SQL migrations to this game database explicitly and only after backing it up. Do not mount or point the game at an existing farm or finance database.

## Backup and restore

Create a compressed PostgreSQL dump containing accounts, sessions, and game saves. The commands copy the binary dump through Docker rather than PowerShell text output:

```powershell
$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$dbContainer = docker compose ps -q db
docker compose exec -T db sh -c 'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Fc -f /tmp/yz-farm-life.dump'
docker cp "${dbContainer}:/tmp/yz-farm-life.dump" ".\yz-farm-life-$stamp.dump"
docker compose exec -T db rm -f /tmp/yz-farm-life.dump
```

Store dumps in an access-controlled location. Protect or delete expired dumps according to your retention policy.

Restore is destructive to this game database only. Stop the app, preserve a pre-restore dump, then restore into the dedicated database:

```powershell
docker compose stop app
$dbContainer = docker compose ps -q db
docker cp .\yz-farm-life-YYYYMMDD-HHMMSS.dump "${dbContainer}:/tmp/yz-farm-life-restore.dump"
docker compose exec -T db sh -c 'pg_restore -U "$POSTGRES_USER" -d "$POSTGRES_DB" --clean --if-exists --no-owner /tmp/yz-farm-life-restore.dump'
docker compose exec -T db rm -f /tmp/yz-farm-life-restore.dump
docker compose up -d
docker compose ps
Invoke-RestMethod http://localhost:3002/api/health
```

## Rollback

Keep the previous source revision and a database dump before updating. To roll back application code, check out the prior game revision and run `docker compose up -d --build app`. If the new version changed the save schema, restore the matching pre-update dump as described above; do not remove the named volume as a rollback technique.

## Stop and remove

`docker compose stop` stops the game without deleting data. `docker compose down` removes this project's containers and network but preserves `yz_farm_life_pgdata`. Do not use `docker compose down -v` unless you intend to permanently delete all local accounts and game saves.
