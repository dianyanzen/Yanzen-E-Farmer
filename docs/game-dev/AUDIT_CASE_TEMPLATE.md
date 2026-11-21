# Template temuan audit YZ Farm Life

Salin ke GitHub Issue atau komentar Pull Request. **Selalu cek ID di [GAME_AUDIT_MASTER.md](GAME_AUDIT_MASTER.md) sebelum membuat ID baru.**

## Identitas
- Audit ID: G-0XX
- Kategori: SAVE / INPUT / CLOCK / SLEEP / MAP / NPC / GAMEPLAY / ART / PERFORMANCE / AUDIO / BUILD / SECURITY / DOCS
- Produk: WEB / DOCKER
- Branch + SHA lengkap:
- Deployment dan URL:
- Versi browser / perangkat / viewport:
- Owner: ChatGPT / Codex / developer
- Status: CONFIRMED_CODE / CONFIRMED_RUNTIME / NEEDS_MANUAL_QA / SUSPECTED / DESIGN_GAP / FIXED_IN_PR / VERIFIED / DEFERRED
- Keyakinan (%):
- Prioritas P0/P1/P2/P3:
- Release gate? YA/TIDAK

## 1. Observasi
Gejala dan bukti kode/log/video/screenshot, koordinat map, waktu game. Jangan membuat klaim runtime bila hanya lihat source.

## 2. Analisis penyebab
File + fungsi + data + hasil reproduksi. Penyebab langsung versus faktor sistemik.

## 3. Tingkat keyakinan (%)
Beri alasan untuk setiap hipotesis.

## 4. Alternatif kemungkinan
Apa lagi yang dapat menjelaskan gejala? Uji untuk membedakannya.

## 5. Rekomendasi tindakan
Patch terkecil, rencana uji, dependensi, perubahan aset dan konsekuensi backward compatibility.

## 6. Dampak terhadap produksi
Pengalaman pemain, progres/save, kemudahan akses, FPS/memori, aset/biaya operasi, **bukan** dampak ke panen kebun nyata kecuali ada bukti kode yang menyentuh Smart Farm.

## 7. Prioritas tindakan
P0–P3; alasan dan blokade rilis bila ada.

## Verifikasi
- Reproduction steps:
- Expected vs actual:
- Automated tests, command dan status:
- Manual PC/mobile tests:
- Screenshot/trace URL:
- File diubah:
- PR URL + base/head SHA:
- CI/staging/prod masing-masing:
- Rencana rollback:
- Keputusan pemilik:
- Bukti untuk menandai `VERIFIED`:
