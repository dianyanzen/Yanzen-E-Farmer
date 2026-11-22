# Standar Potret NPC Aktif — YZ Farm Life
**Dokumen normatif v1.1 | 22 November 2026 | ruang lingkup: lima NPC yang benar-benar muncul dalam gameplay Pasirluyu**

> Status: standar editorial dan kontrak runtime yang disusun setelah inspeksi **sepuluh PNG aktual** (lima potret profesi + lima strip ekspresi) dan kode dialog; bukan pernyataan bahwa setiap aset telah lolos QA final. Dokumen untuk 248 NPC lain bukan cakupan tahap ini.

## 1. Sumber kebenaran dan batasan

1. **NPC yang benar-benar aktif:** `src/lib/game/model.ts` → `placements` / `NPCS`. Tepat lima: `A03`, `A04`, `C01`, `C07`, `C08`. Jangan menyimpulkan seluruh 248 warga telah memiliki dialog/spawn.
2. **Ekspresi di dialog gameplay:** `src/lib/game/portraits.ts`, `src/app/game/dialogue-panel.tsx` dan `public/game/assets/portraits/{ID}.png`. Ini adalah strip **legacy runtime** dan tidak otomatis menyatakan bahwa cerita/relasi legacy telah disahkan untuk katalog canonical.
3. **Potret profesi / ensiklopedia Warga:** `public/game/assets/portraits/bandung/professions/work-{ID}.png` dengan `game-assets/catalog/npc-public-roster.json` dan indeks `public/game/data/npc/index.json` sebagai kunci identitas canonical. Untuk Widi, perubahan profesi dan potret berada di PR #43 sampai digabung.
4. **Daftar dan produksi:** `game-assets/catalog/npc-portrait-register.json`, `game-assets/catalog/portrait-production.json`, `public/game/assets/portraits/manifest.json`. Sebagian dokumen lama menyebut tiga NPC dan daftar 32 potret; itu fase katalog, **bukan jumlah penduduk playable saat ini**.
5. **Pemain ≠ developer:** pemain hanya melihat nama, wajah, reaksi, dan dialog; jangan tampilkan ID, fingerprint, atau status review. Jangan menyamakan profil umum dengan progres pertemuan, quest, atau kedekatan tanpa `approvedLegacyId`.

## 2. Tiga lapisan visual yang berbeda

| Lapisan | Tujuan | Kontrak saat ini | Aturan |
|---|---|---|---|
| Sprite dunia | karakter berjalan / berinteraksi di peta | Aset berjalan renderer dan frame dunia, bukan 256×256 portrait | Bentuk kepala, warna rambut, penutup kepala, pakaian dan siluet harus tetap dapat dikenali; jangan memaksakan detail potret ke sprite 24×32 |
| Strip ekspresi | percakapan/reaksi emosi | **PNG 1536×256**, 8 kolom × 192×256, urutan tetap | Posisi kepala, bahu, kostum, dan outline tidak boleh meloncat antarsel; transparansi bersih |
| Potret profesi | profil Warga / pekerjaan | Seluruh lima potret profesi aktif **256×256**; Widi menggunakan versi perbaikan pilihan pemilik berlatar krem | Target ekspor 256×256, square untuk Warga. Versi resolusi lebih tinggi boleh sebagai sumber, tetapi output publik harus sesuai gaya artistik dan pemeriksaan QA |

**Jangan memakai potret persegi untuk menggantikan ekspresi dialog.** Foto/konsep statis tidak mempunyai delapan emosi. Bila thumbnail Warga tampil sebagai potret statis, itu tidak boleh mematikan strip ekspresi pada panel dialog.

## 3. Identitas visual yang dikunci untuk lima NPC aktif

