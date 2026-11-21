# YZ FARM LIFE — AUDIT PLAYBOOK v1.0
**Dokumen kerja wajib untuk ChatGPT, Codex, Copilot, QA, dan developer. Baca [GAME_AUDIT_MASTER.md](GAME_AUDIT_MASTER.md) sebelum menjalankan langkah di bawah.**

## 0. Tujuan dan etika evidence

Audit yang baik memberi **reproduksi, akar penyebab yang didukung bukti, tindakan, tes, dan status commit**. Audit bukan daftar ide acak. Jangan membuat desain ulang seluruh game sebelum mengidentifikasi blocker konkret. Konfirmasi pengguna bukan pengganti test. Tidak boleh memasukkan screenshot akun pribadi, email, NIK, kredensial, atau data keuangan Smart Farm ke repo.

Mode analisis:
- **STATIC** — GitHub/kode/manifest/CI/diff; boleh menyatakan fakta kode, tidak boleh mengklaim pengalaman bermain.
- **PREVIEW** — deploy terisolasi, runtime log, HTTP asset; bukan otomatis rilis.
- **INTERACTIVE** — bermain dengan akun uji, perangkat tertentu, screenshot/video/trace dan save end-to-end.
- **PRODUCTION** — hanya baca observabilitas publik dan log yang diizinkan; jangan mengubah traffic atau data tanpa approval.
- **DOCKER** — server game mandiri; jangan menyamakan auth/Postgres lokal dengan Supabase web.

Beri `confidence` dan `status` tiap kesimpulan. Jika tidak bisa uji, tulis apa yang kurang.

## 1. Prosedur wajib sebelum analisis

### Langkah A — Verifikasi titik awal dan PR

```bash
git remote -v
git fetch origin --prune
git status --short
git branch --show-current
git rev-parse HEAD
git rev-parse origin/main
git log --oneline -8 origin/main
git branch -r | grep -E 'main|develop/yz-farm-life|game|release'
```

Lihat GitHub Issues/PR, khususnya PR #29 (AI protocol) dan PR #30 (jam/tidur/pasar), catat apakah sudah merge, closed, superseded, atau justru ada commit baru. **Jangan mengandalkan nomor PR atau SHA snapshot lama sebagai HEAD saat ini**.

Jika `AGENTS.md` belum ada di main karena PR #29 belum merge, baca melalui `git show origin/docs/chatgpt-codex-sync-20261121:AGENTS.md` dan master audit dari branch yang sama. Jangan merge `develop/yz-farm-life` utuh ke `main`.

Jika berada di ChatGPT dengan konektor GitHub, gunakan get commit/branch/file/PR; tanpa shell lokal, catat pemeriksaan sebagai **connector-inspected**. Hindari klaim telah menjalankan tes komputer.

### Langkah B — Baca dokumen sebelum kode

Urutan: `AGENTS.md` → `docs/ai/SYNC_PROTOCOL.md` → `GAME_AUDIT_MASTER.md` → file ini → `AUDIT_HISTORY.md` → PR/Issue task aktif → file kode/tes relevan. Dokumentasi `README` lama dapat berstatus historis.

### Langkah C — Tentukan target persis

Tuliskan:
- Produk WEB atau DOCKER, nama deployment dan domain, branch, SHA lengkap.
- Lingkungan: local/dev, Vercel preview, Vercel production, Docker staging/prod.
- Jenis observasi: screenshot pengguna, code, browser, video, save, logs.
- Rentang waktu pengujian, perangkat, resolusi, browser, FPS/ping jika diukur.
- Batas yang diotorisasi pengguna: audit saja / implementasi branch / review / merge / deploy.

## 2. Inventaris dan scanning statis

### Peta berkas wajib

