# Riwayat Audit YZ Farm Life

> Log **append-only secara konseptual**: jangan menghapus temuan lama atau mengubah fakta tanggal lampau. Jika temuan salah, tambahkan koreksi bertanggal dengan bukti. Rujuk [GAME_AUDIT_MASTER.md](GAME_AUDIT_MASTER.md) dan [AUDIT_PLAYBOOK.md](AUDIT_PLAYBOOK.md).

## 2026-11-21 — Audit baseline v1.0 (ChatGPT, static + Vercel metadata)

**Sumber:** GitHub `main` `3330580b90a75f194f7f96b5e48326b7e1945c4e`; PR #30 `e12b0daf55f243b11690782e41a6374b6665b81d`; Docker `develop/yz-farm-life` `7e386f38ed9ef35be29258bedaf573d1896e5dc2`; snapshot PR #29.

**Bukti teramati:** 32 karakter dalam `cast.json` (31 NPC desain), 5 `NPCS` aktif, 5 interior rumah, 30 kecamatan + 151 kelurahan registri, 1 kelurahan dengan zona playable, 4 zona outdoor, 44 tool metadata (3 active), 428 media publik ±40,45MB; loader gambar ada di React dan Phaser; build otomatis tidak memanggil UI test/lint; RLS save web di Supabase terpisah dari Docker. PR #30 build preview `READY` serta log tes model/typecheck/game PASS; alias production menunjuk commit lain.

**Dihasilkan:** [GAME_AUDIT_MASTER.md](GAME_AUDIT_MASTER.md) dengan 35 temuan bernomor G-001…G-035 dan [AUDIT_PLAYBOOK.md](AUDIT_PLAYBOOK.md) dengan 28 skenario fungsional F-01…F-28.

**Keterbatasan:** Belum ada uji gameplay interaktif terautentikasi maupun screenshots/performance traces pada perangkat, sehingga kekurangan UI/bentuk visual dan dampak FPS masih `NEEDS_MANUAL_QA`. Belum menguji server Docker langsung. Tidak ada klaim bahwa semua 35 adalah bug; banyak merupakan gap konten dan release gate.

**Dampak pada source/deploy:** Dokumentasi saja. Tidak ada perubahan game, Supabase, Vercel aliases, DNS, atau data kebun.

**Rencana tahap berikut:** 1) QA progres dua akun (G-001/G-002), 2) collision pasar (G-011), 3) UX tidur/jam (G-006/G-007), 4) profil loading/kamera mobile (G-027/G-028), 5) CI UI dan audit aset (G-032).

---

## Template entri audit berikutnya

### YYYY-MM-DD — [Judul audit] · [owner]

- Target: `branch` / `SHA lengkap` / `deployment URL`
- Perbandingan dengan audit terakhir:
- ID baru / perubahan status / status yang dipertahankan:
- Observasi + bukti (kode/log/repro/screenshot):
- Tes: `PASS`, `FAIL`, `NOT_RUN` beserta perintah dan environment:
- Risiko/dampak game/Smart Farm:
- Action/PR/commit:
- Syarat verifikasi selanjutnya + owner:
- Pencatatan koreksi temuan lampau (jika ada):

Jangan menulis `FIXED` tanpa SHA dan hasil tes sesuai temuan. Status `READY` deployment hanya lulus sistem build/deploy, bukan otomatis QA akun atau game feel.
