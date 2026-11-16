"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";
import { acceptOrder, buySeeds, facing, GameState, FarmTool, meetNpc, movePlayer,
  newGame, nextDay, NPCS, safeLoad, applyFarmTool, Direction } from "@/lib/game/model";
import { drawWorld, type WorldArt } from "@/lib/game/draw-world";
import { BANDUNG_DISTRICTS, REGOL_VILLAGES, START_LOCATION } from "@/lib/game/bandung-locations";
import "./game.css";

type PhoneTab = "apps" | "chat" | "farm" | "ikd" | "map";
type Dialogue = { title: string; lines: string[] };
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
  const [phoneTab, setPhoneTab] = useState<PhoneTab>("apps");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("Regol");
  const [dialogue, setDialogue] = useState<Dialogue | null>(null);
  const [toast, setToast] = useState("Selamat datang di Pasirluyu. Gunakan tombol arah dan E.");
  const [showHelp, setShowHelp] = useState(true);

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
      setDialogue({ title: result.title, lines: result.lines });
      setShowHelp(false);
      return;
    }
    const result = applyFarmTool(game, tool);
    setGame(result.state); setToast(result.message);
    setShowHelp(false);
  }, [game, tool, phoneOpen, dialogue, saveStatus]);

  const togglePhone = useCallback(() => {
    if (dialogue || saveStatus === "loading" || saveStatus === "error") return;
    setPhoneOpen(o => !o); setPhoneTab("apps"); setShowHelp(false);
  }, [dialogue, saveStatus]);

  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      const element = e.target as HTMLElement | null;
      if (element && ["INPUT", "TEXTAREA", "SELECT"].includes(element.tagName)) return;
      const key = e.key.toLowerCase();
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
    if (phoneOpen || dialogue || saveStatus === "error") return;
    setGame(s => nextDay(s));
    setToast("Hari baru dimulai. Tanaman yang disiram kemarin bertumbuh.");
  };
  const markOrder = () => {
    setGame(s => acceptOrder(s));
    setToast("Quest: Bawa empat timun kepada Inggit di pasar.");
  };
  const purchase = () => {
    const next = buySeeds(game);
    if (!next) { setToast("Koin belum cukup. Lima bibit berharga 40 G."); return; }
    setGame(next); setToast("Berhasil membeli lima bibit.");
  };

  const planted = game.plots.filter(p => p.stage >= 0).length;
  const readyCrops = game.plots.filter(p => p.stage === 3).length;
  const unread = !game.story.orderAccepted && !game.phoneRead;
  const minutes = timeLabel(game.minutes);

  return <main className="yzg-page">
    <header className="yzg-header">
      <div>
        <span className="yzg-eyebrow">PIXEL FARMING STORY · PROTOTYPE 01</span>
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
        {dialogue && <div className="yzg-dialog" role="dialog" aria-label={dialogue.title}>
          <div className="yzg-dialog-head"><b>{dialogue.title}</b><span>◈ CERITA</span></div>
          {dialogue.lines.map((line, i) => <p key={i}>{line}</p>)}
          <button onClick={() => setDialogue(null)}>Lanjutkan ›</button>
        </div>}
        {phoneOpen && <div className="yzg-phone-backdrop" onClick={() => setPhoneOpen(false)}>
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
                <div className="yzg-phone-card"><b>Notifikasi kampung</b><p>{game.story.orderDone ? "Inggit mengundangmu ke festival panen kota." : "Inggit mengirim pesan tentang pesanan timun."}</p></div>
              </>}
              {phoneTab === "chat" && <>
                <div className="yzg-phone-card"><b>✉ Inggit · Pedagang pasar</b><p>&ldquo;Halo, Yanzen! Bisa bantu sediakan empat timun segar untuk warungku? Aku bayar 160 G saat kamu antar.&rdquo;</p>
                  {!game.story.orderAccepted && <button onClick={markOrder}>Terima pesanan 4 timun</button>}
                  {game.story.orderAccepted && <small>{game.story.orderDone ? "✓ Pesanan selesai. Terima kasih!" : "Pesanan diterima. Temui Inggit setelah panen."}</small>}
                </div>
                <div className="yzg-phone-card"><b>✉ Ryan</b><p>&ldquo;Kalau sempat, mampir ke dekat kebun. Ada saluran air lama yang menarik.&rdquo;</p></div>
                <div className="yzg-phone-card"><b>Pasar Bibit</b><p>Lima bibit timun — 40 G</p><button onClick={purchase} disabled={game.coins < 40}>Beli 5 bibit</button></div>
              </>}
              {phoneTab === "farm" && <>
                <div className="yzg-phone-card"><b>Ringkasan kebun</b>
                  <div className="yzg-phone-stats"><span>Tanaman aktif<strong>{planted}</strong></span><span>Siap panen<strong>{readyCrops}</strong></span><span>Hasil panen<strong>{game.harvested}</strong></span><span>Saldo<strong>{game.coins} G</strong></span></div>
                </div>
                <div className="yzg-phone-card"><b>Jurnal quest</b><p>{game.story.orderDone ? "✓ Empat timun untuk Inggit telah dikirim." : game.story.orderAccepted ? "Panen dan antar 4 timun kepada Inggit di pasar." : "Baca pesan Inggit untuk menerima pesanan."}</p>
                  <p>{game.story.canalClue ? "✓ Rahasia saluran tua: cari petunjuk dari Nani." : "Temui Ryan di pinggir kebun."}</p>
                  {game.story.sarisStory && <p>✓ Sudah mendengar kisah kampung dari Nani.</p>}
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
                  {selectedDistrict === "Regol" ? <>
                    <small>7 kelurahan asli · Wilayah yang bisa dimainkan saat ini: Pasirluyu</small>
                    {REGOL_VILLAGES.map(v => <p key={v}>{v === "Pasirluyu" ? "✓" : "🔒"} {v}{v === "Pasirluyu" ? " — lokasi awal" : " — tahap berikutnya"}</p>)}
                  </> : <p>🔒 {selectedDistrict} terdaftar dalam peta Kota Bandung. Area permainan untuk kecamatan ini belum dibuat.</p>}
                </div>
              </>}
            </div>
            <div className="yzg-phone-bottom"><button onClick={() => setPhoneTab("apps")}>●</button></div>
          </section>
        </div>}
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
        <button onClick={() => window.location.reload()}>Muat ulang dan coba kembali</button>
      </div>}
    </section>
    <p className="yzg-disclaimer">Prototipe terbatas · Data game dipisahkan dari transaksi dan panen E-Farmer nyata. Visual NPC sementara merupakan pixel art sederhana yang merujuk karakter A01, C01, dan C08; belum berupa sprite final dari lembar referensi.</p>
  </main>;
}
