#!/usr/bin/env bash
# Stage reviewed game code into a separate web integration branch. No commit or deployment.
set -euo pipefail

GAME_SHA="${1:-}"
if [[ ! "$GAME_SHA" =~ ^[0-9a-fA-F]{40}$ ]]; then
  echo "Usage: bash scripts/game-release/stage-web-integration.sh <full-40-char-approved-game-sha>" >&2
  exit 2
fi
if [[ -n "$(git status --porcelain)" ]]; then
  echo "The working tree must be clean. Commit/stash local changes first." >&2
  exit 1
fi

git fetch origin develop/yz-farm-life release/yz-e-farmer-web
git cat-file -e "${GAME_SHA}^{commit}"
if ! git merge-base --is-ancestor "$GAME_SHA" "origin/develop/yz-farm-life"; then
  echo "The approved SHA must be on the game development branch." >&2
  exit 1
fi

git switch -C release/yz-e-farmer-web --track origin/release/yz-e-farmer-web 2>/dev/null || {
  git switch release/yz-e-farmer-web
  git merge --ff-only origin/release/yz-e-farmer-web
}

INTEGRATION_BRANCH="integrate/yz-game-${GAME_SHA:0:12}"
git show-ref --verify --quiet "refs/heads/$INTEGRATION_BRANCH" && {
  echo "Integration branch already exists: $INTEGRATION_BRANCH" >&2
  exit 1
}
git switch -c "$INTEGRATION_BRANCH"

# Shared engine and curated public assets only. Never overwrite the website's
# root layout, login, finance, Supabase auth or page routing by automation.
git restore --source="$GAME_SHA" --staged --worktree -- \
  src/lib/game \
  game-assets/catalog \
  public/game/assets \
  src/app/game/game-client.tsx \
  src/app/game/game.css \
  src/app/game/game-dialog.tsx \
  src/app/game/dialogue-panel.tsx \
  src/app/game/character-gallery.tsx \
  src/app/game/tool-warehouse.tsx \
  src/app/game/world-region-directory.tsx

echo
echo "Staged changes for $INTEGRATION_BRANCH:"
git diff --cached --stat
echo
cat <<'NEXT'
STOP: This is a staged integration candidate, NOT a deployable release.
Before committing or creating a PR:
- Keep existing E-Farmer /, /login, /home, /anggaran and finance routes.
- Add web-compatible Phaser dependency and regenerate the npm lockfile.
- Adapt the existing /game/page.tsx to the updated GameClient props.
- Provide a cloud save/auth adapter; local PostgreSQL-only routes must NOT be copied.
- Run all game and web tests; verify build + real Vercel staging deployment.
- Obtain owner approval for the exact integrated commit SHA.
NEXT
