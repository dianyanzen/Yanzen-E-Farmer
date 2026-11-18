# YZ Farm Life — Living Pasirluyu World Blueprint
Version: v0.2 (prototype, 19 November 2026). Location: Kelurahan Pasirluyu, Kecamatan Regol, Kota Bandung. All world layouts and stories are fictionalized game designs, not a GIS-accurate representation of real homes or citizens.

## Product vision
"Alive even when the player is not watching." NPCs should have their own motives, schedules, obligations, emotional memories, and relationships; the player is a guest in an ongoing village. Avoid random NPC placement simply to increase population. Prioritize human-readable navigation and frictionless mobile control.

## Confirmed runnable scope
- Four outdoor locations: Kebun Yanzen (field), Gang Pasirluyu (gang), Pasar Warga (pasar), Bantaran Sungai (sungai). Two original interiors: Rumah and Gudang.
- The four outdoor locations are authored as 24×16-tile scenes, linked by six directed walkable connections (three bidirectional links). This is **not** an implementation of all 151 kelurahan.
- Natural collision borders: field = buildings to north, canal to west, hedges to south and trees to east; gang = houses and planted boundary trees; market = stalls and hedge; river = water and riverbank. Exit strips are recognizable walkable road/bridge passages.
- NPC first pass: Ryan, Nani, Inggit have authored schedules and location-specific work, motivations, fears, habits, cross-character connections, dialogue variants by time/day/rain, and memory of the player's last dialogue choice. All additional catalog characters are NOT yet active inhabitants.
- YZ Phone: current zone, navigable area chart, NPC whereabouts, hobbies/habits/unlockable inner lives as friendship grows. Phone still shows existing story, friendships, character gallery, and activities.
- Tap to route within the same scene and interact with known objects; keyboard/gamepad-like D-pad still supported. Path routes are grid-BFS; no long-distance pathfinding across several zones yet.
- Rain is deterministic within a seven-day cycle; rain waters planted crops at the beginning of its day. Time advances on outdoor movement and work; no stamina limits.
- Timun: first maturity requires watering for three day transitions; after harvest, plants regrow at stage 1 and can yield up to four harvests total, then retire. This is simplified gameplay balancing, not a claim about field agronomy.

## Daily lives — no random placement
| NPC | Home & role | Morning | Midday/afternoon | Evening | Inner life |
|---|---|---|---|---|---|
| Ryan (A03) | Gang Pasirluyu; water steward | Kebun, observe irrigation | Bantaran Sungai, measure flow | Gang, file report | Wants fair water distribution; fears being blamed for water shortages |
| Nani (C01) | Gang Pasirluyu; caretaker and memory keeper | Beside kebun, tending jasmine | Gang, neighbors | Gang bench | Preserves stories consensually; afraid her family's photograph may be exploited |
| Inggit (C08) | Pasirluyu; warung proprietor | Warung near the farm | Pasar Warga, selling | Warung, count sales | Reduces food waste; values community ties more than fast profit |

These assignments matter: if Ryan is at the river, the player knows why; if Inggit moves to the market, the player can ask at her workplace. Never put Nani in a mine solely to fill a map.

## NPC memory contract
Persist: friendship points, last talked day, count, mood, and last choice. Dialogue should depend on (a) player's choices, (b) day/time, (c) weather, (d) quest, (e) trust, (f) relationships. Future: event journal and mini-quests per NPC with stable authored IDs and bounded consequences (not auto-generated random quests).
**Important limitation:** NPC sprites currently switch authored positions at daily schedule boundaries; visible walking routes, work animations, social encounters with each other, meal breaks, fatigue-free leisure, and home/interior NPC visits are follow-up phases.

