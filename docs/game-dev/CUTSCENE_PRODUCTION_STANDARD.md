# Standar Produksi Cutscene — YZ Farm Life (V1.0)

**Aktif sejak 22 November 2026.** Berlaku lintas misi dan dunia, tidak hanya Pintu Air Pasirluyu. Sumber instruksi agen: [Cutscene Skill](../../.agents/skills/yz-farm-cutscene/SKILL.md).

## Prinsip pengalaman pemain

Cutscene muncul pada momen **yang benar-benar mengubah dunia atau hubungan**, bukan setiap kali tombol E ditekan. Awali dengan situasi, perlihatkan tindakan karakter, akhiri dengan akibat yang dapat ditemui lagi di gameplay. Penonton tidak perlu membaca istilah developer. Tidak ada efek AI generik, kamera bergoyang tanpa alasan, atau deskripsi moral panjang.

## Aset yang harus dibuat AI sebelum pengguna membuat video

| Artefak | Fungsi | Spesifikasi |
|---|---|---|
| FRAME AWAL | Titik awal aksi | Berkas gambar berdiri sendiri, 16:9, target 1920×1080 |
| FRAME AKHIR | Keadaan sesudah aksi | Berkas gambar lain dengan rasio, lokasi, karakter dan cahaya yang sama |
| Prompt Google Flow | Gerakan transisi start ke end | Bahasa Inggris, urutan detik, mekanisme, kamera, audio dan negatif |
| Manifest | Kontrak produksi | Nama, ID, lokasi, quest, kondisi awal/akhir, identitas, sumber, SHA video |

Untuk video yang **sudah dibuat pengguna**, boleh mengekstraksi dua frame dari file final sebagai **referensi kontinuitas**, tetapi harus jelas dibedakan dari dua gambar generasi sebelum video.

## Frame awal dan frame akhir yang baik

**Identitas:** gunakan gambar canonical tokoh (Yanzen: `/game/assets/characters/yanzen-gaits.png`, `/game/assets/portraits/A01.png`). Foto profesi Ryan A03 bukan wajah Yanzen.

**Geografi:** screenshot gameplay adalah sumber posisi relatif (hulu/hilir, jalan, tangga, pintu air, papan, bangunan). Ilustrasi anime boleh memperkaya tekstur tetapi tidak boleh memindah struktur. Gaya visual dipilih sekali oleh pemilik: anime cinematic maupun HD-2D. Jangan mencampur pixel art dalam adegan anime.

**Mekanika:** roda harus tersambung ke ulir/poros dan pelat pintu yang benar; jumlah pintu tetap. Kaki karakter berdiri di bidang kering yang terlihat. Air mengalir dari elevasi tinggi ke rendah; frame akhir memperlihatkan dampak.

**Pencahayaan:** arah bayangan dan waktu hari konsisten. Jangan mengubah cuaca, warna pakaian atau karakter tanpa alasan cerita.

**Antarmuka:** frame referensi tidak memuat subtitle, judul, UI, logo maupun watermark. Subtitle dan tombol pemain dikelola di UI, bukan di video AI kecuali disetujui pemilik.

## Template data untuk cutscene baru

```json
{
  "id": "mission-short-slug",
  "scene": "nama adegan",
  "location": "peta/area game",
  "trigger": "quest/event/phase dari save",
  "characterReferences": ["path ke sprite asli", "path ke portrait canonical"],
  "environmentReferences": ["path/screenshot peta"],
  "artStyle": "anime-cinematic / hd2d",
  "frameStart": "path/frame-start.png",
  "frameEnd": "path/frame-end.png",
  "startState": "kondisi awal mekanisme dan karakter",
  "endState": "perubahan yang benar-benar tersimpan dalam save",
  "cameraPlan": "gerakan kamera beralasan",
  "audioIntent": "suara ambience, SFX, musik opsional",
  "video": "public/game/assets/cutscenes/scene.mp4",
  "poster": "public/game/assets/cutscenes/scene-poster.png",
  "videoSha256": "diisi setelah upload",
  "qa": {
    "visualContinuity": "pending",
    "mobilePlayback": "pending",
    "questSaveReplay": "pending"
  }
}
```