| Concern | Telusuri |
| --- | --- |
| State dan ketepatan hari | `src/lib/game/model.ts`: `newGame`, `movePlayer`, `addMinutes`, `nextDay`, `canSleep`, `safeLoad` |
| UI tidur/dialog/HP/keyboard | `src/app/game/game-client.tsx`, `dialogue-panel.tsx`, `game-dialog.tsx`, `game.css` |
| Render Phaser | `src/lib/game/phaser-world.ts`, `field-engine.ts`, `walking.ts`, `footwork.ts` |
| Render Canvas | `src/lib/game/draw-world.ts`; bandingkan dengan Phaser |
| Peta dan collider | `src/lib/game/modular-outdoor.ts`, `pasirluyu-master-map.ts`, `connected-edges.ts`, `tap-navigation.ts`, `model.ts:areaBlocked` |
| NPC/cerita | `model.ts:NPCS`, `npcSchedule`, `personal-quests.ts`, `resident-profile.ts`, `game-assets/catalog/cast.json` |
| Bandung GIS | `bandung-world.ts`, `data/bandung-master-registry.json`; jangan samakan metadata dengan peta |
| Aset/portrait/audio | `public/game/assets/`, `game-assets/catalog/`, `scripts/game-assets/`, `field-audio.ts` |
| Save/auth/API | `src/app/game/page.tsx`, `src/app/api/game/save/route.ts`, `src/lib/supabase/`, migrasi dan RLS |
| CI/docs | `package.json`, `.github/workflows/`, `docs/game-dev/`, `docs/ai/` |

### Perintah baseline

```bash
npm ci
npm run test
npm run typecheck
npm run test:game
npm run build
npm run lint
npm run assets:audit
npm run test:portraits
```

Jalankan tes browser `npm run test:game:ui`, `npm run test:game:life:ui`, `npm run test:portraits:ui` bila sistem dan kredensial uji mendukung. Periksa script sebenar-benarnya pada `package.json`; **jangan asal menjalankan UI tests ke data production**. Tes manual tetap diperlukan meski semuanya PASS.

Log hasil dalam bentuk `command | exit code | SHA | environment | passed/failed/skipped | reason`.

## 3. QA skenario fungsional (jalankan dalam urutan ini)

Gunakan akun uji bukan akun data pertanian asli. Rekam `PASS/FAIL/NOT_RUN`, URL, waktu, bukti, issue ID untuk setiap skenario.

