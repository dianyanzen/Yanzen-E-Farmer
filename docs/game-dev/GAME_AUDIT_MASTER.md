# YZ FARM LIFE — MASTER AUDIT & IMPROVEMENT REGISTER
**Versi 1.0 | Snapshot: 21 November 2026 WIB | Pemilik produk: Yanzen**

> **DOKUMEN KANONIK.** Semua ChatGPT, Codex, Copilot, dan agen yang menganalisis, mengubah, menilai, menguji, atau merilis **YZ Farm Life** WAJIB membaca dokumen ini dahulu, lalu [AUDIT_PLAYBOOK.md](AUDIT_PLAYBOOK.md), membaca status GitHub sebenarnya, dan melaporkan delta. Dokumen ini bukan bukti bahwa temuan sudah diperbaiki. **Jangan membuat daftar audit paralel yang berpotensi bertentangan.**

## A. Aturan kebenaran dan batas audit

1. **Kode + commit SHA + pengujian terverifikasi** adalah bukti implementasi. Catatan chat, README lama, dan klaim AI tidak otomatis membuktikan perubahan sudah terpasang.
2. Bedakan `MERGED_MAIN`, `PR_PREVIEW`, `DOCKER_DEV`, dan `PRODUCTION_DOMAIN`. Jangan menggabungkan hasil pengamatan dari versi berbeda.
3. Status temuan: `CONFIRMED_CODE` (fakta dapat dibaca dalam kode), `CONFIRMED_RUNTIME` (sudah direproduksi di build/runtime), `NEEDS_MANUAL_QA`, `DESIGN_GAP` (fitur belum dibuat sesuai visi), `SUSPECTED`, `FIXED_IN_PR`, `VERIFIED`, `DEFERRED`. Hanya gunakan `VERIFIED` setelah tes relevan lolos pada SHA yang dituju; jika belum, status tetap terbuka.
4. **Prioritas**: `P0` kehilangan save/uang akun, celah akses serius, crash seluruh game, rilis salah build; `P1` blocker pengalaman dasar/QA utama, data race, input/gerak sulit, ketidaksesuaian runtime; `P2` immersion, kelengkapan mekanik, optimasi normal; `P3` ekspansi konten masa depan dan polish tambahan. `RELEASE_GATE` menandai hal yang wajib diverifikasi sebelum memindahkan traffic, **bukan selalu bug yang sudah terjadi**.
5. **Keyakinan (%)** adalah kekuatan bukti untuk klaim, bukan probabilitas game berfungsi. `100` = konstanta/hasil jelas; `90–99` = bukti kode langsung; `60–89` = perlu reproduksi; di bawah itu jangan menyatakan bug sebagai fakta.
6. Jangan mengubah Smart Farm atau data keuangan nyata ketika memperbaiki game. Route web saat ini tetap membutuhkan Supabase Auth; server Docker memakai jalur data tersendiri. Pemisahan `farm.<domain>` / `play.<domain>` masih **rencana**, bukan konfigurasi aktif.
7. Update file ini lewat PR setelah mengaudit SHA terbaru. **Tidak ada pekerjaan otomatis di latar belakang:** setiap sesi AI harus memeriksa repo kembali.

## B. Snapshot yang diperiksa (2026-11-21)

