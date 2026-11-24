# YZ Farm Life — World Scale & Proportion Contract v1.0

> **ATURAN MUTLAK TERBARU — 24 November 2026:** Semua aset game termasuk setiap frame animasi, setiap ekspresi NPC, tile, furnitur, bangunan, dan efek **wajib berupa file individual milik satu entitas**, tanpa spritesheet, atlas, sumber gambar gabungan, teknik cutting/cropping dari sheet, atau penggunaan file bersama lintas entitas/instance. Tidak boleh mengemas ulang ke atlas pada runtime. Baca [Atomic Assets & Yanzen Scale Standard](./ATOMIC_ASSET_AND_YANZEN_SCALE_STANDARD.md) dan skill [yz-farm-atomic-assets](../../.agents/skills/yz-farm-atomic-assets/SKILL.md). Kunci skala tubuh dan titik kaki Yanzen di semua animasi. Instruksi historis dalam dokumen ini yang menyarankan atlas, sheet, shared asset, atau cutting **tidak berlaku lagi**. Aset lama dimigrasikan bertahap dan tidak boleh dihapus sebelum QA/rollback.


**Keputusan pemilik:** 23 November 2026. **Status:** standar desain wajib sebelum redesain aset Pasirluyu. Ini bukan perubahan runtime dan tidak boleh dianggap QA visual selesai.

## Prinsip yang tidak boleh ditawar
1. **Satu ukuran karakter yang terasa sama di seluruh lokasi**: kebun, sungai, pasar, gang, rumah Yanzen, gudang, rumah NPC, dan toko. Kamera boleh zoom, tetapi proporsi dunia terhadap karakter tidak boleh berubah.
2. **Pisahkan ukuran frame dari karakter terlihat.** Sumber idle 24×32, gait/turn 32×40 pada codebase adalah *frame atlas*, bukan bukti tinggi tubuh berbeda. Ukur alpha bounds, foot-anchor, dan bounding box tubuh; frame dengan padding berbeda tidak boleh menyebabkan karakter membesar.
3. **Jangan memaksa aset besar ke map kecil.** Bangunan dan furnitur harus diawali footprint dalam tile, lalu artistik, baru exported runtime. Hindari kasur raksasa, peti sebesar pemain, pintu lebih kecil dari karakter, dan rak yang tidak mungkin dijangkau.
4. **Konsistensi indoor–outdoor diputuskan dengan reference board side-by-side pada zoom permainan asli**, bukan hanya screenshot PNG yang dibuka fullscreen. World perspective (exterior 3/4, interior top-down) boleh mengubah siluet, tetapi *perceived scale* benda tetap masuk akal.
5. **Jangan melakukan scaling nonuniform pada aset.** Jika gambar interior 320×320 diproyeksikan menjadi 232×244, faktor x=.725 dan y=.7625 tidak sama. Revisi artboard/aspect ratio atau gunakan letterbox/padding yang tetap mempertahankan rasio untuk konten dimensional; crop hanya dengan blueprint, bukan stretch.
6. **Anchor karakter = kaki di permukaan lantai/tanah.** Collider karakter adalah footprint kaki, bukan keseluruhan tinggi sprite. Posisi dekorasi, bed, bayangan, occlusion, dan z-depth mengikuti anchor yang sama di Canvas dan Phaser.
7. **Ground truth gameplay:** tile world 20×20 px; frame idle 24×32 px; animasi Yanzen gait/turn 32×40 px (cek kode aktual tiap revisi). Ukuran logis tidak sama dengan resolusi master. Jangan mengklaim karakter 40px lebih tinggi sebelum alpha-bounds diverifikasi.

## Proof of problem (kode pada 23 Nov 2026)
- `src/lib/game/phaser-world.ts` memuat `stage1.png` dengan frame 24×32, sedangkan `yanzen-gaits.png` dan `yanzen-turns.png` 32×40; actor mengubah texture bergantung animasi tanpa satu normalisasi visible-height eksplisit.
- `src/lib/game/world-layout.ts`: proyeksi interior 320×320 → 232×244; potongan `bed` 97×147 sumber → kira-kira 70×112 world px. **Ini ukuran crop, bukan ukuran kasur fisik terukur.**
- `model.ts` menggunakan koordinat collision dan interaksi yang wajib dipetakan terhadap kaki karakter serta furnitur visual.
- Jangan otomatis mengubah angka; ukur dahulu kotak alpha dan perspektif pada screenshot runtime.

