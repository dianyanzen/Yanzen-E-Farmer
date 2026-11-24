> **Implementasi bertahap — 23 November 2026:** Loop inti memancing V2 kini tersedia di cabang `feat/fishing-wait-bite-animation-20261123`. Ini menggantikan perilaku lama yang selalu langsung menangkap ikan. Bagian spekulatif seperti mini-game tegangan tali multi-input, bobot per ikan, variasi cuaca serta koleksi spesies lain **belum diterapkan** dan tetap menjadi pengembangan lanjutan. Dokumen lama di bawah ini adalah rancangan awal, bukan seluruhnya klaim fitur sudah aktif.

## Implementasi yang dapat diuji sekarang

- **Alur gameplay:** `CASTING` (560 ms) → `WAITING` (4.800–9.199 ms waktu nyata) → `BITE` (jendela tekan A/E 1.700 ms) → `REELING` (animasi otomatis 1.750 ms) → hasil.
- **Peluang:** 80% lemparan mendapat sambaran; 20% tidak ada sambaran. Bila bereaksi tepat, peluang berhasil 70% dan ikan dapat lepas 30%. Menarik sewaktu menunggu = terlalu awal; melewati jendela = terlambat. Angka awal untuk playtest, bukan jaminan tangkap.
- **Visual:** joran melenting pada lemparan, senar dan pelampung berayun, lingkar riak sungai, sambaran yang terlihat, percikan dan tarikan senar. Semua dirender di dalam canvas viewport via overlay DOM/CSS yang tidak menutupi kontrol game; `prefers-reduced-motion` didukung.
- **Ikan sungai:** lele dan nila. Sprite menggunakan aset **yang sudah dimiliki dalam vault game** dan dibuat tersedia di `public/game/assets/fish/`. Bandeng, belanak dan kakap putih adalah stok legacy yang dapat dijual tetapi tidak muncul sebagai hasil mancing Sungai Pasirluyu.
- **Statistik:** jumlah lemparan, sambaran, meleset, lepas, tanpa sambaran, total tangkap, dan catatan per spesies di **YZ Phone → Statistik**. Catatan `caughtBySpecies` dimulai setelah migrasi; tidak merekayasa jumlah masa lalu.
- **Save:** waktu tunggu dan ikan yang belum ditangkap tidak disimpan permanen. Reload membuang `line` legacy secara aman; hasil baru dicatat tepat satu kali lewat session ID saat selesai. Umpan tetap dikonsumsi pada lemparan yang sah. Menyembunyikan tab atau Esc membatalkan percobaan.
- **Batasan:** animasi berada pada overlay world, bukan animasi rangka tubuh Yanzen yang menyatu sepenuhnya dengan Phaser. Mekanisme tegangan tali interaktif 2–3 detik, bobot, rarity, dan suara pemancingan khusus belum dirilis.

**Tes:** `node tests/game-fishing-v2.mjs`, `npm run test:game`, dan pemeriksaan Playwright antarmuka. Keadaan hasil ditentukan RNG eksplisit di `src/lib/game/fishing-session.ts`; timer aktif di `game-client.tsx`.

---

# Fishing Experience V2 — YZ Farm Life
**Status:** spesifikasi implementasi / belum playable. Diperiksa terhadap `src/lib/game/model.ts`, `src/app/game/game-client.tsx`, dan `src/lib/game/field-engine.ts` pada 22 November 2026.

## Audit runtime yang ada
- `castRod` langsung memilih spesies setelah lemparan, memotong umpan dan menambah 2 menit dalam game.
- `reelFish` selalu menambah hasil tangkapan; belum ada bite timer, kesalahan timing, ikan lepas, animasi joran/pelampung, atau statistik per spesies.
- Save v1 menyimpan `fishing: {bait,fish,line,caught,sold,seedPacks,cropsSold}`. Jangan merusak slot lama, harga dan stok ikan lama.
- `fish-market.png` berisi tiga ikan hasil dagangan. Aset ikan lokal `lele.png` dan `nila.png` tersedia di perpustakaan (perlu QA sebelum dipakai runtime).
- Sungai Pasirluyu di Bandung bukan pesisir. Ikan laut dari sistem lama tetap dapat dijual sebagai stok kiriman, bukan target lempar sungai baru.

## Loop permainan yang direkomendasikan
```
IDLE -> CASTING -> WAITING -> BITE_WINDOW -> HOOKED -> LANDED
                                |              |
                                |              +--> ESCAPED
                                +--> MISSED / TOO_EARLY
         WAITING -------------------> NO_BITE / CANCELLED
```
- `CASTING`: 0,4–0,7 detik, gerak joran dan suara lempar. Umpan dikonsumsi sekali pada lemparan sah.
- `WAITING`: acak 4–14 detik **waktu nyata**, tidak dimunculkan sebagai countdown. Pelampung bergoyang kecil; riak dan suara air berlanjut. Pengaruh cuaca/waktu baru setelah memiliki tes deterministik.
- `BITE_WINDOW`: pelampung tenggelam dan audio penanda. Jendela reaksi awal 1–1,5 detik, bisa diseimbangkan. Menarik terlalu cepat/terlambat adalah miss yang jelas, bukan crash atau loop tanpa akhir.
- `HOOKED`: interaksi ringan menjaga tegangan tali selama 1–3 detik (tap singkat berkala atau hold secukupnya), bukan spam cepat. Ada peluang `ESCAPED` walau input benar.
- `LANDED`: suara air, sprite spesies, nama ikan, berat, dan tombol menutup singkat. Rekor baru tampil sebagai kejutan kecil; selain itu jangan menghalangi dunia.
- Tidak ada mekanik mancing 100% berhasil; semua probabilitas berlangsung di fungsi domain yang menerima RNG eksplisit agar bisa diuji.

