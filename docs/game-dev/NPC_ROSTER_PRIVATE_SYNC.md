> **PEMBARUAN 22 NOVEMBER 2026:** Pemilik proyek telah menyetujui publikasi katalog **karakter fiksi** yang dikurasi. Sumber canonical publik sekarang ada di `game-assets/catalog/npc-public-roster.json` dengan dossier dan wiki 248 NPC. Baca [kebijakan baru](NPC_PUBLICATION_POLICY.md). Dokumen di bawah merupakan **rekam keputusan lama** dan berlaku untuk file server yang tetap privat, data save, serta approval legacy. Larangan lama mempublikasikan *nama karakter fiksi* tidak berlaku lagi.

# YZ Farm Life — pemisahan roster privat dan cerita lama

## Keputusan

**Satu-satunya sumber identitas warga canonical:** `deploy/private/residents.json` pada Docker / file privat yang ditunjuk oleh `GAME_RESIDENT_ROSTER`. Berkas ini **tidak boleh** di-commit. Game menerima 248 entri, mempertahankan nama persis dari sumber, pekerjaan, dan ID potret. Nama satu kata (mis. dalam roster yang telah disahkan) tidak boleh diperpanjang secara asal.

GitHub dapat menyimpan *kode* pembaca, bentuk validasi, dan potret yang telah disiapkan, tetapi **tidak memuat salinan katalog nama asli atau perbandingan identitas privat**. Ini berlaku juga untuk output Markdown/Excel yang memuat nama-nama tersebut.

### Langkah instalasi server

1. Simpan daftar `currentRoster` yang 248 entri sebagai array JSON di `deploy/private/residents.json` (atau simpan wrapper `{ "schemaVersion": 1, "currentRoster": [...] }`). Jangan campur `legacyContentReviewQueue`.
2. Atur `GAME_RESIDENT_ROSTER=/path/absolut/deploy/private/residents.json` di environment server bila path berbeda.
3. Jangan taruh berkas roster atau asosiasi privat di dalam `public/`, bundle client, atau GitHub.
4. Pastikan semua 248 file gambar `portrait` tersedia di `public/game/assets/portraits/bandung/` dengan kategori yang benar.
5. Cek halaman `/game`, `/game/phaser`, dan `/game/canvas`: ketiganya menerima data yang sama setelah otentikasi. Identitas baru ditampilkan melalui `residents` tanpa mengambil nama dari `cast.json`.
6. Jangan publikasikan *legacy content* pada pemilik identitas baru tanpa verifikasi manual.

### Menghubungkan lore lama setelah pemeriksaan manual

Opsional: `GAME_APPROVED_LEGACY_ASSOCIATIONS=/path/privat/approved-legacy.json`. Format:

```json
[
  {
    "rosterId": "CONTOH_ID",
    "rosterName": "NAMA SESUAI ROSTER",
    "rosterOccupation": "PEKERJAAN SESUAI ROSTER",
    "legacyId": "CONTOH_ID_LAMA",
    "legacyName": "NAMA LAMA",
    "legacyOccupation": "PEKERJAAN LAMA",
    "approvedBy": "Pemeriksa yang berwenang",
    "approvedAt": "2026-11-22"
  }
]
```

Validasi mengharuskan keenam nilai ID/nama/pekerjaan cocok *persis* dengan sumber roster dan profil lama. Berkas approval tetap privat. **Kesamaan ID, pekerjaan, wajah, atau nama pendek bukan persetujuan.**

## Ketentuan kontinuitas

- Sebanyak 39 kandidat cerita lama dan konsekuensi 12 pilihan *tidak otomatis* diwariskan ke 248 warga baru.
- Simpan save game lama (bond/misi/flag) dalam namespace legacy; jangan hapus atau migrasikan hanya karena ID sama.
- Potret dengan ID `Rxxx`, `Kxx`, `Nxx`, `work-...` adalah *asset key* bukan identitas warga.
- Saat tidak ada roster terverifikasi, UI produksi tidak boleh menampilkan nama-nama lama sebagai daftar canonical.
- Character Bible 12 kategori untuk NPC baru adalah **belum disahkan** kecuali disusun dari basis cerita baru atau asosiasi lama yang eksplisit. Foto tidak boleh dipakai untuk menebak keluarga/usia/psikologi.
- Setiap update harus dites ulang untuk count 248, nama unik, ID unik, gambar ada, dan tautan identitas manual. Untuk seluruh 248 NPC, dunia terbuka dikembangkan bertahap; daftar warga di ponsel tidak berarti NPC langsung punya sprite berjalan.

