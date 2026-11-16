# Perolehan, Audit Lisensi, dan Integrasi Aset Game

## Character Pack v2 — 16 November 2026

Katalog karakter kini berjumlah **32**: A01 satu-satunya main character, A02–A16 dan C01–C16 adalah 31 NPC. Lihat [paket A](../../game-assets/characters/gba-v2/README.md), [ekspansi C beserta manifest, prompt, asal/lisensi dan audit QA](../../game-assets/characters/gba-v2-c/README.md), [galeri C](../../game-assets/characters/gba-v2-c/PREVIEW.md) dan [katalog pemeran gabungan](../../game-assets/catalog/cast.json). C15 mempertahankan kursi roda pada semua pose. Sheet disimpan di katalog aset, belum dipasang ke runtime. Inventaris 32 referensi privat tetap dipisahkan dari keluaran sprite.

Pemeriksaan paket: `node scripts/game-assets/verify-character-pack.mjs`. Catatan QA membedakan hasil visual yang sudah diperiksa dari normalisasi piksel, pivot dan animasi yang masih diperlukan sebelum integrasi game.

> **Status koleksi:** sumber telah dikurasi, file biner pihak ketiga **belum** diunduh atau dipasang ke game. Dilarang mengklaim aset sudah digunakan sebelum status manifest diperbarui.

## Pemisahan tiga tingkat

```text
PRIVATE GOOGLE DRIVE / ART WORKSPACE
  └─ 32 character reference sheets A01–A16 & C01–C16 (never commit originals)

GAME-ASSETS PRIVATE STAGING (gitignored)
  ├─ _downloads/     verified CC0 source ZIPs
  ├─ _staging/       inspected extracted PNGs/credits
  └─ _originals/     source PSD/ASE/Pixelorama project files

CC0 VENDOR SOURCES (tracked, verified by source license)
  └─ game-assets/vendor/kenney-tiny-town/ and kenney-rpg-urban-pack/

PUBLIC/SAFE OUTPUT FOR GAME (tracked only after review)
  └─ public/game/assets/
      ├─ tiles/       trimmed and optimized terrain PNGs + atlas metadata
      ├─ characters/  approved game sprites (NOT visual reference sheets)
      ├─ portraits/   resized and approved expression portraits
      ├─ ui/          UI sprites
      └─ audio/       compact original or CC0 audio
```

## Syarat sebelum aset ditambahkan
1. Sumber **dari kreator asli** atau host resmi yang jelas.
2. Jenis lisensi dan pembatasan **dibaca dari file LICENSE dalam paket** serta halaman sumber, jangan hanya percaya nama "free".
3. Periksa apakah izin komersial dan penggubahan ada; jika ada larangan redistribusi pack, jangan publikasi ZIP mentah ke repository/CDN.
4. Simpan metadata: ID katalog, author, URL, timestamp pemeriksaan, lisensi, SHA-256, filename sumber, file yang dipilih, reviewer.
5. Periksa isi ZIP agar tidak ada symlink/path traversal, berkas executable/script asing atau payload besar; jangan otomatis mengeksekusi file di arsip.
6. Buka PNG untuk validasi perspektif, ukuran 16×16, pixel-crisp, transparansi, warna, dan kecocokan dengan style guide.
7. Bila digunakan, hanya commit keluaran yang diperlukan dengan izin yang jelas. Simpan file asli hanya di direktori privat.
8. Sertakan daftar kredit rilis untuk semua sumber (bahkan CC0 secara sukarela) dan dokumentasikan modifikasi material.
9. Penggantian aset harus diikuti QA proporsi, collision, urutan layer, dan frame index.
10. Tidak ada impor ke domain production sampai melalui preview/PR review.

## Lisensi yang dipilih
- **CC0**: umum untuk penggunaan komersial, modifikasi dan distribusi. Namun verify juga hak pihak ketiga yang mungkin melekat pada konten; catat kreator dan sumber.
- **CC BY 4.0**: dapat dipertimbangkan tetapi butuh atribusi yang layak termasuk perubahan dan link lisensi.
- **Custom gratis komersial tetapi no resale/no redistribution of the pack**: dapat dipakai sebagai *embedded game artwork* sesuai persyaratan, tetapi **jangan mirror file ZIP/PNG pack** ke repo publik; inspeksi LICENSE.txt paket sebelum memutuskan ekspor final.
- **Non-commercial / unclear / third-party rip / Nintendo/Harvest Moon sprite**: dilarang dimasukkan ke game publik.

## Cara memakai katalog
```bash
# Audit metadata, 32 karakter, id unik, lisensi, status dan path
node scripts/game-assets/verify-catalog.mjs

# Mengambil salah satu source pack CC0 langsung dari host aslinya
# Perintah ini MEMERLUKAN akses internet di komputer developer
node scripts/game-assets/fetch-cc0-crops.mjs --accept-cc0

# Hasil masuk ke game-assets/_downloads (gitignored), bukan runtime.
```
Jika unduhan gagal karena akses host, **catat hasilnya dan unduh manual dari halaman sumber**. Jangan memakai mirror tanpa bukti lisensi.

## Status impor binary (16 November 2026)
- Kenney Tiny Town: `game-assets/vendor/kenney-tiny-town/tilemap.png`, `tilemap_packed.png`, `preview.png` + `LICENSE.txt`. Provenance: official `https://kenney.nl/assets/tiny-town`, binary source mirror `https://github.com/GeorgeQLe/assets-2d-city`. License CC0.
- Kenney RPG Urban Pack: `game-assets/vendor/kenney-rpg-urban-pack/tilemap.png`, `tilemap_packed.png`, `sample.png`, `tilemap.txt` + `LICENSE.txt`. Provenance: `https://kenney.nl/assets/rpg-urban-pack`, same mirror. License CC0.
- These are **source assets in repo**, not yet loaded by gameplay. The rest of the pack downloads and all reference character originals remain external/private.

## Langkah kerja sprite nyata
- **Characters:** buat animasi 4 arah dari 32 reference visuals: sebuah NPC minimal idle + 4-frame walk tiap arah. Gunakan nama fiktif/roles baru dan hindari simbol kelembagaan bawaan reference sheet.
- **Farm tiles:** cocokkan layer tanah, tanah basah, aliran air, bedengan, ajir timun. Bandingkan crop animation (5 tahap) dengan state prototype (0–3); buat adapter yang terdokumentasi tanpa merusak game save.
- **Atlas:** satu PNG/JSON per cluster scene, penggunaan nearest-neighbor di semua renderer.
- **Audio:** audio pendek untuk tiap UI action; cek lisensi musik secara terpisah.
- **Phone UI:** gunakan subset Kenney CC0 hanya bila bahasa bentuk selaras; interaction logic React tetap buatan proyek.

## Provenance ledger per file (template)
```json
{
  "assetId": "oga-farming-crops-16",
  "original": "FarmingCrops16x16.zip",
  "sourceUrl": "https://opengameart.org/content/farming-crops-16x16",
  "author": "josehzz",
  "license": "CC0-1.0",
  "checkedOn": "2026-11-16",
  "sourceSha256": "FILL_AFTER_REAL_DOWNLOAD",
  "derivedGameFile": "public/game/assets/tiles/crops.png",
  "derivedSha256": "FILL_AFTER_FINAL_EXPORT",
  "changes": "Crop+repalette, keep pixel grid 16x16",
  "reviewStatus": "NOT_STARTED"
}
```

## Re-review triggers
New pack revision, change in intended use (paid distribution), license discrepancy between webpage/archive, prior pack removed, or evidence ownership questioned -> block integration and request new legal/art review.
