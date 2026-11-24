# YZ Farm Life — Blueprint Cutscene untuk Misi NPC (KONSEP, BELUM IMPLEMENTASI)

**Status:** rancangan editorial dan teknis saja · 23 November 2026. **Tidak ada video, frame baru, sistem pemutar, trigger cutscene, subtitle runtime, atau event save yang diaktifkan melalui dokumen ini.** Pengerjaan aset/frame video dilakukan terpisah oleh pemilik dengan Google Flow. Setiap kandidat di bawah **belum menjadi konten aktif** hingga disetujui dan diimplementasikan secara eksplisit.

## Arah kreatif
Cutscene harus menjadi hadiah naratif yang pantas setelah tindakan dan pilihan pemain, bukan memutus gameplay di setiap pekerjaan. Tiga tingkatan penyajian:
1. **Animasi gameplay di dunia:** aksi inspeksi, menyiram, memasukkan timun ke keranjang, mencatat ikan, menarik senar, membuka pintu air. Tidak pakai video.
2. **Adegan dialog interaktif:** konflik, perbedaan pendapat, emosi, dan pilihan; gunakan portrait ekspresi canonical, musik/SFX, dialog natural serta konsekuensi yang benar-benar dicatat save.
3. **Cutscene sinematik opsional:** momen besar yang mengubah konteks cerita, hubungan warga, atau kesadaran pemain. Hindari cutscene berlebihan pada tugas yang dapat berulang.

**Target editorial, bukan fitur tersedia:** 7 kandidat cutscene sinematik (termasuk konsep irigasi yang sudah pernah dibuat pengguna), 10–15 adegan dialog khusus, serta aksi gameplay dalam 30 rancangan misi. Target durasi produksi sinematik dasar `10 detik`; variasi hanya jika disetujui. Satu NPC aktif idealnya mempunyai setidaknya satu momen berkesan, tetapi tidak wajib pada misi pertamanya.

## Tujuh kandidat yang dikurasi

| ID Konsep | NPC | Misi/peristiwa | Mengapa sinematik? | Kapan layak dipicu? | Alternatif ringan | Status |
|---|---|---|---|---|---|---|
| CS-RYAN-01 | Ryan A03 | Air sampai ke hilir | Gerbang air terbuka dan aliran mulai mencapai hilir | Setelah aksi pintu air valid dan narasi sesuai; video terdahulu pengguna harus diperiksa sebelum reuse | Animasi bendung + SFX air | Konsep/referensi video lama; belum integrasi paket ini |
| CS-RYAN-02 | Ryan A03 | Air untuk Dua Kebun | Keputusan pembagian air memengaruhi dua warga | Sesudah dua pihak didengar dan keputusan dicatat | Dialog dua sudut pandang | Konsep |
| CS-NANI-01 | Nani C01 | Foto Tanpa Nama | Foto menghubungkan ingatan dengan petunjuk cerita lama | Setelah pilihan Bab 1 tentang foto diketahui, gunakan varian scene sesuai pilihan | Zoom foto + ekspresi Nani | Konsep |
| CS-NANI-02 | Nani C01 | Surat untuk Masa Depan | Penutup rangkaian cerita yang personal | Hanya bila syarat cerita Nani terpenuhi | Adegan membaca surat | Konsep |
| CS-AYU-01 | Ayu A04 | Benih yang Diberikan Kembali | Perawatan akhirnya menghasilkan tunas yang berarti | Setelah proses menanam/merawat benar-benar selesai | Tumbuhnya kecambah di peta | Konsep |
| CS-WIDI-01 | Widi C07 | Ikan yang Lepas | Kesabaran saat hasil tak sesuai harapan, bukan selalu berhasil | Event ikan lepas benar-benar tercatat dari mekanik memancing yang diperbarui | Animasi pelampung/senar + reaksi Widi | Konsep; mekanik gagal belum divalidasi untuk scene |
| CS-INGGIT-01 | Inggit C08 | Meja Makan Para Tetangga | Momen sosial yang memperlihatkan perkembangan hubungan | Setelah kondisi sosial dan jadwal kelima NPC layak, bukan cutscene paksa | Dialog berkelompok di warung | Konsep |

**Penting:** misi CS-RYAN-01 berbeda dari tambahan lima quest interaktif P1; keberadaan video lama pengguna tidak otomatis berarti file atau trigger tersedia pada branch ini. Permainan tidak boleh memutar adegan yang belum terjadi atau mengabaikan konsekuensi pilihan. Peristiwa Widi yang gagal tidak boleh dipalsukan dengan persentase keberhasilan 100%.

## Kontrak dua frame dan produksi video yang dilakukan pengguna

