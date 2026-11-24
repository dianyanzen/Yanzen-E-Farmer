# YZ Phone — Warga, Kronik dan cerita yang benar-benar terjadi

**Status implementasi aktif, 22 November 2026.** Baca `PLAYER_DEVELOPER_CONTENT_BOUNDARY.md` dan skill `yz-farm-encyclopedia`.

## Warga

- **Satu ikon Warga**, tidak ada Wargapedia duplikat. Daftar memuat potret, nama yang ditulis manusiawi, profesi, dan pencarian nama/pekerjaan. Pagination menjaga layar portrait tetap nyaman.
- Data diambil dari `/game/data/npc/index.json` dan `/game/data/npc/{ID}.json`. Ada 248 karakter canonical dan 12 kategori di **lapisan data developer**, namun `wargaPlayerView` memilih hanya **keseharian, cerita asal yang layak, ciri yang terlihat atau riwayat publik tersumber untuk kameo**.
- Pemain **tidak perlu diberi tahu** profil dapat diakses sejak awal; membacanya bukan hadiah kedekatan. Jangan tampilkan ID, approval, status draf, daftar semua field mentah, atau instruksi developer.
- Informasi percakapan dan misi hanya muncul ketika ada data `GameState` dan hubungan legacy→canonical yang **disetujui** melalui `approvedLegacyId`. Tidak boleh mengarang pertemuan/lokasi agar kartu hubungan terisi.
- Kameo P01/P02 menampilkan biografi publik yang memiliki tautan sumber; interaksi serta dialog game bukan kegiatan atau kutipan nyata.
- Editor memakai dokumen JSON/wiki dan endpoint review server terotorisasi `/api/game/resident-bible/[id]?draft=1`; **tidak ada toggle debug di YZ Phone pemain**.

## Kronik

`Kronik` merangkum `GameState`: kisah dan milestone Bab 1, misi personal, jejak hari, keputusan bercabang, percakapan serta panen. Ia tidak menyisipkan cerita usulan 248 NPC sebagai pengalaman yang sudah terjadi. Tidak mengarang tanggal bila tanggal belum disimpan.

Saat sebuah riwayat punya hubungan yang disetujui, tombol Warga membuka halaman orang yang tepat. Jika tidak ada mapping yang sah, tombol tidak dibuat; **jangan menjelaskan konflik ID/versi lama kepada pemain**.

## Panduan

Panduan dalam YZ Phone menjadi tempat utama kontrol HP/PC, bertani, pulang dan tidur. HUD dan papan cukup menunjukkan tindakan yang sedang relevan. Jangan menampilkan rencana ekspansi, editor UI atau detail build.

## Batas saat ini

- 248 profil dan potret adalah cakupan ensiklopedia, bukan 248 tokoh yang sudah berjalan di peta.
- Bab 1, save, dan mekanik aktivitas mengikuti source runtime; konten arsip 32/70 karakter lama masih ada untuk kompatibilitas tetapi **bukan** identitas canonical.
- Vercel staging Hobby memakai build game-only dengan 8 entry route; halaman web ensiklopedia terpisah dapat tersedia di source, tetapi tidak termasuk rute playtest jika memang dipangkas.

## QA

Jalankan `npm run chars:public:check`, `npm run test:game`, `npm run typecheck`, `npm run test:portraits:ui`, dan inspeksi nyata iOS/desktop. Pastikan daftar 248, pencarian nama, profil tidak menampilkan ID/draf, potret dan sumber kameo, error jaringan, tombol kembali, aksesibilitas, serta Kronik berdasarkan save.
