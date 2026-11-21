# YZ Farm Life — Asset Library (categorized)

**2487 media entries, 1195 unique Git blobs.** Every media path is categorized into one index, without duplicating the underlying PNG/WAV. The folder structure below is a browseable **index**, not copies of legacy media; media that can be safely moved are organized physically under `public/game/assets/`.

| Category | Folder | Purpose |
| --- | --- | --- |
| Karakter dan sprite gerak | [characters](./characters/index.json) | Aktor, avatar, karakter dan konsep profesi |
| Potret dan ekspresi | [portraits](./portraits/index.json) | Ekspresi dialog dan ilustrasi konsep Bandung |
| Tanaman dan komoditas | [plants](./plants/index.json) | Sprite tahap tumbuh tanaman, tanaman prototipe |
| Hewan dan ternak | [animals](./animals/index.json) | Hewan domestik dan aset terkait |
| Peta, tile dan wilayah | [world](./world/index.json) | Peta Pasirluyu, Kota Bandung, kelurahan, lingkungan |
| Bangunan dan interior | [buildings](./buildings/index.json) | Bangunan, rumah dan desain interior |
| Properti lingkungan | [props](./props/index.json) | Perabot, objek kecil dan dekorasi |
| Alat dan tindakan | [tools](./tools/index.json) | Cangkul, penyiram, alat panen, ikon aksi |
| Antarmuka dan HUD | [interface](./interface/index.json) | Tombol, ikon, sampul dan menu |
| Audio dan suasana | [audio](./audio/index.json) | Musik, suara lingkungan, SFX, atmosfer malam |
| Cuaca dan efek | [environment](./environment/index.json) | Cuaca, partikel dan efek visual |
| Cerita dan misi | [stories](./stories/index.json) | Gambar jurnal dan adegan cerita |
| Pasar dan perdagangan | [commerce](./commerce/index.json) | Aset pasar, barang dan ikon toko |
| Sumber eksternal | [vendors](./vendors/index.json) | Aset dari vendor dengan catatan lisensi |

## Physical runtime folder example

```text
public/game/assets/
  characters/           # runtime walking actors
  portraits/             # 32 active A/C dialogue expression strips (legacy URLs preserved)
    bandung/
      neighborhood/      # 30 K character concepts
      specialists/       # 6 N character concepts
      civic/             # 2 P civic concepts
      residents/         # 179 R resident concepts
      professions/       # 32 work concepts
      phone/             # 19 phone concepts
  tiles/                # map tile and farm-kit
  pasirluyu/            # existing world resources
  residences/           # building artwork
  audio/                # active audio resources
  story/                # active journal imagery
```

## Access and production rules

1. **Runtime** loads only the assets needed for an active zone. The asset index and legacy packs must never be bundled into the game's initial scene.
2. **Legacy asset bundles** at `game-assets/yz-farm-life/{aset,atlas-bandung,bandung-151,explore-bandung}` retain their original media and relative reference paths (including TMJ/SQLite/ZIP). These are *indexed* by category but not mass-moved to protect their dependencies.
3. **Canon character source** stays at `game-assets/characters/gba-v2*/sheets/`; the 32 dialogue expressions remain at their original public URL to avoid breaking existing saves or integrations.
4. **Public Bandung concept artwork** is physically divided into six folders; use `bandungConceptPortraitPath(id)` from `src/lib/game/bandung-concept-portrait.ts` rather than concatenating raw URLs.
5. An asset can be **ACTIVE**, **FUTURE**, **REWORK**, or **DELETE**. Categorization is **not** visual approval; the quality audits remain in the catalog. Do not interpret 196 plant filenames as 196 unique species drawings.
6. **After committing media changes** run `npm run assets:index && npm run assets:categories`, then `npm run assets:index:check && npm run assets:categories:check && npm run test:game:assets`. Do not modify SQLite production, public DNS or release deployments in this refactor.
