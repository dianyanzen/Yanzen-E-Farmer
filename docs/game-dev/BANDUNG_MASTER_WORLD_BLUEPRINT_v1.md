# MASTER WORLD MAP BLUEPRINT — YZ FARM LIFE
**Version:** 1.0 (implementation foundation, 19 November 2026)
**Scope:** Kota Bandung, 30 kecamatan and 151 kelurahan
**Gameplay origin:** Pasirluyu, Regol, Kota Bandung
**Release status:** feature branch, NOT merged into production

## 1. Design commitment
Kota Bandung is one **logical world**. Its 30 kecamatan and 151 kelurahan are administrative references and not walls or loading screens. Subdistricts contain varied authored neighborhoods; neighborhoods contain locations; locations can span multiple rendering chunks. Interiors are distinct local scenes linked by doors.

**Do not mistake an administrative name or atlas thumbnail for a playable map.** Only Pasirluyu has playable world scenes. The purpose of this phase is to make the *authoritative directory and data contract* usable in the game without exposing incomplete districts as traversable.

## 2. Architecture contract
```text
KOTA BANDUNG (World ID: bdg)
  └── 30 kecamatan (DistrictRecord, "bdg/{kecamatan}")
       └── 151 kelurahan (VillageRecord, "bdg/{kecamatan}/{kelurahan}")
            └── 0..n Kawasan (Zone)
                 └── 0..n Lokasi (WorldLocationRecord)
                      ├── 0..n World tilemap chunks
                      ├── 0..n Interior scenes
                      ├── Navigation & route anchors
                      ├── NPC homes/workplaces/events
                      └── Dynamic objects, quests and discoveries
```

Physical map and world connectivity are separate layers:
- **Administrative registry:** hierarchy, names, aliases and stable game IDs
- **Geographic layer (pending):** licensed polygons, roads, rivers, spatial projections; no geometry has been copied or invented in this phase
- **Narrative/playable layer:** authored area, scene, NPC and activities
- **Engine layer:** world tile positions, route portals, chunk ownership, collisions and save boundaries

The engine's existing Pasirluyu 48×48 **logical** master atlas in `src/lib/game/model.ts` remains intact. This new registry does not expand that tilemap to 151 kelurahan, invent crossing routes, or alter the existing player save.

## 3. Source of truth & provenance
The file `src/lib/game/data/bandung-master-registry.json` defines all 30 parent district records and 151 child village records. It is validated against:
1. Disdukcapil Kota Bandung — Profil Perkembangan Kependudukan Kota Bandung 2025: administrative scope (30 districts / 151 villages)
2. Public `tryfatur/geojson-bandung` tree: **district/village name grouping only**, NOT imported GeoJSON geometry; public presence is not automatic permission to redistribute GIS polygons
3. Previously bundled `public/game/atlas/index.html`: exact 151 thumbnail labels and 30 district labels

The original dataset's slug labels differed in three cases: `cihaurgeulis` → game atlas `Cihargeulis`, `cimencrang` → `Cimincrang`, and `cijaura` → `Cijawura`. The atlas display spellings remain consistent with the game and the alternative source spellings are retained in `name_variants`. Before presenting these variants as official spellings, validate against a current government code-and-name register.

**Not imported at this stage:** official administrative codes, polygon geometry, precise street graph, centroid coordinates, road adjacency, and genuine map scale. `boundary_state:"not_imported"` and `VERIFIED_CITY_ROUTES=[]` are intentional safeguards.

## 4. Live data registry and selectors
- `bandung-world.ts` reads the JSON registry as a typed catalog.
- `BANDUNG_WORLD`: city metadata and totals
- `WORLD_DISTRICTS`, `WORLD_VILLAGES`: normalized administrative directory
- `getWorldDistrict`, `getWorldVillages`, `getWorldVillageById`
- `isVillagePlayable`: true **only** for Regol → Pasirluyu at present
- `searchWorldVillages`: district/village/alias query, bounded result count
- `WORLD_ZONE_CATEGORIES`: 11 planned gameplay categories, not 151 cloned zone maps
- `PASIRLUYU_LOCATIONS`: the four real available outdoor scenes `field`, `gang`, `pasar`, `sungai`
- `PASIRLUYU_CONNECTIONS`: the three currently implemented undirected links in the local map
- `VERIFIED_CITY_ROUTES`: empty until a citywide route graph is actually verified

