"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type MouseEvent as ReactMouseEvent } from "react";
import Link from "next/link";
import NextImage from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";
import { acceptOrder, buySeeds, facing, GameState, FarmTool, meetNpc, movePlayer,
  newGame, nextDay, NPCS, NPC_SOULS, npcWhere, areaTitle, AREAS, ROUTE_BARRIERS, PASIRLUYU_MASTER, weatherForDay, timeGreeting, safeLoad, interactDoor, canSleep, chooseSocial, bondLevel, bondLabel, playerLevel, applyFarmTool, Direction, chapterJournal,
  choosePhoto, sellCucumbers, sellableCucumbers, getActionContext, farmOverview, equipFarmTool, cycleFarmTool, transferTool, upgradeToolBag, bagCapacity, TOOL_CATALOG, toolName, type ToolId, type PhotoChoice, type SocialChoice, type Dialogue } from "@/lib/game/model";
import { type WorldArt } from "@/lib/game/draw-world";
import { START_LOCATION } from "@/lib/game/bandung-locations";
import WorldRegionDirectory from "./world-region-directory";
import { FieldEngine, type ToolUse } from "@/lib/game/field-engine";
import { planTapRoute, type TapRoute } from "@/lib/game/tap-navigation";
import { STEP_MS, RUN_STEP_MS } from "@/lib/game/walking";
import CharacterGallery from "./character-gallery";
import DialoguePanel, { Portrait } from "./dialogue-panel";
import ToolWarehouse from "./tool-warehouse";
import "./game.css";

type PhoneTab = "apps" | "chat" | "farm" | "ikd" | "map" | "friends" | "stats" | "characters";
type SaveStatus = "loading" | "ready" | "saving" | "saved" | "error";
const APPS: { id: PhoneTab; name: string; icon: string }[] = [
  { id: "chat", name: "Pesan", icon: "✉" },
  { id: "farm", name: "Kebunku", icon: "✿" },
  { id: "ikd", name: "IKD", icon: "▣" },
  { id: "map", name: "Jelajah", icon: "⌖" },
  { id: "friends", name: "Kedekatan", icon: "♡" },
  { id: "stats", name: "Statistik", icon: "▤" },
  { id: "characters", name: "Warga", icon: "☷" },
];
function timeLabel(minutes: number) {
  return String(Math.floor(minutes / 60)).padStart(2, "0") + ":" + String(minutes % 60).padStart(2, "0");
}
type WalkInput = (id: string, direction: Direction) => void;
function DirectionButton({ direction, label, symbol, press, release, step }: {
  direction: Direction; label: string; symbol: string; press: WalkInput;
  release: (id: string) => void; step: (dir: Direction) => void;
}) {
  const id = "pad:" + direction;
  return <button className={direction} aria-label={label}
    onPointerDown={event => {
      if (!event.isPrimary || event.button !== 0) return;
      event.currentTarget.setPointerCapture(event.pointerId);
      press(id, direction);
    }}
    onPointerMove={event => {
      if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
      const pad = event.currentTarget.parentElement!.getBoundingClientRect();
      const x = (event.clientX-pad.left)/pad.width*2-1;
      const y = (event.clientY-pad.top)/pad.height*2-1;
      if (Math.max(Math.abs(x),Math.abs(y)) < .2 || Math.max(Math.abs(x),Math.abs(y)) > 1.25) {
        release(id);
        return;
      }
      press(id, Math.abs(x)>Math.abs(y) ? (x<0?"left":"right") : (y<0?"up":"down"));
    }}
    onPointerUp={() => release(id)} onPointerCancel={() => release(id)}
    onLostPointerCapture={() => release(id)}
    onClick={event => { if (event.detail === 0) step(direction); }}>{symbol}</button>;
}

