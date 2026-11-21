# Audit NPC Docker dan PostgreSQL

## Hasil perbandingan aset NPC

- Paket SQLite dari Docker berisi 32 rekaman karakter; katalog GitHub juga berisi 32 karakter: Yanzen dan 31 NPC.
- Audit SHA-256 mencocokkan 465 dari 468 berkas paket impor dengan aset yang sudah dilacak di GitHub. Tidak ditemukan foto baru yang unik pada paket tersebut.
- Tiga berkas yang berbeda adalah metadata/dokumentasi sumber, bukan gambar:
  - `sumber-karakter/gba-v2/README.md`
  - `sumber-karakter/gba-v2-c/manifest.json`
  - `sumber-karakter/gba-v2-c/README.md`
- Aset canonical tidak ditimpa. Referensi gambar sumber tetap mengikuti batasan provenance yang tercatat pada katalog aset.

## Inventaris PostgreSQL Docker

Database `yz_farm_life` berisi tabel berikut pada saat audit:

| Tabel | Baris | Kategori |
| --- | ---: | --- |
| `yz_game_users` | 4 | Akun dan data autentikasi |
| `yz_game_sessions` | 8 | Sesi autentikasi |
| `yz_game_saves` | 4 | Simpanan permainan privat |

Tidak ditemukan tabel NPC terpisah di PostgreSQL. Data karakter berasal dari paket aset/SQLite, bukan dari tabel-tabel tersebut. Skema simpanan permainan yang digunakan aplikasi sudah didefinisikan di `supabase/migrations/20261116000100_yz_game_saves.sql`.

## Batas ekspor

Dump PostgreSQL mentah tidak disertakan di repositori publik karena tabel akun dan sesi menyimpan alamat email, hash kata sandi, serta hash token; simpanan juga berisi data pengguna. Tidak ada data baris PostgreSQL yang diunggah. Ekspor lengkap hanya layak ditempatkan di penyimpanan privat dengan kontrol akses yang sesuai.