## Nilai awal untuk playtest, bukan tingkat tangkap yang dijamin
- Peluang mendapat sambaran per lemparan: 80% pada kondisi dasar.
- Dari sambaran yang masuk jendela tepat, peluang ikan tertangkap: sekitar 70%; sisanya dapat lepas karena ketegangan/timing.
- Kesalahan pemain bisa menurunkan kesempatan. Jangan mengubah peluang berdasarkan jumlah kegagalan secara diam-diam, kecuali pengaman frustrasi didokumentasikan.
- Target rata-rata 1 keberhasilan per 2–3 percobaan untuk pemain baru; sesuaikan hasil pengujian 100+ percobaan ber-seed.
- Durasi memancing harus berhenti bila pemain bergerak jauh, memasuki dialog, tidur, berpindah lokasi, keluar game atau memutus interaksi. Session timer tidak boleh menyisakan `line` yatim setelah reload.

## Ikan, aset, dan ekonomi
| Habitat | Spesies usulan | Status |
|---|---|---|
| Sungai/kolam | Lele, nila | Aset konsep ada, perlu inspeksi dan adaptasi |
| Sungai/kolam | Ikan mas, mujair, patin, tawes, gabus | Produksi aset per spesies dan rarity |
| Stok pasar lama | Bandeng, belanak, kakap putih | Tetap bisa dijual karena ada di save lama; jangan otomatis hasil sungai |
Setiap ikan punya `id`, nama, habitat, rarity, rentang berat, harga dasar, atlas frame, musim/waktu jika sudah didukung data, dan ikon koleksi. Jangan memakai aset hasil pencarian internet tanpa cek lisensi.

## Statistik dan YZ Phone
Tambahkan `Koleksi Ikan` sebagai subbagian **Statistik** yang sudah ada; hindari aplikasi ponsel baru.
- Ringkasan: total lemparan, total sambaran, berhasil, meleset, ikan lepas, tanpa sambaran, ikan yang pernah ditemukan, rekor bobot.
- Katalog: potret ikan, nama, pertama kali tertangkap (hari dalam game), jumlah tangkapan sepanjang waktu, jumlah yang masih di tas, jumlah terjual, rekor berat, habitat, dan kelangkaan yang sudah terungkap.
- Jangan menyamakan jumlah stok dengan jumlah tangkapan sepanjang waktu. Penjualan tidak boleh menghapus catatan pernah ditemukan.
- Statistik developer yang tidak relevan (seed RNG, event id, state internal, debug timing) tidak tampil di ponsel.
- `save` harus migrasi data v1: default nol untuk statistik baru, kunci ikan lama tetap terbaca, `line` lama dipulihkan aman. Jangan mengasumsikan pernah tertangkap hanya dari `caught` agregat tanpa data per spesies.

## UX tanpa overlay berlebihan
- Di dunia: joran, senar, pelampung, riak, gelembung dan animasi ikan; hanya petunjuk kontekstual kecil saat fase tertentu.
- PC: E/Spasi untuk lempar/tarik, Esc untuk membatalkan.
- HP: tombol A berubah makna sesuai fase, minimal 44×44 CSS px, hindari tabrakan dengan kontrol jalan, dukung reduced motion.
- SFX: suara lempar, riak, sambaran, tarikan, ikan lepas, ikan naik; tidak membunyikan semua pada setiap frame.
- Widi: dialog mentor dan lapak pancing tetap natural; katalog jangan berisi JSON, ID NPC atau istilah kode.
- Ringkas HUD umum: hilangkan baris panduan dan angka yang sudah tersedia di YZ Phone; jangan menutup area peta.

## Acceptance dan QA
1. State machine test: waiting benar-benar berlangsung; 100% catch tidak terjadi; terlalu awal, terlalu lambat, lepas, tanpa sambaran, batal, dan sukses semuanya tercapai dengan RNG fake.
2. Hitungan `attempts = caught + missed + escaped + noBite + cancelled?` memakai definisi eksplisit; hindari double-count akibat remount dan tab hidden.
3. Setelah menjual ikan, catatan pernah tertangkap/rekor tetap ada; save lama migrasi tanpa menimpa kemajuan.
4. Uji kondisi Safari iOS, PC fullscreen, tombol fokus, perubahan tab, page reload saat menunggu, dan jaringan save gagal.
5. Bandingkan sprite ikan dengan atlas dunia dan potret lain; tidak ada ikan laut acak di air tawar.
6. Uji visual tangkapan pada layar portrait/landscape dan FPS stabil. Jangan menyebut fitur telah live hanya karena dokumen ini ada.

## Widi Munajat — pembaruan karakter
- Canonical `C07`; nama dan portrait key `work-C07` dipertahankan.
- Profesi dan 12-kategori diselaraskan menjadi **Spesialis ikan dan memancing**. Cast runtime lama direvisi untuk peran pasar tanpa menganggap bahwa seluruh relasi legacy sudah disahkan.
- Potret profesi: gambar revisi yang **dipilih pemilik** sudah mengganti `work-C07.png` dengan ukuran 256×256, tetap mempertahankan wajah muda, rambut gelap acak, baju charcoal, dan mengganti keranjang sayur dengan joran, jaring serta kotak perlengkapan.
- Gambar generasi sebelumnya yang terlalu realistis/berkumis **telah diganti**. Metadata asset DB, fingerprint PNG dan QA ledger mengikuti versi pilihan pemilik. Tetap uji potret dalam YZ Phone pada layar mobile, dan bandingkan sprite dunia serta strip ekspresi sebelum menyatakan QA runtime selesai; baca `ACTIVE_NPC_PORTRAIT_STANDARD.md`.