export default function GameClient() {
  const router = useRouter();
  const screenRef = useRef<HTMLElement>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [screenError, setScreenError] = useState("");
  const toggleFullscreen = useCallback(async () => {
    try {
      setScreenError("");
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (screenRef.current?.requestFullscreen) await screenRef.current.requestFullscreen();
      else setScreenError("Browser ini belum mendukung fullscreen. Gunakan mode layar penuh browser.");
    } catch {
      setScreenError("Fullscreen belum dapat dibuka. Coba tombol Layar penuh kembali.");
    }
  }, []);
  useEffect(() => {
    const sync = () => setFullscreen(document.fullscreenElement === screenRef.current);
    const shortcut = (event: KeyboardEvent) => {
      if (event.key !== "Enter" || !event.altKey || event.repeat) return;
      event.preventDefault();
      void toggleFullscreen();
    };
    document.addEventListener("fullscreenchange", sync);
    window.addEventListener("keydown", shortcut);
    return () => {
      document.removeEventListener("fullscreenchange", sync);
      window.removeEventListener("keydown", shortcut);
    };
  }, [toggleFullscreen]);
  const [art, setArt] = useState<WorldArt>({});
  const [field] = useState(() => new FieldEngine());
  const tapRoute = useRef<TapRoute|null>(null);
  const [tapTick,setTapTick] = useState(0);
  const [sound, setSound] = useState(true);
  const [runMode, setRunMode] = useState(false);
  const [swing, setSwing] = useState<ToolUse | null>(null);
  useEffect(() => {
    let active = true;
    const sources = { people: "characters/stage1.png", gaits: "characters/yanzen-gaits.png", turns: "characters/yanzen-turns.png", cucumber: "tiles/cucumber.png", landscape: "tiles/pasirluyu.png", actions: "tiles/actions.png", effects: "tiles/field-effects.png",
      pasirluyuDay: "pasirluyu/house-neighborhood-day.svg", pasirluyuEvening: "pasirluyu/house-neighborhood-evening.svg",
      rumahDay: "pasirluyu/rumah-yanzen-interior-day.svg", rumahEvening: "pasirluyu/rumah-yanzen-interior-evening.svg",
      gudangInterior: "pasirluyu/gudang-interior.svg" };
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
  const [storageOpen, setStorageOpen] = useState(false);
  const [phoneOpen, setPhoneOpen] = useState(false);
  const phoneRef = useRef<HTMLDialogElement>(null);
  const [phoneTab, setPhoneTab] = useState<PhoneTab>("apps");
  const [dialogue, setDialogue] = useState<Dialogue | null>(null);
  const dialogueRef = useRef<HTMLDialogElement>(null);
  const [toast, setToast] = useState("");
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
        field.reset(loaded.player);
        setGame(loaded); setToast("Progres cloud berhasil dimuat. Selamat kembali!");
      }
      setUserId(id); setSaveStatus("ready");
    })().catch(e => {
      if(active){setErrorText("Gagal memuat save: " + String(e));setSaveStatus("error"); saveLockedRef.current = true;}
    });
    return () => { active = false; };
  }, [router, field]);

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

  const controlsLocked = storageOpen || phoneOpen || !!dialogue || saveStatus === "loading" || saveStatus === "error";
  const step = useCallback((direction: Direction) => {
    if (controlsLocked) return;
    tapRoute.current=null;
    setGame(s => movePlayer(s, direction));
    setShowHelp(false);
  }, [controlsLocked]);

  const press = useCallback<WalkInput>((id, dir) => {
    if (controlsLocked || field.held.get(id) === dir) return;
    const first = field.held.size === 0;
    field.held.set(id, dir);
    if (first) {
      step(dir);
      field.delayStep(performance.now() + (runMode || field.shift ? RUN_STEP_MS : STEP_MS));
    }
  }, [controlsLocked, step, runMode, field]);
  const release = useCallback((id: string) => { field.held.delete(id); }, [field]);
  const scene = useRef({ game, art, swing, step, runMode });
  const lastArea = useRef(game.location);
  useLayoutEffect(() => {
    scene.current = { game, art, swing, step, runMode };
    if(lastArea.current!==game.location){
      field.clear();field.reset(game.player);
      lastArea.current=game.location;
    }
    field.aim(game.player);
    if (controlsLocked) { field.held.clear(); field.setShift(false); }
  }, [game, art, swing, step, controlsLocked, runMode, field]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    const clear = () => { field.clear(); field.audio.pause(); };
    const unlock = () => field.audio.unlock();
    const keyup = (event: KeyboardEvent) => {
      if (event.key === "Shift") field.setShift(event.shiftKey);
      release(event.key.toLowerCase());
    };
    const paint = (now: number) => {
      if (!document.hidden) field.paint(canvas, scene.current, now, reduced.matches);
      frame = requestAnimationFrame(paint);
    };
    window.addEventListener("pointerdown", unlock);
    window.addEventListener("keydown", unlock);
    frame = requestAnimationFrame(paint);
    window.addEventListener("keyup", keyup);
    window.addEventListener("blur", clear);
    document.addEventListener("visibilitychange", clear);
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
      field.audio.dispose();
      cancelAnimationFrame(frame);
      clear();
      window.removeEventListener("keyup", keyup);
      window.removeEventListener("blur", clear);
      document.removeEventListener("visibilitychange", clear);
    };
  }, [release, field]);

  const equip=useCallback((next:ToolId)=>{
    if(controlsLocked||!game.carriedTools.includes(next))return;
    setGame(current=>equipFarmTool(current,next));
    setToast("Alat aktif: "+toolName(next)+(TOOL_CATALOG[next].status==="planned"?" · Belum ada lokasi pemakaian untuk alat ini.":""));
    setShowHelp(false);
  },[controlsLocked,game.carriedTools]);
  const swapTool=useCallback((direction:1|-1)=>{
    if(controlsLocked)return;
    const next=cycleFarmTool(game.equippedTool,direction,game.carriedTools);
    if(next)equip(next);
    else setToast("Tas alat kosong. Ambil alat dari gudang.");
  },[controlsLocked,game.equippedTool,game.carriedTools,equip]);
  const transfer=(id:ToolId,direction:"store"|"take")=>{
    if(saveStatus==="loading"||saveStatus==="error")return;
    const result=transferTool(game,id,direction);
    if(result.state!==game){setGame(result.state);void persist(result.state);}
    setToast(result.message);
  };
  const upgrade=()=>{
    if(saveStatus==="loading"||saveStatus==="error")return;
    const result=upgradeToolBag(game);
    if(result.state!==game){setGame(result.state);void persist(result.state);}
    setToast(result.message);
  };

  const action=useCallback(()=>{
    if(controlsLocked) return;
    const context=getActionContext(game);
    if(context.kind==="door"){
      const next=interactDoor(game);
      field.clear();field.reset(next.player);setSwing(null);setGame(next);void persist(next);
      setToast(next.location==="home"?"Masuk rumah. Hadapkan karakter ke kasur untuk tidur.":
        next.location==="shed"?"Selamat datang di gudang. Dekati rak untuk menyimpan alat.":
        "Kembali ke kebun Pasirluyu.");
    }else if(context.kind==="travel"){
      const next=movePlayer(game,game.player.dir);
      if(next.location!==game.location){
        field.clear();field.reset(next.player);setSwing(null);setGame(next);void persist(next);
        setToast("Sekarang berada di "+areaTitle(next.location)+".");
      }
    }else if(context.kind==="sleep"){
      setDialogue({title:"Rumah Yanzen · Istirahat",sleep:true,lines:["Tidur sampai besok pagi? Tanaman yang sudah disiram akan tumbuh, dan hari baru dimulai."]});
    }else if(context.kind==="npc"){
      const result=meetNpc(game,context.npcId);
      setGame(result.state);setDialogue(result);
      if(result.state!==game) void persist(result.state);
    }else if(context.kind==="storage"){
      setStorageOpen(true);
    }else if(context.kind==="inspect"){
      setToast(context.text);
    }else if(context.kind==="farm"||context.kind==="plant"||context.kind==="harvest"){
      // Plant and harvest with empty hands, regardless of equipped gear.
      const selected:FarmTool=context.kind==="plant"?"seed":context.kind==="harvest"?"harvest":
        game.equippedTool==="water"?"water":"hoe";
      const result=applyFarmTool(game,selected);
      if(result.state!==game){
        setSwing({tool:selected,started:performance.now(),origin:game.player,target:facing(game.player),before:game.plots});
        setGame(result.state);void persist(result.state);
      }
      setToast(result.message);
    }else if(context.kind==="wait"){
      setToast("Tanaman ini sudah disiram hari ini. Siram petak lain atau tidur di rumah agar besok tumbuh!");
    }else if(context.kind==="need-tool"){
      setToast(context.label+" · Ambil alat dari gudang dan pilih sebagai alat aktif.");
    }else{
      setToast(game.location==="field"
        ? "Hadapkan karakter ke petak kebun, pintu, atau warga untuk berinteraksi."
        : "Hadapkan karakter ke objek yang bisa digunakan.");
    }
    setShowHelp(false);
  },[game,controlsLocked,persist,field]);

  const tapOnWorld=useCallback((event:ReactMouseEvent<HTMLCanvasElement>)=>{
    if(controlsLocked)return;
    const tile=field.pickTile(event.currentTarget,event.clientX,event.clientY);
    if(!tile)return;
    const route=planTapRoute(game,tile.x,tile.y);
    if(!route){setToast("Jalur belum tersedia. Ketuk jalan atau objek yang dapat dijangkau.");return;}
    tapRoute.current=route;
    setTapTick(t=>t+1);
    setShowHelp(false);
  },[controlsLocked,field,game]);

  useEffect(()=>{
    if(controlsLocked||!tapRoute.current)return;
    const timer=window.setTimeout(()=>{
      const route=tapRoute.current;
      if(!route)return;
      if(route.steps.length){
        const dir=route.steps.shift()!;
        const next=movePlayer(game,dir);
        if(next.location===game.location&&
           next.player.x===game.player.x&&next.player.y===game.player.y){
          tapRoute.current=null;setToast("Jalur terhalang. Pilih jalan lain.");return;
        }
        setGame(next);setTapTick(t=>t+1);return;
      }
      if(route.face){
        const dir=route.face;route.face=null;
        if(game.player.dir!==dir)setGame({...game,player:{...game.player,dir}});
        setTapTick(t=>t+1);return;
      }
      tapRoute.current=null;
      if(route.exit){
        const next=movePlayer(game,route.exit);
        if(next.location!==game.location){
          field.clear();field.reset(next.player);setGame(next);
          setToast("Selamat datang di "+areaTitle(next.location)+".");
        }
      }else if(route.interact)action();
    },145);
    return ()=>window.clearTimeout(timer);
  },[game,tapTick,controlsLocked,action,field]);

  const togglePhone = useCallback(() => {
    if (dialogue || saveStatus === "loading" || saveStatus === "error") return;
    setPhoneOpen(o => !o); setPhoneTab("apps"); setShowHelp(false);
  }, [dialogue, saveStatus]);

  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      const element = e.target as HTMLElement | null;
      if (element && ["INPUT", "TEXTAREA", "SELECT"].includes(element.tagName)) return;
      const key = e.key.toLowerCase();
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      // Native buttons and dialogs own Enter/Space/Tab. Do not dismiss a
      // meaningful choice before its focused button can activate.
      if (dialogue || (element?.closest("button, a, dialog") && [" ", "enter"].includes(key))) return;
      if (["arrowup", "arrowdown", "arrowleft", "arrowright", " ", "p", "e", "escape", "q", "r"].includes(key) ||
        ["w", "a", "s", "d"].includes(key)) e.preventDefault();
      if (key === "escape") { setStorageOpen(false); setPhoneOpen(false); setDialogue(null); return; }
      if (key === "p") { if (!e.repeat) togglePhone(); return; }
      if (phoneOpen || dialogue || storageOpen) {
        if (dialogue && (key === "e" || key === " " || key === "enter")) setDialogue(null);
        return;
      }
      const dirs: Record<string, Direction> = {
        w: "up", arrowup: "up", s: "down", arrowdown: "down",
        a: "left", arrowleft: "left", d: "right", arrowright: "right"
      };
      field.setShift(e.shiftKey);
      if (dirs[key] && !e.repeat) press(key, dirs[key]);
      if (!e.repeat && (key==="q" || key==="r")) { swapTool(key==="q"?-1:1); return; }
      if(!e.repeat && /^[1-9]$/.test(key)) {
        const id=game.carriedTools[Number(key)-1];
        if(id)equip(id);
        return;
      }
      if ((key === " " || key === "e") && !e.repeat) action();
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [press, action, togglePhone, phoneOpen, dialogue, storageOpen, field, equip, swapTool, game.carriedTools]);

  const rest = () => {
    if (phoneOpen || saveStatus === "loading" || saveStatus === "error" || !canSleep(game)) return;
    const next = nextDay(game);
    setDialogue(null);
    setGame(next); void persist(next);
    setToast("Hari baru di Pasirluyu · Cuaca "+weatherForDay(next.day)+". Tanaman yang disiram tumbuh!");
  };
  const respond = (choice: SocialChoice) => {
    if (saveStatus === "loading" || saveStatus === "error" || !dialogue?.npcId) return;
    const result = chooseSocial(game, dialogue.npcId, choice);
    setGame(result.state); setDialogue(result);
    if (result.state !== game) void persist(result.state);
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
  const context = getActionContext(game);
  const farming = farmOverview(game);
  const actionLabel = context.label;
  const actionVerb = context.kind==="plant"?"TANAM":
    context.kind==="harvest"?"PANEN":context.kind==="farm"?
    (game.equippedTool==="water"?"SIRAM":"CANGKUL"):
    context.kind==="wait"?"INFO":context.kind==="sleep"?"TIDUR":
    context.kind==="npc"?"BICARA":context.kind==="storage"?"GUDANG":
    context.kind==="door"?"MASUK":context.kind==="travel"?"JALAN":context.kind==="inspect"?"LIHAT":"AKSI";
  const unavailable = saveStatus === "loading" || saveStatus === "error";

  return <main ref={screenRef} className="yzg-page">
    <header className="yzg-header">
      <div>
        <span className="yzg-eyebrow">BAB 1 · EMPAT TIMUN DAN SATU NAMA</span>
        <h1>YZ <span>Farm Life</span></h1>
        <p>Pasirluyu · Kecamatan Regol</p>
      </div>
      <Link href="/home" className="yzg-back">← Kembali ke E-Farmer</Link>
    </header>

    <section className="yzg-shell" aria-label="Permainan YZ Farm Life">
      <div className="yzg-headsup">
        <span>{weatherForDay(game.day)==="hujan"?"☂":weatherForDay(game.day)==="berawan"?"☁":"☀"} Hari {game.day} · {minutes} · {weatherForDay(game.day)}</span>
        <span>◈ {game.coins} G</span>
        <span>Timun {game.harvested} · Bibit {game.seeds}</span>
        <span>Lv. {playerLevel(game)} · {areaTitle(game.location)}</span>
        <span className={saveStatus === "error" ? "yzg-bad" : ""}>☁ {saveStatus === "loading" ? "Memuat cloud" : saveStatus === "ready" ? "Siap" : saveStatus === "saving" ? "Menyimpan" : saveStatus === "saved" ? "Tersimpan" : "Gagal save"}</span>
      </div>
      <section className="yzg-objective" aria-label="Tujuan cerita">
        <div><b>{journal.stage === 5 ? "Bab 1 selesai" : "Tujuan berikutnya"}</b><p>{journal.objective}</p></div>
        <button onClick={() => { setShowHelp(false); setPhoneOpen(true); setPhoneTab("farm"); }} disabled={unavailable || !!dialogue}>Buka jurnal</button>
      </section>
      <div className="yzg-viewport">
        <canvas ref={canvasRef} width={300} height={200} onClick={tapOnWorld}
          aria-label="Peta Pasirluyu. Ketuk jalan untuk berjalan atau ketuk objek untuk berinteraksi."
          role="img" style={{cursor:"pointer"}}/>
        {toast && <div className="yzg-toast" role="status">{toast}</div>}
        {!phoneOpen && !dialogue && game.location === "field" && unread && <button className="yzg-notif" onClick={togglePhone}>
          <span className="yzg-notif-icon">✉</span>
          <span><b>YZ Phone · Pesan baru</b><small>Inggit: Ada pesanan timun untuk warungku!</small></span>
        </button>}
        {showHelp && <div className="yzg-help">
          <b>Selamat datang, Yanzen!</b><br/>
          Bergerak: WASD / panah atau ketuk tujuan di peta · Aksi: E · HP: P<br/>
          Ketuk petak untuk mendekat dan beraksi. Tanam dan panen otomatis; cangkul dan siram membutuhkan alat yang sesuai. Ikuti jalan di batas peta untuk menjelajah.
          <button onClick={() => setShowHelp(false)}>Mengerti</button>
        </div>}
        {dialogue && <dialog ref={dialogueRef} className="yzg-dialog yzg-chapter-dialog" aria-label={dialogue.title} onCancel={() => setDialogue(null)} onClose={() => setDialogue(null)}>
          <DialoguePanel key={dialogue.title + dialogue.lines.join("|")} dialogue={dialogue} game={game}>
          {dialogue.photo && <figure className="yzg-story-photo"><NextImage src="/game/assets/story/foto-saluran.png" width={1536} height={1024} sizes="(max-width: 640px) 90vw, 580px" alt="Foto cerita fiktif: dua garis pada batu di samping pintu air dan jembatan kebun."/><figcaption>Foto pintu air · koleksi Nani · ilustrasi fiktif</figcaption></figure>}

          {dialogue.choosePhoto && <div className="yzg-photo-choices" aria-label="Pilih tempat foto">
            <button onClick={() => decidePhoto("nani")} disabled={unavailable}>Percayakan foto asli kepada Nani<small>Kisah disimpan bersama keluarga.</small></button>
            <button onClick={() => decidePhoto("warung")} disabled={unavailable}>Titip salinan di warung<small>Warga dapat menambahkan nama.</small></button>
          </div>}
          {dialogue.shop && <div className="yzg-shop">
            <button onClick={purchase} disabled={unavailable || game.coins < 40}>Beli 5 bibit · 40 G</button>
            <button onClick={sell} disabled={unavailable || !sellableCucumbers(game)}>Jual {sellableCucumbers(game)} timun · {sellableCucumbers(game) * 25} G</button>
            {game.story.orderAccepted && !game.story.orderDone && <small>Empat timun dicadangkan untuk pesanan Inggit.</small>}
          </div>}
          {dialogue.choices && <div className="yzg-response-list" aria-label="Pilih jawaban">{dialogue.choices.map(choice => {
            const locked = bondLevel(game.bonds[dialogue.npcId!].points) < (choice.minLevel || 0);
            return <button key={choice.id} disabled={unavailable || locked} onClick={() => respond(choice.id)}>{choice.label}{locked && <small>Terbuka pada kedekatan Lv. {choice.minLevel}</small>}</button>;
          })}</div>}
          {dialogue.sleep && <button onClick={rest} disabled={unavailable}>Tidur sampai pagi</button>}
          <button onClick={() => setDialogue(null)}>{dialogue.sleep ? "Belum tidur" : dialogue.choosePhoto ? "Putuskan nanti" : "Akhiri percakapan"}</button>
          </DialoguePanel>
        </dialog>}
        {storageOpen && <ToolWarehouse game={game} disabled={unavailable}
          onClose={()=>setStorageOpen(false)} onTransfer={transfer} onUpgrade={upgrade}/>}
        {phoneOpen && <dialog ref={phoneRef} className="yzg-phone-backdrop" aria-label="YZ Phone" onCancel={() => setPhoneOpen(false)} onClose={() => setPhoneOpen(false)} onClick={e => { if (e.target === e.currentTarget) setPhoneOpen(false); }}>
          <section className="yzg-phone" onClick={e => e.stopPropagation()} aria-label="Smartphone YZ Phone">
            <div className="yzg-phone-notch"/>
            <div className="yzg-phone-time"><span>{minutes}</span><span>●●●  ▰</span></div>
            <div className="yzg-phone-top">
              <button aria-label="Kembali" onClick={() => phoneTab === "apps" ? setPhoneOpen(false) : setPhoneTab("apps")}>‹</button>
              <b>{phoneTab === "apps" ? "YZ PHONE" : phoneTab === "chat" ? "Pesan" : phoneTab === "farm" ? "Kebunku" : phoneTab === "ikd" ? "IKD" : phoneTab === "friends" ? "Kedekatan" : phoneTab === "stats" ? "Statistik" : phoneTab === "characters" ? "Warga" : "Jelajah"}</b>
              <button aria-label="Tutup ponsel" onClick={() => setPhoneOpen(false)}>×</button>
            </div>
            <div className="yzg-phone-content">
              {phoneTab === "apps" && <>
                <div className="yzg-phone-greeting">{timeGreeting(game.minutes).toUpperCase()}, YANZEN <strong>Hidup terus berjalan di Pasirluyu.</strong><small>Hari {game.day} · Cuaca {weatherForDay(game.day)} · {areaTitle(game.location)}</small></div>
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
                  <div className="yzg-phone-stats"><span>Tanaman aktif<strong>{planted}</strong></span><span>Siap panen<strong>{readyCrops}</strong></span><span>Perlu disiram<strong>{farming.needsWater}</strong></span><span>Sudah disiram<strong>{farming.watered}</strong></span><span>Hasil panen<strong>{game.harvested}</strong></span><span>Saldo<strong>{game.coins} G</strong></span></div>
                  <p>{farming.next}</p>
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
                  <div className="yzg-id-portrait"><Portrait npcId="A01"/></div><strong>YANZEN</strong>
                  <p>Warga Pasirluyu</p>
                  <dl><dt>ID Game</dt><dd>YZF-{(userId || "000001").slice(0, 6).toUpperCase()}</dd>
                    <dt>Domisili</dt><dd>Pasirluyu, Regol, Kota Bandung</dd>
                    <dt>Pekerjaan</dt><dd>Petani urban</dd>
                    <dt>Tahun tinggal</dt><dd>{game.day > 0 ? "Tahun 1" : "Baru pindah"}</dd>
                    <dt>Hari bermain</dt><dd>{game.day}</dd></dl>
                  <small>Seluruh identitas ini fiktif. Bukan IKD pemerintah atau data kependudukan asli.</small>
                </div>
              </>}
              {phoneTab === "characters" && <CharacterGallery/>}
              {phoneTab === "friends" && <>
                <div className="yzg-phone-card"><b>Warga Pasirluyu</b><p>Kenali warga melalui jawabanmu. Poin kedekatan dihitung sekali per NPC setiap hari.</p></div>
                {NPCS.map(npc => {
                  const bond = game.bonds[npc.id], level = bondLevel(bond.points);
                  const place=npcWhere(game,npc.id),soul=NPC_SOULS[npc.id];
                  return <div className="yzg-phone-card yzg-bond-card" key={npc.id}>
                    <Portrait npcId={npc.id} emotion={bond.mood}/>
                    <div><b>{npc.name}</b><small>{npc.role} · {soul.work}</small><p>Lv. {level} · {bondLabel(bond.points)}</p>
                    <p className="yzg-npc-where">Lokasi: {areaTitle(place.location)} · {place.activity}</p>
                    {level>=1&&<small>Kebiasaan: {soul.habit}</small>}
                    {level>=2&&<small>Harapan: {soul.desire}</small>}
                    {level>=3&&<small>Hal yang dikhawatirkan: {soul.fear}</small>}
                    {level>=2&&<small>Hubungan warga: {soul.connection}</small>}
                    <meter min={0} max={1000} value={bond.points} aria-label={"Kedekatan " + npc.name}/><small>{bond.points}/1000 poin · {bond.talks} percakapan</small>
                    <small>{bond.lastTalkDay === game.day ? "Sudah berbincang hari ini" : "Belum berbincang hari ini"} · {level < 2 ? "Cerita pribadi terbuka di Lv. 2" : "Cerita pribadi terbuka"}</small></div>
                  </div>;
                })}
              </>}
              {phoneTab === "stats" && <>
                <div className="yzg-phone-card"><b>YANZEN · Lv. {playerLevel(game)}</b><p>Petani urban · Hari {game.day}</p>
                  <p>Berjalan, bertani dan berinteraksi tanpa batas energi. Tidur di rumah untuk berganti hari dan menumbuhkan tanaman.</p>
                  <div className="yzg-phone-stats">
                    <span>Pengalaman<strong>{game.stats.xp} XP</strong></span><span>Aksi bertani<strong>{game.stats.actions}</strong></span>
                    <span>Total panen<strong>{game.stats.harvests}</strong></span><span>Percakapan<strong>{game.stats.conversations}</strong></span>
                    <span>Malam beristirahat<strong>{game.stats.nights}</strong></span><span>Saldo<strong>{game.coins} G</strong></span>
                  </div>
                </div>
              </>}
              {phoneTab === "map" && <>
                <div className="yzg-phone-card"><b>Lokasi kamu sekarang</b>
                  <p>{areaTitle(game.location)} · {START_LOCATION.village}, {START_LOCATION.district}<br/>{START_LOCATION.city}</p>
                  <small>Master map {PASIRLUYU_MASTER.width} × {PASIRLUYU_MASTER.height} tile · empat kawasan aktif, dua area pengembangan.</small>
                  <div className="yzg-local-map yzg-master-minimap" aria-label="Peta master Pasirluyu terdiri dari enam chunk">
                    <div className="locked">Taman Kampung <small>Belum dibuka</small></div>
                    <div className={game.location==="pasar"?"current":""}>Pasar Warga <small>Utara gang</small></div>
                    <div className={game.location==="field"?"current":""}>Kebun Yanzen <small>Barat gang</small></div>
                    <div className={game.location==="gang"?"current":""}>Gang Pasirluyu <small>Jalur utama</small></div>
                    <div className="locked">Kebun Selatan <small>Belum dibuka</small></div>
                    <div className={game.location==="sungai"?"current":""}>Bantaran Sungai <small>Selatan gang</small></div>
                  </div>
                  <details className="yzg-road-closure-info">
                    <summary>{ROUTE_BARRIERS.length} jalan yang belum terbuka — lihat alasannya</summary>
                    {ROUTE_BARRIERS.map(b=><p key={b.id}><b>{b.label}</b>
                      <small>{AREAS[b.location].name} → {b.future}. {b.message}</small></p>)}
                  </details>
                  {(["field","gang","pasar","sungai"] as const).map(id=><p key={id}><b>{id===game.location?"● ":"○ "}{AREAS[id].name}</b><small>{AREAS[id].description}</small></p>)}
                  <small>Game menggunakan nama wilayah asli. Jalan, kebun dan NPC direka untuk cerita.</small>
                </div>
                <WorldRegionDirectory/>
              </>}
            </div>
            <div className="yzg-phone-bottom"><button onClick={() => setPhoneTab("apps")}>●</button></div>
          </section>
        </dialog>}
      </div>
      <div className="yzg-controls">
        <div className="yzg-action-context" role="status">Objek di depan: <strong>{actionLabel}</strong>
          {game.location!=="home"&&game.location!=="shed"&&<small> · {areaTitle(game.location)} · Ikuti jalan untuk berpindah kawasan</small>}
        </div>
        {game.location==="field" && <div className="yzg-farm-guidance" aria-label="Panduan dan kondisi kebun">
          <div className="yzg-farm-counts">
            <strong>KEBUN</strong>
            <span>Siap panen {farming.ready}</span>
            <span>Perlu air {farming.needsWater}</span>
            <span>Sudah disiram {farming.watered}</span>
            <span>Siap tanam {farming.tilled}</span>
          </div>
          <p><strong>Berikutnya:</strong> {farming.next}</p>
        </div>}
        <div className="yzg-toolbelt" aria-label="Tas peralatan">
          <div className="yzg-tool-status" aria-live="polite">Alat di tangan: <strong>{toolName(game.equippedTool)}</strong>
            <small>Tas {game.carriedTools.length}/{bagCapacity(game.bagTier)} · Lv. {game.bagTier} · Q/R tukar</small></div>
          <div className="yzg-tool-switch">
            <button type="button" onClick={() => swapTool(-1)} disabled={controlsLocked||!game.carriedTools.length} aria-label="Alat sebelumnya" title="Alat sebelumnya · Q">‹</button>
            <button type="button" onClick={() => swapTool(1)} disabled={controlsLocked||!game.carriedTools.length} aria-label="Alat berikutnya" title="Alat berikutnya · R">›</button>
          </div>
          <div className="yzg-tools" role="toolbar" aria-label="Pilih alat yang dibawa">
            {game.carriedTools.length===0?<small>Tas kosong. Kunjungi gudang.</small>:game.carriedTools.map((id,index)=>
              <button key={id} type="button" className={game.equippedTool===id?"active":""} aria-label={"Pilih "+toolName(id)}
                aria-pressed={game.equippedTool===id} disabled={controlsLocked} onClick={()=>equip(id)}>
                <span>{index+1}</span>{toolName(id)}
              </button>)}
          </div>
        </div>
        <div className="yzg-buttons">
          <button onClick={() => void toggleFullscreen()} aria-pressed={fullscreen}>{fullscreen ? "Keluar layar penuh" : "Layar penuh"} · Alt+Enter</button>
          {screenError && <span role="alert">{screenError}</span>}
          <button aria-pressed={sound} onClick={() => { field.audio.toggle(!sound); setSound(!sound); }}>Suara {sound ? "aktif" : "mati"}</button>
          <button className="yzg-phone-trigger" onClick={togglePhone}>▣ YZ Phone {unread ? "•" : ""}</button>
          <span className="yzg-home-hint">☾ Tidur: masuk rumah → ranjang → Aksi</span>
          <button onClick={() => void persist(game)} disabled={saveStatus === "loading" || saveStatus === "error"}>☁ Simpan</button>
        </div>
      </div>
      <div className="yzg-touch">
        <div className="yzg-dpad" aria-label="Kontrol bergerak">
          <DirectionButton direction="up" label="Atas" symbol="▲" step={step} press={press} release={release} />
          <DirectionButton direction="left" label="Kiri" symbol="◀" step={step} press={press} release={release} />
          <DirectionButton direction="down" label="Bawah" symbol="▼" step={step} press={press} release={release} />
          <DirectionButton direction="right" label="Kanan" symbol="▶" step={step} press={press} release={release} />
        </div>
        <button className="yzg-run" aria-pressed={runMode} disabled={controlsLocked} onClick={() => setRunMode(value => !value)}>Lari</button>
        <button className="yzg-action" onClick={action} aria-label="Aksi" title={actionLabel}>A <small>{actionVerb}</small></button>
      </div>
      <div className="yzg-footer"><span>WASD: jalan · E: aksi otomatis · Q/R: tukar alat · 1–9: pilih alat · P: HP</span><span>Ketuk peta untuk berjalan · Jelajah Pasirluyu · Tidur di rumah untuk menumbuhkan tanaman.</span></div>
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