| Tokoh | Penanda visual yang HARUS bertahan | Potret profesi | Strip dialog | Hasil inspeksi awal |
|---|---|---|---|---|
| **Ryan (A03)** | rambut gelap berantakan, alis tegas, kemeja kerja ochre/kuning tanah | tampak mengatur sambungan pipa | 8 wajah, rambut dan warna busana tetap | **Cocok secara umum**; beda pose kerja wajar, periksa garis atas strip dan anti-alias |
| **Ayu (A04)** | hijab lavender abu-ungu, pakaian senada, wajah lembut | membawa bungkus benih | 8 wajah dengan hijab dan outfit konsisten | **Cocok secara umum**; beberapa ekspresi sedih dan khawatir perlu cukup terbedakan di layar kecil |
| **Nani (C01)** | usia lanjut, hijab beige/merah muda pudar, blus bunga, kerutan wajah | membawa pot tanaman | 8 wajah dengan ciri umur tetap | **Cocok secara umum**; jaga kerutan dan corak baju di semua emosi, periksa kebersihan alpha |
| **Widi (C07)** | rambut gelap berantakan, wajah muda tanpa kumis, kemeja charcoal | **PR #43:** versi **256×256 yang dipilih pemilik**, joran, reel, jaring dan kotak umpan, latar krem | 8 wajah pixel-anime, identitas rambut/mata dan pakaian tetap | **Arah visual diperbaiki dan dipilih pemilik**; uji lagi pada ukuran 80px dan sprite dunia sebelum menyatakan QA runtime selesai |
| **Inggit (C08)** | rambut cokelat bersanggul, atasan gelap, apron cokelat muda | membawa semangkuk makanan | 8 wajah dengan sanggul dan apron | **Cocok secara umum**; bentuk sanggul dan warna apron konsisten |

Empat potret awal terlihat selaras secara umum berdasarkan inspeksi visual. Potret Widi generasi pertama dalam PR #43 memang tidak cocok; versi itu **sudah diganti** dengan pilihan pemilik yang lebih dekat ke wajah, palet, latar krem, dan gaya NPC aktif. Persetujuan arah visual ini belum menggantikan uji tampilan mobile dan sprite dunia.

### Keputusan khusus Widi

- Potret profesi **yang dipilih pemilik** telah diintegrasikan sebagai `work-C07.png` ukuran 256×256, mengikuti standarisasi empat NPC lain.
- **Identitas tidak berubah:** rambut gelap acak, wajah muda tanpa kumis/janggut dan kemeja charcoal. Rompi, joran, reel, kotak umpan dan jaring adalah atribut profesi tambahan.
- Gambar generasi sebelumnya (512×512, semi-realistis dan berkumis) **digantikan**, bukan digunakan pada game. Potret lama berkeranjang sayur tetap tercatat dalam Git history, bukan gambar aktif di branch.
- **Status:** arah visual disetujui pemilik pada 22 November 2026; masih perlu inspeksi pada ukuran kartu Warga 80px, koherensi sprite dunia, dan tes saat dialog. Delapan-frame ekspresi `C07.png` tidak diubah.
- Hindari mengganti penanda wajah/hijab dan jangan menambahkan aksesori yang merombak identitas karakter di ekspresi.

## 4. Aturan generasi, ilustrasi, dan komposisi

