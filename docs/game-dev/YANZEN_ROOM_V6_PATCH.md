# Interior Yanzen V6

Base: 884299dc5fda3c5ef68c5a3024e763767ee416e3. Scope: bed aisle and shed decoration only.

- Bed footprint (9,6),(9,7); aisle x10 rows 6–8 free. Hitbox [180,204) × [108,160). Sleep remains available at (9,8) facing up, (10,7) left, (8,7) right.
- Shed: 12 independent vector props. Keep existing storage and exit, enlarge basket, preserve x11–14 rows 8–13. Four new floor blockers: (8,9),(8,12),(16,9),(16,12). Hanging tools and tabletop props have no independent floor collision; decorative only, not inventory.
- Do not change exterior, irrigation, NPC roster, save schema, web, or character scale. Keep legacy assets.
- Asset artwork and exact alpha bounds remain candidates pending screenshot QA. Check layering and object sizes on Canvas and Phaser before staging release.
- Run npm run typecheck, npm run test:game, npm run test:game:starter, npm run test:game:starter:ui and npm run test:game:starter:ui:phaser. Do not deploy if tests or visual QA fail.
