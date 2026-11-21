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
