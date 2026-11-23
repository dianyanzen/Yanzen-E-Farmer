# Pilot Rumah Yanzen Minimalis — Kontrak Art & Navigasi

**Tanggal:** 23 November 2026 · **Scope:** hanya Rumah Yanzen (interior dan fasad exterior), tanpa mengubah interior gudang, rumah warga, NPC, quest, inventaris, atau save schema.

## Mengapa dimulai dari satu rumah?
Observasi screenshot staging: lantai cokelat di tengah/tepi terlihat kosong, tetapi beberapa bagian sebelumnya tertolak sebagai collision; kasur, meja, karpet, dan barang tambahan menjadikan rumah terlihat penuh. Masalah bersumber dari ketidakselarasan gambar base dan peta tile. Sasaran pilot: **lantai kosong = bisa dilewati**, dan **benda fisik = solid dengan interaksi mudah**.

## Konsep visual
- Rumah kecil petani di Pasirluyu, hangat, sederhana, berfungsi; atap genteng terakota menggantikan kesan turquoise fantasi.
- Pertahankan bentuk ilustrasi eksterior HD, pintu, jendela, dan tumbuhan yang sudah bagus; ubah palet atap melalui turunan canvas yang tidak merusak master.
- Interior dipisah dari furniture: panel kayu dan dinding berwarna krem, satu jendela menghadap pekarangan, kalender tanam, apron, mat pintu kecil, dan lantai papan sebagai ruang berjalan yang tenang. **Tidak ada karpet raksasa atau peti yang mengisi koridor**.
- Furniture utama hanya: kasur tunggal, peti hasil/bibit, rak catatan budidaya menempel dinding, dan meja kerja kebun. Furniture dari atlas HD lama tetapi diukur ulang; tidak ada lemari besar atau karung yang memblokir jalur.
- Semua interaksi mengikuti fungsi ekonomi game: kasur untuk tidur, meja untuk catatan, peti sebagai objek inspeksi, rak untuk buku. Jangan buat storage nyata baru tanpa sistem data.

## Implementasi
- `src/lib/game/farmhouse-visual.ts`: satu base kayu tanpa furnitur dan palet fasad atap petani. Original source atlas tetap tersimpan dan menjadi rollback.
- `src/lib/game/housing-hd.ts`: base rumah diganti dengan fungsi baru, props memakai layer terpisah; interior gudang tetap seperti sebelumnya.
- `src/lib/game/world-layout.ts`: empat perabot dengan posisi/ukuran visual sesuai karakter 24×32 px.
- `src/lib/game/world-layout-data.json`: collision tunggal, hotspot, dan zona ketuk aktual.
- `src/lib/game/model.ts`: batas ruangan dan fungsi tidur/inspeksi benar; save lama dipulihkan ke lantai terdekat jika pernah berdiri pada area yang kini solid.
- Phaser dan Canvas berbagi base interior baru dan turunan palet eksterior yang sama.

## Denah collision logis (tile 20×20)
Area berdiri: kolom x7…17, baris y6…13. Total 88 tile; 12 tile untuk furniture, **76 tile lantai bebas (86,4%)**. Kode: `##` = solid furniture, `..` = bebas.

```text
       x7  8  9  10 11 12 13 14 15 16 17
 y6    .. .. .. .. .. .. .. .. .. .. ..
 y7    .. ## ## .. .. .. .. .. ## ## ..
 y8    .. ## ## .. .. .. .. .. ## ## ..
 y9    .. ## ## .. .. .. .. .. .. .. ..
y10    .. .. .. .. .. .. .. .. .. .. ..
y11    .. ## ## .. .. .. .. .. .. .. ..
y12    .. .. .. .. .. .. .. .. .. .. ..
y13    .. .. .. .. .. pintu↓ .. .. .. ..
```

Titik mulai tetap (12,12), pintu keluar di sekitar (12,13). Semua tile bebas harus tersambung ke titik mulai. Tidak ada jalan satu tile yang berakhir buta. Hotspot kasur di sebelah kanan ranjang, meja di sebelah kiri, peti dari sisi kanan, rak pada dinding utara.

## Kualitas dan gate sebelum merge
- Jalankan `npm run typecheck`, `npm run assets:assemble:hd`, `npm run test:game`.
- `tests/game-farmhouse-walkability.mjs`: 76 tile yang tampak bisa dilewati dan 304 simulasi tap dari masing-masing tile ke 4 furnitur; tidak ada buntu atau aksi yang menunjuk objek salah.
- Uji visual dengan ukuran game di iPhone dan desktop: siang/malam, kesesuaian atap dengan gudang dan rumah tetangga, player dekat kasur/peti/meja/rak, ketuk lantai di semua pojok, keluar/masuk lewat pintu, save lama.
- **Masih membutuhkan penilaian visual pemilik** karena render prosedural bisa berbeda sedikit dari HD master dan facade direcolor, bukan gambar ulang seluruh siluet.
- Jangan merge ke main atau menghapus aset lama hanya berdasarkan tes logika.
