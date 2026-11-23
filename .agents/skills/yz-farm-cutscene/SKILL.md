---
name: yz-farm-cutscene
description: Alur wajib pembuatan cutscene sinematik YZ Farm Life, dari dua frame canonical (awal dan akhir), pembuatan video eksternal oleh pemilik, QA, import MP4, hingga unlock dan replay YZ Phone.
---

# YZ Farm Life — Cinematic Cutscene Production

Gunakan skill ini setiap kali ada permintaan **buat/revisi frame awal, frame akhir, video cutscene, replay Kenangan, atau integrasi cutscene ke gameplay**. Ini adalah aturan produksi developer, bukan teks yang muncul di permainan. Baca `AGENTS.md`, `docs/game-dev/CUTSCENE_PRODUCTION_STANDARD.md`, `docs/game-dev/ACTIVE_NPC_PORTRAIT_STANDARD.md`, serta skill Humanizer untuk narasi.

Template siap pakai untuk tiga generasi terpisah (frame awal, frame akhir, dan video Google Flow): [dual-frame-and-flow.md](templates/dual-frame-and-flow.md).

## Pembagian tanggung jawab

**AI/game editor mengerjakan:** audit misi dan peta, verifikasi identitas canonical, penyusunan storyboard, **membuat dua gambar referensi independen: FRAME AWAL dan FRAME AKHIR**, prompt untuk Google Flow/Veo, inspeksi video unggahan pemilik, pemrosesan file tanpa merusak kualitas, penggantian aset GitHub, tes runtime, dan staging.

**Pemilik membuat video:** gunakan dua frame sebagai `Frames to Video`/input yang didukung model video yang dipilih. Setelah file final diunggah, AI **wajib memakai video itu sebagai sumber utama**; jangan membuat ulang via CSS/Remotion dan mengklaim itu video pemilik. Tidak membuat video tambahan kecuali diminta.

## Aturan mutlak dua frame

1. **Frame awal:** keadaan SEBELUM aksi; tokoh, lokasi, benda, mekanisme dan sudut kamera terlihat jelas. Pastikan tokoh punya seluruh tubuh dan pijakan yang dapat dipahami. Setiap tangan punya posisi serta tujuan.
2. **Frame akhir:** keadaan SESUDAH aksi; geografi, desain karakter, properti dan arah kamera tetap sama kecuali perpindahan yang dijelaskan. Akibat peristiwa harus jelas terlihat, misalnya pintu terangkat dan air mengalir.
3. Keduanya merupakan **dua file gambar terpisah**, bukan satu kolase. Target rasio 16:9, idealnya 1920×1080/ukuran maksimum generator; jika generator mendukung resolusi lain, kedua frame harus berasio dan dimensi identik.
4. Jangan membuat frame akhir terlebih dahulu tanpa kontrak frame awal. Jangan memaksa satu model video mengarang ulang muka, alat, jalan, atau mekanika.
5. Tuliskan `startState`, `endState`, `camera`, `characterReferences`, `environmentReferences`, `physicalContinuity`, `visualStyle` dan `audioIntent` dalam manifest produksi. Ekspor dalam bentuk PNG/JPG, tanpa teks, UI, watermark atau logo.
6. Untuk karakter Yanzen: sumber canonical tubuh `public/game/assets/characters/yanzen-gaits.png`, wajah `public/game/assets/portraits/A01.png`, adegan profesi Ryan `public/game/assets/portraits/bandung/professions/work-A03.png` adalah **Ryan, bukan wajah Yanzen**. Jangan menukar identitas kedua tokoh. Peta dunia asli dan screenshot gameplay adalah sumber tertinggi untuk geografi.
7. Frame harus cocok dengan kondisi quest dan waktu; jangan membuat bendungan tertutup di frame akhir ketika gameplay sudah menyatakan air mengalir.

## Contoh resmi: Pintu Air Pasirluyu