| Item | Hasil terverifikasi | Implikasi |
| --- | --- | --- |
| Repo | [dianyanzen/Yanzen-E-Farmer](https://github.com/dianyanzen/Yanzen-E-Farmer) | Satu repo; dua produk masih bercampur |
| `main` | `3330580b90a75f194f7f96b5e48326b7e1945c4e` | Web game + Smart Farm; Next 16.4.6, Phaser 4.2.1 |
| [PR #30](https://github.com/dianyanzen/Yanzen-E-Farmer/pull/30) | `e12b0daf55f243b11690782e41a6374b6665b81d` · READY preview | Jam 16 langkah/menit, 1 menit kerja, transisi tidur berfase, paving pasar lebar penuh, 10 PNG; **belum merge** |
| [PR #29](https://github.com/dianyanzen/Yanzen-E-Farmer/pull/29) | Branch `docs/chatgpt-codex-sync-20261121`; dokumen koordinasi AI | PR ini yang memuat `AGENTS.md`; jangan mengira telah ada di main |
| Docker dev | `develop/yz-farm-life` `7e386f38ed9ef35be29258bedaf573d1896e5dc2` | Runtime/auth/storage lain; tidak boleh merge utuh ke main |
| Production alias | `yanzen-e-farmer.vercel.app` → Vercel deployment `dpl_FFVB4SMVFAFVTiX1e5MhjGWf1Z1q` saat diperiksa | **Bukan PR #30**, walaupun nama domain terlihat sama |
| Preview PR #30 | `yanzen-e-farmer-staging-ks3manvfa-dianyanzens-projects.vercel.app` READY | Build tes model/typecheck/tes game berhasil; **QA interaktif berakun belum dibuktikan** |
| Render & save | `/game` Phaser, `/game/canvas` fallback; `GET/PUT /api/game/save` Supabase `yz_game_saves` | JSON per user (RLS); endpoint health statis tidak memeriksa DB |
| Dunia benar-benar playable | Empat zona outdoor (`field`, `gang`, `pasar`, `sungai`) dan interior tertentu | Tiga sambungan utama, belum seluruh Bandung |
| Registri wilayah | 30 kecamatan, 151 kelurahan; `geometry_status=not_imported`; **1 kelurahan playable: Pasirluyu** | Nama wilayah ≠ peta yang bisa dijelajahi |
| Karakter | `cast.json`: 32 karakter = 1 utama + 31 NPC; `model.ts`: **5 NPC aktif** (Ryan, Nani, Inggit, Ayu, Widi) | 26 NPC lainnya belum memiliki `placements` dan kegiatan dunia |
| Hunian | 5 interior rumah NPC di `RESIDENT_HOMES` | Jangan mengira 31 NPC punya rumah |
| Alat | 44 metadata: **3 active** (cangkul, gembor, joran), **41 planned** | Menanam/memanen merupakan aksi tangan, bukan entri alat aktif |
| Tanaman | Timun + 48 petak kebun; pertumbuhan 4 tahap; panen berulang | Komoditas lain belum gameplay |
| Aset publik | 428 file media game, jumlah ukuran repo ±40.449.805 byte | **Bukan ukuran unduhan awal**; butuh ukur Network nyata |
| Portrait | 32 strip utama; katalog tambahan `portraits/bandung` 268 berkas ±23,6 MB | Ketersediaan gambar tidak berarti NPC playable |
| Tes build | `npm run test && npm run typecheck && npm run test:game && next build` | UI browser, lint, katalog aset **tidak** otomatis ikut dalam `build` |
| Kerentanan dependensi | Log build `npm ci` mendeteksi **7 moderate** | Audit rinci versi/dependency, jangan langsung `npm audit fix` membabi-buta |

**Confidence snapshot repo/data:** 99% untuk metrik yang dihitung dari sumber; **0% klaim** bahwa uji gameplay autentik sudah dilakukan. Lakukan pemeriksaan ulang untuk setiap commit baru.

## C. Peta arsitektur yang harus dipahami dulu

```text
GitHub main (web campuran saat ini)
 ├── src/app/game/page.tsx          auth Supabase -> GameClient(engine=phaser)
 ├── src/app/game/game-client.tsx   UI React, input, YZ Phone, autosave, modal, tidur
 ├── src/lib/game/model.ts          aturan dunia, hari, NPC, plot, ekonom i, save migration
 ├── src/lib/game/field-engine.ts   perantara input/animasi/audio/camera
 ├── src/lib/game/phaser-world.ts   render Phaser, atlas, sprite, kamera, weather
 ├── src/lib/game/draw-world.ts     fallback Canvas
 ├── src/lib/game/modular-outdoor.ts tanah, kios, paving, daftar prop 4 zona
 ├── src/lib/game/bandung-world.ts  data 30/151, bukan tilemap seluruh kota
 ├── src/lib/game/personal-quests.ts 5 personal quest
 ├── src/app/api/game/save/route.ts GET/PUT save per akun (Supabase)
 └── src/app/* (non-game)           Smart Farm nyata — jangan diubah tanpa mandat

GitHub develop/yz-farm-life -> Docker/PostgreSQL game mandiri, kode/akun tidak selalu identik.
```

Semua analisis perubahan map harus cek `model.ts` collision/portals, `modular-outdoor.ts` visual, `phaser-world.ts` draw order, `tap-navigation.ts` route, `safeLoad` koordinat save, **dan Canvas fallback**.

## D. Register kekurangan dan risiko — SELALU BUKA BAGIAN INI SEBELUM PERUBAHAN

Kolom **status = keadaan bukti saat snapshot**, bukan kepastian semua pemain terpengaruh. Estimasi kepercayaan per temuan dibatasi bukti yang ada. Pemilik tugas default **UNASSIGNED** sampai Issue/PR mengklaimnya.

### D1. Kebenaran rilis, akun, dan progres (wajib beres sebelum production)

| ID | Prioritas | Observasi + analisis penyebab | Status/keyakinan | Aksi & syarat selesai |
| --- | --- | --- | --- | --- |
| G-001 | **P0 RELEASE_GATE** | Login akun nyata → play → save → refresh → load belum dibuktikan di PR #30; `/api/game/health` hanya membalas JSON konfigurasi, bukan query DB. | CONFIRMED_CODE 100% (keterbatasan health); NEEDS_MANUAL_QA (E2E) | Uji dua akun terpisah, save field + quest + tidur, tangkap network PUT/GET dan RLS, restart browser; jangan pindah alias sebelum PASS |
| G-002 | **P1** | Save satu JSONB/user di-`upsert` langsung; tidak ada precondition revision/CAS atau merge lintas tab/perangkat. Perubahan terakhir berpotensi menimpa progres sesi lain. | CONFIRMED_CODE 98% (desain), risiko runtime perlu reproduksi | Tambah revision monotonic/ETag atau concurrency guard, konflik UI, tes dua tab/perangkat dan race |
| G-003 | **P0 RELEASE_GATE** | Web Supabase dan Docker PostgreSQL/auth lokal belum satu kontrak migrasi/identitas. Memindahkan `/game` ke subdomain Docker terlalu dini dapat memutus save. | CONFIRMED_CODE 95%; migrasi belum terverifikasi | Tentukan sumber save kanonik, mapping user, backup, export/import idempotent, compare checksums, fallback/rollback |
| G-004 | **P0 RELEASE_GATE** | Preview PR #30 telah READY, tetapi production alias masih ke build lama; jangan mengatakan perbaikan sudah LIVE. | CONFIRMED_RUNTIME (alias) 100% pada snapshot | Review PR/QA, approve SHA, verifikasi alias/DNS, smoke URL final, rencana rollback |
| G-005 | **P1** | Autosave React di-debounce 1,3s dan diantre per tab, tetapi kesalahan PUT mengunci `saveLockedRef`; butuh recovery UX jelas untuk offline/latensi/sesi habis. | CONFIRMED_CODE 97%, UX belum diuji | Simulasi PUT 401/503, timeout, offline, penutupan tab; pastikan tidak silently overwrite dan pemain dapat retry dengan aman |

### D2. Waktu, tidur, cuaca, kenyamanan loop harian

| ID | Prioritas | Observasi + analisis penyebab | Status/keyakinan | Aksi & syarat selesai |
| --- | --- | --- | --- | --- |
| G-006 | **P1** | Pada `main`: 4 langkah outdoor = 1 menit dan aksi +3 menit. PR #30 memperlambat menjadi 16 langkah dan +1 menit; nyaman/tidaknya **belum diuji sesi 10–20 menit**. | FIXED_IN_PR 99% (angka), NEEDS_MANUAL_QA (feel) | Catat durasi nyata menyelesaikan 1 hari, 4 timun, 3 NPC, jalan rumah→pasar; kalibrasi berdasarkan feedback, bukan mengubah angka sembarang |
| G-007 | **P1** | Tidur pada `main` langsung `nextDay` + overlay teks. PR #30 memperkenalkan settling/night/morning 3,1 detik; karakter tidur berupa komposisi HTML/CSS, belum sprite karakter di ranjang yang tersinkron frame. | FIXED_IN_PR 99%; NEEDS_MANUAL_QA 100% | Uji posisi kasur, lock kontrol, layering, transisi, save ketika fase pagi, reduced-motion, tab ditutup saat animasi |
| G-008 | **P2** | NPC memiliki jam kerja/pulang; waktu permainan berhenti maksimal pukul 22.00; siklus malam dan jadwal realistis jangka panjang belum seimbang dengan eksplorasi besar. | CONFIRMED_CODE 96%; kalibrasi DESIGN_GAP | Playtest pagi–malam, cek warung tutup dan NPC pulang, uji apakah quest sempat dikerjakan dengan pace baru |
| G-009 | **P2** | Cuaca dijadwalkan deterministik `weatherForDay` 7 hari; hujan punya visual dan efek tanaman, tetapi belum ada musim, intensitas cuaca dinamis, atau cuaca unik kota. | CONFIRMED_CODE 99%, DESIGN_GAP | Musim & weather state opsional sesudah loop dasar, efek gameplay terukur, regression save |
| G-010 | **P2** | Tidur hanya di kasur adalah aturan baik yang sudah ada; UX untuk pemain yang jauh dari rumah pada malam hari belum dievaluasi (rute pulang, petunjuk, safety). | SUSPECTED 75% | Uji situasi jam 21–22 dan jalan pulang dari sungai/pasar; desain bantuan natural, tanpa fast-travel otomatis diam-diam |

### D3. Dunia, peta, pasar, collision, tampilan kamera

| ID | Prioritas | Observasi + analisis penyebab | Status/keyakinan | Aksi & syarat selesai |
| --- | --- | --- | --- | --- |
| G-011 | **P1** | PR #30 mengisi plaza pasar sepanjang lebar 640px dan menempatkan 10 jenis aset/13 props, tetapi `areaBlocked` hanya membaca `outdoorFootprints` dari `model.ts` bukan posisi semua prop `modular-outdoor.ts`; potensi tembus dekorasi/overlay jalur. | CONFIRMED_CODE 99% (sumber collision terpisah); interseksi aktual NEEDS_MANUAL_QA | Overlay tile walkable vs footprint baru, uji 4 arah tiap prop besar, jalur tengah, portal x=11–12, jangan tambahkan collision kosmetik untuk pot kecil |
| G-012 | **P1** | Pasar lebih padat **secara aset**, belum punya crowd pembeli, tawar-menawar, suara, ataupun idle-loop dagang bervariasi; jumlah NPC aktif dunia masih lima. | DESIGN_GAP 99% | Isi aktivitas nonblocking (pembeli, vendor, pengangkut) setelah path QA; crowd tak boleh memblok pemain |
| G-013 | **P2** | Baru empat zona outdoor dan tiga koneksi nyata; **lima** penghalang akses memang sengaja mengunci wilayah berikutnya. | CONFIRMED_CODE 100% | Pertahankan label `planned` dan batas cerita jujur; buat satu zona berikutnya hanya setelah Pasirluyu QA lulus |
| G-014 | **P1** | `WORLD.tile=20`; dokumen Art Direction lama mengharuskan 16px dan target portrait 288×512, sedangkan Phaser menggunakan view 300×200 pada skala 3; ukuran/perspektif belum jadi design contract tunggal. | CONFIRMED_CODE 100%, DESIGN_GAP | Putuskan kontrak pixel art (20 logical tile atau 16 source art yang di-scale), konsolidasikan docs, device screenshots & tap targeting |
| G-015 | **P2** | Phaser dan Canvas menggunakan model sama tetapi pipeline render, zoom, camera, dan depth berbeda; perbedaan framing/occlusion masih perlu matriks parity. | CONFIRMED_CODE 99%, NEEDS_MANUAL_QA | Bandingkan screenshot lokasi & timestamp identik di Phaser/Canvas, terutama NPC, tree occlusion, touch, object inspection |
| G-016 | **P2** | Lebar fisik kota 30 kecamatan/151 kelurahan hanya registri administratif; baru Pasirluyu `playable`, geometri GIS belum diimpor. | CONFIRMED_CODE 100% | Desain hub Regol dan satu koneksi selanjutnya, lalu GIS berlisensi/terverifikasi; jangan memalsukan 151 map playable |
| G-017 | **P2** | Interior rumah NPC 5 aktif, area furnitur hanya beberapa objek inspeksi; aktivitas penghuni, buka pintu, dan furnishings gameplay belum mendalam. | CONFIRMED_CODE 90%, DESIGN_GAP | Tambah variasi interior interaktif setelah tes kunjungan/akses NPC dan collision stabil |

### D4. NPC, dialog, cerita, ekonomi, pekerjaan, alat

| ID | Prioritas | Observasi + analisis penyebab | Status/keyakinan | Aksi & syarat selesai |
| --- | --- | --- | --- | --- |
| G-018 | **P2** | Katalog 31 NPC tetapi `placements` hanya untuk 5: A03, C01, C08, A04, C07; aset potret **tidak sama** dengan karakter interaktif. | CONFIRMED_CODE 100% | Buat NPC wave 2 yang bermakna (3–5 orang), pekerjaan, jadwal, rumah, alasan hadir; tes setiap karakter |
| G-019 | **P2** | Lima personal quest aktif pada `tales`, kampanye awal selesai setelah percabangan foto Nani; sistem narasi berlapis/bertahun-tahun di GDD masih target. | CONFIRMED_CODE 95%, DESIGN_GAP | Character Bible, event gates, konsekuensi lintas hari, dialog berbeda untuk keputusan; tes reward tidak dobel dan replay |
| G-020 | **P2** | Kedekatan 0–1000, pilihan dialog, dan memory pilihan terakhir sudah ada; motivasi hubungan dinamis, persahabatan antar-NPC, dan konsekuensi mendalam belum skala 31 NPC. | CONFIRMED_CODE 96%, DESIGN_GAP | Audit per-NPC: kepribadian, memori relevan, konflik, konsekuensi, jaringan sosial, dialog tanpa label berlebihan |
| G-021 | **P2** | 44 entri alat: 3 aktif, 41 `planned`; banyak ikon/item katalog belum punya aksi (kapak, sabit, tambang, alat ternak, memasak, kamera). | CONFIRMED_CODE 100% | Aktifkan dalam paket kecil dengan target tile, animasi, biaya, inventori, dampak, tes dan save migration |
| G-022 | **P2** | Kebun berisi 48 petak timun; padi, buncis, peternakan ikan/sapi, rotasi komoditas & pekerjaan kota belum menjadi gameplay penuh. | CONFIRMED_CODE 99%, DESIGN_GAP | Prioritaskan komoditas kedua **setelah** timun loop lulus; pisah aset katalog dari mekanik produksi |
| G-023 | **P2** | Kandang/ayam ada sebagai dekorasi, tetapi siklus pakan, kesehatan, telur/susu dan ternak produktif belum jadi sistem. | DESIGN_GAP 95% | Ternak vertical slice: 1 kandang + 1 jenis hewan + 1 produk, bukan langsung seluruh katalog |
| G-024 | **P2** | Memancing model hanya `castRod(roll)`→`reelFish`, tiga spesies, satu pelet per lempar; minigame skill, timing, stamina ikan belum ada. | CONFIRMED_CODE 99% | Tambah interaksi singkat yang responsif dan aksesibel; server save tetap mengawasi inventori |
| G-025 | **P2** | Pasar memiliki beberapa transaksi tetap: jual timun/ikan, beli 5 bibit/5 pelet, tanpa quantity selector, keranjang dagang, diskon/stock dinamis. | CONFIRMED_CODE 99% | Uji UX belanja/jual terlebih dahulu; baru tambah harga, kuantitas, inventaris NPC, ringkasan transaksi dan cegah double-click |
| G-026 | **P3** | Romansa, festival, pekerjaan multiprofesi, aktivitas spiritual malam Jumat, secret, 264 komoditas: **visi ekspansi**, belum boleh dilabeli rusak karena belum tersedia. | DESIGN_GAP 100% | Catat roadmap konten pasca-prototipe; tiap fitur perlu kriteria playable dan biaya aset |

### D5. Kualitas visual, performa, UX, audio, dan pengujian

| ID | Prioritas | Observasi + analisis penyebab | Status/keyakinan | Aksi & syarat selesai |
| --- | --- | --- | --- | --- |
| G-027 | **P1** | `game-client.tsx` membuat `new Image()` untuk semua `outdoorSources`, sementara `phaser-world.ts` juga melakukan `this.load.image` untuk sumber yang sama; potensi decoding/kerja memori ganda walaupun browser mungkin cache jaringan. | CONFIRMED_CODE 100%; dampak performa NEEDS_PROFILE | Ukur request, decoded images, p95 frame time; pilih satu sumber loading/lazy per zone tanpa merusak Canvas fallback |
| G-028 | **P1** | Target portrait-first belum dibuktikan terhadap aspect ratio aktual Phaser, fullscreen mobile, safe-area, notch, rotating screen, portrait YZ Phone. | NEEDS_MANUAL_QA 95% | Screenshot dan input test 360×800, 393×852, 430×932, desktop 1366×768, fullscreen; tidak boleh crop interaksi/bed/portal |
| G-029 | **P1** | PR #30 hanya tes signature PNG dan kode paving, **bukan visual diff, objek collision, atau QA crowd pada resolusi nyata**. | CONFIRMED_CODE 100% | Capture screenshot before/after pasar, collision debug layer, regression test walk path, verifikasi tidak ada tangan/objek anomali |
| G-030 | **P2** | Aset publik `public/game/assets` mengandung ±40,45 MB total; 268 aset tambahan portrait Bandung ~23,58 MB. Initial request/bytes/transcode/lazy belum diukur. | CONFIRMED_CODE 100% (repo bytes), NEEDS_PROFILE | Budget initial transfer dan memory berdasar trace asli, lazy load portrait, atlas per zona, cache headers, decode count |
| G-031 | **P2** | Suara dasar kebun, langkah, warung, kanal ada; pasar padat butuh ambient nonrepetitif, variasi intensitas waktu & kontrol volume yang konsisten. | CONFIRMED_CODE 92%, DESIGN_GAP | Audit field-audio, mute, tab hidden, gesture autoplay, layering, looping; uji tanpa audio wajib tetap playable |
| G-032 | **P1** | `npm run build` mencakup tes database/model/typecheck, tetapi **tidak mencakup** lint, tes UI browser, portrait UI, asset audit; otomatis hijau belum setara QA pemain. | CONFIRMED_CODE 100% | Tambah CI bertahap untuk smoke browser & accessibility, visual diff, asset audit; jangan menambah flaky gate tanpa perbaikan |
| G-033 | **P2** | Banyak README lama masih menyebut Canvas prototype/branch lama/status aset 2026-11-16, padahal main sudah Phaser 4; dokumentasi dapat menyesatkan AI. | CONFIRMED_CODE 99% | Dokumen induk ini menang atas catatan lama; beri status `HISTORICAL`, perbarui indeks referensi |
| G-034 | **P2** | npm install mencatat 7 moderate vulnerabilities; detail transitive belum ditelaah sebagai security assessment. | CONFIRMED_RUNTIME 100% (log), NEEDS_TRIAGE | Rekam `npm audit --json`, klasifikasi prod/dev, upgrade terarah dengan tes rollback; jangan `npm audit fix --force` tanpa evaluasi |
| G-035 | **P1** | PR terbuka bertumpuk dari tahap lama (#18–#28) dan branch Docker/web berbeda; mengambil PR lama bisa menimpa baseline yang baru atau salah target. | CONFIRMED_CODE 99% | Label superseded vs aktif, compare base/head; tidak merge massal, gunakan `AGENTS.md` dan handoff PR |

### D6. Audit negatif yang juga perlu diingat (yang *sudah ada*)

- **Sudah ada:** Phaser render dengan Canvas fallback; pergerakan interpolasi, tap navigation, jalur 4 zona, tanda arah yang bisa diperiksa, NPC jadwal dan interaksi, YZ Phone, persahabatan, dialog ekspresi, cerita Bab 1, quest personal 5 NPC, tanam–siram–panen–tidur, pasar jual/beli dasar, memancing dasar, save dengan validasi JSONB serta pembatasan RLS server, 5 interior rumah, audio dasar, fullscreen PC.
- **Jangan mengklaim tidak ada** hanya karena fitur belum sempurna. Setiap laporan harus membedakan `ADA`, `ADA TAPI BELUM POLISHED`, `DI PR BELUM MERGE`, `BELUM ADA`, dan `BELUM DIVERIFIKASI`.
- **Jangan mengklaim production berubah** ketika hanya PR preview READY.
- **Jangan menganggap asset pack 32 karakter sama dengan 32 NPC hidup.**

## E. Prioritas eksekusi aktif — PERINTAH PEMILIK 2026-11-21

**Keputusan:** YZ Farm Life sekarang **EXPERIENCE-FIRST**. [EXPERIENCE_FIRST_ROADMAP.md](EXPERIENCE_FIRST_ROADMAP.md) adalah kontrak kerja prioritas saat ini. Perubahan ini mengesampingkan urutan milestone awal di dokumen ini, **tetapi tidak menghapus temuan G-001…G-035**.

- **Tahap 1 sebelumnya (migrasi/sinkronisasi Docker–Vercel, SSO, perombakan infrastruktur): `DEFERRED`.** Docker adalah lingkungan uji coba lokal; jangan menghabiskan sprint untuk memindah backend atau mengejar kesiapan production. Save lokal jangan dirusak dan seluruh tabel Smart Farm harus tetap terpisah. Bila nanti pemilik meminta rilis publik game, aktifkan kembali release gate G-001/G-002/G-003/G-004 dengan bukti.
- **Tahap aktif 2 (EX-01 + EX-02): game feel.** Prioritas berurutan gerak/animasi/kamera/jam/tidur, lalu paving/collision/interaktivitas pasar, ambient dan UI mobile. ID G-006/G-007/G-011/G-014/G-015/G-027/G-028/G-029/G-031.
- **Tahap aktif 3 (EX-03 + EX-04): living Pasirluyu.** Fokus 5 NPC yang sudah playable (Ryan, Nani, Inggit, Ayu, Widi), aktivitas pasar, ekspresi/dialog, quest/relasi, farming–trading–sleep loop. ID G-012/G-018/G-019/G-020/G-021/G-024/G-025.
- **Ekspansi dunia:** `ON_HOLD` / hanya bertahap sesudah loop kecil nyaman dimainkan. ID G-013/G-016/G-017/G-026 dan seluruh 31 NPC/151 kelurahan/264 komoditas sekaligus **bukan target sprint sekarang**. Satu area kecil per PR jika ada alasan gameplay dan bukti QA.
- **Tuning waktu 16 langkah/menit (PR #30)** masih harus diuji *feel*-nya; jangan menganggap pasti ideal. Nilai pemain berdasarkan perjalanan dan sesi nyata.
- **Tidak ada izin merge/release otomatis:** PR #29 dan PR #30 tetap harus direview serta status lingkungan diperiksa lagi.

**Gerbang pengalaman:** pemain bisa menikmati perjalanan rumah → kebun → gang → pasar → sungai → rumah, berinteraksi natural dengan 5 NPC, tidur, dan melanjutkan permainan tanpa stutter/stuck/label menumpuk. Audit game harus mencatat hasil manual keyboard dan touch; tes hanya tersedia bila dijalankan.

## F. Syarat milestone "Prototype Polished" (bukan klaim capaian)

Semua poin di bawah harus ditandai dengan **SHA + bukti**:
- [ ] Tidak ada kehilangan save pada login, refresh, tidur, tab kedua, pindah device, gagal jaringan.
- [ ] 1 hari game diputar penuh dua kali; pemain tidak terlalu cepat malam atau terlalu lama menunggu.
- [ ] Pasar terlihat utuh dan padat tetapi semua pintu, pedagang, jalan dan portal terjangkau.
- [ ] Tidak ada aset 404, karakter transparan, frame salah, clip, z-order tertukar.
- [ ] Dialog/HP/quest/rumah/tidur/alat/penjualan/fishing diuji di keyboard dan sentuh.
- [ ] Screenshot baseline desktop/mobile/Phaser/Canvas serta trace kinerja tersedia.
- [ ] Build + UI/E2E + lint + audit aset lulus atau pengecualian ditulis jelas.
- [ ] Seluruh tabel nyata Smart Farm tidak berubah akibat game.
- [ ] Merge dan deployment dilakukan dengan persetujuan pemilik pada SHA yang sama dan rollback teruji.

## G. Format analisis WAJIB (tiap isu)

Gunakan ketujuh bagian proyek:
1. **Observasi** — gejala dan sumber, URL, commit SHA, layar/perangkat.
2. **Analisis penyebab** — file, fungsi, hasil eksperimen.
3. **Tingkat keyakinan (%)** — untuk tiap penyebab, bukan untuk keseluruhan game.
4. **Alternatif kemungkinan** — faktor yang belum dieksklusi.
5. **Rekomendasi tindakan** — perubahan paling kecil yang dapat dibuktikan.
6. **Dampak pada produksi game** — game feel, FPS, retention sukarela, save, aset, biaya server; pisahkan dari produksi kebun riil.
7. **Prioritas tindakan** — P0/P1/P2/P3, bukti dan dependensi.

Tambahkan: `Issue ID`, `status`, `owner`, `target branch`, `base SHA`, `commit hasil`, `tes`, `screenshot/trace`, `PR`, `deployment`, `rollback`. **Jangan hapus temuan; ubah status dengan bukti dan catat di [AUDIT_HISTORY.md](AUDIT_HISTORY.md).**

## H. Cara menganalisis dengan benar di sesi AI berikutnya

**Wajib:** baca [AUDIT_PLAYBOOK.md](AUDIT_PLAYBOOK.md), cek GitHub refs terbaru, lalu laporkan *apa yang berubah sejak snapshot* — bukan menyalin dokumen ini tanpa inspeksi. Temuan baru ditambahkan dengan ID G-036, G-037, dst. Hindari menciptakan isu duplikat. Simpan hasil audit dan bukti melalui PR. Jika hanya bisa membaca kode tanpa browser autentik, nyatakan `NEEDS_MANUAL_QA` dan jangan mengarang FPS, delay, atau screenshot.

## Referensi rujukan dalam repo

- [GAME_DESIGN_DOCUMENT.md](GAME_DESIGN_DOCUMENT.md) — visi produk, bukan status build.
- [LIFE_SYSTEMS.md](LIFE_SYSTEMS.md), [STORY_SYSTEM.md](STORY_SYSTEM.md) — desain sosial/quest.
- [ASSET_PRODUCTION_BACKLOG.md](ASSET_PRODUCTION_BACKLOG.md), [ART_DIRECTION.md](ART_DIRECTION.md) — seni visual/target historis.
- [CLOCK_SLEEP_MARKET_IMPLEMENTATION.md](CLOCK_SLEEP_MARKET_IMPLEMENTATION.md) pada PR #30 — patch terbaru, bukan bukti main.
- [WEB_INTEGRATION_BOUNDARY.md](WEB_INTEGRATION_BOUNDARY.md) — batas Docker vs web.
- [docs/ai/SYNC_PROTOCOL.md](../ai/SYNC_PROTOCOL.md) — pembagian kerja ChatGPT vs Codex.
- [AUDIT_HISTORY.md](AUDIT_HISTORY.md) — log audit; **jangan mengganti fakta di sini tanpa pencatatan**.
