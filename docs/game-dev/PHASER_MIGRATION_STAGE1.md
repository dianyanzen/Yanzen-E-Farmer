# YZ Farm Life — Phaser 4 migration stage 1

## Scope
This experimental branch is based on Open Source Toolkit PR #27 and does not change the default production game.
* Legacy: /game (existing Canvas renderer)
* Phaser: /game/phaser (authenticated preview with native Phaser 4.2.1 Game, Scene, camera and GPU sprite rendering)
* Both routes reuse the same GameClient, FieldEngine movement clock, model.ts commands, dialogues, YZ Phone and Supabase save path. They use the same player progress. **Do not test destructive actions using an important save.**

## What is migrated
- A Phaser.Game instance with Phaser.Scene, Phaser.Scale.FIT, pixel-art textures and lifecycle cleanup.
- Native Phaser sprites for the player, NPCs, crops and tool effects.
- Native Phaser camera, farm Graphics layers, day/night tint and rain.
- Static background canvas textures generated from existing deterministic road/area drawing utilities *once per scene*. This retains original geography while avoiding a complete per-frame Canvas repaint.
- Tap coordinates still use the original 300x200 logical viewport and the existing BFS/collision model.
- The original Canvas renderer remains a fallback if Phaser cannot load.

## Not yet migrated
- The movement and game-state clock still run from FieldEngine (React-driven tile commands). This is intentional to preserve save/collision behavior while comparing rendering systems.
- Some ambience details and non-field animations still use the previous static art, and visuals can differ from Canvas. Verify every location and time of day.
- Native Phaser input, Tilemap integration, chunk streaming and many-NPC optimization come in later stages after profiling.
- No production deployment, no merge to main, no claim of verified FPS gains.

## QA checklist
1. Sign in and open /game/phaser and /game side-by-side in the same browser; test home, field, gang, pasar, sungai, and shed.
2. Check arrow/WASD, run, pointer/tap navigation, dialogue, inventory, YZ Phone, sleep, farming and reload (save persistence).
3. Safari iPhone: portrait, landscape, touch, scroll prevention, audio unlock, fullscreen availability.
4. Record FPS/frametime on device; compare 95th-percentile frame time, input-to-motion latency, and memory.
5. npm ci, npm run typecheck, npm run test:game, npm run build. Keep this PR draft until UI and gameplay parity tests pass.

## Rollback
The /game route is unchanged. Disabling /game/phaser or reverting this isolated PR removes the Phaser integration without data migration.