## Kontrak penggantian video lama

1. Terima file final dari pemilik dan cek lewat `ffprobe` serta 5–7 cuplikan selama durasi video.
2. Simpan file **tanpa re-encode yang menurunkan kualitas** jika sudah kompatibel (H.264 AAC, 16:9, durasi wajar).
3. Simpan poster dan dua frame QA. Nama file runtime bisa dipertahankan demi kompatibilitas, tetapi kontennya **diganti** dan sha256/manifest diubah.
4. **Matikan build-time restore** dari video Remotion lama agar tidak menimpa video unggahan. Hapus asset HD chunks dan pipeline yang sudah usang setelah mengganti tes.
5. Katalog `game-assets/catalog/asset-database.json`, `game-assets/library/`, `cutscene manifest` diperbarui.
6. `src/app/game/sluice-cutscene.tsx` hanya memutar video. Quest dan unlock/replay berada di model/game-client, tidak diserahkan pada file MP4.
7. QA dari URL preview benar-benar menjalankan file versi baru dan menonton di Safari iOS. Build sukses saja bukan bukti UI sempurna.

## Pasirluyu — penggantian 22 November 2026

Video sumber pemilik: `Man_operating_irrigation_mechanism_3e1dfd4f_1080p.mp4`. Nama file mengandung “1080p”, tetapi **hasil inspeksi aktual adalah 910×512, 30 fps, 10 detik, H.264/AAC**, 6.199.340 byte. Jangan mengklaim ini 1920×1080. SHA256 `6692a1a19cf1f466121bc0ba2dcec5e431bab1e9043f4103ca9e7804be105b20`.

Storyboard nyata: Yanzen di sisi kanan memutar roda, pintu terangkat, air deras mengalir ke hilir, dan karakter terlihat lega. Dua frame QA diambil dari sekitar 0,2s dan 9,6s; keduanya **ekstraksi video**, bukan keyframe AI baru. Poster diambil dari adegan nyata.

**Kritik visual yang tetap harus dicatat:** keterhubungan roda kanan dengan dua pintu sebaiknya tidak dipahami sebagai mekanisme aktual proyek irigasi; ini karya sinematik fiksi yang disetujui pemilik. Jangan mengubah video tanpa permintaan. Pengujian teknis tidak berarti semua fisika adegan sempurna.

## Frame video dalam layout permainan

Dalam gameplay Phaser mobile/desktop, pemutar wajib diposisikan **di dalam `.yzg-viewport`**. Subtitle dan pilihan suara/lewati muncul setelah gambar, tetapi tidak boleh keluar dari viewport menuju panel peralatan atau D-pad.

Pakai dimensi nyata video (`910×512` untuk Pasirluyu), `object-fit:contain`, dan pengukuran ruang dari parent game. Jangan gunakan `position:fixed; inset:0; width:100vw; height:100dvh`. Tidak ada pemanggilan fullscreen native pada elemen video yang merusak batas area permainan.

Untuk iPhone dalam orientasi tegak, pertahankan kontrol di luar layar video. Dalam lanskap pendek, panel input boleh disembunyikan sementara, hanya untuk memberi ruang film, dan wajib pulih setelah pemutaran.

Tes ukuran 393×852, 390×844, 844×390, 1280×800, 1440×900; periksa bounding rectangle, subtitle terpisah, urutan z-index, dan file video tetap byte-identik. Gunakan `npm run test:game:cutscene:ui` setelah browser dependencies tersedia.

## Standar tes

```bash
npm run cutscene:verify
npm run test:game
npm run typecheck
npm run assets:index:check
npm run assets:categories:check
```

Prioritas QA: checksum/codec, keterbacaan pada layar 390px, autoplay `muted playsInline`, suara setelah interaksi, kontrol lewati/ulang, tidak mengubah save saat replay, galeri Kenangan terkunci bagi pemain baru dan terbuka untuk pemain yang menuntaskan misi lama.
