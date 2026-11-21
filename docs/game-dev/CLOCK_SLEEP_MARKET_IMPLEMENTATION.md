# YZ Farm Life — Clock, Sleep & Market Polish

Owner: ChatGPT · Feature branch: `feat/game/clock-sleep-market-chatgpt-20261121` · Base: `3330580b90a75f194f7f96b5e48326b7e1945c4e`

## Observasi dan akar masalah

- Game menggunakan jam berbasis **aksi**, bukan timer real-time. Sebelum perubahan, 4 langkah outdoor = 1 menit dalam game dan rata-rata pekerjaan kebun = 3 menit. Ketika peta membesar, ini membuat pemain mencapai malam terlalu cepat.
- Tidur sebelumnya memanggil `nextDay` serta `persist` segera, bersamaan dengan overlay teks 1,8 detik; tidak terlihat urutan bersiap–malam–bangun.
- Area paving pasar sebelumnya di-clip pada `x=40,y=120,w=600,h=180`, sehingga kiri dan bagian atas/bawah masih menyisakan ruang rumput. Memang bukan satu kotak utuh yang mencapai tepi.

## Perubahan implementasi

1. `WALK_STEPS_PER_MINUTE=16` dan `FARM_ACTION_MINUTES=1` pada model. Berjalan, bekerja, dan memancing tetap menambah waktu secara deterministik; diam, memeriksa dialog dan membuka YZ Phone **tidak** menjalankan timer game. Jam tetap berhenti maksimal pukul 22:00; tidur di kasur saja dapat mengganti hari. Existing saves `version:1` tetap kompatibel; `walkingSteps` lama masih valid sebagai sisa langkah.
2. Tidur melalui konfirmasi kasur memulai fase `settling` (0–650 ms), `night` (650–1550 ms), dan `morning` (1550–3100 ms). Kontrol dikunci; layar memperlihatkan kamar pixel-art dengan bantal, karakter rebah, selimut dan redup cahaya. **Save dan nextDay diterapkan ketika malam beralih pagi, bukan pada awal animasi.** Timer dibersihkan saat unmount. Tidak ada eksplorasi/aktivitas waktu ketika UI terbuka.
3. `MARKET_PLAZA` berbentuk persegi panjang dari `x=0` sampai `x=640`, `y=90` sampai bawah `y=320`. Pola ubin mengisi sampai kedua batas; tepi atas ditutup curb. Jalur menuju Gang Pasirluyu dan jalur utama tengah tidak dipasangi collider tambahan.
4. 10 sprite pixel-art original dan 13 penempatan baru di sisi pasar, meliputi gerobak sayur, kanopi buah, meja ikan, rak bibit, peti, karung, lampu, timbangan, keranjang ikan dan pot. Render tetap menggunakan `outdoorObjects` bersama sehingga **Phaser maupun Canvas** menerima dekorasi yang sama. Aset PNG dibuat lewat `scripts/game-assets/generate-market-decor.mjs`; tidak memakai aset pihak ketiga.

## Kriteria QA wajib

- `npm ci && npm run test && npm run typecheck && npm run test:game && npm run build`
- Jalankan `node scripts/game-assets/generate-market-decor.mjs` pada salinan kerja yang bersih untuk memastikan determinisme byte; setelah itu `git diff --exit-code -- public/game/assets/tiles/farm-kit/market`.
- Game: 15 langkah sukses tidak mengubah menit, langkah ke-16 tambah 1 menit; aksi kebun tambah 1 menit; tidur tetap memerlukan posisi kasur dan hari baru tersimpan.
- Peta: plaza menyentuh kedua ujung, pemeriksaan jalan kanan-kiri, jalur portal (pasar→gang), pedagang dan NPC tidak tertutup visual/collision; cek tampilannya pada desktop dan layar sentuh 390×760.
- Uji pengalaman sesungguhnya dengan akun login untuk memastikan `PUT/GET /api/game/save` sukses; buka kembali game setelah tidur. Build saja tidak memvalidasi runtime akun.
- Tes visual aset harus memastikan semua PNG muncul dan tidak tertutup berlebihan. Aset sederhana berukuran kecil; evaluasi estetika pixel art perlu ulasan manual.

## Koordinasi ChatGPT × Codex

Lihat PR #29 `AGENTS.md` dan `docs/ai/SYNC_PROTOCOL.md` (masih menunggu merge saat branch dibuat). Jangan merge PR ini bersamaan dengan PR lama yang menyunting `model.ts` atau `modular-outdoor.ts` tanpa rebase/review. **Jangan mengubah Smart Farm, Supabase RLS, DNS, production, atau Docker** melalui PR game ini.

## Handoff

- Produk: GAME · Owner: ChatGPT.
- Status awal: `NEEDS_TEST` sampai build staging dan tes manual dinyatakan lulus.
- Target integrasi: PR ke `main` (game masih terintegrasi web; pemisahan subdomain adalah rencana terpisah).
- Rilis production: hanya berdasarkan persetujuan eksplisit pengguna setelah smoke test.