## Map connections
\`\`\`
        [PASAR WARGA]
              ↑ ↓
     [GANG PASIRLUYU] ← → [KEBUN YANZEN] — Rumah / Gudang
              ↑ ↓
       [BANTARAN SUNGAI]
\`\`\`
Kebun east road y10–11 → Gang west road; Gang north path x11–12 → Pasar south path; Gang south x11–12 → Sungai north path. Other edges must contain physical obstacles such as fences, trees, water, buildings or terrain. Natural scenery has a collision counterpart; never introduce invisible walls or prop tiles that can be walked through.
Note: the positions above are *conceptual topology*; they do not describe official street alignments in Pasirluyu.

## UX quality gates
1. First 60 seconds: tap a plot → hoe, tap again → plant, equip watering can → water. Each action has explicit confirmation and a plain-language next step. The tutorial may be skipped.
2. No dead ends: no stamina bar or failure to act because of an out-of-date resource; old saves must remain safe.
3. Camera + controls: choose D-pad/keyboard or tap-to-route. Back button and player orientation must be predictable.
4. HUD should show one next action; move deep stat tables to YZ Phone; keep controls reachable with one thumb and readable on 393px wide displays.
5. NPC presence: a player's phone tells where a person currently works. Trust levels reveal their motives and fears; never reveal their intimate backstory too early.
6. Effects: meaningful work animation, rain variation, day/night mood, harvest feedback, discrete sound. Respect reduced motion and a sound-off preference.
7. World map: show visited zones and upcoming road exits; avoid false claims that undeveloped kelurahan are already playable.

## Roadmap, NOT yet implemented
**Next P0 (QA):** Test mobile browser directly, verify canvas tap coordinates under Safari address bar changes and fullscreen; visually inspect 4 scenes for collision mismatch; test simulated browser cloud save, NPC schedule change mid-walk, route interruptions, and dialog focus.
**P1:** A true optional 60-second interactive tutorial with checkpoints; NPC walk cycles and indoor schedules; seasonal/weather alternates; house and market interactables; accessible landmarks and clearer travel transitions; camera handoff fade.
**P2:** NPC-specific side quests and heart events, gifting preferences, birthday calendar, festivals, neighbor-to-neighbor conversations, job boards; area-exclusive tools (fishing rod by river, axe by grove), regrowth balance and crop variety.
**P3:** More connected maps through Regol, then the wider city; catalog 151 kelurahan remains metadata until visual and story validation. Separate save schema version/migrations when the world becomes more complex.

## References and design extraction (research, not assets for reuse)
1. Stardew Valley villagers & schedules: https://stardewvalleywiki.com/Villagers — schedules by time/weather, purposeful places.
2. Stardew Valley friendship: https://stardewvalleywiki.com/Friendship — event/affinity gating, dialogue consequences.
3. Fields of Mistria friendship: https://fieldsofmistria.wiki.gg/wiki/Friendship — heart events with progression prerequisites.
4. My Time at Sandrock commissions: https://mytimeatsandrock.fandom.com/wiki/Commissions — NPC work and community economy.
5. Animal Crossing villager personalities: https://nookipedia.com/wiki/Villager — hobbies and distinct archetypes.
6. Sun Haven NPC romances: https://sunhaven.wiki.gg/wiki/Dating — conversations and character-specific events.
7. Story of Seasons Friends of Mineral Town calendar: https://fogu.com/sos3/events/index.html — meaningful recurring festivals.
8. Harvest Moon Back to Nature events: https://h-moon.ir/en/back-to-nature-guide/events/ — event context, timing and player closeness.
9. Moonstone Island daily cycle: https://moonstoneisland.wiki.gg/wiki/Day_Cycle — indoor start/end and time-dependent shop routines.
10. Roots of Pacha relationships: https://rootsofpacha.wiki.gg/wiki/Relationships — community and relationships beyond a stat bar.
11. Eastward Octopia: https://store.steampowered.com/app/2305370/Eastward__Octopia/ — small town growth through neighbors.
12. The Legend of Zelda: A Link to the Past level boundaries: https://www.gamedeveloper.com/business/overworld-overload-an-analysis-of-link-to-the-past-s-light-world-part-2 — natural cliffs/river/tree barriers.
13. Pokémon route gates: https://bulbapedia.bulbagarden.net/wiki/Gate — coherent geographic transition points.
14. Dinkum journal and milestones: https://www.neoseeker.com/dinkum/The_Basics — player-facing activity goals.

No copied sprites, proprietary character designs, game scripts or map tiles from these games are used here. Any prior uploaded commercial guide PDFs must be read directly before quoting or making content-specific claims about them; the current implementation is based on gameplay patterns and public references.

15. Spiritfarer: https://thunderlotusgames.com/games/spiritfarer/ — character-specific care and emotionally significant life stories; use as a reference for empathy and meaningful consequences, not copied content.
16. Littlewood townsfolk: https://littlewood.fandom.com/wiki/Townsfolk — inhabitants have wishes/quests that link to housing and layout instead of random map placement.
17. Kynseed routines: https://wiki.kynseed.com/wiki/Time — 3-hour schedule slots for characters, and long-term daily-life structure as a future possibility; **generational aging is NOT implemented**.
18. Rune Factory 4 town events: https://therunefactory.fandom.com/wiki/Town_Events_%28RF4%29 — town-wide events and character-specific narrative beats.