- **Satu master wajah per tokoh:** bentuk muka, posisi mata, ukuran hidung, garis rahang, telinga, warna kulit, gaya rambut/hijab, dan umur visual tidak berubah akibat emosi.
- **Satu pakaian utama untuk delapan emosi:** atribut profesi hanya di konsep/pose tambahan kecuali memang terlihat konsisten pada seluruh frame. Hindari tangan ekstra, potongan bahu, dan aksesori yang muncul-hilang sembarangan.
- **Art style:** potret ilustrasi Bandung bergaris tegas dan cel shading hangat dengan tekstur piksel terkontrol; bukan foto realistik, cat minyak, 3D, gaya chibi ekstrem, atau campuran resolusi yang tidak seragam.
- **Framing:** wajah berada pada area yang konsisten, bagian tubuh terlihat sampai dada/bahu; sisakan ruang aman untuk kepala/rambut/hijab; tidak ada elemen liar yang menyentuh tepi atas/sel.
- **Warna:** muted ochre Ryan, lavender Ayu, beige-bunga Nani, charcoal Widi, cokelat-apron Inggit. Jangan memaksakan satu warna pakaian untuk semua orang.
- **Ekspor:** PNG dengan alpha nyata untuk strip ekspresi; setiap sel **192×256** tanpa garis pembatas, huruf, placeholder, watermark, atau kebocoran piksel dari frame lain. Potret profesi 256×256 dengan latar sederhana boleh opaque.
- **Layar kecil:** emosi tetap harus terbaca pada lebar **80 px mobile**; cek juga 112 px desktop, kondisi terang/gelap, antarmuka penuh, dan pembesaran nearest-neighbor tanpa blur.

## 5. Urutan dan makna delapan ekspresi — kontrak tetap

| Kolom | Key | Bahasa pemain | Penanda yang harus terbaca |
|---:|---|---|---|
| 0 | `neutral` | Netral | pandangan tenang dan mulut wajar |
| 1 | `happy` | Senang | senyum tampak jelas, bukan tertawa terbuka |
| 2 | `sad` | Sedih | sudut mulut turun dan mata meredup |
| 3 | `worried` | Khawatir | alis tegang/terangkat dengan kegelisahan |
| 4 | `surprised` | Terkejut | mata lebih terbuka dan mulut bereaksi |
| 5 | `annoyed` | Kesal | alis menyatu/menurun, ekspresi tertahan |
| 6 | `shy` | Malu | sungkan halus dan pipi merona, bukan otomatis romansa |
| 7 | `laughing` | Tertawa | mata dan mulut tertawa jelas |

Urutan ini ditetapkan di `PORTRAIT_EMOTIONS`; jangan menukar kolom tanpa migrasi generator/manifest/tes. Interaksi pemain harus memakai respons yang relevan: misalnya ikan lepas dapat memicu `worried`, kabar baik `happy`, kesalahan serius `annoyed` **hanya bila cocok dengan sifat tokoh**; hindari tiap kalimat memicu perubahan ekspresi dramatis.

## 6. Kontrak UI dialog (temuan bug dan penyelesaiannya)

**Temuan kode sebelum perbaikan:** `DialoguePanel` memilih `ResidentPortrait` jika server memberikan profil canonical yang cocok secara visual. Komponen ini menampilkan satu gambar statis dan mengabaikan `dialogue.emotion`. Inilah sebabnya kumpulan delapan ekspresi bisa tampak tidak dipakai. **Ini bug presentasi, bukan kekurangan aset.**

**Perbaikan minimum pada branch:** Panel dialog aktif selalu memakai `Portrait npcId=... emotion=...`; nama yang tampil boleh canonical jika lolos pencocokan konservatif. `ResidentPortrait` tetap dipakai untuk katalog Warga dan keperluan thumbnail. Peristiwa hubungan/quest tetap mengikuti save dan tautan yang memang sudah disahkan, **bukan** hasil persamaan potret.

- Dukung `dialogue.emotions?.[page]` jika setiap halaman mempunyai emosi berbeda, fallback ke `dialogue.emotion` lalu `neutral`. Perubahan ini *presentasi murni*, tidak memodifikasi game save.
- Tidak membuat tab emosi atau toggle developer di YZ Phone pemain.
- Gambar gagal: fallback huruf nama tokoh yang bersangkutan, jangan pernah mengganti dengan wajah NPC lain.
- Pastikan pemuatan lazy gambar tidak menyebabkan portrait flicker antarhalaman dan layout dialog tidak bergeser.

## 7. Quality gate sebelum aset diganti atau rilis