The previous `bandung-locations.ts` is temporarily preserved as a legacy API so existing gameplay and tests are not disrupted. The `test:world` test checks parity; new features must read the world registry.

## 5. YZ Phone integration
YZ Phone → Jelajah:
- displays the world administrative scope (30 kecamatan / 151 kelurahan)
- selects a kecamatan and lists all child kelurahan
- searches globally by kelurahan/district names (including alias spellings)
- clearly shows **Pasirluyu = active**, other kelurahan = future plans
- links to existing atlas previews, not as portal travel
- lists four existing Pasirluyu areas without claiming other districts are playable
- is designed for portrait mobile screens

**Never link a locked kelurahan to a nonexistent playable scene.**

## 6. Future master-map world system
The recommended long-term architecture is Tiled/TMJ-like tilemap + chunk streaming:
- Geographic WGS84 / projected dataset → **game transform with audited scale**
- A global stable coordinate grid for outdoor scenes
- Chunks with a single terrain, water, building, road and collision source
- Seam alignment checks for roads, rivers, terrain and slopes
- Authored traversable route graph, with real physical borders at unavailable exits
- Lazy loading of visible and neighboring chunks
- NPC simulation offscreen (schedules and events, not full animation)
- Interior portals on one consistent location registry
- Player discovery saved by stable location IDs (not by district name)
- Transition migration plan before changing `GameState` save version

**Pending decision:** 32×32 tile future chunk proposal versus the current 24×16 prototype chunk. Keep the existing engine unchanged until camera/streaming and mobile performance tests justify a migration.

## 7. Pasirluyu first: example world
- District: Regol
- Village: Pasirluyu
- Outdoor scenes: Kebun Yanzen, Gang Pasirluyu, Pasar Warga, Bantaran Sungai
- Interiors: existing Rumah Yanzen and Gudang (separate from the four outdoor scenes)
- Other six Regol kelurahan appear in directory but are not claimed playable
- NPC professions, homes, daily schedules and story are attached to the authored scenes, not randomly replicated into the remaining kelurahan

## 8. Roadmap and acceptance gates

| Phase | Deliverable | State |
|---|---|---|
| F0 | 30/151 validated catalog, stable IDs, YZ Phone directory | Implemented on feature branch |
| F1 | Licensed Bandung polygon and road geometry, code cross-check | Not started |
| F2 | Citywide adjacency & route graph, validated seams | Not started |
| F3 | Authored master map for Pasirluyu, coherent landscape | Prototype exists; further art QA needed |
| F4 | NPC navigation, gameplay and mobile UX quality gate | Partial |
| F5 | Expansion to the remaining six kelurahan of Regol | Not started |
| F6 | Expansion across the remaining 29 kecamatan | Not started |
| F7 | Citywide streaming optimization and ongoing maintenance | Not started |

**Go/no-go validation for F0**
- Exactly 30 distinct districts and 151 distinct villages
- Each village has precisely one parent district
- Parity with existing 151 asset labels
- Pasirluyu belongs to Regol
- Only Pasirluyu is accessible as an actual game village
- No fabricated polygon, official code, travel time, or adjacency
- Existing Pasirluyu scenes, inventory, NPCs, cloud save schema and gameplay tests remain functional

## 9. Folder design
```text
src/lib/game/
  bandung-locations.ts                       # existing compatible constant API
  bandung-world.ts                           # typed world registry + selectors
  data/bandung-master-registry.json          # 30 kecamatan and 151 kelurahan
  model.ts                                   # existing Pasirluyu runtime world
  pasirluyu-master-map.ts                    # authored runtime art, unchanged here

src/app/game/
  world-region-directory.tsx                 # YZ Phone administrative explorer
  game-client.tsx                            # invokes world directory, rest unchanged

tests/
  game-bandung-world.mjs                     # 30/151, alias, atlas and status validation

docs/game-dev/
  BANDUNG_MASTER_WORLD_BLUEPRINT_v1.md       # this document
```

## 10. Scope and change control
This commit does **not** add 151 complete maps, does **not** deploy to production, and does **not** change E-Farmer financial records, database structures, RLS, auth, NPC progression or player saves. Keep the branch and PR separate until typecheck, all model tests, build, and mobile browser review pass.
