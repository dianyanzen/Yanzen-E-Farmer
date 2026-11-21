# Game Creation Tools and ChatGPT Plugins

## ChatGPT connected / available in this project
These tools are **already available as connected integrations**, not new npm dependencies:

| Tool | Game-development role | Usage |
|---|---|---|
| GitHub | source-of-truth, pull requests, source review, CI tests | Required: branch isolation and change history |
| Vercel | preview builds and logs | Preview only until acceptance gates pass |
| Supabase | Auth and per-user JSONB save records | Existing RLS-isolated `yz_game_saves`; never mix real farm ledger |
| Google Drive | securely inspect the 32 private character references | Do not publish Drive links, image IDs or originals to a public repo |
| Adobe | portraits, optimization, compositing and image editing | Optional asset workflow, obey source licenses |
| Canva | wireframes, storyboards and presentation/visual prototypes | Optional, not a sprite atlas pipeline |
| tldraw | narrative graphs, scene flows, maps, design discussions | Useful for NPC relationship/quest diagrams |
| Lovable / MagicPath | rapid React UI concepts | Optional YZ Phone UI prototype; inspect code before merging |

### Optional ChatGPT plugin
**Figma** (not currently installed at collection time): UI layouts, editable phone mockups and design handoff to coding. Connect only through the explicit installation prompt in ChatGPT; no installation has been performed here.

## External desktop apps (not ChatGPT plugins)
1. **Tiled Map Editor** — https://www.mapeditor.org/ · https://docs.mapeditor.org/en/stable/ — author reusable tilemaps, object collision layers, portals, NPC spawn layers, district exits; JSON export.
2. **Pixelorama** — https://pixelorama.org/ — open-source pixel art, spritesheets, frame-by-frame animation, tileset painting.
3. **LibreSprite** — https://github.com/LibreSprite/LibreSprite — free sprite editor (GPL-2.0); license applies to the **tool**, not automatically to user-created art.
4. **Phaser 4** — https://phaser.io/oss/docs/ — future renderer option for animated sprites, camera, tilemap and lazy scene loading. **Not installed in Stage 1**; current Canvas renderer remains intentionally light.
5. **ink** — https://github.com/inkle/ink — optional authored branching narrative runtime; evaluate integration cost with browser and persistent story state before adoption.
6. **TexturePacker alternative** — use editor atlas export initially; avoid purchasing tooling before first optimized 3-NPC portrait prototype.

## Candidate VS Code extensions (manual, no silent installation)
- ESLint, Prettier (already part of repo tooling)
- Tailwind CSS IntelliSense
- Tiled / TMX or JSON syntax support (verify publisher and current permissions)
- Pixel art image viewer optional (avoid extensions requiring broad remote access)
- GitHub Pull Requests and Issues (optional developer workflow)

## Selection rule
**Don't install every tool.** For Stage 1.1, the lean stack is VS Code + Tiled + Pixelorama + GitHub + Vercel + Supabase. Figma is optional for YZ Phone.

## Project-local Codex agent skills — Humanizer

**Terpasang dalam GitHub (bukan plugin ChatGPT atau dependency npm):** `.agents/skills/humanizer/SKILL.md`, versi `4.0.0` dari [blader/humanizer](https://github.com/blader/humanizer), lisensi MIT, commit upstream terkunci `a32f24407364c74c812b43c15926d638bee1e072`. Companion `.agents/skills/yz-farm-dialogue/SKILL.md` menyesuaikan pedoman karakter, quest dan gaya Bahasa Indonesia. Lihat [Humanizer Narrative Pipeline](HUMANIZER_DIALOGUE_PIPELINE.md).

Gunakan skill ini ketika *menulis/merevisi* dialog atau naskah. Jangan memakainya untuk meringkas karakter menjadi gaya seragam, memodifikasi kode sebagai efek samping, atau menjalankan proses AI di runtime. Codex di server perlu `git pull` dan sesi baru untuk menemukan skill project-local. Verifikasi statis dengan `npm run test:game:humanizer`.