**P0 — blok rilis:** wajah/umur/siluet tidak sesuai, profesi atau potret milik orang lain, rasio frame salah, salah urutan emosi, dialog memakai wajah statis saat emosi berubah, PNG terpotong, sumber tanpa izin, atau mismatch identitas antara konsep Widi dan ekspresinya.

**P1 — perbaiki saat QA:** kontur kurang konsisten, proporsi kepala bergeser, latar/alpha kotor, warna outfit melenceng, ekspresi sedih vs khawatir nyaris sama, artefak blur pada skala 80 px.

**P2 — polish:** detail kecil ekspresi, pendar blush, pose tangan pendukung, penghalusan outline jika tidak mengurangi kesan pixel.

Lakukan sebelum merge:
1. Ambil screenshot potret profesi + semua 8 ekspresi + sprite dunia secara berdampingan untuk setiap NPC aktif.
2. Cek kontur, warna, karakteristik wajah, jumlah jari, atribut profesi, koridor frame, alpha dan bleed; bandingkan terutama idle/worried/surprised/laughing.
3. Jalankan `npm run test:portraits`, `npm run test:portraits:ui`, `npm run typecheck`, `npm run test:game`, `npm run test:game:humanizer`, kemudian test game di iPhone dan desktop.
4. Uji pilihan dialog yang menimbulkan `happy`, `sad`, `worried`, dan `annoyed` pada masing-masing NPC bila cerita yang aktif memang menyediakan pilihan itu; jangan mengarang dialog hanya demi check.
5. Untuk berkas yang diganti: catat ukuran/dimensi, checksum SHA-256, Git blob SHA, asal, tanggal tinjauan dan `needs-human-side-by-side` sampai reviewer menyetujui. Update manifest/ledger; **jangan menulis bahwa QA manusia telah lulus bila belum**.

## 8. Rekomendasi prioritas

- **P0:** pertahankan perbaikan render ekspresi dialog, periksa potret Widi pilihan pemilik di ukuran UI aktual sebelum produksi.
- **P1:** ukur ulang keseragaman lima pasangan pada layar perangkat fisik serta pastikan emosi per halaman bila tersedia tidak diabaikan.
- **P2:** polish art kecil, animasi masuk potret halus, dan variasi reaksi natural tanpa menambah HUD.
- **Bukan lingkup ini:** membuat 243 sprite/strip ekspresi tambahan hanya untuk memenuhi 248 profil Warga.

Lihat juga `PORTRAIT_CATALOG.md`, `ART_DIRECTION.md`, `PLAYER_DEVELOPER_CONTENT_BOUNDARY.md`, `YZ_PHONE_WARGA_KRONIK.md`, dan `docs/game-dev/FISHING_EXPERIENCE_V2.md`.


## Tambahan implementasi — 22 November 2026 (Remaster Widi)
Pemilik meminta **strip ekspresi Widi baru** dipakai, bukan sekadar menggeser potret lama. Frame baru telah disusun dari delapan ekspresi hasil generasi yang disediakan, dalam bentuk 8×1 sel 192×256 (total 1536×256), untuk `public/game/assets/portraits/C07.png`. Setiap potret di-center pada area transparan sendiri; tidak boleh ada pixel karakter lain pada tepi frame. Palet dipadatkan untuk keterbacaan piksel pada layar ponsel.

Potret profesi Widi `work-C07.png` **tetap** digunakan sebagai potret Warga. Perbaikan ekspresi tidak mengubah pekerjaan, ID canonical, save, hubungan, atau cerita.

Validasi gambar baru perlu dibandingkan pada 80px / 112px dan pada kedelapan emosi (neutral, happy, sad, worried, surprised, annoyed, shy, laughing) di Safari iOS dan Android Chrome. `styleReview` pada register bernilai `owner-requested-remaster-8-emotions-20261122-awaiting-safari-qa` hingga review viewport selesai; tes berkas otomatis bukan pengganti review manusia.