**Sumber lokasi:** screenshot peta Sungai Pasirluyu; dua pintu kayu berdampingan, tiang batu, dua batang ulir, roda pengoperasian di sebelah kanan, tangga dan jalur inspeksi kering, air dari hulu belakang ke hilir depan. Jaga jumlah pintu, jalur aliran, dan posisi pijakan. Yanzen mengenakan kemeja krem berkerah, rompi gelap, celana gelap, sepatu bot dan rambut gelap sedikit berantakan; cek A01 dan sprite gerak.

**Frame awal:** Yanzen berdiri sepenuhnya di platform kanan, kedua tangan siap memutar roda yang benar-benar terhubung ke mekanisme. Pintu masih tertutup/baru akan dibuka; sedikit air mengalir. Anime cinematic gambar 2D berkualitas tinggi, tanpa pixel art jika pemilik memilih gaya anime.

**Frame akhir:** Yanzen berdiri aman setelah putaran terakhir, kedua pintu sudah berada pada posisi akhir yang masuk akal berdasarkan mekanisme masing-masing; air mengalir kuat melalui bukaan. Cahaya sore tetap konsisten; kedua sepatu tampak utuh. Jangan mengubah wajah, kemeja, rompi, roda, jumlah pintu, desain tiang atau geografi.

**Video yang diterima (22 November 2026):** `public/game/assets/cutscenes/sluice-gate.mp4`, 10 detik, H.264/AAC, 910×512, 30 fps. Frame referensi untuk klip ini **diekstraksi dari video final pemilik**, sebagai catatan kontinuitas: `.../frames/sluice-start.jpg` (±0,2 detik) dan `.../frames/sluice-end.jpg` (±9,6 detik). Bukan klaim dua gambar AI terpisah yang dibuat sebelum video. Untuk misi baru, AI membuat keduanya sebelum pengguna memproduksi video.

## Kontrak video penerimaan

- Pemilik mengunggah **MP4 final**. Audit dengan `ffprobe`: codec, dimensi, fps, panjang, audio, checksum. Simpan original jika sudah memenuhi kebutuhan; kompres/ubah hanya dengan persetujuan atau untuk varian streaming tambahan yang tidak merusak original.
- Target 16:9, 24–30 fps, H.264 yuv420p + AAC, audio opsional, 8–12 detik per shot (fleksibel sesuai cerita), dan kualitas HD asli. Jangan diam-diam menurunkan ke 320×180 / 10 fps seperti kesalahan cutscene sebelumnya.
- Periksa setidaknya lima timestamp: awal, seperempat, pertengahan, tiga perempat, akhir. Periksa anatomi/sepatu, susunan roda dan ulir, arah aliran, jumlah pintu, transisi, flicker, dan gaya karakter.
- Frame key art, poster dan tombol replay **harus berasal dari adegan aktual**. Simpan provenance dan checksum di `game-assets/cinematics/<slug>/manifest.json`.
- Import final ke `public/game/assets/cutscenes/<slug>.mp4` (untuk sluice URL historis `sluice-gate.mp4` dipertahankan). Perbarui katalog aset dan QA. Video lama digantikan, jangan restore otomatis di build dari render lama.
- Phaser mengatur pemicu gameplay. Komponen React video **hanya memutar, pause, skip, toggle audio, fullscreen, dan report selesai**. Tidak boleh mengubah save, uang, affinity, hadiah, atau quest ketika replay/skip.
- Game `YZ Phone → Kenangan` memperlihatkan adegan yang telah terbuka berdasarkan `src/lib/game/model.ts` melalui `hasSluiceMemory`; save lama tetap valid. Poster dan detail player harus mobile-first, subtitle besar dan terpisah dari video bila diperlukan, autoplay muted untuk Safari, `playsInline`, video load failure memiliki retry/skip.
- Remotion bersifat **opsional untuk penyuntingan** ketika diperlukan; **bukan prasyarat** untuk video yang sudah dihasilkan pemilik.

## Alur standar untuk misi baru

