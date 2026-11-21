# YZ FARM LIFE — EXPERIENCE-FIRST ROADMAP v1.1
**Keputusan pemilik: 21 November 2026 · Fokus: playable experience Pasirluyu · Status: arah kerja resmi, BUKAN klaim fitur sudah selesai.**

> Baca [GAME_AUDIT_MASTER.md](GAME_AUDIT_MASTER.md), [AUDIT_PLAYBOOK.md](AUDIT_PLAYBOOK.md), dan [AUDIT_HISTORY.md](AUDIT_HISTORY.md) setiap memulai tugas game. Dokumen ini adalah prioritas **atas perintah pemilik**, bukan pengganti catatan teknis dan bukan izin merge/production otomatis.

## 0. Keputusan final dari pemilik (menggantikan urutan roadmap awal)

1. **Tahap 1 (migrasi Docker ke web, sinkronisasi akun/datastore lintas environment): DITUNDA / DEFERRED.** Docker **hanya digunakan untuk uji coba** dan iterasi lokal. Jangan membangun migrasi database, SSO lintas subdomain, redesign deployment atau pembagian monorepo sekarang. Backlog G-003 disimpan untuk saat pemilik memilih rilis standalone nanti.
2. **Fokus utama: Tahap 2 (game feel, UX, animasi, peta, performa) lalu Tahap 3 (suasana kota kecil, dialog, NPC, ekonomi sosial)**. Jalankan iterasi singkat dan bisa dicoba, bukan perubahan besar sekaligus.
3. **Ekspansi dunia: sangat perlahan.** Dilarang memperluas puluhan kecamatan, semua 151 kelurahan, menambahkan 31 NPC playable sekaligus, membuat semua pekerjaan/alat/komoditas dalam satu PR, atau mendesain ulang atlas kota sebelum Pasirluyu siap dimainkan. Penambahan map/NPC harus mengikuti bukti kebutuhan pemain dan QA area lama.
4. **Nilai keberhasilan utama = pengalaman pemain:** pemain nyaman bergerak dan bereksplorasi, merasa dunia hidup, tahu harus melakukan apa tanpa HUD berlebihan, tidak mudah stuck, dialog menyenangkan, interaksi terasa bermakna, waktu tidak memburu.
5. **Pengecualian keselamatan minimal:** jangan hilangkan/korup save lokal dalam eksperimen, jangan menyentuh data Smart Farm nyata, jangan menonaktifkan akses/RLS web, dan jangan mengklaim preview sebagai production. Ini guardrail, **bukan proyek migrasi tahap 1**. Audit produksi/save multi-device luas menjadi release gate saat rilis publik diminta.

