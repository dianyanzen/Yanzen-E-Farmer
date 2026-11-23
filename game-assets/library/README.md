# YZ Farm Life — Asset Library (categorized)

**Indeks gabungan (23 November 2026): 2.499 media, 1.205 konten Git unik.** Jumlah dinamis yang benar berada di [`index.json`](./index.json) dan [`asset-database.json`](../catalog/asset-database.json); angka historis pada catatan pemangkasan aset 21 November bukan jumlah sekarang. Setiap berkas dikategorikan pada satu indeks tanpa menggandakan PNG/WAV asli. The folder structure below is a browseable **index**, not copies of legacy media; media that can be safely moved are organized physically under `public/game/assets/`.

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
  portraits/             # 32 strip ekspresi A/C tersimpan; hanya 5 NPC playable di Pasirluyu saat ini
    bandung/
      neighborhood/      # 30 K character concepts
      specialists/       # 6 N character concepts
      civic/             # 2 P civic concepts
      residents/         # 179 R resident concepts
      professions/       # 32 work concepts
      phone/             # 19 phone concepts
  tiles/                # map tile, farm-kit, dan atlas toko Ayu/Widi
  pasirluyu/            # existing world resources
  residences/           # building artwork
  audio/                # active audio resources
  story/                # gambar jurnal aktif
  fish/                 # lele dan nila untuk memancing sungai
  quests/               # 5 properti misi aktif
  cutscenes/            # poster dan 2 frame pintu air (MP4 asli belum ada di Git)
```

## Access and production rules

1. **Runtime** loads only the assets needed for an active zone. The asset index and legacy packs must never be bundled into the game's initial scene.
2. **Legacy asset bundles** at `game-assets/yz-farm-life/{aset,atlas-bandung,bandung-151,explore-bandung}` retain their original media and relative reference paths (including TMJ/SQLite/ZIP). These are *indexed* by category but not mass-moved to protect their dependencies.
3. **Sumber sprite 32 karakter legacy/aktif** berada di `game-assets/characters/gba-v2*/sheets/`; 32 strip ekspresi dialog tetap pada URL lama untuk kompatibilitas, tetapi **bukan berarti 32 tokoh sudah playable**. Identitas resmi 248 warga mengikuti roster canonical terpisah; saat ini hanya lima NPC aktif.
4. **Public Bandung concept artwork** is physically divided into six folders; use `bandungConceptPortraitPath(id)` from `src/lib/game/bandung-concept-portrait.ts` rather than concatenating raw URLs.
5. An asset can be **ACTIVE**, **FUTURE**, **REWORK**, or **DELETE**. Categorization is **not** visual approval; the quality audits remain in the catalog. Do not interpret 196 plant filenames as 196 unique species drawings.
6. **After committing media changes** run `npm run assets:index && npm run assets:categories`, then `npm run assets:index:check && npm run assets:categories:check && npm run test:game:assets`. Do not modify SQLite production, public DNS or release deployments in this refactor.