1. **Observasi:** baca quest/runtime, peta, 2–3 frame karakter canonical, gaya seni yang diminta. Jelaskan kesesuaian 0–100% dan ketidakpastian faktual (jangan mengarang geografi).
2. **Buat dual keyframes:** `FRAME_AWAL.png` dan `FRAME_AKHIR.png` dengan style, identitas dan tata ruang sama. Tampilkan keduanya untuk penilaian pengguna; koreksi anatomi dan logika mekanik hingga selaras.
3. **Serahkan prompt video:** tulis prompt 8–12 detik atau sesuai batas Google Flow/Veo, gerak dari start → end, kamera/gerak tokoh/lingkungan, audio dan larangan morphing. Berikan file frame ke pengguna.
4. **Terima file video dari pemilik:** jangan gunakan file lain sebagai pengganti, kecuali pengguna menyetujui. Audit visual + metadata + SHA.
5. **Implementasi:** upload file ke GitHub, register manifest, poster dan frame asli, kaitkan ID cutscene yang stabil dengan event misi + replay, hindari hardcoded unlock hanya dari playback.
6. **Quality gate:** cek metadata, checksum, semua sumber aset, `npm run test:game`, `npm run typecheck`, QA smartphone Safari/Android dan preview Vercel. Jangan mengklaim uji perangkat nyata jika hanya tes CI.
7. **Penggantian:** hapus artefak runtime lama yang tidak terpakai dan build automation usang **setelah** memverifikasi tidak ada pemanggil lain; katalog/manifest harus tetap akurat.

## Standar area tayang: game world, bukan browser (revisi 22 November 2026)

- Cutscene harus menjadi **anak `.yzg-viewport`**, berposisi `absolute; inset:0`, bukan `position:fixed` atau modal selebar `100vw × 100dvh` yang menutupi kontrol.
- **Wajib pertahankan aspek asli video** berdasarkan metadata, bukan mengubahnya menjadi 16:9 secara paksa bila sumber sedikit berbeda. Video Pasirluyu 910×512 menggunakan `aspect-ratio:910/512; object-fit:contain` tanpa memotong gambar maupun re-encode.
- Subtitle dan tombol kontrol khusus cutscene berada **di bawah video tetapi tetap di dalam world viewport**. Hitung ruang melalui `ResizeObserver` terhadap ukuran world, caption dan tombol; jangan membiarkan label menabrak alat, D-pad, YZ Phone, atau kontrol lari.
- Selama cutscene, kontrol gerak dan tools permainan dalam `.yzg-controls` dan `.yzg-touch` bersifat `inert`. Pada mobile lanskap pendek, boleh sembunyikan sementara kontrol yang tidak diperlukan agar viewport membesar; setelah cutscene selesai tampilkan kembali.
- Tombol fullscreen sinematik jika ada harus memperbesar **game page** secara sukarela, bukan `video.webkitEnterFullscreen` yang keluar dari area permainan pada Safari iPhone.
- QA visual wajib untuk 390×844, 393×852, 844×390, 1280×800 dan 1440×900 (atau variannya), dengan bukti geometri: video, subtitle dan tombol 100% masuk world viewport; world tidak bertabrakan dengan panel game.
- Gunakan `node tests/game-cutscene-viewport-ui.mjs` sebagai pemeriksaan browser setelah mengubah CSS/komponen cutscene. Tes ini hanya simulasi Chromium; uji Safari nyata tetap terpisah.

## Definition of Done

- Dua frame tervalidasi dan dapat direproduksi untuk setiap cutscene baru.
- Video final pemilik utuh di GitHub dan benar-benar digunakan saat gameplay maupun replay.
- Tidak ada MP4 lama, proses restore otomatis lama, atau fallback scene lama yang diam-diam mengambil alih video baru.
- Poster, Kenangan, skip, audio, fullscreen, save lama, quest, dan UI mobile diuji.
- Tes game + katalog lulus; tautan preview memakai commit yang tepat.
