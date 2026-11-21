# Koordinasi ChatGPT × Codex × GitHub

Tujuan folder ini: dua AI dapat melanjutkan proyek yang sama tanpa kehilangan konteks atau menimpa pekerjaan satu sama lain.

| Dokumen | Fungsi |
| --- | --- |
| [AGENTS.md](../../AGENTS.md) | Instruksi minimum yang harus dibaca setiap agen |
| [SYNC_PROTOCOL.md](SYNC_PROTOCOL.md) | Alur kerja, penanggung jawab, branch, PR, konflik, dan gerbang rilis |
| [ARCHITECTURE_SPLIT.md](ARCHITECTURE_SPLIT.md) | Rencana memisahkan Smart Farm dan YZ Farm Life ke subdomain |
| [CURRENT_STATE.md](CURRENT_STATE.md) | Snapshot sementara; selalu verifikasi ulang commit/deployment langsung |
| [HANDOFF_TEMPLATE.md](HANDOFF_TEMPLATE.md) | Format serah terima ChatGPT ↔ Codex |
| [YZ Farm Life Master Audit](../game-dev/GAME_AUDIT_MASTER.md) | **Rujukan kanonik wajib setiap audit game** |
| [YZ Farm Life Audit Playbook](../game-dev/AUDIT_PLAYBOOK.md) | Tes, bukti, prosedur, dan handoff audit |

**Prinsip:** bukan AI yang menjadi pusat sinkronisasi; **GitHub + PR/Issue + commit SHA** yang menghubungkan hasil kerja mereka. ChatGPT maupun Codex tetap harus membaca status terkini setiap kali mulai tugas. Kehadiran file instruksi tidak memberikan sinkronisasi real-time atau kunci eksklusif.
