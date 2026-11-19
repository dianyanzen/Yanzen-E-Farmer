# Potret seluruh karakter YZ Farm Life

32 karakter mengikuti `game-assets/catalog/cast.json`: Yanzen (A01) + 31 NPC. Setiap karakter memiliki delapan ekspresi original, total **256 potret**.

| Kolom | ID ekspresi | Nama |
| --- | --- | --- |
| 0 | neutral | Netral |
| 1 | happy | Senang |
| 2 | sad | Sedih |
| 3 | worried | Khawatir |
| 4 | surprised | Terkejut |
| 5 | annoyed | Kesal |
| 6 | shy | Malu |
| 7 | laughing | Tertawa |

Ekspresi malu menunjukkan rasa sungkan sosial; tidak menambahkan jalur romansa.

## Referensi dan konsistensi
Wajah dan pakaian mengikuti sprite depan dari dua paket referensi yang sudah ada: `gba-v2` (A01–A16), `gba-v2-c` (C01–C16). Rambut Ryan hitam; Nani mengenakan hijab beige dan blus bunga; Inggit bersanggul dan memakai apron cokelat. Nida tetap bermasker. Tatang dan Heri tetap berkumis pada seluruh ekspresi.

Potret dibuat dalam delapan kelompok berisi empat karakter. Aset memakai OpenAI image generation dan diperiksa terhadap referensi. Prompt dan checksum sumber/hasil tercatat dalam `game-assets/catalog/portrait-production.json`. Tidak ada gambar Harvest Moon yang dimasukkan ke aset.

## Runtime
- `public/game/assets/portraits/{ID}.png`: satu strip 1536×256 per karakter, delapan sel 192×256.
- `public/game/assets/portraits/manifest.json`: pemetaan 32 karakter dan delapan ekspresi.
- Potret memakai lazy-loaded image. Mengganti ekspresi menggeser strip yang sama, bukan mengunduh gambar lain.
- ID tidak dikenal atau gambar gagal dimuat menampilkan placeholder; tidak meminjam wajah karakter lain.
- Dialog dan kedekatan tiga NPC Pasirluyu memakai potret baru. Profil IKD karakter utama memakai potret Yanzen.
- YZ Phone → **Warga**: cari nama/pekerjaan, baca profil/hobi, dan pilih salah satu delapan ekspresi. Katalog menampilkan seluruh karakter; NPC yang belum mempunyai area permainan ditandai **Wilayah berikutnya**.
- Menambah potret tidak menempatkan 28 NPC lain ke peta atau menambahkan cerita/quest mereka.

Atlas lama `characters/portraits.png` dipertahankan untuk kompatibilitas URL; komponen runtime baru memakai strip per karakter.

## Pemeriksaan
`npm run test:portraits`: jumlah, identitas, dimensi, pemetaan ekspresi, fallback, dan ukuran aset.
`npm run test:portraits:ui`: memuat semua 32 strip, delapan ekspresi, pencarian, lazy loading, dan fallback gambar gagal di browser.
Pengujian dialog/rumah, save lama, TypeScript, ESLint, dan build produksi juga dijalankan.
