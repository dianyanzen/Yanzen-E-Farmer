# YZ Farm Life — Humanizer untuk seluruh teks game

**Sasaran:** setiap kalimat yang pemain lihat atau dengar terasa seperti bagian dari kehidupan Pasirluyu. Ini standar editorial yang diterapkan saat penulisan dan code review, **bukan API yang memproses teks saat game berjalan**.

## Cakupan wajib

| Media | Sasaran gaya | Contoh pemeriksaan |
| --- | --- | --- |
| Dialog dan reaksi NPC | Suara individu, tindakan dan jeda yang alami | Ryan merujuk pengamatan air; Nani pada benda dan ingatan; Inggit pada stok warung |
| Quest dan keputusan | Apa yang dilakukan dan akibat yang terasa | Jangan memajang hadiah/poin kedekatan sebagai ucapan tokoh |
| HUD, toast dan kontrol | Pendek dan jelas | Sebut tindakan, tempat dan dampaknya; jangan membacakan data internal |
| Menu Warga, Kedekatan, YZ Phone | Tampak seperti catatan yang dimiliki pemain | Pisahkan informasi diketahui, belum kenal, dan cerita yang belum terbuka |
| Kronik / ringkasan cerita | Berdasarkan flag, quest, statistik dan keputusan di save | Tidak mengarang tanggal lama, perasaan warga atau kejadian belum dimainkan |
| Papan, peta, warung, interior | Kontekstual dengan benda yang disentuh | Plang menjelaskan jalan; lemari menggambarkan pakaian, bukan rencana fitur |
| Tutorial, status & error | Instruksi yang dapat ditindaklanjuti, tetap manusiawi | Jangan menyebut PostgreSQL, proses build, atau renderer kecuali untuk support teknis |
| Potret, pilihan ekspresi, aksesibilitas | Label ringkas yang menjelaskan orang/aksi | Jangan menggandakan nama pembicara di setiap baris dialog |

## Kriteria bahasa

- Tulis **Bahasa Indonesia percakapan yang tepat konteks**; nuansa Sunda hanya saat wajar dan tidak dibuat-buat.
- Hindari satu suara untuk semua NPC, sapaan generik, metafora besar tanpa fungsi, penutup moral setelah setiap adegan, dan pola “bukan X melainkan Y” yang tidak menambah informasi.
- Gunakan kalimat pendek di bubble, tetapi izinkan jeda, ketidaksetujuan, gugup, humor kecil, subteks, dan kalimat panjang saat emosi membutuhkan.
- UI ringkas bukan berarti istilah teknis dihapus dari dokumen developer. Stack, error kode, SQL dan informasi support tetap ada di log/dokumentasi; **jangan menaruhnya di mulut NPC**.
- Jangan memotong petunjuk mekanik yang penting hanya demi estetika. Tempatkan cara bermain di Panduan YZ Phone, dan status aksi langsung di layar.
- Hubungan antartokoh, identitas warga, usia dan rahasia pribadi baru dari Character Bible yang masih `narrative-proposal` **tidak otomatis canon**. Kronik hanya menampilkan fakta dari save.
- Ucapan NPC harus orisinal; tidak mengambil dialog berhak cipta dari Harvest Moon.
- Semua pemain memahami konsekuensi pilihan tanpa harus membaca lore debug.

## Alur kerja reviewer dan Codex

1. Tandai **semua** string baru atau berubah yang tampil ke pemain (di komponen React, model, quest, peta, toast, objek).
2. Baca konteks sumber, aksi yang memicu teks, ID tokoh, lokasi, jam, cuaca, level kedekatan, dan state-save yang berkaitan.
3. Jalankan Humanizer sebagai tahap editorial; ubah prosa, bukan ID quest, kondisi, hadiah, angka, pilihan, atau jenis tool.
4. Uji konsistensi dengan `game-assets/characters/profiles/index.json`; hal pribadi belum boleh terbuka sebelum jalur naratifnya tersedia.
5. Baca secara keras seperti NPC berbicara di lokasi itu; coba pada layar 255–286px YZ Phone serta 393px mobile.
6. Jalankan `npm run test:game:copy`, `npm run test:game:phone`, `npm run test:game`, typecheck, dan uji UI saat runtime disentuh. Pemeriksaan pola otomatis adalah pagar minimum; **mutu bahasa tetap harus direview manusia**.

## Contoh revisi yang sudah diterapkan

| Sebelum | Sesudah | Alasan |
| --- | --- | --- |
| “Ayu: ...” di setiap halaman potret Ayu | Ucapan saja, nama berada di header dialog | Tidak mengulang label pembicara seperti naskah mentah |
| “Hari sudah sore. Harapanku tetap sama: ...” untuk semua NPC | Ucapan sore yang berbeda per tokoh | Mempertahankan karakter, bukan template seragam |
| “Fitur mengganti pakaian belum tersedia” pada lemari | “Pakaian kebunmu tersusun di lemari. Belum ada yang perlu diganti sekarang.” | Benda terasa hadir di dunia |
| “PostgreSQL lokal ...” dalam panduan bermain | “Perjalananmu akan tersimpan” | UI tidak terasa seperti panel developer |
| “Kedekatan +20” sebagai ucapan NPC | Reaksi NPC alami; poin ada di menu Kedekatan/Warga | Angka dan emosi berada pada tempatnya |

## Batas penerapan

Perubahan ini meliputi editorial pass untuk teks inti Pasirluyu/YZ Phone dan linter regresi. Sistem ini **tidak menyunting otomatis semua dokumen/ratusan aset ekspansi yang belum masuk runtime**. Setiap teks baru harus melalui gate yang sama. Linter mendeteksi frasa yang diketahui buruk, bukan membuktikan tulisan “100% bukan AI”.