| ID test | Langkah pemain | Hasil yang harus terbukti |
| --- | --- | --- |
| F-01 | Login akun A → buka `/game` → refresh | Muncul game Phaser; sesi dan progress konsisten |
| F-02 | Login akun B pada browser berbeda | Save A tidak pernah terbaca oleh B (RLS) |
| F-03 | Hapus cookies / logout | Tidak dapat memanggil save berakun, route game meminta login |
| F-04 | Cangkul → tanam → siram → tidur di kasur → panen 4 timun | Growth terikat hari, saldo/item benar; tidak ada panen ganda |
| F-05 | Coba tidur di luar rumah / tidak menghadap kasur | Hari tidak berganti; pesan interaksi tetap masuk akal |
| F-06 | Konfirmasi tidur → amati seluruh transisi | Lock input, settling → night → morning, hari naik tepat 1, save terkirim tepat |
| F-07 | Tutup/reload tab pada fase tidur awal/tengah/akhir | Tidak hilang progres sebelumnya; tidak menjadi save korup/duplikat |
| F-08 | Lakukan 15 lalu 16 langkah valid (PR #30) | Waktu tetap lalu +1; blocked moves tidak menambah menit |
| F-09 | Buka YZ Phone / dialog 5 menit realtime | Jam game tidak melonjak; kontrol lain tidak memicu gerak |
| F-10 | Dari kebun → gang → pasar → gang → sungai → balik | Semua portal bisa dicapai, tidak teleport ke tile terhalang |
| F-11 | Pasar: dekati gerobak, kios benih, ikan, pintu warung | Tidak tembus objek besar, tidak nyangkut, NPC/pintu bisa diakses |
| F-12 | Datang pasar 11:00 vs 20:00 | Buka/tutup dagang dan NPC konsisten dengan jadwal |
| F-13 | Jual timun yang belum dijanjikan, simpan timun order | Tidak menjual timun quest secara keliru |
| F-14 | Beli bibit/pelet, jual ikan per spesies, ulangi klik cepat | Tidak minus coin, double reward, overflow, atau menipu jumlah |
| F-15 | Pancing dari tile valid/invalid, tanpa joran/pelet | Hanya lokasi valid bisa memancing; inventori konsisten |
| F-16 | NPC Ryan, Nani, Inggit, Ayu, Widi diajak bicara | Dialog benar, portrait/emotion/choice, poin tidak farming berulang |
| F-17 | Selesaikan 5 personal quest dan Bab 1 | Trigger, reward dan aftermath tepat, save bertahan refresh |
| F-18 | Kunjungi 5 rumah NPC sebelum/sesudah jam kerja | Batas kunjungan dan return-point benar, tidak terjebak |
| F-19 | Gunakan gudang, transfer tool, upgrade tas | Kapasitas, saldo, peralatan dan state persist benar |
| F-20 | Save di tepi peta/pintu/jalan, reload setelah build dengan footprint baru | Karakter tidak stuck dalam tembok; migrasi mempertahankan uang/quest |
| F-21 | Buka dua tab satu akun, lakukan perubahan bertentangan | Tidak kehilangan update secara diam-diam; jika belum ada guard tandai FAIL |
| F-22 | Putuskan jaringan saat autosave, pulihkan | Error jelas, aksi retry aman, tidak overwrite save lama |
| F-23 | Matikan/mute suara, pindah tab browser, balik lagi | Tidak ada suara mengunci, double loop, atau crash |
| F-24 | Paksa fallback Canvas bila Phaser gagal di lingkungan uji | Input dan save tetap tersedia, UI tidak menjadi blank |
| F-25 | Fullscreen PC: Alt+Enter dan tombol UI | Kontrol keyboard, modal fokus, ESC, peta tidak terpotong |
| F-26 | Cek / anggaran, / keuangan, / panen Smart Farm pasca PR game | Tidak ada regresi auth/routes/biaya nyata |
| F-27 | Restart container Docker pada game standalone | Volume save/akun game persisten; tidak mengubah Supabase web |
| F-28 | Close/reopen browser setelah tidur dan transaksi | Cloud save benar-benar GET/PUT, bukan hanya state React yang belum terkirim |

## 4. QA visual dan game feel

### Matriks viewport

| Profil | CSS viewport | Wajib periksa |
| --- | --- | --- |
| Mobile kecil | 360×800 | D-pad/aksi, satu tangan, dialog, YZ Phone, notch |
| Mobile sedang | 393×852 | Ketajaman sprites, posisi kontrol, menu/dialog tidak melewati layar |
| Mobile lebar | 430×932 | Market screenshot, bed scene, kamera mengikuti karakter |
| Tablet portrait | 768×1024 | Padding, kamera dan HUD tidak menjadi lautan ruang kosong |
| Desktop HD | 1366×768 | Fullscreen, WASD/arrow, minim label, frame pacing |
| Desktop 1080p | 1920×1080 | Pixel crisp, kamera/zoom tidak melar, UI konsisten |

**Ambil referensi per lokasi**: kebun 06.20, gang 13.00, pasar 13.00, sungai 13.00, pasar 19.00, rumah 21.00, tidur (3 fase), pagi, HP, dialog NPC, gudang. Setiap screenshot harus menyebut SHA/engine/browser/viewport/jam game. Bandingkan Phaser vs Canvas pada state sama.

### Checklist per frame visual

- Lantai/tile tidak seam, lubang, clipping, paver tidak mendadak berhenti, jalur kaki dapat terbaca.
- Sprites pada layer depth benar; karakter berjalan di depan/belakang properti sesuai posisi kaki.
- Props kecil tidak menghalangi click target, besar punya collision konsisten; tidak ada posisi berdiri di atas meja.
- Aset pixel art satu gaya: ukuran outline, top-down, skala, bayangan, warna, jumlah jari/tangan, arah pandang, kaki menapak.
- Pasar **hidup tanpa teks label di semua benda**: plang interaktif untuk tempat, NPC punya gestur, tata dagang dan jarak jalur wajar.
- Animasi idle/walk/aksi/masuk rumah/tidur terasa ada bobot; uji reduksi gerak `prefers-reduced-motion`.
- UI tidak mengganggu world view; instruksi lengkap tetap di YZ Phone, bukan teks permanen menumpuk.

**Tidak boleh:** meluluskan visual hanya dari tes PNG signature/source regex. Jika layar/game tidak dapat dijalankan, tandai `NOT_RUN`.

## 5. Benchmark performa (jangan mengarang metrik)

Catat:
- Network waterfall: request count, transfer bytes, cached vs uncached, 404, delay decode; bedakan **total aset di repo** dengan **asset yang benar-benar dimuat**.
- FPS median/p5 dan frame time p95 untuk diam, berjalan, 5 NPC aktif, pasar ramai, hujan, transisi.
- Time to interactive (cold/warm), JS heap, GPU textures, image decoder, DOM, event listener leak setelah pindah peta 20 kali.
- Bandingkan Phaser vs Canvas di ponsel kelas menengah; ukur sebelum memutuskan refactor loader.
- Uji kecepatan aksi dan jam setelah PR #30: berapa menit nyata dibutuhkan dari 06:20 ke 18:00 untuk pemain normal. Karena jam saat ini **berbasis aksi**, bukan per detik, jangan mengonversi secara asal ke real minutes.

**Target usulan, bukan hasil terukur:** interaksi bebas stutter nyata, FPS nyaman secara konsisten, tidak memuat aset wilayah jauh di awal, intro cepat pada ponsel menengah. Pasang angka SLO hanya setelah baseline dan perangkat uji disepakati.

## 6. Save, keamanan dan migrasi

- **WEB:** Supabase Auth + RLS `yz_game_saves`, `safeLoad`, `PUT` validasi Origin/content-type/ukuran; cek isolasi dua akun tanpa bypass cookie. Jangan menonaktifkan RLS.
- **DOCKER:** PostgreSQL lokal dan mekanisme login berbeda; tidak boleh memakai service key Supabase atau menyalin data pribadi game ke Smart Farm.
- Simpan file sampel state untuk **new save, legacy v1, invalid/corrupt, max values, old tile position, pending quest, 15 walkingSteps (PR #30)**; tes roundtrip JSONB.
- Uji konflik satu akun dua tab dan dua perangkat. Sebelum memperkenalkan autosave lintas device, gunakan revision/CAS atau strategi konflik yang terdokumentasi.
- Simulasikan 401/403/413/415/503, lambat, disconnect, restart server. Gagal save harus jelas dan tidak merusak state lama.
- Sebelum mengubah schema/koordinat: backup data uji → migrasi idempotent → uji rollback → baru minta persetujuan produksi.
- `/api/game/health` sekarang statis; endpoint 200 **bukan bukti DB save sehat**.

## 7. QA konten, aset, hak cipta, dan worldbuilding

- 32 karakter katalog ≠ 31 NPC playable. Rekonsiliasi `cast.json`, sprite atlas, portraits, `NPCS`, schedule, home, jobs, bonds, dan quest.
- 30/151 administratif ≠ peta sah atau playable. Jangan mengarang akses jalan/kecamatan; cantumkan geometri dan sumber.
- Periksa semua aset runtime: ukuran, transparansi, penggunaan yang benar, lisensi/provenance, konflik artstyle, varian ekspresi, sprite sheet indexing.
- Tidak menyalin sprite, peta atau desain UI berhak cipta dari Harvest Moon; referensi hanya untuk analisis mekanisme yang diimplementasikan secara orisinal.
- Catat cerita Sunda/urban Bandung secara wajar, nama wilayah faktual, orang/bisnis fiktif, tradisi spiritual jika ditambah jangan dijadikan fakta lokasi tanpa sumber.
- Jangan menambah ratusan aset/NPC yang tidak dapat muncul atau berinteraksi dalam game; **uji satu vertical slice dulu**.

## 8. Prosedur menulis/memperbarui temuan

Buka `GAME_AUDIT_MASTER.md` bagian D. Untuk setiap bug/feature gap:
1. Cari ID yang sudah ada; jangan buat temuan duplikat.
2. Jika baru, lanjut ID berikutnya `G-036`, `G-037`, dst.
3. Buat Issue GitHub (opsional untuk backlog makro, wajib untuk perubahan yang langsung dikerjakan), cantumkan owner, acceptance, branch dan file scope.
4. Tambahkan **observasi, penyebab, keyakinan %, alternatif, aksi, dampak, prioritas**, serta commit/PR/tes yang mendukung.
5. Periksa diff PR dan konflik dengan PR lain; jangan mengubah file yang sedang diklaim oleh Codex tanpa handoff.
6. Set `FIXED_IN_PR` setelah commit, **bukan** `VERIFIED` sampai tes terkait dengan SHA itu lulus. Jika runtime belum diuji, pertahankan `NEEDS_MANUAL_QA`.
7. Catat ringkasan perubahan pada `AUDIT_HISTORY.md` melalui PR. Jangan mengganti tanggal audit asli seolah-olah baru diperiksa hari itu.
8. Laporan akhir harus menjawab: apa betul-betul diubah, apa yang belum teruji, siapa owner langkah berikut, dan apakah production berubah.

Contoh Markdown issue:

```md
## G-011 | Pasar props & collision | P1
Target: WEB PREVIEW @ e12b0da...
Observasi: x/y prop + jalan bisa dilewati (bukti screenshot/video)
Penyebab: model.ts:areaBlocked hanya memakai outdoorFootprints; props dari modular-outdoor.ts
Keyakinan: 99% sumber collision terpisah; 70% ada overlap pada tile tertentu sampai dimainkan
Alternatif: prop memang sengaja dekoratif/tidak solid
Rekomendasi: solid footprint hanya untuk meja/gerobak yang dapat menahan karakter
Dampak: immersion, pathfinding, akses pedagang
Prioritas: P1
Owner: unassigned
Repro: [langkah + posisi tile]
Tes: [perintah + keluaran]
PR/commit: [URL + SHA]
Status: NEEDS_MANUAL_QA
```

## 9. Aturan serah-terima antardua AI

- **Satu issue = satu owner = satu branch + PR**. ChatGPT dan Codex tidak mengedit branch yang sama bergantian tanpa serah-terima terdokumentasi.
- Link rujukan untuk Codex yang bekerja di server: `origin/main:AGENTS.md`, `docs/game-dev/GAME_AUDIT_MASTER.md` dan file ini. Jika dokumen belum merged, gunakan branch PR #29.
- Setiap perubahan melampirkan exact base SHA, head SHA, diff file, tes, preview URL, risiko, dan rollback. Lihat `docs/ai/HANDOFF_TEMPLATE.md`.
- **Jika GitHub bergerak saat mengaudit:** refresh SHA, rebase branch pribadi atau PR sesuai aturan; jangan force push shared branch.
- Jika user mengirim screenshot, identifikasi apakah dari `main`, PR preview, atau Docker; screenshot tidak boleh dipakai untuk mengklaim semua build mengalami hal sama.
- Pastikan ChatGPT/Codex benar-benar membaca ulang dokumen ini. Menambahkan instruksi ke repo **tidak** membuat memori kedua AI otomatis real-time.

## 10. Exit gate dan laporan audit akhir

Tulis ringkasan tujuh bagian observasi→prioritas untuk **setiap temuan penting**. Selain itu harus ada:
- Branch/SHA yang dianalisis dan apakah PR tersebut merged.
- Skor kematangan per domain hanya bila ada rubrik dan tes cukup; jangan mengarang persentase penyelesaian.
- Daftar P0/P1 teratas dan kriteria PASS jelas.
- `tests PASSED / FAILED / NOT_RUN`; screenshot/trace jika ada.
- Impact pada game (kenyamanan, progres, visual, performa, waktu pemain) dan pada Smart Farm (isolasi harus tetap).
- File dokumen yang diperbarui, link PR, deployment preview vs production, next owner.
- Pesan kepada pengguna jelas bila tidak mengubah kode, hanya audit; dan bila tidak merilis production.

**Audit dianggap selesai untuk sebuah SHA hanya setelah `GAME_AUDIT_MASTER.md` dan `AUDIT_HISTORY.md` mencerminkan temuan baru serta hasil aktual, bukan hanya dijelaskan di chat.**