## Cakupan perubahan ini

Sinkronisasi tampilan daftar warga, detail, wajah, pemisahan karakter legacy, dan pengamanan private roster. Ini **bukan** migrasi otomatis atas 274 misi, 151 lokasi, dan 343 prasyarat yang datanya tetap berada di import/legacy untuk direview. Mengklaim migrasi tersebut selesai sebelum review berisiko memindahkan kisah pada orang yang salah.

## Character Bible privat untuk seluruh 248 warga

Jalankan `npm run chars:bible:seed` sekali di Docker setelah roster tervalidasi. Perintah membuat `deploy/private/character-bibles.json` dengan **248 entri dan 12 kategori** di masing-masing entri, secara lokal saja, tanpa mengarang usia, keluarga, motivasi, konflik, atau riwayat warga. Semua entri berstatus `draft`, dan perintah **menolak menimpa** berkas lama.

Setelah penulis meninjau setiap profil secara individual, ubah `approval` entri tersebut menjadi `approved`. Ketika login, YZ Phone mengambil profil itu **saat warga diklik**, lewat `/api/game/resident-bible/[id]` yang memerlukan sesi login dan tidak di-cache. Biografi yang belum disetujui tidak akan ditampilkan.

Atur `GAME_RESIDENT_BIBLES=/path/privat/character-bibles.json` bila berkasnya tidak berada di lokasi default. Identitas inti, pekerjaan, dan referensi potret akan selalu dinormalisasi dari roster yang saat itu aktif, bukan menyalin nama yang mungkin sudah usang di Character Bible.

`npm run chars:roster:check` memvalidasi 248 baris, keunikan ID/nama/portrait, keberadaan file gambar dan izin asosiasi legacy. Perintah hanya mencetak jumlah, tidak mencetak identitas.

**Catatan:** 248 rancangan dengan 12 judul tidak berarti seluruh 248 *cerita* sudah tertulis. Kualitas naratif, dialog alami, ekspresi, serta kondisi runtime setiap NPC tetap membutuhkan peninjauan penulis dan tes permainan.

## Vercel tanpa file Docker

Agar ketiga URL game di Vercel menampilkan katalog 248 yang sama tanpa mengirim JSON privat ke GitHub, administrator dapat mengatur **environment variable server-only** `GAME_RESIDENT_ROSTER_JSON` (isi JSON array atau wrapper `{schemaVersion,currentRoster}`) pada environment deployment Vercel. Jangan memakai prefix `NEXT_PUBLIC_`, jangan menyalin nilai ini ke source/client, dan jangan menaruhnya dalam log atau hasil CI. Variabel ini memiliki prioritas lebih tinggi daripada `GAME_RESIDENT_ROSTER` yang menunjuk file Docker. Jika nilainya tidak valid, pembacaan gagal tertutup, bukan diam-diam mengganti nama dengan identitas lama. Perbarui deployment setelah memasang variabel privat.

Pada server Docker, default tetap berkas `deploy/private/residents.json`. Kedua bentuk diproses dan divalidasi oleh fungsi yang sama. Tidak ada perubahan data server yang dilakukan oleh PR ini.

## Sidik jari katalog canonical
Pembaca roster kini memverifikasi SHA-256 dari seluruh 248 entri (urut menurut ID, setiap baris berupa `id|name|occupation|portrait\n`). Sidik jari yang disematkan telah dihitung dari katalog 248 identitas yang diberikan owner pada 22 November 2026: `cd19795344bbb4fefc0022a3f17d25135d79624de4d5d9c6c618699cc1f871a0`. Jika ada satu nama, pekerjaan, potret, atau ID salah, data **tidak diaktifkan** dan sistem mencatat pesan error nonpribadi. Pengelola dapat menyetujui revisi dengan memperbarui hash setelah peninjauan atau mengatur `GAME_CANONICAL_ROSTER_SHA256` di server; jangan mengatur hash berdasarkan data sembarang demi memaksa lulus.
