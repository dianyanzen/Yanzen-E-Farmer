# Gaya bahasa pemain — YZ Farm Life

**Aturan aktif, 22 November 2026.** Semua teks yang pemain baca/dengar harus terasa seperti dunia Pasirluyu dan mudah dipahami di layar ponsel. Humanizer adalah proses editorial saat development, **bukan pemanggilan AI saat game berjalan**.

## Kompas editorial

1. **Konteks dulu, baru kalimat.** Identifikasi siapa bicara, tempat, kondisi cuaca/waktu, suasana, tindakan yang dapat dilakukan dan apa yang diketahui tokoh.
2. **Suara tokoh berbeda.** Setiap NPC boleh punya kebiasaan, keberatan, dan tujuan sendiri. Hindari sapaan seragam, metafora mengambang, kalimat bantuan generik, dan penutup bermoral di setiap percakapan.
3. **UI bukan narator teknis.** Tulis "Belum tersimpan", bukan "Gagal save". "Catatan perjalananmu belum bisa dibuka", bukan "Error 500 / JSON". Tidak perlu menjelaskan sesuatu sedang draf, belum ada backend, atau terbuka Lv. 0.
4. **Satu label cukup.** Nama/pekerjaan berada di header profil; jangan ulangi dengan kode NPC, bab teknis, dan level pada bubble percakapan.
5. **Ada ruang diam.** Pemain tidak harus menerima tutorial atau pujian dari tiap warga. Dialog boleh pendek, ragu, bercanda, atau menyimpan informasi.
6. **Yang diketahui berbeda dari yang sudah terjadi.** Profil Warga boleh menampilkan kisah dunia game yang sudah layak disajikan. Kronik hanya menampilkan pilihan, hari, misi dan kejadian dari `GameState`.
7. **Aksesibilitas tetap jelas.** Jangan menyembunyikan petunjuk penting demi estetika. Gunakan YZ Phone → Panduan untuk kontrol; status aksi tetap terlihat singkat.
8. **Jangan salin materi game lain.** Semua dialog harus orisinal; Bandung yang nyata membutuhkan sumber untuk klaim sejarah/geografi, sedangkan kisah warga tetap fiksi.

## Bagaimana setiap layar terdengar

| Lokasi | Prioritas isi | Hindari |
|---|---|---|
| Dialog | Ucapan tokoh sesuai konteks | Level, perintah quest dalam mulut NPC |
| Warga | Nama, potret, profesi, hal yang relevan tentang tokoh | 12 kategori raw, ID, "draft", status implementasi |
| Kedekatan | Percakapan dan rasa hubungan yang tercatat | Rasio poin, status legacy, jadwal yang dikarang |
| Kronik | Kejadian yang tersimpan di save | Cerita proposal disajikan sebagai pengalaman |
| Gudang/inventaris | Benda yang ada, bisa dipakai dan dipindah | Katalog alat pengembangan yang belum ada |
| Peta/plang | Arah dan akses yang benar-benar tersedia | Daftar seluruh ekspansi yang belum hidup |
| HUD | Waktu, lahan, uang, panen, tindakan | Keterangan internal engine |
| Error/login/save | Dampak yang jelas dan langkah pemulihan | Exception, token, stack trace, SQL atau dump save |
| IKD fiksi | Identitas karakter dalam semesta game | Data adminduk/NIK/PIN pemerintah nyata |

## Alur kerja seluruh game

- Daftarkan string aktif dari `src/app/game/`, `src/lib/game/model.ts`, `src/lib/game/personal-quests.ts`, `src/lib/game/phone-story.ts`, `src/lib/game/signposts.ts` dan komponen YZ Phone.
- Kelompokkan **dialog tokoh / UI dunia / sistem / developer**. Jangan paksa satu gaya ke semua jenis teks.
- Pilih teks yang melemahkan pengalaman: pesan panjang, generik, jargon, salah janji fitur, pengulangan, dan informasi yang bocor dari developer.
- Perbaiki naskah dengan Humanizer `.agents/skills/humanizer/SKILL.md` serta skill `yz-farm-dialogue`. Jika Warga, gunakan `yz-farm-encyclopedia`.
- Jangan ganti ID, perhitungan, rewards, pilihan, prasyarat quest, timers atau skema save sebagai efek samping copy edit.
- Jalankan `npm run test:game:copy`, `npm run test:game:humanizer`, `npm run test:game:phone`, `npm run test:game`, `npm run typecheck`, dan lihat hasilnya pada viewport kecil. Tes otomatis tidak dapat menjamin seluruh prosa sudah natural.

## Contoh

- Pengalaman rumah: "Pakaian kebunmu tersusun di lemari." Bukan pesan bahwa fitur kostum belum diimplementasikan.
- Kesalahan memuat: "Catatan perjalananmu belum bisa dibuka. Progres lama tetap aman; coba masuk lagi." Log exception terpisah untuk developer.
- Warga: "Ryan Andryana Achadiat — Pengelola irigasi." Tidak memajang "A03 · 12 kategori · status draft".
- Misi: tokoh menyampaikan apa yang ia butuhkan; tombol pilihan, catatan, dan tujuan teknis berada di UI yang sesuai.

**Batas:** Audit ini harus berulang saat ada konten baru. Belum seluruh prosa generasi massal Character Bible menjadi kalimat yang disetujui penulis; jangan memasukkannya ke layar pemain dengan loop `Object.entries`.