- **Frame A (pembuka):** establishing shot di lokasi yang cocok dengan peta aktual Pasirluyu, waktu, cuaca, pakaian canonical, pose awal dan sumber cahaya. Karakter sepenuhnya di dalam frame, tidak terpotong bagian kaki/tangan, proporsi utuh, kedalaman adegan jelas.
- **Frame B (penutup):** karakter, lokasi, warna, perspektif dan sumber cahaya konsisten dengan Frame A; memperlihatkan akibat kejadian, tidak sekadar zoom acak. Periksa tangan, kaki, jumlah anggota tubuh, benda mekanik dan proporsi alat.
- **Prompt Google Flow (sekitar 10 detik):** uraikan pergerakan kamera, aksi dari A ke B, durasi transisi, suasana, detail audio/gerak, kontinuitas pemain/NPC; cegah pergantian wajah/kostum, teleportasi, penambahan objek dan distorsi alat.
- **Asal video:** pengguna membuat final video dengan Google Flow lalu menyerahkannya untuk integrasi pada tahap terpisah. Jangan membuat potret NPC baru otomatis atau mengubah identitas/strip ekspresi dari prompt ini.
- **Wajib review artefak:** dua frame sumber, video final asli, hak penggunaan, kesesuaian identitas, QC anatomi, kualitas gerak dan subtitle. Tambahkan metadata produksi/versi tanpa mengganti file rilis lama sebelum pengujian.

## Kontrak presentasi di layar (rencana implementasi)

- Video hanya diputar **di area viewport game**, bukan fullscreen halaman atau menimpa kontrol.
- **Aspect ratio sumber tidak diubah**: gunakan `object-fit: contain`; tampilkan letterbox sesuai kebutuhan, jangan crop atau stretch.
- Subtitle harus berada **di dalam area video/viewport** pada safe-area bawah, dengan batas aman; tidak bertabrakan dengan controller dan tidak membuat gameplay keluar dari canvas.
- Navigasi mobile dan desktop sama-sama dapat melewati video lewat tombol **Lewati**, tidak memengaruhi aksi berhasil maupun status penyelesaian quest.
- Event cutscene adalah konsekuensi yang sudah ditentukan oleh state sebelum playback. Skip, reload, video gagal dimuat dan pengulangan tidak memberikan reward tambahan atau menandai quest palsu selesai.
- Tawarkan **Tonton ulang** dalam YZ Phone → Kronik hanya setelah adegan benar-benar dibuka dalam save; replay tidak mengubah progres.
- Muat video sesuai kebutuhan (*lazy load*), dengan opsi kualitas hemat data dan fallback dialog jika media gagal; jangan memuat tujuh video saat game baru dibuka.
- Subtitle, narasi, nama tempat dan percakapan ditulis natural dalam Bahasa Indonesia; informasi teknis tersembunyi dari pemain.

## Kontrak peristiwa dan data (belum dibuat)

Contoh konsep metadata, **bukan instruksi migrasi yang sudah dieksekusi**:

```ts
type CutsceneDefinitionDraft = {
  id: string;
  questId: string;
  triggerEvent: string;
  requiredFlags: string[];
  choiceVariant?: string;
  sourceAspectRatio: string;
  frameA: string;
  frameB: string;
  sourceVideo: string;
  subtitles: { atMs: number; untilMs: number; text: string }[];
  fallbackDialogueId: string;
  replayable: boolean;
};
```

Ketika kelak diaktifkan: gunakan ID unik stabil, kaitkan pemicu ke event game tervalidasi, simpan hanya status adegan yang dibuka/ditonton, sertakan field dalam migrasi `safeLoad` dan `newGame()`, reset progres secara menyeluruh, dan pastikan UI developer tidak bocor ke pengguna.

## QA sebelum implementasi cutscene apa pun

1. Penempatan video di canvas pada resolusi ponsel sempit, lanskap, desktop; tidak pernah menutup controller.
2. Video 10 detik/aspect ratio asli serta subtitle tidak melampaui safe-area.
3. Keputusan pemain dan timestamp kejadian cocok dengan adegan; ketujuh kandidat tidak otomatis terbuka.
4. Mengulang, melewati, gagal memuat, reload di tengah playback tidak mengubah uang, misi, inventory atau kedekatan NPC.
5. Kronik menampilkan replay hanya jika benar-benar sudah dibuka; reset mengembalikan status ke awal.
6. Bandingkan kedua frame dan video terhadap portrait canonical aktif dan sprite game; NPC tidak berubah wajah/pekerjaan.
7. Konfirmasi final dari pemilik mengenai cutscene mana yang layak masuk runtime, lalu QA staging sebelum deploy produksi.

## Batas pekerjaan sekarang

Dalam paket **aset dan aksi misi** pada branch ini, hanya misi/objek interaktif yang dibuat. **Dokumen ini tidak menginstruksikan pengaktifan cutscene sekarang.** Seluruh ide video sinematik adalah backlog editorial terkurasi.