**Kebijakan aset (penegasan pemilik):** jumlah aset *vault* boleh sangat banyak dan berkembang jauh sebelum peta baru dibuat. Jangan batasi perpustakaan menjadi hanya apa yang tampil di Pasirluyu. Namun setiap aset harus memiliki ID, provenance/lisensi, klasifikasi gaya, status review dan potensi pengalaman, sedangkan runtime per-zona tetap hemat. Duplikasi sprite generik harus ditandai, **tidak dihapus** sehingga 196 nama komoditas tetap ada. Perbaikan potret pixel-art aktif diprioritaskan; ilustrasi konsep Bandung disimpan sebagai varian sampai redrawing lulus QA. Lihat [ASSET_LIBRARY_MASTER.md](https://github.com/dianyanzen/Yanzen-E-Farmer/blob/feat/game/asset-library-database-experience-20261121/docs/game-dev/ASSET_LIBRARY_MASTER.md) pada PR #31.

## 1. Empat sprint experience-first (urutannya dapat disesuaikan hasil QA)

| Sprint | Scope | Masalah audit & area kode | Exit criteria (bukti aktual, bukan klaim) |
| --- | --- | --- | --- |
| **EX-01 — Movement, clock & sleep** | Kelancaran Phaser/Canvas, aksi alat, animasi karakter, reaksi input, kamera dan zoom; jam berjalan/aktivitas; fase tidur, sound & night overlay. Integrasikan PR #30 setelah review. | G-006, G-007, G-014, G-015, G-027, G-028; `model.ts`, `game-client.tsx`, `phaser-world.ts`, `field-engine.ts` | Satu sesi eksplorasi rumah→kebun→gang→pasar→rumah di keyboard/touch tanpa input macet, kamera melompat, frame kosong; tidur berganti hari tepat sekali; jam dikalibrasi berdasar video playtest, bukan perkiraan |
| **EX-02 — Market & Pasirluyu atmosphere** | Plaza paving menyambung, semua pintu reachable, crowd yang tidak memblok, stall & dekorasi original, layering, shading senja/malam, ambient pasar, jejak langkah dan gerak kecil di gang/sungai. | G-011, G-012, G-029, G-031; `modular-outdoor.ts`, `model.ts:areaBlocked`, `connected-edges.ts`, `field-audio.ts` | Screenshot/clip pasar pagi–siang–malam pada desktop+mobile; uji collision/portal 4 zona; semua aset 200 dan prop solid tak bisa ditembus; UI tetap mudah dibaca |
| **EX-03 — Lima NPC terasa hidup** | Fokus dulu pada **Ryan, Nani, Inggit, Ayu, Widi**; perilaku lokasi/jam/cuaca, walk/idle/aktivitas pekerjaan, percakapan singkat bervariasi, pilihan yang relevan dan perubahan kedekatan, lokasi rumah & pasar sesuai jadwal. | G-018, G-019, G-020, G-012; `model.ts`, `personal-quests.ts`, `dialogue-panel.tsx`, `resident-profile.ts` | Kelima NPC terlihat dan bisa ditemui; tiap NPC minimal satu rutinitas siang dan pulang, respons konteks bermakna, tidak spam dialog sama; quest & rewards tidak terduplikasi |
| **EX-04 — Polished daily loop** | Cangkul/tanam/siram/panen → jual/beli → interaksi sosial → memancing (opsional) → pulang → tidur → pagi; natural signposts, YZ Phone sebagai pusat bantuan, tidak ada banjir label. | G-021/022/024/025 hanya sebagai polish mekanik **yang sudah ada**, G-028/G-032 | Minimal dua sesi playtest terstruktur 15–20 menit pada keyboard dan touch; tidak ada blocker P1 pada jalur utama; screenshot baseline + catatan FPS/Network dari perangkat nyata; pemain tahu kegiatan berikut lewat lingkungan/HP |

## 2. Experience contracts (lebih penting daripada banyaknya fitur)

### A. Controls & camera
- Gerak memiliki kecepatan dan interpolasi konsisten; tombol keyboard tahan, arah, input tap/hold/drag, dan ESC dapat diandalkan.
- Kamera menjaga pemain terlihat, tidak memotong jalur portal, objek penting, atau memicu blur/tile wobble.
- Pixel art, shadow dan collision terlihat konsisten; tanpa aset bergerak sendiri akibat mismatch skala.
- Mobile 360×800, 393×852, 430×932; desktop 1366×768 dan 1920×1080; touch controls nyaman (target interaktif minimal sekitar 44 CSS px), safe-area benar; UI di HP minimal.
- FPS/latency **diukur** pada perangkat dan scenario, jangan mengarang nominal sebelum baseline.

### B. Clock & sleep
- Di PR #30 clock menjadi 16 langkah outdoor per menit, kerja/pancing 1 menit; ini **hipotesis tuning**, bukan keputusan bahwa sudah ideal.
- Pertahankan waktu berhenti ketika dialog/menu terbuka. Ukur berapa menit game yang berlalu selama **perjalanan kebun→pasar dan 10–20 menit sesi nyata**. Jangan membuat pemain tidak pernah mencapai malam karena terlalu lambat, atau langsung malam karena terlalu cepat.
- Tidur hanya dekat kasur, konfirmasi, animasi satu alur yang natural, kontrol dikunci, nextDay/save tepat sekali, fade tidak menyilaukan, dan reduced-motion tersedia.
- Jika perlu, pilih clock hibrida secara **desain setelah playtest**; jangan mengubah clock secara buta untuk menyenangkan angka.

### C. Pasirluyu looks alive
- Paving pasar persegi panjang penuh dan jalan paving/seam tidak terputus.
- Kepadatan **visual** dipisahkan dari **collision**; set footprint hanya untuk benda besar; pusat jalan dan semua pintu bebas; jalur jelas lewat prop, tekstur, gestur.
- NPC melakukan aktivitas yang masuk akal, bukan sekadar diam/label. Ada perubahan suasana pagi–siang–malam dan audio sederhana.
- Aset baru harus bergaya pixel art orisinal dan relevan, tidak menambah download awal tanpa perlu. Semua visual harus diverifikasi screenshot di game nyata.

### D. Natural UX, not HUD simulator
- Jurnal/HUD dapat disembunyikan; pertolongan detail di YZ Phone.
- Nama tempat pada plang **bisa diinspeksi**, bukan label permanen pada semua objek.
- Dialog mengandalkan portrait, ekspresi, pilihan, gestur serta konsekuensi, bukan panel teks yang menutupi layar terus menerus.
- Rilis setiap slice yang benar-benar terasa; jangan menambah props yang hanya ada di repo tapi tidak digunakan oleh runtime.

## 3. Konten sosial terukur: five-character depth before thirty-one-character breadth

| NPC | Peran yang sudah ada | Polishing pertama yang bermanfaat | Pengujian |
| --- | --- | --- | --- |
| Ryan (A03) | Pengurus saluran | Jalan inspeksi bendung, gestur mengecek air, kabar berubah jika pintu dibuka/hujan | Muncul area/waktu sesuai; feedback kanal terkait quest |
| Nani (C01) | Tanaman dan sejarah warga | Rutinitas teras/melati, ekspresi ketika pilihan foto berbeda, percakapan mengingat hasil Bab 1 | Memory choice tahan reload, dialog tidak kontradiktif |
| Inggit (C08) | Warung/sayur | Persiapan dagang pagi, pembeli siang, penutupan sore, respons pesanan timun | Jam buka/tutup, jual-beli, reward & stok benar |
| Ayu (A04) | Penjual bibit | Menata bibit, idle di kios, saran tumbuh sesuai kondisi petak | Ada aktivitas dan penjualan valid |
| Widi (C07) | Ikan dan pelet | Es/keranjang ikan, timbangan, respons terhadap hasil pancing | Jual ikan dan bait, loop ikan teruji |

**Target EX-03** tidak mensyaratkan 26 NPC lain langsung diberi map/rumah. Crowd dekoratif hanya ditambah jika tidak mengganggu jalur dan bisa dibedakan jelas dari NPC interaktif.

## 4. Ekspansi bertahap — gerbang sebelum membuka area baru

**STOP ekspansi** bila EX-01/EX-02/EX-03 belum konsisten dimainkan atau masih ada blocker P1 navigasi, save lokal, interaksi, atau kamera. Boleh menambah 1 detail kecil pada zona yang sudah ada, bukan membangun kecamatan baru.

**Syarat membuka satu lokasi tambahan (bukan kewajiban langsung):**
1. Pasirluyu utama sudah dimainkan keyboard & touch dan issue G-006/007/011/028/029 tidak lagi blocker.
2. Area baru menjawab kebutuhan gameplay/cerita tertentu, tidak hanya meningkatkan jumlah lokasi.
3. Satu PR = **satu zona kecil** atau satu kelompok NPC sangat kecil; desain pintu/portal, jalur pulang, NPC schedule, aset, collision dan save migration diuji sekaligus.
4. Main → Docker hanya port selektif bila diperlukan; jangan rewrite semua saat menambah map.
5. Sebelum lanjut, cek biaya aset/performa dan umpan balik tentang area sebelumnya.

**Tidak menjadi prioritas sekarang:** 30 kecamatan menjadi playable sekaligus, 151 map kelurahan, 264 komoditas, semua alat 41 planned, romansa/festival, sistem pekerjaan masif, seluruh transport, relokasi backend.

## 5. Pembagian kerja dua AI dan urutan integrasi

- **ChatGPT:** audit visual/kode, review UX, menetapkan acceptance criteria, memilih perubahan minimal dan melakukan implementasi terdelegasi via PR terpisah.
- **Codex pada Docker lokal:** jalankan dan fine-tune fitur EX-01/EX-02/EX-03, ambil screenshot/video/repro, uji aksi secara langsung; buat PR/commit/handoff, tanpa mengubah produk kebun.
- **GitHub:** repository dan master audit adalah sumber kebenaran; tiap isu G-xxx punya owner/branch agar tidak bentrok.
- **Pemilik:** pilih pengalaman yang terasa benar, menyetujui integrasi akhir atau rilis. Tidak perlu meninjau migrasi server dalam sprint experience.
- **PR #30:** perubahan jam/tidur/pasar **belum merge saat roadmap ini ditulis**. Review gameplay sebelum memindah ke `main`. **PR #29:** master audit dan kebijakan ini; belum merge saat ditulis.

## 6. Bukti & laporan sprint yang wajib diserahkan

Format ringkas:
- `EX-01/02/03/04` dan ID `G-xxx`, branch, SHA, PR, status preview/Docker.
- Tiga screenshot utama before/after (atau video 30–60 detik): posisi/viewport/jam game; bila tidak dapat screenshot, tulis NOT_RUN.
- 1 temuan pengalaman nyata yang diperbaiki dan cara mereproduksinya.
- 7 langkah audit: observasi, penyebab, confidence %, alternatif, tindakan, dampak pada game, prioritas.
- Tes model + visual manual (PC dan mobile), performance baseline jika diukur.
- Apa yang tidak berubah (termasuk Smart Farm), risiko tersisa, dan apakah pengguna sudah menyetujui merge/production.

**Definisi keberhasilan sekarang:** pemain dapat menikmati dunia kecil Pasirluyu berulang kali karena sistem dan karakter terasa hidup, **bukan** karena jumlah kota, aset, atau fitur di tabel meningkat.
