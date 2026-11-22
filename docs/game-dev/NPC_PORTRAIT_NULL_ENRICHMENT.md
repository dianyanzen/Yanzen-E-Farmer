# Audit nilai kosong dan pengayaan visual — YZ Farm Life

Tanggal: 22 November 2026. Sumber: potret canonical di GitHub + roster 248 NPC + Character Bible fiksi publik dan premis quest. Tidak menyalin isi cerita lama tanpa persetujuan asosiasi.

## Ringkasan hasil

| Pemeriksaan | Sebelum | Sesudah |
|---|---:|---:|
| Jumlah NPC | 248 | 248 |
| Nilai null pada 12 bagian | 2,272 | 794 |
| Null yang mendapat nilai baru | — | **1,478** |
| Observasi potret terisi | 0 / 248 | 248 / 248 |
| Nilai preferredName terisi dari nama canonical | 2 / 248 (non-null cameo tidak memakai atribut ini) | 246 / 248 |
| Usia fiksi sementara | 0 | 246 |
| Pendidikan fiksi sementara | 0 | 246 |
| Bahasa percakapan rancangan | 0 | 246 |
| Memori fiksi pembentuk karakter | 0 | 246 |
| Dokumen Markdown yang diregenerasi | 248 | 248 |

## Nilai kosong yang masih perlu dipertahankan

- **01_core_identity.origin**: 248 NPC masih null.
- **07_background_history.familyContext**: 248 NPC masih null.
- **09_dialogue_behavior.publicCameoGuardrail**: 246 NPC masih null.
- **01_core_identity.ageYears**: 2 NPC masih null.
- **01_core_identity.language**: 2 NPC masih null.
- **02_physical_appearance.proposedPose**: 2 NPC masih null.
- **03_fashion_aesthetic.costumeConcept**: 2 NPC masih null.
- **04_social_profile.education**: 2 NPC masih null.
- **04_social_profile.workRoutineConcept**: 2 NPC masih null.
- **04_social_profile.workplaceConcept**: 2 NPC masih null.
- **05_personality.flawConcept**: 2 NPC masih null.
- **05_personality.microHabitConcept**: 2 NPC masih null.
- **05_personality.observableHabit**: 2 NPC masih null.
- **05_personality.strengthConcept**: 2 NPC masih null.
- **05_personality.values**: 2 NPC masih null.
- **05_personality.weakness**: 2 NPC masih null.
- **06_psychological_profile.agencyConcept**: 2 NPC masih null.
- **06_psychological_profile.conflictConcept**: 2 NPC masih null.
- **06_psychological_profile.fear**: 2 NPC masih null.
- **06_psychological_profile.innerConflict**: 2 NPC masih null.
- **06_psychological_profile.motivationConcept**: 2 NPC masih null.
- **06_psychological_profile.need**: 2 NPC masih null.
- **06_psychological_profile.primaryMotivation**: 2 NPC masih null.
- **07_background_history.formativeMemory**: 2 NPC masih null.
- **07_background_history.sceneConcept**: 2 NPC masih null.
- **08_relationship_dynamics.boundaryConcept**: 2 NPC masih null.
- **09_dialogue_behavior.habitualGesture**: 2 NPC masih null.
- **09_dialogue_behavior.speakingCadence**: 2 NPC masih null.
- **10_narrative_development.sideQuestConcept**: 2 NPC masih null.

Sebagian besar null tersisa **sengaja**: `origin` (tempat lahir/asal yang tidak ditetapkan), `familyContext` (keluarga yang belum disetujui), dan `publicCameoGuardrail` untuk warga biasa (field hanya relevan bagi cameo publik). P01/P02 tidak diberi usia, latar pendidikan, keluarga, konflik batin, riwayat, atau motif pribadi rekaan.

## Jenis sumber dan tingkat keyakinan

| Atribut | Sumber | Keyakinan | Makna |
|---|---|---:|---|
| Ciri fisik dalam ilustrasi | Potret asli sesuai ID→portrait key | 90% | Deskripsi objek yang tampak, bukan ciri seseorang di dunia nyata |
| Nama panggilan usulan | Nama canonical, disambiguasi duplikat | 83% | Label panggilan di dunia game, belum disahkan penulis |
| Bahasa | Konvensi dialog YZ Farm Life | 80% | Bahasa penulisan percakapan, bukan kemampuan linguistik seseorang |
| Kenangan pembentuk karakter | Premis side quest & pekerjaan | 52% | Adegan fiksi draf, memerlukan Humanizer dan editorial review |
| Pendidikan cerita | Tugas dan profesi fiksi | 40% | Jalur pendidikan fiksi; bukan gelar/ijazah nyata |
| Usia numerik rancangan | Isyarat usia visual + kebutuhan peran cerita | 38% | **Bukan hasil pengukuran usia dari potret**; usulan yang dapat direvisi |

## Temuan visual dan rekomendasi QA

- Ada perbedaan kepadatan piksel, tekstur shading, dan outline antara aset `professions`, `neighborhood`, `specialists`, `residents`, dan `civic`. Diperlukan art QA lintas kategori sebelum perubahan gaya final.
- Sebagian kolom gaya pakaian awal berisi default generik seperti 'apron kerja' yang tidak cocok dengan potret. Atribut pakaian, aksesori, palet, gestur, dan kontinuitas visual kini ditulis ulang dari gambar yang dipasangkan dengan ID canonical.
- Semua field yang diisi memiliki penanda sumber (`fieldProvenance`) dan catatan visual (`visualEvidence`). Review ulang wajib jika potret diganti.
- Karakter C15 tergambar menggunakan kursi roda; deskripsi visual tidak membuat asumsi medis apa pun.
- Tidak ada otomatisasi yang mengaktifkan spawn, misi, statistik relasi, atau mengganti ID canonical.
- `origin`, `familyContext` dan hubungan antartokoh yang belum disetujui **tidak boleh diberi nilai karangan yang terkesan sebagai data faktual**.

## QA dan prioritas

1. **P0:** verifikasi portrait key, nama, pekerjaan, fingerprint, JSON valid, jumlah 12 kategori, serta aturan kameo.
2. **P1:** review manual sampel 248 visual/usia/pendidikan; perbaiki naskah kilas balik yang terasa template atau tidak natural.
3. **P2:** evaluasi perbedaan art style, perbarui sprite & animation sheet untuk kemunculan di dunia game.

Hasil ini adalah **draf ensiklopedia publik**, bukan persetujuan final atau laporan bug visual pixel-by-pixel. CI/Next build perlu diuji tersendiri.

## Kontrol perubahan potret berdasarkan SHA Git

Seluruh 248 potret yang diamati memiliki `gitBlobSha` dan `sizeBytes` terverifikasi di `docs/game-dev/characters/PORTRAIT_ASSET_AUDIT.json`. SHA diperiksa ulang oleh `npm run chars:portrait:check` terhadap byte file lokal saat test. Jika aset potret diubah, pemeriksaan akan gagal agar ciri fisik pada Character Bible tidak dibiarkan usang tanpa peninjauan ulang. Ledger merekam **248 SHA unik** dan total sekitar **21,64 MB** aset potret yang dipasangkan ke 248 ID canonical.
