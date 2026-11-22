# Pintu Air Pasirluyu — status impor MP4 pemilik

**22 November 2026**

## Yang sudah di repository

- `.agents/skills/yz-farm-cutscene/SKILL.md`: aturan dua frame, prompt, produksi video oleh pemilik, QA dan penerapan.
- `docs/game-dev/CUTSCENE_PRODUCTION_STANDARD.md`: format dan contoh baru.
- Dua thumbnail hasil ekstraksi video final: `public/game/assets/cutscenes/frames/sluice-start.jpg` dan `sluice-end.jpg`.
- Poster `public/game/assets/cutscenes/sluice-poster.jpg` dari frame final, menggantikan poster Remotion sebelumnya.
- `src/app/game/sluice-cutscene.tsx` kini memutar video pemilik (10 detik, H.264/AAC) tanpa fallback SVG lama. Tidak ada pemberian hadiah saat replay/skip.
- `game-assets/cinematics/pasirluyu-sluice/manifest.json`: metadata dan SHA256 sumber asli.
- Semua 23 sumber Remotion, renderer, dan potongan file lama dihapus dari branch; MP4 Remotion 320×180 yang lama juga sudah dihapus dari Git, bukan dipakai sebagai alternatif.

## Batasan impor yang masih perlu diselesaikan

GitHub Actions untuk mengunduh MP4 final gagal **sebelum runner menjalankan langkah pertama**. Tidak ada log pekerja. Oleh karena itu **file video asli 6.199.340 byte belum di-commit secara permanen sebagai blob tunggal GitHub**.

Preview Vercel pada branch ini memakai environment variable bersifat sementara `YZ_SLUICE_VIDEO_SOURCE_URL`, mengunduh **file pemilik yang cocok SHA256**, lalu menyematkan MP4 itu ke output statis hasil build. Ini membuktikan preview dapat memakai file yang tepat, **bukan** membuktikan MP4 sudah berada dalam riwayat GitHub. URL sumber itu dapat kedaluwarsa dan bukan solusi produksi permanen.

### Langkah final dari server/Codex yang memiliki autentikasi GitHub

Salin file yang diunggah pengguna ke mesin tempat `git push` terautentikasi, kemudian jalankan:

```bash
git fetch origin
git switch feat/sluice-user-video-cinematic-standard-20261122
git pull --ff-only

# Gunakan file asli milik pemilik, jangan re-encode.
node scripts/game-cinematics/import-owner-video.mjs --file /path/to/Man_operating_irrigation_mechanism_3e1dfd4f_1080p.mp4

git add public/game/assets/cutscenes/sluice-gate.mp4
npm run assets:index
npm run assets:categories
npm run cutscene:verify
npm run typecheck
npm run test:game

git add game-assets/catalog/asset-database.json game-assets/library
git commit -m "assets(game): permanently import owner-approved Pasirluyu 10-second cinematic"
git push origin feat/sluice-user-video-cinematic-standard-20261122
```

Konfirmasi di GitHub bahwa `public/game/assets/cutscenes/sluice-gate.mp4` benar-benar tampil berukuran **6.199.340 byte**. Setelah itu, Vercel preview boleh dibangun tanpa `YZ_SLUICE_VIDEO_SOURCE_URL` dengan mengembalikan build yang memverifikasi file lokal tanpa perlu download.

## QC

Video sumber terinspeksi: 910×512, 30 fps, 10 detik, audio AAC stereo, video H.264; SHA256 `6692a1a19cf1f466121bc0ba2dcec5e431bab1e9043f4103ca9e7804be105b20`. Jangan menyebutnya 1080p hanya karena nama berkas.

QA Safari iPhone nyata masih diperlukan; status build READY tidak menjamin suara atau fullscreen native pada semua versi Safari.
