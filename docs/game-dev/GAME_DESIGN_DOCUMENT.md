# YZ Farm Life — Game Design Document v0.2

## Elevator pitch
A cozy 2D pixel-art, portrait-first farming and neighborhood simulation set in a **fictional farm in Pasirluyu, Regol, Kota Bandung**, where the player grows cucumbers, interacts with 32 visual NPCs, uncovers family/community histories, and explores all **30 real Bandung district names** through evolving gameplay.

**Primary fantasy:** "Aku pulang ke sawah di tengah kota; kampung punya kehidupan sendiri, dan setiap warga menyimpan cerita."

## Core design
- **Visual/controls:** GBA-inspired top-down 2D; 16px tile standard; mobile portrait 288×512 target; game can be played in short 5–15 min sessions.
- **Daily loop:** wake → read optional phone notification → tend soil/irrigation → discover character/event → visit market or neighbors → rest or explore.
- **Narrative:** three layers: main city-farm arc, character arcs and context-triggered micro-events. Never force the same fetch quest on repeat solely to prolong playtime.
- **No forced daily login:** return after days or weeks without arbitrary loss. NPC routines follow *game time*, not real-world login streak.
- **Social simulation:** NPCs have schedules, attitudes, goals, relationships, knowledge and recall of significant decisions; each character can disagree with the protagonist.
- **Farming:** start with cucumber; expand after first polished loop to rice, beans and fish. Soil/wetness/growth stages should be engaging, not punish players with realistic complexity.
- **Urban world:** roads, small alleys, marketplace, riverside, roofs and civic/heritage places; district boundaries as navigation not cadastral maps.
- **Authentic Bandung:** geographic district names and carefully sourced local background; fictional people and businesses marked as fiction.

## Portrait phone as a physical in-game tool
When P/phone button is pressed, game scene remains visible behind YZ Phone. At minimum: notifications, Chat, Kebunku, Jurnal, Jelajah, and **IKD = Identitas Karakter Digital** (fictional data only; no NIK/PIN/selfie).
Phone can create NPC meetups/quests; it must not replace face-to-face conversations.

## Starting map: Pasirluyu
- Farm/house: player wakes and interacts with crops.
- Gang: two neighbors and mailbox.
- Warung/pasar: local merchant with delivery order.
- Drainage/irrigation: mystery story seed and later quest area.
- Transit: future route from Regol to curated districts. Only locations actually built are marked playable.

## 32-character policy
32 art reference sheets (A01–A16, C01–C16), **visual references only**, no inherited IKD-agent role. Design all NPCs with distinct narrative purpose, routine and relationship network. Initial 3 NPCs remain temporary role placeholders until a Character Bible is approved.

## Data
Separate game state from real E-Farmer. Existing `public.yz_game_saves` per-user JSONB prototype (RLS) is the save contract. Version/shape migrations are mandatory before changing world coordinates, plot growth state or flags. Client cannot see service-role keys.

## Stages and acceptance
| Stage | Required output | Exit gate |
|---|---|---|
| S1 baseline | playable landscape Canvas, farm loop, 3 NPCs, phone, save | tests+manual UI+cloud save |
| S1.1 asset library | verified licenses, character registry, tools and documents | catalogue validation passes |
| S1.2 portrait | 288×512 camera, 16px tile world and mobile controls | device QA, no broken saves |
| S2 Pasirluyu story | optimized farm/town art, 6 NPCs, 6 authored storylets | playable narrative arc; no cloned assets |
| S3 Regol | hub + transitions, curated playable places | spatial/quest QA |
| S4 Bandung districts | expansion across 30 official kecamatan | each district has meaningful content, not empty maps |

## Risks and measurable objectives
- **High risk:** mixing incompatible free asset packs; mitigate by a visual style QA gate and redraw.
- **High risk:** repetitive dialogue; measure player sessions with *voluntary* exploration and narrative variety (no coercive retention).
- **High risk:** public attribution/privacy; use source ledger, only fictional identities, no private property geolocation.
- **Medium risk:** 30 district scope exceeds MVP; expand only after Pasirluyu genuinely enjoyable.
- **Medium risk:** load size; set a target under 15 MB initial transfer, measure actual, lazy-load districts.
