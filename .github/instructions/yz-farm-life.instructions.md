---
applyTo: "src/app/game/**,src/lib/game/**,public/game/assets/**,game-assets/**,scripts/game-*/**,tests/game-*,docs/game-dev/**"
---

# Mandatory YZ Farm Life game instructions

**Read `docs/game-dev/GAME_AUDIT_MASTER.md` and `docs/game-dev/AUDIT_PLAYBOOK.md` before editing or reviewing the game.** Follow repository root `AGENTS.md` and `docs/ai/SYNC_PROTOCOL.md` for shared GitHub/Codex/ChatGPT ownership rules.

- Review active issue IDs G-001…G-035; identify affected modules, branch and exact SHA. Never assume PR preview code is on main.
- Audit claim must include observation, cause, confidence %, alternatives, action, player impact, and priority, plus test evidence and remaining QA.
- `main` mixes real Smart Farm and web YZ Farm Life. `develop/yz-farm-life` is a different standalone Docker/PostgreSQL track. Don't merge full trees or silently change auth/save.
- Never touch production aliases, Supabase financial tables, user data, or DNS without owner approval.
- New patches go to one owner/feature branch/PR; update master audit and audit history after verified changes.
- Treat assets, NPC registry, and geographic labels as **not necessarily playable** until the model, scene, collision and QA prove they are.
