# YZ Farm Life — Open Source GitHub Toolkit v1.0
**Tanggal audit:** 19 November 2026
**Kebijakan:** Pertahankan engine Canvas/React yang sudah bekerja. Gunakan tool gratis berlisensi jelas, impor hanya aset yang relevan, dan jangan menggandakan subsistem tanpa kebutuhan terukur.
**Status:** Branch pengembangan; belum di-merge ke main dan belum di-deploy production.

## 1. Tool yang sudah bisa digunakan

### Tiled Map Editor — `mapeditor/tiled`
- Repository: https://github.com/mapeditor/tiled
- Lisensi aplikasi editor: GPL-2.0-or-later. **Konten peta yang kita buat tidak otomatis menjadi GPL.**
- Integrasi yang sudah tersedia di GitHub:
  - `game-assets/tiled/pasirluyu-master.tmj` — template editable (48×48 tile pada 20px/tile), dengan object layer pembagian chunk, 6 portal antarkawasan, dan 5 rintangan berstatus terkunci.
  - `game-assets/tiled/pasirluyu.world` — project world yang menunjuk map tersebut.
  - `scripts/game-world/export-tiled.mjs` — generator deterministik yang membaca `src/lib/game/model.ts`.
- Cara memakai: unduh/install Tiled dari sumber resmi; buka file `.world` atau `.tmj`. Tambahkan tileset, layer jalan, plang, terrain dan dekorasi melalui editor. Jangan mengubah objek portal/blocked routes sembarangan karena berasal dari data runtime.
- Alur sinkronisasi: `npm run tools:tiled:export` menghasilkan file template; `npm run tools:tiled:check` memastikan template tetap sesuai model. **Catatan:** mengedit objek dalam `.tmj` saja tidak otomatis mengubah runtime; diperlukan importer/review sebelum menjadi sumber peta gameplay.
- Batas saat ini: Tiled tidak otomatis mengekspor satu seamless Kota Bandung. Prototipe Pasirluyu masih 4 kawasan aktif, dan engine masih memakai map Canvas. Proyek `.tmj` adalah blueprint visual dan metadata editor yang bisa dipoles bertahap.

### Kenney UI Pack — Pixel Adventure (CC0)
- Resmi: https://kenney.nl/assets/ui-pack-pixel-adventure
- Kode sumber mirror: https://github.com/shorepine/kenney/tree/3694c6879e487c108f55677be7dd2ca75b07cc3b/ui/UI%20Pack%20-%20Pixel%20Adventure
- Lisensi: CC0 1.0, lisensi sumber disertakan di `game-assets/vendor/kenney-ui-pixel-adventure/LICENSE.txt`.
- Diambil **16 file PNG 16×16** dari varian *Small tiles / Thin outline*, ditahan sebagai vendor reference di `game-assets/vendor/kenney-ui-pixel-adventure/`. Metadata sumber ada di `manifest.json`.
- Rencana: review visual untuk panel dialog, tombol kecil, jendela YZ Phone, dan kartu konteks sebelum melakukan compositing atau masuk ke `public/game/assets/ui`.
- Tidak seluruh pack diimpor dan **belum satu pun sprite baru ini tampil di game**.
- Peningkatan keamanan/pencatatan: `game-assets/catalog/sources.json` telah diperbarui dan `npm run assets:audit` memvalidasi sumber dan PNG.

## 2. Tool GitHub yang direkomendasikan, belum di-install ke runtime

| Tool | GitHub | Lisensi | Kebutuhan | Keputusan |
|---|---|---|---|---|
| Tween.js | https://github.com/tweenjs/tween.js | MIT | easing gerak/animasi UI/camera | Belum dipasang; lihat dulu kekurangan WalkPath/Footwork |
| Howler.js | https://github.com/goldfire/howler.js | MIT | ambience, stereo/SFX | Belum dipasang; `FieldAudio` sudah memakai Web Audio dengan iOS unlock |
| EasyStar.js | https://github.com/prettymuchbryce/easystarjs | MIT | A* dan cost per tile | Belum dipasang; BFS kini cukup untuk area 24×16 |
| LDtk | https://github.com/deepnight/ldtk | MIT | editor alternatif tilemap & entity | Tidak paralel dengan Tiled, agar tidak mempunyai dua sumber map |
| LibreSprite | https://github.com/LibreSprite/LibreSprite | GPL-2.0 | menggambar/animasi sprite | Dapat di-install terpisah oleh pembuat aset; bukan runtime dep |
| Free Game Dev Assets | https://github.com/TMHSDigital/Free-Game-Dev-Assets | campuran | katalog riset aset | Setiap aset harus diperiksa lisensi asalnya |

**Mengapa tidak langsung `npm install` semua?**
Karena itu menambah bundle, dependency maintenance, dan risiko incompatibility tanpa menambah gameplay. Sebagai contoh, duplikasi Howler+FieldAudio dapat menghasilkan dua AudioContext dan pengendalian mute yang tidak konsisten pada iPhone. EasyStar perlu diuji dibanding BFS yang sekarang sudah ada. Tween.js harus dipilih untuk satu animasi yang memang membutuhkan easing, bukan sekadar terpasang.

## 3. Tool dan aset yang ternyata sudah kita miliki
- `FieldAudio` — efek suara dan ambience berbasis Web Audio.
- `WalkPath`, `Footwork` — langkah dan transisi sprite karakter.
- `tap-navigation` — BFS pathfinding saat mengetuk peta.
- `game-assets/vendor/kenney-tiny-town` dan `.../kenney-rpg-urban-pack` — Kenney CC0, sumber telah dicatat; **jangan download ulang**.

## 4. Perintah cek
```sh
npm ci
npm run tools:tiled:check
npm run tools:github:check
npm run assets:audit
npm run typecheck
npm run test:game
npm run build
```

## 5. Backlog implementasi estetika YZ Farm Life
1. **P0:** sederhanakan HUD; jurnal default tertutup dan seluruh bantuan penggunaan di YZ Phone.
2. **P0:** plang interaktif berbasis entity, bukan label teks terus-menerus di atas peta. Satu nama lokasi baru terlihat saat diperiksa.
3. **P1:** ubah peta artistik yang sekarang menjadi Tiled berlapis, pastikan jalan dan sungai mulus pada tiap batas chunk.
4. **P1:** uji optimalisasi gerak & kamera pada Safari iPhone (jitter, tap delay, reduced-motion).
5. **P1:** review 16 aset UI yang telah diambil dalam perbandingan 1:1 dengan font, tombol dan panel existing; jangan campur beberapa gaya.
6. **P2:** nilai apakah Tween.js, Howler.js atau EasyStar.js benar-benar diperlukan setelah profiling pada perangkat nyata.

## 6. Kriteria penerimaan
- Sumber tool/lisensi tercatat dan akses HTTPS valid.
- File master Tiled dihasilkan dari model dan bisa dibuka oleh Tiled.
- Sprite Kenney baru berasal dari commit yang dipin; lisensi CC0 jelas dan PNG benar 16×16.
- Tidak ada perubahan save game, RLS, data farm keuangan, map live, atau engine.
- Test game lama tetap lulus; produksi dilakukan setelah review visual.
