# YZ Farm Life — safe web integration

The Docker dev branch uses independent PostgreSQL accounts and sessions. The Vercel web uses Supabase Auth and the pre-existing `public.yz_game_saves` RLS migration (`20261116000100_yz_game_saves.sql`). Never point the cloud game at the Docker volume or expose its connection string.

## Routes
- `/game` and `/game/phaser`: Phaser 4 renderer, existing web login.
- `/game/canvas`: Canvas fallback.
- `/api/auth/session`: Supabase SSR session for the shared game client.
- `/api/auth/logout`: Supabase sign-out from the game.
- `/api/game/save`: RLS-scoped get/put; one slot per authenticated user, validation via `safeLoad`.
- Existing E-Farmer `/`, `/login`, `/home`, `/anggaran` and financial routes remain unchanged.

## Preproduction checks
1. Verify the Supabase migration was applied and RLS works for two separate test accounts. A missing table returns 503, not false success.
2. Test anonymous GET save and auth session return 401; anonymous PUT returns 401 only with matching origin.
3. Verify one test account can save and reload state after refresh; second account cannot read or replace that state.
4. Verify full page, mobile interaction, sleeping, tools, NPC dialogue, and Phaser Canvas fallback.
5. Check E-Farmer finance routes and Supabase auth after integrating the new game.
6. Release only from reviewed SHA after Vercel staging READY, followed by a verified production deployment.

Do not make an external release while source/build checks or account-specific save verification are pending.
