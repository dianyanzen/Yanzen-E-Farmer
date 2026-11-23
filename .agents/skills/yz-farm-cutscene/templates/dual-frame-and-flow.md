# Template produksi dua frame + Google Flow (YZ Farm Life)

Gunakan bersama `../SKILL.md`. Tiga prompt berikut adalah **template editor**. Ubah [PLACEHOLDER] memakai sumber canonical yang benar; jangan menebak desain pemain atau hasil misi.

## PROMPT FRAME AWAL — Gemini / Image Generation

```text
Produce ONE cinematic 16:9 START FRAME for the original YZ Farm Life story cutscene [SCENE_TITLE].
Reference priority: [ACTOR_SPRITE] defines pose/costume/proportion; [ACTOR_PORTRAIT] defines recognizable face; [CANONICAL_MAP_SCREENSHOT] defines location geometry, river flow and landmarks.
Visual style: [OWNER_APPROVED_STYLE]. Maintain natural light direction and coherent cel-animation line art.
Scene state BEFORE the action: [START_STATE].
Show the full body and both shoes resting on a believable surface; preserve every visible prop and mechanism.
Frame camera: [SHOT_SIZE_AND_DIRECTION]. Exact continuity anchors: [GEOGRAPHY_AND_PROPS].
No text, UI, subtitles, watermark, extra limbs, invented mechanisms, or generic replacement protagonist.
Output a single individual image, NOT a two-panel collage.
```

## PROMPT FRAME AKHIR — Gemini / Image Generation

```text
Produce ONE cinematic 16:9 END FRAME that is the direct visual continuation of the approved START FRAME, matching [ACTOR_SPRITE], [ACTOR_PORTRAIT] and [CANONICAL_MAP_SCREENSHOT].
Preserve exactly the identity, outfit, number of objects, mechanism attachment, river direction, spatial proportions, visual style, lighting, color palette and camera geography.
State AFTER the action: [END_STATE]. The cause/effect must be physically legible.
The character remains anatomically complete with both shoes visible and correct hand count. No morphing, duplicate props, vanishing gate parts, flipped water direction, inconsistent shadows, text, UI or watermark.
Output a single individual image, NOT a montage.
```

## PROMPT VIDEO — Google Flow / Veo

```text
Animate from the approved START FRAME to the approved END FRAME over [8–12] seconds.
Use the frames as hard spatial and identity anchors. The first frame shows [START_STATE]; the final frame clearly establishes [END_STATE].
00:00–00:25 duration fraction: establish location, actor and the obstacle.
00:25–00:65: action with causally coherent character movement and machine physics.
00:65–00:90: environment responds realistically; use precise water/wood/metal sound design and restrained camera motion.
00:90–01:00: complete the outcome, stabilize camera and hold for transition to the playable world.
Keep character costume, face, map, light direction, gate geometry and the whole prop inventory unchanged.
No character morphing, unexplained magic, camera teleportation, broken joints, hands, disconnected gears or reversed water flow.
Original ambience and SFX only; background music if requested. No baked-in captions or on-screen UI.
Output MP4 H.264/AAC, highest available quality, landscape 16:9, 24–30 fps. Do not degrade the approved original.
```

## Produksi Pasirluyu yang telah selesai

`startState`: Yanzen bersiap dan memutar roda di platform inspeksi kanan, dua pintu kayu masih rendah, sedikit air terlihat di hilir.
`endState`: satu sesi pengoperasian berakhir; pintu terangkat, arus air kuat mengalir menuju hilir; Yanzen berdiri lega.
`canonical`: `public/game/assets/characters/yanzen-gaits.png`, `public/game/assets/portraits/A01.png`, screenshot peta sungai aktif.
`style`: cinematic anime 2D, bukan pixel art.
`video`: milik pemilik game, 10 detik, native 910×512 / 30fps (bukan 1920×1080).

Untuk klip yang sudah dibuat, dua JPG referensi berasal dari timestamp asli video ±0,2s dan ±9,6s; keduanya **bukan** frame Gemini praproduksi. Pada misi mendatang lakukan dua generasi gambar dahulu, baru pemilik merender di Google Flow.
