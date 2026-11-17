"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import NextImage from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";
import { acceptOrder, buySeeds, facing, GameState, FarmTool, meetNpc, movePlayer,
  newGame, nextDay, NPCS, safeLoad, applyFarmTool, Direction, chapterJournal,
  choosePhoto, sellCucumbers, sellableCucumbers, type PhotoChoice, type Dialogue } from "@/lib/game/model";
import { drawWorld, type WorldArt } from "@/lib/game/draw-world";
import { BANDUNG_DISTRICTS, REGOL_VILLAGES, START_LOCATION } from "@/lib/game/bandung-locations";
import "./game.css";

type PhoneTab = "apps" | "chat" | "farm" | "ikd" | "map";
type SaveStatus = "loading" | "ready" | "saving" | "saved" | "error";
const TOOLS: { id: FarmTool; name: string; glyph: string }[] = [
  { id: "hoe", name: "Cangkul", glyph: "01" },
  { id: "seed", name: "Tanam", glyph: "02" },
  { id: "water", name: "Siram", glyph: "03" },
  { id: "harvest", name: "Panen", glyph: "04" },
];
const APPS: { id: PhoneTab; name: string; icon: string }[] = [
  { id: "chat", name: "Pesan", icon: "✉" },
  { id: "farm", name: "Kebunku", icon: "✿" },
  { id: "ikd", name: "IKD", icon: "▣" },
  { id: "map", name: "Jelajah", icon: "⌖" },
];
function timeLabel(minutes: number) {
  return String(Math.floor(minutes / 60)).padStart(2, "0") + ":" + String(minutes % 60).padStart(2, "0");
}
export default function GameClient() {
  const router = useRouter();
  const [art, setArt] = useState<WorldArt>({});
  const previousTile = useRef("");
  useEffect(() => {
    let active = true;
    const sources = { people: "characters/stage1.png", cucumber: "tiles/cucumber.png" };
    for (const [key, path] of Object.entries(sources)) {
      const image = new Image();
      image.onload = () => { if (active) setArt(previous => ({ ...previous, [key]: image })); };
      image.src = "/game/assets/" + path;
    }
    return () => { active = false; };
  }, []);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dbRef = useRef<ReturnType<typeof createClient> | null>(null);
  const queueRef = useRef<Promise<void>>(Promise.resolve());
  const saveLockedRef = useRef(false);
  const [game, setGame] = useState<GameState>(() => newGame());
  const [userId, setUserId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("loading");
  const [errorText, setErrorText] = useState("");
  const [tool, setTool] = useState<FarmTool>("hoe");
  const [phoneOpen, setPhoneOpen] = useState(false);
  const phoneRef = useRef<HTMLDialogElement>(null);
  const [phoneTab, setPhoneTab] = useState<PhoneTab>("apps");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("Regol");
  const [dialogue, setDialogue] = useState<Dialogue | null>(null);
  const dialogueRef = useRef<HTMLDialogElement>(null);
  const [toast, setToast] = useState("Selamat datang di Pasirluyu. Gunakan tombol arah dan E.");
  const [showHelp, setShowHelp] = useState(true);

  useEffect(() => {
    const dialog = dialogueRef.current;
    if (dialogue && dialog && !dialog.open) dialog.showModal();
  }, [dialogue]);
  useEffect(() => {
    const dialog = phoneRef.current;
    if (phoneOpen && dialog && !dialog.open) dialog.showModal();
  }, [phoneOpen]);

  useEffect(() => {
    let active = true;
    const db = createClient(); dbRef.current = db;
    (async () => {
      const { data: auth, error: authError } = await db.auth.getUser();
      if (!active) return;
      if (authError || !auth.user) { router.replace("/login"); return; }
      const id = auth.user.id;
      const { data, error } = await db.from("yz_game_saves").select("data").eq("user_id", id).maybeSingle();
      if (!active) return;
      if (error) {
        setErrorText("Database game belum siap atau tidak dapat diakses: " + error.message);
        setSaveStatus("error"); saveLockedRef.current = true;
        return;
      }
      if (data?.data) {
        const loaded = safeLoad(data.data);
        if (!loaded) {
          setErrorText("Data save tidak dikenali. Penyimpanan dinonaktifkan agar progres lama tidak tertimpa.");
          setSaveStatus("error"); saveLockedRef.current = true;
          return;
        }
        setGame(loaded); setToast("Progres cloud berhasil dimuat. Selamat kembali!");
      }
      setUserId(id); setSaveStatus("ready");
    })().catch(e => {
      if(active){setErrorText("Gagal memuat save: " + String(e));setSaveStatus("error"); saveLockedRef.current = true;}
    });
    return () => { active = false; };
  }, [router]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const { x, y } = game.player;
    const tile = x + "," + y;
    const moved = previousTile.current !== "" && previousTile.current !== tile;
    previousTile.current = tile;
    drawWorld(canvas, game, art, moved ? ((x+y)%2)*2 : 1);
    if (moved) {
      const timer = window.setTimeout(() => drawWorld(canvas, game, art), 120);
      return () => window.clearTimeout(timer);
    }
  }, [game, art]);

  const persist = useCallback((snapshot: GameState) => {
    if (!userId || !dbRef.current || saveLockedRef.current) return;
    const db = dbRef.current;
    const next = queueRef.current.then(async () => {
      if (saveLockedRef.current) return;
      setSaveStatus("saving");
      const { error } = await db.from("yz_game_saves").upsert(
        { user_id: userId, version: 1, data: snapshot, updated_at: new Date().toISOString() },
        { onConflict: "user_id" }
      );
      if (error) throw error;
      setSaveStatus("saved");
    }).catch(e => { saveLockedRef.current = true; setSaveStatus("error"); setErrorText("Gagal menyimpan: " + String(e)); });
    queueRef.current = next;
    return next;
  }, [userId]);

  useEffect(() => {
    if (!userId || saveLockedRef.current) return;
    const t = window.setTimeout(() => { void persist(game); }, 1300);
    return () => window.clearTimeout(t);
  }, [game, userId, persist]);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(""), 4600);
    return () => window.clearTimeout(t);
  }, [toast]);

  const step = useCallback((direction: Direction) => {
    if (phoneOpen || dialogue || saveStatus === "loading" || saveStatus === "error") return;
    setGame(s => movePlayer(s, direction));
    setShowHelp(false);
  }, [phoneOpen, dialogue, saveStatus]);

  const action = useCallback(() => {
    if (phoneOpen || dialogue || saveStatus === "loading" || saveStatus === "error") return;
    const front = facing(game.player);
    const npc = NPCS.find(n => n.x === front.x && n.y === front.y);
    if (npc) {
      const result = meetNpc(game, npc.id);
      setGame(result.state);
      setDialogue(result);
      if (result.state !== game) void persist(result.state);
      setShowHelp(false);
      return;
    }
    const result = applyFarmTool(game, tool);
    setGame(result.state); setToast(result.message);
    if (result.state !== game) void persist(result.state);
    setShowHelp(false);
  }, [game, tool, phoneOpen, dialogue, saveStatus, persist]);

  const togglePhone = useCallback(() => {
    if (dialogue || saveStatus === "loading" || saveStatus === "error") return;
    setPhoneOpen(o => !o); setPhoneTab("apps"); setShowHelp(false);
  }, [dialogue, saveStatus]);

  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      const element = e.target as HTMLElement | null;
      if (element && ["INPUT", "TEXTAREA", "SELECT"].includes(element.tagName)) return;
      const key = e.key.toLowerCase();
      // Native buttons and dialogs own Enter/Space/Tab. Do not dismiss a
      // meaningful choice before its focused button can activate.
      if (dialogue || (element?.closest("button, a, dialog") && [" ", "enter"].includes(key))) return;
      if (["arrowup", "arrowdown", "arrowleft", "arrowright", " ", "p", "e", "escape"].includes(key) ||
        ["w", "a", "s", "d"].includes(key)) e.preventDefault();
      if (key === "escape") { setPhoneOpen(false); setDialogue(null); return; }
      if (key === "p") { if (!e.repeat) togglePhone(); return; }
      if (phoneOpen || dialogue) {
        if (dialogue && (key === "e" || key === " " || key === "enter")) setDialogue(null);
        return;
      }
      const dirs: Record<string, Direction> = {
        w: "up", arrowup: "up", s: "down", arrowdown: "down",
        a: "left", arrowleft: "left", d: "right", arrowright: "right"
      };
      if (dirs[key]) step(dirs[key]);
      if ((key === " " || key === "e") && !e.repeat) action();
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [step, action, togglePhone, phoneOpen, dialogue]);

  const rest = () => {
    if (phoneOpen || dialogue || saveStatus === "loading" || saveStatus === "error") return;
    const next = nextDay(game);
    setGame(next); void persist(next);
    setToast("Hari baru dimulai. Tanaman yang disiram kemarin bertumbuh.");
  };
  const markOrder = () => {
    if (saveStatus === "loading" || saveStatus === "error") return;
    const next = acceptOrder(game);
    setGame(next); void persist(next);
    setToast("Quest: Bawa empat timun kepada Inggit di pasar.");
  };
  const purchase = () => {
    if (saveStatus === "loading" || saveStatus === "error") return;
    const next = buySeeds(game);
    if (!next) { setToast("Koin belum cukup. Lima bibit berharga 40 G."); return; }
    setGame(next); void persist(next); setToast("Berhasil membeli lima bibit.");
  };
  const decidePhoto = (choice: PhotoChoice) => {
    if (saveStatus === "loading" || saveStatus === "error") return;
    const next = choosePhoto(game, choice);
    if (next === game) return;
    setGame(next); void persist(next);
    setDialogue({ title: "Bab 1 selesai · Empat Timun dan Satu Nama", photo: true, lines: [
      choice === "nani" ? "Nani menyelipkan foto asli ke amplop. Ia akan menyiapkan kisah dengan suaranya sendiri; kamu tidak perlu membagikannya sebelum ia siap." :
        "Nani menyimpan foto asli dan menitipkan salinan di warung. Inggit menyiapkan tempat untuk nama-nama yang diingat warga.",
      "Pilihanmu tercatat di jurnal. Temui kembali Nani dan Inggit untuk melihat akibatnya. Bab Cimincrang belum tersedia; kebun dan warung tetap dapat dikunjungi."] });
  };
  const sell = () => {
    if (saveStatus === "loading" || saveStatus === "error") return;
    const quantity = sellableCucumbers(game);
    if (!quantity) return;
    const next = sellCucumbers(game);
    setGame(next); void persist(next);
    setDialogue({ title: "Inggit · Hasil Panen Diterima", shop: true, lines: [
      `Inggit: ${quantity} timun sudah kuterima. Ini ${quantity * 25} G. Empat timun untuk pesanan yang masih aktif tetap kamu simpan.`] });
  };

  const planted = game.plots.filter(p => p.stage >= 0).length;
  const readyCrops = game.plots.filter(p => p.stage === 3).length;
  const unread = !game.story.orderAccepted && !game.phoneRead;
  const minutes = timeLabel(game.minutes);
  const journal = chapterJournal(game);
  const unavailable = saveStatus === "loading" || saveStatus === "error";

  return <main className="yzg-page">
    <header className="yzg-header">
      <div>
        <span className="yzg-eyebrow">BAB 1 · EMPAT TIMUN DAN SATU NAMA</span>
        <h1>YZ <span>Farm Life</span></h1>
        <p>Pasirluyu — sawah dan cerita di tengah kota.</p>
      </div>
      <Link href="/home" className="yzg-back">← Kembali ke E-Farmer</Link>
    </header>

    <section className="yzg-shell" aria-label="Permainan YZ Farm Life">
      <div className="yzg-headsup">
        <span>☀ Hari {game.day} · {minutes}</span>
        <span>◈ {game.coins} G</span>
        <span>Timun {game.harvested} · Bibit {game.seeds}</span>
        <span className={saveStatus === "error" ? "yzg-bad" : ""}>☁ {saveStatus === "loading" ? "Memuat cloud" : saveStatus === "ready" ? "Siap" : saveStatus === "saving" ? "Menyimpan" : saveStatus === "saved" ? "Tersimpan" : "Gagal save"}</span>
      </div>
      <section className="yzg-objective" aria-label="Tujuan cerita">
        <div><b>{journal.stage === 5 ? "Bab 1 selesai" : "Tujuan berikutnya"}</b><p>{journal.objective}</p></div>
        <button onClick={() => { setShowHelp(false); setPhoneOpen(true); setPhoneTab("farm"); }} disabled={unavailable || !!dialogue}>Buka jurnal</button>
      </section>
      <div className="yzg-viewport">
        <canvas ref={canvasRef} width={480} height={320} aria-label="Peta piksel Kebun Timun dan Pasirluyu" role="img"/>
        {toast && <div className="yzg-toast" role="status">{toast}</div>}
        {!phoneOpen && !dialogue && unread && <button className="yzg-notif" onClick={togglePhone}>
          <span className="yzg-notif-icon">✉</span>
          <span><b>YZ Phone · Pesan baru</b><small>Inggit: Ada pesanan timun untuk warungku!</small></span>
        </button>}
        {showHelp && <div className="yzg-help">
          <b>Selamat datang, Yanzen!</b><br/>
          Bergerak: WASD / panah · Interaksi: E · HP: P<br/>
          Arahkan ke petak kebun, pilih alat, lalu tekan E.
          <button onClick={() => setShowHelp(false)}>Mengerti</button>
        </div>}
        {dialogue && <dialog ref={dialogueRef} className="yzg-dialog yzg-chapter-dialog" aria-label={dialogue.title} onCancel={() => setDialogue(null)} onClose={() => setDialogue(null)}>
          <div className="yzg-dialog-head"><b>{dialogue.title}</b><span>◈ CERITA</span></div>
          {dialogue.photo && <figure className="yzg-story-photo"><NextImage src="/game/assets/story/foto-saluran.png" width={1536} height={1024} sizes="(max-width: 640px) 90vw, 580px" alt="Foto cerita fiktif: dua garis pada batu di samping pintu air dan jembatan kebun."/><figcaption>Foto pintu air · koleksi Nani · ilustrasi fiktif</figcaption></figure>}
          {dialogue.lines.map((line, i) => <p key={i}>{line}</p>)}
          {dialogue.choosePhoto && <div className="yzg-photo-choices" aria-label="Pilih tempat foto">
            <button onClick={() => decidePhoto("nani")} disabled={unavailable}>Percayakan foto asli kepada Nani<small>Kisah disimpan bersama keluarga.</small></button>
            <button onClick={() => decidePhoto("warung")} disabled={unavailable}>Titip salinan di warung<small>Warga dapat menambahkan nama.</small></button>
          </div>}
          {dialogue.shop && <div className="yzg-shop">
            <button onClick={purchase} disabled={unavailable || game.coins < 40}>Beli 5 bibit · 40 G</button>
            <button onClick={sell} disabled={unavailable || !sellableCucumbers(game)}>Jual {sellableCucumbers(game)} timun · {sellableCucumbers(game) * 25} G</button>
            {game.story.orderAccepted && !game.story.orderDone && <small>Empat timun dicadangkan untuk pesanan Inggit.</small>}
          </div>}
          <button onClick={() => setDialogue(null)}>{dialogue.choosePhoto ? "Putuskan nanti" : "Lanjutkan ›"}</button>
        </dialog>}
        {phoneOpen && <dialog ref={phoneRef} className="yzg-phone-backdrop" aria-label="YZ Phone" onCancel={() => setPhoneOpen(false)} onClose={() => setPhoneOpen(false)} onClick={e => { if (e.target === e.currentTarget) setPhoneOpen(false); }}>
          <section className="yzg-phone" onClick={e => e.stopPropagation()} aria-label="Smartphone YZ Phone">
            <div className="yzg-phone-notch"/>
            <div className="yzg-phone-time"><span>{minutes}</span><span>●●●  ▰</span></div>
            <div className="yzg-phone-top">
              <button aria-label="Kembali" onClick={() => phoneTab === "apps" ? setPhoneOpen(false) : setPhoneTab("apps")}>‹</button>
              <b>{phoneTab === "apps" ? "YZ PHONE" : phoneTab === "chat" ? "Pesan" : phoneTab === "farm" ? "Kebunku" : phoneTab === "ikd" ? "IKD" : "Jelajah"}</b>
              <button aria-label="Tutup ponsel" onClick={() => setPhoneOpen(false)}>×</button>
            </div>
            <div className="yzg-phone-content">
              {phoneTab === "apps" && <>
                <div className="yzg-phone-greeting">SELAMAT PAGI, YANZEN <strong>Hidup terus berjalan di Pasirluyu.</strong><small>Hari {game.day} · Cuaca cerah berawan</small></div>
                <div className="yzg-app-grid">{APPS.map(app => <button key={app.id} onClick={() => {
                  setPhoneTab(app.id);
                  if (app.id === "chat") setGame(g => ({ ...g, phoneRead: true }));
                }}><span>{app.icon}{app.id === "chat" && unread && <i/>}</span><b>{app.name}</b></button>)}</div>
                <div className="yzg-phone-card"><b>Tujuan berikutnya</b><p>{journal.objective}</p></div>
              </>}
              {phoneTab === "chat" && <>
                <div className="yzg-phone-card"><b>✉ Inggit · Pedagang pasar</b><p>&ldquo;Halo, Yanzen! Bisa bantu sediakan empat timun segar untuk warungku? Aku bayar 160 G saat kamu antar.&rdquo;</p>
                  {!game.story.orderAccepted && <button onClick={markOrder}>Terima pesanan 4 timun</button>}
                  {game.story.orderAccepted && <small>{game.story.orderDone ? "✓ Pesanan selesai. Terima kasih!" : "Pesanan diterima. Temui Inggit setelah panen."}</small>}
                </div>
                <div className="yzg-phone-card"><b>✉ Ryan</b><p>&ldquo;Kalau sempat, mampir ke dekat kebun. Ada saluran air lama yang menarik.&rdquo;</p></div>
                <div className="yzg-phone-card"><b>Pasar Bibit</b><p>Lima bibit timun — 40 G</p><button onClick={purchase} disabled={unavailable || game.coins < 40}>Beli 5 bibit</button></div>
              </>}
              {phoneTab === "farm" && <>
                <div className="yzg-phone-card"><b>Ringkasan kebun</b>
                  <div className="yzg-phone-stats"><span>Tanaman aktif<strong>{planted}</strong></span><span>Siap panen<strong>{readyCrops}</strong></span><span>Hasil panen<strong>{game.harvested}</strong></span><span>Saldo<strong>{game.coins} G</strong></span></div>
                </div>
                <div className="yzg-phone-card"><b>Jurnal · Bab 1</b><p>{journal.objective}</p>
                  <ol className="yzg-journal">{journal.entries.map(entry => <li key={entry.title}>{entry.done ? "Selesai: " : "Belum: "}{entry.title}</li>)}</ol>
                  {game.story.photoSeen && <figure className="yzg-story-photo"><NextImage src="/game/assets/story/foto-saluran.png" width={1536} height={1024} sizes="300px" alt="Foto lama pintu air milik Nani, dengan dua garis pada batu."/><figcaption>Petunjuk: Cimincrang</figcaption></figure>}
                  {game.story.photoChoice && <p><b>Keputusan hari {game.story.completedDay}</b><br/>{game.story.photoChoice === "nani" ? "Foto asli dipercayakan kepada Nani; kisah keluarga disiapkan dengan suaranya sendiri." : "Salinan foto dititipkan di warung; warga dapat menambahkan nama. Foto asli tetap bersama Nani."}</p>}
                </div>
              </>}
              {phoneTab === "ikd" && <>
                <div className="yzg-phone-card yzg-id">
                  <small>IKD · IDENTITAS KARAKTER DIGITAL</small>
                  <div className="yzg-avatar">Y</div><strong>YANZEN</strong>
                  <p>Warga Pasirluyu</p>
                  <dl><dt>ID Game</dt><dd>YZF-{(userId || "000001").slice(0, 6).toUpperCase()}</dd>
                    <dt>Domisili</dt><dd>Pasirluyu, Regol, Kota Bandung</dd>
                    <dt>Pekerjaan</dt><dd>Petani urban</dd>
                    <dt>Tahun tinggal</dt><dd>{game.day > 0 ? "Tahun 1" : "Baru pindah"}</dd>
                    <dt>Hari bermain</dt><dd>{game.day}</dd></dl>
                  <small>Seluruh identitas ini fiktif. Bukan IKD pemerintah atau data kependudukan asli.</small>
                </div>
              </>}
              {phoneTab === "map" && <>
                <div className="yzg-phone-card"><b>Lokasi kamu sekarang</b>
                  <p>{START_LOCATION.village} · Kecamatan {START_LOCATION.district}<br/>{START_LOCATION.city}</p>
                  <small>Game menggunakan nama wilayah asli. Jalan, kebun dan NPC direka untuk cerita.</small>
                </div>
                <div className="yzg-phone-card"><b>Jelajah 30 Kecamatan</b>
                  <label htmlFor="yzg-kecamatan" className="yzg-map-label">Pilih kecamatan</label>
                  <select className="yzg-map-select" id="yzg-kecamatan"
                    value={selectedDistrict} onChange={e => setSelectedDistrict(e.target.value)}>
                    {BANDUNG_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <a href={`/game/atlas/index.html?kecamatan=${encodeURIComponent(selectedDistrict)}`}>Buka atlas wilayah dan tanaman</a>
                  {selectedDistrict === "Regol" ? <>
                    <small>7 kelurahan asli · Wilayah yang bisa dimainkan saat ini: Pasirluyu</small>
                    {REGOL_VILLAGES.map(v => <p key={v}>{v === "Pasirluyu" ? "✓" : "🔒"} {v}{v === "Pasirluyu" ? " — lokasi awal" : " — tahap berikutnya"}</p>)}
                  </> : <p>🔒 {selectedDistrict} terdaftar dalam peta Kota Bandung. Area permainan untuk kecamatan ini belum dibuat.</p>}
                </div>
              </>}
            </div>
            <div className="yzg-phone-bottom"><button onClick={() => setPhoneTab("apps")}>●</button></div>
          </section>
        </dialog>}
      </div>
      <div className="yzg-controls">
        <div className="yzg-tools" aria-label="Alat pertanian">
          {TOOLS.map(t => <button key={t.id} className={tool === t.id ? "active" : ""} aria-pressed={tool === t.id} onClick={() => setTool(t.id)}><span>{t.glyph}</span>{t.name}</button>)}
        </div>
        <div className="yzg-buttons">
          <button className="yzg-phone-trigger" onClick={togglePhone}>▣ YZ Phone {unread ? "•" : ""}</button>
          <button onClick={rest} disabled={saveStatus === "loading" || saveStatus === "error"}>☾ Tidur / Hari Baru</button>
          <button onClick={() => void persist(game)} disabled={saveStatus === "loading" || saveStatus === "error"}>☁ Simpan</button>
        </div>
      </div>
      <div className="yzg-touch">
        <div className="yzg-dpad" aria-label="Kontrol bergerak">
          <button className="up" onClick={() => step("up")} aria-label="Atas">▲</button>
          <button className="left" onClick={() => step("left")} aria-label="Kiri">◀</button>
          <button className="down" onClick={() => step("down")} aria-label="Bawah">▼</button>
          <button className="right" onClick={() => step("right")} aria-label="Kanan">▶</button>
        </div>
        <button className="yzg-action" onClick={action}>A <small>AKSI</small></button>
      </div>
      <div className="yzg-footer"><span>Jalan: WASD / arah · E: aksi · P: HP · Escape: tutup</span><span>Petak disiram tumbuh saat hari berganti.</span></div>
      {saveStatus === "error" && <div className="yzg-error" role="alert">
        <b>Penyimpanan cloud bermasalah</b><p>{errorText}</p>
        {userId && <p>Progres terbaru masih di layar. Coba simpan kembali sebelum menutup game.</p>}
        <button onClick={() => {
          if (!userId) { window.location.reload(); return; }
          saveLockedRef.current = false; setErrorText(""); void persist(game);
        }}>{userId ? "Coba simpan kembali" : "Coba muat progres kembali"}</button>
      </div>}
    </section>
    <p className="yzg-disclaimer">Bab 1 · Pasirluyu. Yanzen A01, Ryan A03, Nani C01, dan Inggit C08 memakai atlas runtime proyek. Cerita dan foto pintu air adalah fiksi. Progres game terpisah dari transaksi dan panen E-Farmer nyata. Perjalanan ke Cimincrang belum tersedia.</p>
  </main>;
}