## Referensi ukuran awal — HIPOTESIS yang harus dibuktikan lewat blockout
| Objek | Kesan yang dicari | Kandidat ukuran world-logical |
|---|---|---|
| Player | Konsisten ketika idle/jalan/memancing/interior | Target visible silhouette sekitar 24×32 px pada semua scene; frame sheet boleh berbeda |
| Pintu rumah | Jelas bisa dilalui, dekat jalan | Sekitar 1–1,5 tile bukaan jalan; tinggi visual mengikuti perspektif fasad |
| Kasur satu orang | Panjangnya wajar relatif tubuh, jalur samping cukup | Sekitar 2–2,5 tile lebar area dan 3,5–4,5 tile panjang pada denah; ukuran final berdasarkan alpha bounds dan perspektif, bukan formula buta |
| Meja kerja | Mudah dijangkau dan seimbang dengan kursi | Sekitar 2–3 tile lebar, bergantung jenis workstation |
| Rak/lemari | Melekat ke dinding, tidak menghalangi pintu | Berdasarkan footprint 1–2 tile kedalaman, bukan tinggi tampak |
| Area sirkulasi | Pemain bisa mendekati barang | Koridor minimal satu tile benar-benar walkable; ideal dua tile pada ruang komunal |

Dimensi contoh tidak boleh digunakan sebagai collision final tanpa QA visual dan jalur. Kasur tidak harus 112px tinggi hanya karena crop atlas saat ini sebesar itu.

## Tahap 0 — Scale Lab (wajib, sebelum regenerasi)
1. Render satu **reference sheet di engine** yang memuat karakter idle, berjalan, memancing, NPC, kasur, kursi, meja, peti, pintu dan satu tile 20px.
2. Bandingkan karakter di **outdoor, indoor rumah, gudang, rumah NPC** pada zoom **logis yang sama**, juga screenshot aktual mobile setelah kamera zoom.
3. Ukur `visibleAlphaBounds`, `groundAnchor`, `displayBoundingBox`, `footprintTiles`, `collisionTiles`, `zFootY` tiap objek.
4. Tetapkan **single scale contract** dalam data; renderer Canvas/Phaser membaca referensi sama; animasi tak mengubah ukuran manusia terlihat.
5. Buat *silhouette blockout* tanpa ilustrasi final (rumah, gudang, kamar) dan uji jalur tidur, simpan alat, pintu, serta posisi dekorasi.
6. Terima hasil setelah side-by-side disetujui pemilik; **baru** buat/ganti master seni HD.

## Pilot redesign Pasirluyu
- **Pilot 1:** karakter Yanzen di kebun vs rumah vs gudang pada tampilan logis yang sama.
- **Pilot 2:** denah interior rumah Yanzen: kasur, meja kerja, lemari, peti, dan jalur lantai (termasuk collision, prompt dan z-depth).
- **Pilot 3:** exterior rumah Yanzen, halaman, sambungan jalan ke gudang dan pintu; landasan bangunan harus menapak.
- **Pilot 4:** gudang dan interior sesudah standar kasur/rumah lolos.
- Berikutnya: rumah warga dan gang → Ayu/Widi/Inggit/pasar → sungai/pintu air (pertahankan aset landmark bagus) → kebun/plot/vegetasi → polish lingkungan dan UI.

## Gate QA dan bukti wajib
- Tidak ada perubahan ukuran karakter yang terlihat saat pindah scene, idle/jalan atau aksi.
- Perabot masuk akal terhadap avatar, tidak terlalu dominan, cocok dengan layout ruang dan aktivitas.
- Perabot punya collision dan depth terpisah dan dapat didekati; kasur dapat dipakai tanpa pemain berdiri di atasnya.
- Tidak ada stretch rasio, pixel smear, checkerboard; ukuran final dinilai pada viewport game, bukan master.
- Semua pintu terhubung ke jalan; karakter, NPC dan camera tidak clipping; kompatibel dengan save lama.
- Screenshot target: field beside house, interior beside bed/desk, shed beside toolrack, one resident interior, mobile plus desktop, idle and moving, day/night; Canvas dan Phaser setara.
- Uji typecheck, test:game, no broken references, before/after, QA manual. Tolak merge jika salah satu hard fail.

## Prioritas keputusan
**P0** konsistensi visible-height karakter dan ukur furnitur. **P0** blockout rumah Yanzen. **P1** perbaikan render furniture/collision, pintu dan jalan. **P1** desain gudang. **P2** pasar/gang/sungai/kebun, dengan audit sebelum regenerate.

Dokumen ini melengkapi `YZ_VISUAL_IDENTITY_BIBLE.md` dan `ASSET_REDESIGN_LIFECYCLE.md`; tidak menggantikan keduanya.
