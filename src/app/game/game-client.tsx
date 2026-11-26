"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type MouseEvent as ReactMouseEvent } from "react";
import NextImage from "next/image";
import { useRouter } from "next/navigation";
import { castRod,finishFishingAttempt,marketTrade,isMarketMerchant,FISH_IDS,FISH_MARKET,hasSluiceMemory,type RiverFishId,type FishingOutcome } from "@/lib/game/model";
import { acceptOrder, facing, GameState, FarmTool, meetNpc, movePlayer,
  RESIDENT_HOMES, newGame, nextDay, NPCS, NPC_SOULS, npcHere, npcWhere, areaTitle, AREAS, ROUTE_BARRIERS, ROUTE_PORTALS, edgeTile, isOutdoorLocation, weatherForDay, timeGreeting, safeLoad, interactDoor, canSleep, chooseSocial, bondLevel, bondLabel, playerLevel, applyFarmTool, Direction, chapterJournal,
  choosePhoto, getActionContext, farmOverview, sellableCucumbers, equipFarmTool, cycleFarmTool, transferTool, upgradeToolBag, bagCapacity, TOOL_CATALOG, toolName, formatGameRupiah, type ToolId, type PhotoChoice, type SocialChoice, type Dialogue } from "@/lib/game/model";
import { outdoorSources } from "@/lib/game/modular-outdoor";
import { type WorldArt } from "@/lib/game/draw-world";
import { yanzenInteriorAssets } from "@/lib/game/yanzen-interior-art";
import { START_LOCATION } from "@/lib/game/bandung-locations";
import WorldRegionDirectory from "./world-region-directory";
import type { PhaserFieldAdapter } from "@/lib/game/phaser-world";
import { FieldEngine, type ToolUse, type WorldPick } from "@/lib/game/field-engine";
import { planTapRoute, type TapRoute } from "@/lib/game/tap-navigation";
import CharacterGallery from "./character-gallery";
import PhoneChronicle from "./phone-chronicle";
import GameDialog from "./game-dialog";
import type { ResidentProfile } from "@/lib/game/resident-profile";
import {approvedLegacyId,conservativeDisplayMatch} from "@/lib/game/legacy-identity";
import { questObjective, questTalk, questTalks, tales, followUpTales, followUpTalk, followUpAvailable, inspectFollowUpProp } from "@/lib/game/personal-quests";
import DialoguePanel, { Portrait, ResidentPortrait } from "./dialogue-panel";
import ToolWarehouse from "./tool-warehouse";
import SluiceCutscene from "./sluice-cutscene";
import {FishingScene} from "./fishing-scene";
import {planFishingSession,fishingCatchSucceeds,FISHING_CAST_MS,FISHING_BITE_WINDOW_MS,FISHING_REEL_MS,type FishingPhase,type FishingPlan} from "@/lib/game/fishing-session";
import "./game.css";

type PhoneTab = "apps" | "chat" | "farm" | "chronicle" | "memories" | "ikd" | "map" | "friends" | "stats" | "characters" | "guide";
type SaveStatus = "loading" | "ready" | "saving" | "saved" | "error";
type ActiveFishing=FishingPlan & {id:number;phase:FishingPhase;phaseAt:number};
type FishingNotice={outcome:FishingOutcome;species?:RiverFishId;startedAt:number};
const APPS: { id: PhoneTab; name: string; icon: string }[] = [
  { id: "chat", name: "Pesan", icon: "✉" },
  { id: "farm", name: "Kebunku", icon: "✿" },
  { id: "chronicle", name: "Kronik", icon: "☷" },
  { id: "memories", name: "Kenangan", icon: "▣" },
  { id: "ikd", name: "IKD", icon: "▣" },
  { id: "map", name: "Jelajah", icon: "⌖" },
  { id: "friends", name: "Kedekatan", icon: "♡" },
  { id: "stats", name: "Statistik", icon: "▤" },
  { id: "characters", name: "Warga", icon: "☷" },
  { id: "guide", name: "Panduan", icon: "?" },
];
function timeLabel(minutes: number) {
  return String(Math.floor(minutes / 60)).padStart(2, "0") + ":" + String(minutes % 60).padStart(2, "0");
}
const compass: Record<Direction, string> = {up:"Utara",right:"Timur",down:"Selatan",left:"Barat"};
type WorldRoute = TapRoute & { resident?: typeof NPCS[number]["id"] };
type WalkInput = (id: string, direction: Direction) => void;
function DirectionButton({ direction, label, symbol, press, release, step }: {
  direction: Direction; label: string; symbol: string; press: WalkInput;
  release: (id: string) => void; step: (dir: Direction) => void;
}) {
  const id = "pad:" + direction;
  return <button className={direction} aria-label={label}
    onPointerDown={event => {
      if (!event.isPrimary || event.button !== 0) return;
      event.preventDefault();
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
    onClick={event => { if (event.detail === 0) step(direction); }}><span aria-hidden="true" className="yzg-arrow">{symbol}</span></button>;
}

export default function GameClient({ engine = "canvas", residents = [] }: {
  engine?: "canvas" | "phaser";
  residents?: readonly ResidentProfile[];
}) {
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
  const tapRoute = useRef<WorldRoute | null>(null);
  const queuedKeys = useRef<Direction[]>([]);
  const finishTap = useRef<(() => void) | null>(null);
  const [sound, setSound] = useState(true);
  const [runMode, setRunMode] = useState(false);
  const [swing, setSwing] = useState<ToolUse | null>(null);
  useEffect(() => {
    let active = true;
    const sources = { ...Object.fromEntries(RESIDENT_HOMES.map(home=>[home.location,"residences/"+home.location+".png"])), people: "characters/stage1.png", gaits: "characters/yanzen-gaits.png", turns: "characters/yanzen-turns.png", cucumber: "tiles/cucumber.png", actions: "tiles/actions.png", effects: "tiles/field-effects.png",
      rumahDay: "pasirluyu/rumah-yanzen-interior-day.svg", rumahEvening: "pasirluyu/rumah-yanzen-interior-evening.svg",
      warungInterior: "pasirluyu/warung-interior.svg", gudangInterior: "pasirluyu/gudang-interior.svg" };
    for (const [key, path] of Object.entries(sources)) {
      const image = new Image();
      image.onload = () => { if (active) setArt(previous => ({ ...previous, [key]: image })); };
      image.src = "/game/assets/" + path;
    }
    for (const [key,path] of Object.entries(yanzenInteriorAssets)) {
      const image = new Image();
      image.onload = () => {
        if (active) setArt(previous => ({...previous,roomAssets:{...previous.roomAssets,[key]:image}}));
      };
      image.src = "/game/assets/" + path;
    }
    for (const [key,path] of Object.entries(outdoorSources)) {
      const image = new Image();
      image.onload = () => {
        if (active) setArt(previous => ({...previous,outdoor:{...previous.outdoor,[key]:image}}));
      };
      image.src = "/game/assets/" + path;
    }
    return () => { active = false; };
  }, []);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const phaserHostRef = useRef<HTMLDivElement>(null);
  const phaserAdapterRef = useRef<PhaserFieldAdapter | null>(null);
  const [phaserReady, setPhaserReady] = useState(false);
  const [phaserError, setPhaserError] = useState("");
  useEffect(() => {
    if (engine !== "phaser") return;
    const host = phaserHostRef.current;
    if (!host) return;
    let active = true;
    void import("@/lib/game/phaser-world")
      .then(module => module.mountPhaserWorld(host))
      .then(mounted => {
        if (!active) { mounted.destroy(); return; }
        phaserAdapterRef.current = mounted;
        field.setRenderer(mounted);
        setPhaserReady(true);
      }).catch(error => {
        if (!active) return;
        console.error("Phaser bootstrap failed; Canvas 2D remains available.", error);
        setPhaserError("Tampilan utama belum berhasil dibuka. Sementara kamu bisa bermain dengan tampilan ringan.");
        field.setRenderer(null);
        setPhaserReady(false);
      });
    return () => {
      active = false;
      field.setRenderer(null);
      phaserAdapterRef.current?.destroy();
      phaserAdapterRef.current = null;
    };
  }, [engine, field]);
  const queueRef = useRef<Promise<void>>(Promise.resolve());
  const saveLockedRef = useRef(false);
  const resetInFlightRef = useRef(false);
  const saveRevisionRef = useRef<string | null>(null);
  const [game, setGame] = useState<GameState>(() => newGame());
  const [userId, setUserId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("loading");
  const [worldPresented, setWorldPresented] = useState(false);
  const readyToPresent = (saveStatus === "ready" || saveStatus === "saving" || saveStatus === "saved") &&
    (engine === "canvas" || phaserReady || !!phaserError);
  useEffect(() => {
    if (!readyToPresent) return;
    let next = 0;
    const first = requestAnimationFrame(() => {
      next = requestAnimationFrame(() => setWorldPresented(true));
    });
    return () => { cancelAnimationFrame(first); cancelAnimationFrame(next); };
  }, [readyToPresent]);
  const [errorText, setErrorText] = useState("");
  const [storageOpen, setStorageOpen] = useState(false);
  const [phoneOpen, setPhoneOpen] = useState(false);
  const [phoneTab, setPhoneTab] = useState<PhoneTab>("apps");
  const [resetOpen, setResetOpen] = useState(false);
  const [resetBusy, setResetBusy] = useState(false);
  const [resetError, setResetError] = useState("");
  const [selectedCitizen, setSelectedCitizen] = useState<string|null>(null);
  const [dialogue, setDialogue] = useState<Dialogue | null>(null);
  const [cutscene, setCutscene] = useState<"sluice-open"|"sluice-replay"|null>(null);
  const [toast, setToast] = useState("");
  const [showHelp, setShowHelp] = useState(engine === "canvas");

  useEffect(() => {
    let active = true;
    (async () => {
      const authResponse = await fetch("/api/auth/session", { cache: "no-store" });
      if (!active) return;
      if (authResponse.status === 401) { router.replace("/login"); return; }
      if (!authResponse.ok) {
        setErrorText("Akunmu belum bisa dibuka. Coba periksa sambungan ke server permainan.");
        setSaveStatus("error"); saveLockedRef.current = true;
        return;
      }
      const authData: unknown = await authResponse.json();
      if (!active) return;
      if (!authData || typeof authData !== "object" || !("user" in authData) ||
          !authData.user || typeof authData.user !== "object" || !("id" in authData.user) ||
          typeof authData.user.id !== "string") {
        throw new Error("Respons autentikasi lokal tidak valid.");
      }
      const id = authData.user.id;
      const saveResponse = await fetch("/api/game/save", { cache: "no-store" });
      if (!active) return;
      if (!saveResponse.ok) {
        setErrorText("Catatan permainanmu belum bisa dibuka. Coba lagi tanpa menghapus progres lama.");
        setSaveStatus("error"); saveLockedRef.current = true;
        return;
      }
      const saveData: unknown = await saveResponse.json();
      if (!saveData || typeof saveData !== "object" || !("data" in saveData)) {
        throw new Error("Respons penyimpanan game tidak valid.");
      }
      saveRevisionRef.current = "updatedAt" in saveData && typeof saveData.updatedAt === "string"
        ? saveData.updatedAt : null;
      if (saveData.data) {
        const loaded = safeLoad(saveData.data);
        if (!loaded) {
          setErrorText("Catatan permainan lama belum terbaca. Menyimpan sementara dimatikan supaya catatanmu tidak tertimpa.");
          setSaveStatus("error"); saveLockedRef.current = true;
          return;
        }
        field.reset(loaded.player);
        setGame(loaded);
      }
      setUserId(id); setSaveStatus("ready");
    })().catch(e => {
      if(active){console.error("[game] Cannot load save",e);setErrorText("Catatan perjalananmu belum bisa dibuka. Progres lama tetap aman; coba masuk lagi.");setSaveStatus("error"); saveLockedRef.current = true;}
    });
    return () => { active = false; };
  }, [router, field]);

  const persist = useCallback((snapshot: GameState) => {
    if (!userId || saveLockedRef.current || resetInFlightRef.current) return;
    const next = queueRef.current.then(async () => {
      if (saveLockedRef.current || resetInFlightRef.current) return;
      setSaveStatus("saving");
      const response = await fetch("/api/game/save", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: snapshot, expectedUpdatedAt: saveRevisionRef.current }),
      });
      if (!response.ok) {
        if (response.status === 409) throw new Error("SAVE_STALE");
        const result: unknown = await response.json().catch(() => null);
        const message = result && typeof result === "object" && "error" in result &&
          typeof result.error === "string" ? result.error : "PostgreSQL menolak penyimpanan.";
        throw new Error(message);
      }
      const saved: unknown = await response.json().catch(() => null);
      if (saved && typeof saved === "object" && "updatedAt" in saved && typeof saved.updatedAt === "string") {
        saveRevisionRef.current = saved.updatedAt;
      }
      setSaveStatus("saved");
    }).catch(e => {
      saveLockedRef.current = true;
      setSaveStatus("error");
      console.error("[game] Cannot persist save", e);
      setErrorText(e instanceof Error && e.message === "SAVE_STALE"
        ? "Permainan ini sudah berubah di tab atau perangkat lain. Muat ulang untuk melihat progres terbaru; catatan lama tidak ditimpa."
        : "Perjalananmu belum tersimpan. Periksa koneksi sebelum melanjutkan.");
    });
    queueRef.current = next;
    return next;
  }, [userId]);

  // Fishing timers exist only while a cast is active. A reload never restores
  // a hooked fish; the cost of the bait and total attempts remain in the save.
  const gameRef=useRef(game);
  gameRef.current=game;
  const fishingRef=useRef<ActiveFishing|null>(null);
  const fishingId=useRef(0);
  const [fishingSession,setFishingSession]=useState<ActiveFishing|null>(null);
  const [fishingNotice,setFishingNotice]=useState<FishingNotice|null>(null);
  const finishFishing=useCallback((id:number,outcome:FishingOutcome,species?:RiverFishId)=>{
    if(fishingRef.current?.id!==id)return; // timer, skip and duplicate inputs are idempotent
    fishingRef.current=null;
    setFishingSession(null);
    const next=finishFishingAttempt(gameRef.current,outcome,species);
    if(next!==gameRef.current){gameRef.current=next;setGame(next);void persist(next);}
    setFishingNotice({outcome,species:outcome==="caught"?species:undefined,startedAt:performance.now()});
    // The catch/result appears above Yanzen, never in a viewport-centered toast.
    setToast("");
  },[persist]);
  const setFishingPhase=useCallback((id:number,phase:FishingPhase)=>{
    const active=fishingRef.current;
    if(!active||active.id!==id)return;
    const next={...active,phase,phaseAt:performance.now()};
    fishingRef.current=next;
    setFishingSession(next);
  },[]);
  useEffect(()=>{
    if(!fishingSession)return;
    const {id,phase}=fishingSession;
    const delay=phase==="casting"?FISHING_CAST_MS:phase==="waiting"?fishingSession.waitMs:
      phase==="bite"?FISHING_BITE_WINDOW_MS:FISHING_REEL_MS;
    const timeout=window.setTimeout(()=>{
      if(fishingRef.current?.id!==id)return;
      if(phase==="casting")setFishingPhase(id,"waiting");
      else if(phase==="waiting"){
        if(fishingRef.current.willBite){field.audio.hit("water",.35);setFishingPhase(id,"bite");}
        else finishFishing(id,"no_bite");
      }else if(phase==="bite")finishFishing(id,"late");
      else {const landed=fishingCatchSucceeds(Math.random());if(landed)field.audio.hit("harvest",.3);finishFishing(id,landed?"caught":"escaped",fishingRef.current.species);}
    },delay);
    return ()=>window.clearTimeout(timeout);
  },[fishingSession,finishFishing,setFishingPhase,field]);
  useEffect(()=>{
    if(!fishingNotice)return;
    const t=window.setTimeout(()=>setFishingNotice(null),2900);
    return ()=>window.clearTimeout(t);
  },[fishingNotice]);
  useEffect(()=>{
    const cancelHidden=()=>{
      if(document.hidden&&fishingRef.current)finishFishing(fishingRef.current.id,"cancelled");
    };
    document.addEventListener("visibilitychange",cancelHidden);
    return ()=>document.removeEventListener("visibilitychange",cancelHidden);
  },[finishFishing]);

  const logout = useCallback(async () => {
    try {
      if (userId) {
        await persist(game);
        if (saveLockedRef.current) return;
      }
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) throw new Error("Server menolak permintaan keluar.");
      router.replace("/login");
      router.refresh();
    } catch (error) {
      console.error("Local account logout failed:", error);
      setErrorText("Gagal keluar. Sesi tetap aktif sampai masalah penyimpanan diperbaiki.");
      setSaveStatus("error");
      saveLockedRef.current = true;
    }
  }, [game, persist, router, userId]);

  const resetGame = useCallback(async () => {
    if (!userId || resetInFlightRef.current || saveLockedRef.current ||
        saveStatus === "loading" || saveStatus === "saving" || saveStatus === "error") return;
    resetInFlightRef.current = true;
    setResetBusy(true);
    setResetError("");
    try {
      // Wait for any already-running save so it cannot restore old progress after reset.
      await queueRef.current;
      if (saveLockedRef.current) throw new Error("Penyimpanan lama belum selesai.");
      const response = await fetch("/api/game/save", { method: "POST" });
      if (!response.ok) throw new Error("Permintaan reset ditolak.");
      // Tell any other open game tabs to reload before they try to autosave stale state.
      if (typeof BroadcastChannel !== "undefined") {
        const channel = new BroadcastChannel("yz-farm-progress");
        channel.postMessage({ type: "reset", userId });
        channel.close();
      }
      // Reload all runtime state (world, NPCs, inventory and phone), not just React game state.
      window.location.reload();
    } catch (error) {
      console.error("[game] Reset failed:", error);
      setResetError("Permainan belum berhasil diulang. Progres lama tetap tersimpan. Periksa koneksi lalu coba lagi.");
      setResetBusy(false);
      resetInFlightRef.current = false;
    }
  }, [userId, saveStatus]);

  useEffect(() => {
    if (!userId || typeof BroadcastChannel === "undefined") return;
    const channel = new BroadcastChannel("yz-farm-progress");
    channel.onmessage = event => {
      if (event.data?.type !== "reset" || event.data.userId !== userId) return;
      saveLockedRef.current = true;
      window.location.reload();
    };
    return () => channel.close();
  }, [userId]);

  useEffect(() => {
    if (!userId || saveLockedRef.current || resetInFlightRef.current) return;
    const t = window.setTimeout(() => { void persist(game); }, 1300);
    return () => window.clearTimeout(t);
  }, [game, userId, persist]);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(""), 4600);
    return () => window.clearTimeout(t);
  }, [toast]);

  const [wakingDay,setWakingDay]=useState<number|null>(null);
  useEffect(()=>{
    if(wakingDay===null)return;
    const id=window.setTimeout(()=>setWakingDay(null),1800);
    return ()=>window.clearTimeout(id);
  },[wakingDay]);
  const controlsLocked = wakingDay!==null || !worldPresented || storageOpen || phoneOpen || !!dialogue || !!cutscene || saveStatus === "loading" || saveStatus === "error";
  const movementLocked=controlsLocked || !!fishingSession;
  const step = useCallback((direction: Direction) => {
    if (movementLocked) return;
    tapRoute.current = null;
    queuedKeys.current.push(direction);
    setShowHelp(false);
  }, [movementLocked]);

  const crossing = useRef<{next: GameState; message: string} | null>(null);
  const queueCrossing = useCallback((current: GameState, next: GameState, dir: Direction, message: string) => {
    if (crossing.current) return;
    crossing.current = {next,message};
    queuedKeys.current.length = 0;
    field.held.clear();
    tapRoute.current = null;
    field.aim({...facing({...current.player,dir}),dir});
  }, [field]);
  const press = useCallback<WalkInput>((id, dir) => {
    if (movementLocked || crossing.current || field.held.get(id) === dir) return;
    tapRoute.current = null;
    if (!field.held.size) queuedKeys.current.push(dir);
    field.held.set(id, dir);
    setShowHelp(false);
  }, [movementLocked, field]);
  const release = useCallback((id: string) => { field.held.delete(id); }, [field]);
  const scene = useRef({ game, art, swing, runMode, fishingSession, fishingNotice });
  const lastArea = useRef(game.location);
  const portalArrival = useRef(false);
  useLayoutEffect(() => {
    scene.current = { game, art, swing, runMode, fishingSession, fishingNotice };
    if(lastArea.current!==game.location){
      field.clear();
      const {x, y, dir} = game.player;
      const from = dir === "right" ? {x:x-1,y,dir} : dir === "left" ? {x:x+1,y,dir} :
        dir === "down" ? {x,y:y-1,dir} : {x,y:y+1,dir};
      field.reset(portalArrival.current ? from : game.player);
      portalArrival.current = false;
      lastArea.current=game.location;
    }
    if (!crossing.current) field.aim(game.player);
    if (movementLocked) {
      field.held.clear();
      field.setShift(false);
      queuedKeys.current.length = 0;
      tapRoute.current = null;
    }
  }, [game, art, swing, controlsLocked, runMode, field, fishingSession, fishingNotice]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    const clear = () => {
      queuedKeys.current.length = 0;
      tapRoute.current = null;
      field.clear();
      field.audio.pause();
    };
    const unlock = () => field.audio.unlock();
    const keyup = (event: KeyboardEvent) => {
      if (event.key === "Shift") field.setShift(event.shiftKey);
      release(event.key.toLowerCase());
    };
    const paint = (now: number) => {
      if (!document.hidden) {
        if (!field.moving && crossing.current) {
          const {next,message} = crossing.current;
          crossing.current = null;
          portalArrival.current = true;
          setSwing(null);
          setGame(next);
          setToast(message);
          return void (frame = requestAnimationFrame(paint));
        }
        if (!field.moving && tapRoute.current && !tapRoute.current.steps.length) finishTap.current?.();
        const route = tapRoute.current;
        const held = Array.from(field.held.values()).at(-1);
        const hasInput = !crossing.current && (queuedKeys.current.length > 0 || held || route?.steps.length);
        field.paint(canvas, scene.current, now, reduced.matches, hasInput ? current => {
          const keyboard = queuedKeys.current.shift() ?? held;
          const direction = keyboard ?? route?.steps[0];
          if (!direction) return undefined;

          const next = movePlayer(current, direction);
          if (next.location !== current.location && keyboard) {
            queueCrossing(current,next,direction,"Jalan ke " + areaTitle(next.location) + ".");
            return undefined;
          }
          const moved = next.player.x !== current.player.x || next.player.y !== current.player.y;
          if (!keyboard && (!moved || next.location !== current.location)) {
            tapRoute.current = null;
            const ahead = facing({...current.player,dir:direction});
            const pedestrian = npcHere(current).some(n => n.x===ahead.x && n.y===ahead.y);
            setToast(pedestrian ? "Seorang warga sedang lewat. Pilih tujuan lagi untuk mencari jalan." : "Jalur terhalang. Pilih jalan lain.");
            return undefined;
          }
          if (!keyboard) route?.steps.shift();
          if (moved || next.location !== current.location || next.player.dir !== current.player.dir) {
            scene.current = { ...scene.current, game: next };
            setGame(next);
          }
          return moved && next.location === current.location ? next : undefined;
        } : undefined, route?.steps);
      }
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
  }, [queueCrossing, release, field]);

  const equip=useCallback((next:ToolId)=>{
    if(movementLocked||!game.carriedTools.includes(next))return;
    setGame(current=>equipFarmTool(current,next));
    setToast("Sekarang kamu memegang "+toolName(next)+(TOOL_CATALOG[next].status==="planned"?" · Alat ini belum bisa dipakai di sini.":""));
    setShowHelp(false);
  },[movementLocked,game.carriedTools]);
  const swapTool=useCallback((direction:1|-1)=>{
    if(movementLocked)return;
    const next=cycleFarmTool(game.equippedTool,direction,game.carriedTools);
    if(next)equip(next);
    else setToast("Tasmu kosong. Coba ambil alat di gudang.");
  },[movementLocked,game.equippedTool,game.carriedTools,equip]);
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
    if(controlsLocked || crossing.current || field.moving) return;
    tapRoute.current = null;
    if(fishingRef.current){
      const session=fishingRef.current;
      if(session.phase==="waiting")finishFishing(session.id,"early");
      else if(session.phase==="bite")setFishingPhase(session.id,"reeling");
      return;
    }
    const context=getActionContext(game);
    if(context.kind==="door"){
      const next=interactDoor(game);
      const message=next.location==="home"?"Masuk rumah. Hadapkan karakter ke kasur untuk tidur.":
        next.location==="shed"?"Selamat datang di gudang. Dekati rak untuk menyimpan alat.":
        next.location==="warung"?"Masuk Warung Inggit.":
        next.location==="pasar"?"Kembali ke pasar.":"Kembali ke Kebun Yanzen.";
      queueCrossing(game,next,game.player.dir,message);
    }else if(context.kind==="travel"){
      const next=movePlayer(game,game.player.dir);
      if(next.location!==game.location) queueCrossing(game,next,game.player.dir,"Jalan ke "+areaTitle(next.location)+".");
    }else if(context.kind==="sleep"){
      setDialogue({title:"Rumah Yanzen · Istirahat",sleep:true,lines:["Tidur sampai besok pagi? Tanaman yang sudah disiram akan tumbuh, dan hari baru dimulai."]});
    }else if(context.kind==="npc"){
      const result=meetNpc(game,context.npcId);
      setGame(result.state);setDialogue(result);
      if(result.state!==game) void persist(result.state);
    }else if(context.kind==="storage"){
      setStorageOpen(true);
    }else if(context.kind==="nursery"){
      const wet=game.plots.filter(p=>p.watered && p.stage>=0).length;
      setDialogue({title:"Meja semai",lines:[wet?"Tanah sampel terasa lembap. Ada "+wet+" petak tanaman tersiram.":"Tanah sampel masih kering. Tanam lalu siram satu petak hidup sebelum melapor kepada Nani.", "Catatan Nani: sentuh permukaannya sebelum menyiram lagi. Akar juga memerlukan udara."]});
      if(wet && game.personalQuests?.C01?.phase===2){const next={...game,nurseryChecked:true};setGame(next);void persist(next);}
    }else if(context.kind==="quest-prop"){
      const result=inspectFollowUpProp(game,context.propId);
      if(result.state!==game){setGame(result.state);void persist(result.state);}
      setToast(result.message);
    }else if(context.kind==="fish"){
      const next=castRod(game);
      if(next===game)setToast("Umpan habis atau joran belum siap. Beli pelet dari Widi.");
      else{
        const plan=planFishingSession(Math.random(),Math.random(),Math.random());
        const session:ActiveFishing={...plan,id:++fishingId.current,phase:"casting",phaseAt:performance.now()};
        fishingRef.current=session;
        setFishingSession(session);
        setFishingNotice(null);
        queuedKeys.current.length=0;
        field.held.clear();
        tapRoute.current=null;
        field.audio.hit("water",.16);
        gameRef.current=next;
        setGame(next);
        void persist(next);
        setToast("");
      }
    }else if(context.kind==="sluice"){
      const firstOpen=!game.sluiceOpen && game.personalQuests?.A03?.phase===2 && !hasSluiceMemory(game);
      const next:GameState={...game,sluiceOpen:!game.sluiceOpen,...(firstOpen?{sluiceCutsceneSeen:true}:{})};
      setGame(next);void persist(next);
      if(firstOpen){setToast("");setCutscene("sluice-open");}
      else setToast(next.sluiceOpen?"Pintu air terbuka. Air mengalir ke hilir.":"Pintu air ditutup.");
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
      setToast("Tanaman ini sudah cukup air hari ini. Besok kamu bisa menyiramnya lagi.");
    }else if(context.kind==="need-tool"){
      setToast(context.label+" · Ambil alat dari gudang dan pilih sebagai alat aktif.");
    }else{
      setToast(game.location==="field"
        ? "Hadapkan karakter ke petak kebun, pintu, atau warga untuk berinteraksi."
        : "Hadapkan karakter ke objek yang bisa digunakan.");
    }
    setShowHelp(false);
  },[game,controlsLocked,persist,field,queueCrossing,finishFishing,setFishingPhase]);

  const selectWorldTile = useCallback((tile: WorldPick | null) => {
    if (movementLocked || crossing.current || !tile) return;
    const route = planTapRoute(game, tile.x, tile.y, tile.world);
    const resident = npcHere(game).find(n => n.x===tile.x && n.y===tile.y);
    tapRoute.current = route ? {...route,resident:resident?.id} : null;
    if (!route) {
      setToast("Belum ada jalan ke sana. Ketuk tanah atau benda yang bisa kamu jangkau.");
      return;
    }
    setShowHelp(false);
  }, [movementLocked, game]);
  const [routeMessage, setRouteMessage] = useState("");
  const walkToNeighbour = (portal: typeof ROUTE_PORTALS[number]) => {
    if (crossing.current || portal.from !== game.location) return;
    let best: TapRoute | null = null;
    for (let lane=portal.start; lane<=portal.end; lane++) {
      const {x,y} = edgeTile(portal.direction,lane);
      const route = planTapRoute(game,x,y);
      if (route?.exit === portal.direction && (!best || route.steps.length < best.steps.length)) best=route;
    }
    if (!best) {
      setRouteMessage("Jalur ke " + areaTitle(portal.to) + " sedang terhalang.");
      return;
    }
    queuedKeys.current.length = 0;
    field.held.clear();
    tapRoute.current = best;
    setPhoneOpen(false);
    setToast("Menuju " + areaTitle(portal.to) + " · Esc untuk berhenti");
  };
  const tapOnWorld = useCallback((event:ReactMouseEvent<HTMLCanvasElement>) => {
    selectWorldTile(field.pickTile(event.currentTarget, event.clientX, event.clientY, game.location));
  }, [field, selectWorldTile, game.location]);
  const tapOnPhaserWorld = useCallback((event:ReactMouseEvent<HTMLDivElement>) => {
    selectWorldTile(phaserAdapterRef.current?.pickTile(event.clientX, event.clientY) ?? null);
  }, [selectWorldTile]);

  useLayoutEffect(() => {
    finishTap.current = () => {
      const route = tapRoute.current;
      if (movementLocked || !route || route.steps.length || scene.current.game !== game) return;
      if (route.face && game.player.dir !== route.face) {
        setGame({ ...game, player: { ...game.player, dir: route.face } });
        return;
      }
      tapRoute.current = null;
      if (route.exit) {
        const next = movePlayer(game, route.exit);
        if (next.location !== game.location) {
          queueCrossing(game,next,route.exit,"Jalan ke " + areaTitle(next.location) + ".");
        }
      } else if (route.interact) {
        const target = getActionContext(game);
        if ((route.resident || target.kind==="npc") && (target.kind!=="npc" || target.npcId!==route.resident)) {
          setToast("Orangnya sudah beranjak. Coba dekati lagi.");
          return;
        }
        action();
      }
    };
  }, [game, movementLocked, action, queueCrossing]);

  const togglePhone = useCallback(() => {
    if (wakingDay!==null || dialogue || storageOpen || fishingRef.current || crossing.current || saveStatus === "loading" || saveStatus === "error") return;
    setPhoneOpen(o => !o); setPhoneTab("apps"); setSelectedCitizen(null); setShowHelp(false);
  }, [dialogue, storageOpen, saveStatus,wakingDay]);

  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      const element = e.target as HTMLElement | null;
      if (element && ["INPUT", "TEXTAREA", "SELECT"].includes(element.tagName)) return;
      const key = e.key.toLowerCase();
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.defaultPrevented) return;
      if (key === "p" && phoneOpen && !e.repeat) {
        e.preventDefault();
        setPhoneOpen(false);
        return;
      }
      if (dialogue || phoneOpen || storageOpen) return;
      if (key==="escape" && fishingRef.current){
        e.preventDefault();finishFishing(fishingRef.current.id,"cancelled");return;
      }
      if (key === "escape" && tapRoute.current) {
        e.preventDefault();
        tapRoute.current = null;
        setToast("Berhenti berjalan.");
        return;
      }
      if (element?.closest("button, a, summary") && (key === " " || key === "enter")) return;
      if (["arrowup", "arrowdown", "arrowleft", "arrowright", " ", "enter", "p", "e", "q", "r",
           "w", "a", "s", "d"].includes(key)) e.preventDefault();
      if (key === "p") { if (!e.repeat) togglePhone(); return; }
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
      if ((key === " " || key === "enter" || key === "e") && !e.repeat) action();
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [press, action, togglePhone, phoneOpen, dialogue, storageOpen, field, equip, swapTool, game.carriedTools, finishFishing]);

  const rest = () => {
    if (phoneOpen || saveStatus === "loading" || saveStatus === "error" || !canSleep(game)) return;
    if(wakingDay!==null)return;
    const next = nextDay(game);
    setWakingDay(next.day);
    setDialogue(null);
    setGame(next); void persist(next);
    setToast("Pagi di Pasirluyu. Cuaca "+weatherForDay(next.day)+". Tanaman yang kemarin disiram mulai tumbuh.");
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
    setToast("Inggit menunggu empat timun segar di warung.");
  };
  const decidePhoto = (choice: PhotoChoice) => {
    if (saveStatus === "loading" || saveStatus === "error") return;
    const next = choosePhoto(game, choice);
    if (next === game) return;
    setGame(next); void persist(next);
    setDialogue({ title: "Bab 1 selesai · Empat Timun dan Satu Nama", photo: true, lines: [
      choice === "nani" ? "Nani menyelipkan foto asli ke amplop. Ia akan menyiapkan kisah dengan suaranya sendiri; kamu tidak perlu membagikannya sebelum ia siap." :
        "Nani menyimpan foto asli dan menitipkan salinan di warung. Inggit menyiapkan tempat untuk nama-nama yang diingat warga.",
      "Keputusanmu tersimpan di jurnal. Kalau bertemu Nani atau Inggit lagi, tanyakan kabar mereka. Jalan ke Cimincrang masih tertutup."] });
  };
  const planted = game.plots.filter(p => p.stage >= 0).length;
  const readyCrops = game.plots.filter(p => p.stage === 3).length;
  const unread = !game.story.orderAccepted && !game.phoneRead;
  const minutes = timeLabel(game.minutes);
  const journal = chapterJournal(game);
  const context = getActionContext(game);
  const farming = farmOverview(game);
  // An ID collision never authorizes replacing a legacy NPC's dialogue or face.
  const approvedByLegacyId=new Map(residents.flatMap(resident=>{
    const oldId=approvedLegacyId(resident);
    return oldId?[[oldId,resident] as const]:[];
  }));
  const visualByLegacyId=new Map(NPCS.flatMap(npc=>{
    const match=conservativeDisplayMatch(npc,residents);
    return match?[[npc.id,match] as const]:[];
  }));
  // Visible names/faces follow a verified two-field display match, while story
  // and relationship transfer still require independent manual approval.
  const activeNames=new Map(NPCS.map(npc=>[npc.name,
    approvedByLegacyId.get(npc.id)?.name??visualByLegacyId.get(npc.id)?.name??npc.name]));
  const namePattern=new RegExp("\\b("+[...activeNames.keys()]
    .sort((a,b)=>b.length-a.length).join("|")+")\\b","g");
  const display=(message:string)=>message.replace(namePattern,name=>activeNames.get(name)??name);
  const actionLabel = fishingSession?
    fishingSession.phase==="bite"?"Tarik sekarang!":
    fishingSession.phase==="waiting"?"Tunggu sambaran":
    fishingSession.phase==="reeling"?"Sedang menarik ikan":"Melempar kail":
    display(context.label);
  const actionVerb = fishingSession ? (fishingSession.phase==="bite"?"TARIK":fishingSession.phase==="waiting"?"TUNGGU":fishingSession.phase==="reeling"?"MENARIK":"LEMPAR") : context.kind==="plant"?"TANAM":
    context.kind==="harvest"?"PANEN":context.kind==="farm"?
    (game.equippedTool==="water"?"SIRAM":"CANGKUL"):
    context.kind==="wait"?"INFO":context.kind==="quest-prop"?"PERIKSA":context.kind==="sleep"?"TIDUR":
    context.kind==="npc"?"BICARA":context.kind==="storage"?"GUDANG":
    context.kind==="sluice"?(game.sluiceOpen?"TUTUP":"BUKA"):context.kind==="door"?(isOutdoorLocation(game.location)?"MASUK":"KELUAR"):context.kind==="travel"?"JALAN":context.kind==="inspect"?"LIHAT":"AKSI";
  const unavailable = saveStatus === "loading" || saveStatus === "error";

  return <main ref={screenRef} className={engine === "phaser" ? "yzg-page yzg-page--phaser" : "yzg-page"}>
    <header className="yzg-header">
      <div>
        <span className="yzg-eyebrow">BAB 1 · EMPAT TIMUN DAN SATU NAMA</span>
        <h1>YZ <span>Farm Life</span></h1>
      </div>
    </header>

    <section className="yzg-shell" aria-label="Permainan YZ Farm Life">
      <div className="yzg-headsup">
        <span>{weatherForDay(game.day)==="hujan"?"☂":weatherForDay(game.day)==="berawan"?"☁":game.minutes>=1080?"☾":"☀"} Hari {game.day} · {minutes} · {game.minutes>=1080?"Malam":game.minutes>=960?"Sore":game.minutes<660?"Pagi":"Siang"} · {weatherForDay(game.day)}</span>
        <span>◈ {formatGameRupiah(game.coins)}</span>
        <span>Timun {game.harvested} · Bibit {game.seeds}</span>
        <span>Lv. {playerLevel(game)} · {areaTitle(game.location)}</span>
        <span className={saveStatus === "error" ? "yzg-bad" : ""}>▣ {saveStatus === "loading" ? "Memuat" : saveStatus === "ready" ? "Siap" : saveStatus === "saving" ? "Menyimpan" : saveStatus === "saved" ? "Tersimpan" : "Belum tersimpan"}</span>
      </div>
      <section className="yzg-objective" aria-label="Tujuan cerita">
        <div><b>{journal.stage === 5 ? "Bab 1 selesai" : "Tujuan berikutnya"}</b><p>{display(journal.objective)}</p></div>
        <button onClick={() => { setShowHelp(false); setPhoneOpen(true); setPhoneTab("farm"); }} disabled={unavailable || !!dialogue}>Buka jurnal</button>
      </section>
      <div className="yzg-viewport" tabIndex={-1} data-game-focus>
        <canvas ref={canvasRef} width={300} height={200} onClick={tapOnWorld}
          aria-label="Peta Pasirluyu. Ketuk jalan untuk berjalan atau ketuk objek untuk berinteraksi."
          role="img" style={{cursor:"pointer",visibility:(!worldPresented || phaserReady)?"hidden":"visible",
            pointerEvents:(!worldPresented || phaserReady)?"none":"auto"}}/>
        {engine === "phaser" && <div ref={phaserHostRef} className="yzg-phaser-host"
          role="region" aria-label="Peta permainan"
          onClick={tapOnPhaserWorld}
          style={{opacity:worldPresented&&phaserReady?1:0,pointerEvents:worldPresented&&phaserReady?"auto":"none"}} />}
        {fishingSession&&<FishingScene phase={fishingSession.phase} onCancel={()=>finishFishing(fishingSession.id,"cancelled")}/>}
        {/* Fishing notifications are rendered over the character in both world engines. */}
        {cutscene!==null && <SluiceCutscene onDone={()=>{const newMemory=cutscene==="sluice-open";setCutscene(null);if(newMemory)setToast("Kenangan tersimpan di YZ Phone.");}}/>}
        {wakingDay!==null && <div className="yzg-sleep-scene" role="status"><strong>Hari {wakingDay}</strong><small>Pagi di rumah Yanzen</small></div>}
        {!worldPresented && <div className="yzg-loading" aria-busy={saveStatus !== "error"}>
          <div className="yzg-loading-copy">
            <strong>YZ Farm Life</strong>
            {saveStatus !== "error" && <span role="status">Memuat kebun dan progres...</span>}
          </div>
        </div>}
        {worldPresented && phaserError && <div className="yzg-toast" role="status">{phaserError}</div>}
        {worldPresented && toast && <div className="yzg-toast" role="status">{display(toast)}</div>}
        {worldPresented && !phoneOpen && !dialogue && game.location === "field" && (unread || game.seeds===0) && <button className="yzg-notif"
          onClick={()=>{setPhoneOpen(true);setPhoneTab("chat");setSelectedCitizen(null);setShowHelp(false);if(unread)setGame(g=>({...g,phoneRead:true}));}}>
          <span className="yzg-notif-icon">✉</span>
          <span><b>{unread?"YZ Phone · Pesan baru":"YZ Phone · Stok bibit habis"}</b>
            <small>{display(unread?"Inggit: Ada pesanan timun untuk warungku!":"Ayu: Bibit habis? Mampir ke lapak benihku di Pasar Warga.")}</small></span>
        </button>}
        {showHelp && <div className="yzg-help">
          <b>Selamat datang, Yanzen!</b><br/>
          Bergerak: WASD / panah atau ketuk tujuan di peta · Aksi: E · HP: P<br/>
          Ketuk petak untuk mendekat dan beraksi. Tanam dan panen otomatis; cangkul dan siram membutuhkan alat yang sesuai. Ikuti jalan di batas peta untuk menjelajah.
          <button onClick={() => setShowHelp(false)}>Mengerti</button>
        </div>}
        {dialogue && <GameDialog className="yzg-dialog yzg-chapter-dialog" aria-label={display(dialogue.title)}
          focusKey={dialogue.title + dialogue.lines.join("|")} onBack={() => setDialogue(null)}>
          <DialoguePanel key={dialogue.title + dialogue.lines.join("|")} dialogue={{ ...dialogue, title: display(dialogue.title) }} game={game}
            resident={dialogue.npcId ? visualByLegacyId.get(dialogue.npcId) : undefined}>
          {dialogue.npcId && isMarketMerchant(dialogue.npcId) && game.location==="pasar" && (
            <details className="yzg-market" open={dialogue.title==="Lapak pasar"}>
              <summary>
                <strong>{dialogue.npcId==="C07"?"Lapak pancing Widi":"Lapak benih Ayu"}</strong>
                <small>{dialogue.npcId==="C07"?"Beli umpan atau jual hasil pancing":"Beli bibit atau jual hasil kebun"}</small>
              </summary>
              <div className="yzg-market-grid">
                {(dialogue.npcId==="A04" ? ["seeds","cucumber"] as const :
                  ["bait",...FISH_IDS.filter(id=>game.fishing.fish[id]>0)] as const).map(item=>{
                  const fish=FISH_IDS.includes(item as keyof typeof FISH_MARKET)?FISH_MARKET[item as keyof typeof FISH_MARKET]:null;
                  const quantity=fish?game.fishing.fish[item as keyof typeof FISH_MARKET]:0;
                  const itemName=item==="bait"?"Beli 5 pelet":item==="seeds"?"Beli 5 bibit":
                    item==="cucumber"?"Jual hasil timun":"Jual "+fish!.name;
                  const detail=item==="bait"?formatGameRupiah(15)+" · Stok: "+game.fishing.bait:
                    item==="seeds"?formatGameRupiah(40)+" · 5 bibit":item==="cucumber"?sellableCucumbers(game)+" timun tersedia · "+formatGameRupiah(25)+"/timun":
                    quantity+" ekor · "+formatGameRupiah(fish!.price)+"/ekor";
                  return <button key={item} className="yzg-market-item" disabled={unavailable} onClick={()=>{
                    if(!dialogue.npcId || !isMarketMerchant(dialogue.npcId))return;
                    const result=marketTrade(game,dialogue.npcId,item);
                    if(result.state!==game){setGame(result.state);void persist(result.state);}
                    setDialogue({...dialogue,title:"Lapak pasar",lines:[result.message],choices:undefined,emotions:undefined});
                  }}>
                    {fish && (item==="lele"||item==="nila") ?
                      <img className="yzg-market-freshwater" src={"/game/assets/fish/"+item+".png"} alt="" aria-hidden="true"/> :
                     fish ? <span className="yzg-market-sprite yzg-market-sprite--widi" aria-hidden="true"
                      style={{backgroundPosition:fish.frame===0?"100% 0%":fish.frame===1?"0% 100%":"50% 100%"}}/> :
                      <span className={dialogue.npcId==="C07"?"yzg-market-sprite yzg-market-sprite--widi":"yzg-market-sprite yzg-market-sprite--ayu"}
                        style={{backgroundPosition:item==="bait"?"50% 0%":item==="seeds"?"0% 0%":"0% 100%"}} aria-hidden="true"/>}
                    <span className="yzg-market-item-text"><strong>{itemName}</strong><small>{detail}</small></span>
                  </button>;
                })}
              </div>
              {dialogue.npcId==="C07" && FISH_IDS.every(id=>game.fishing.fish[id]===0) &&
                <p className="yzg-market-empty">Belum ada ikan di tasmu. Kalau dapat, bawa ke sini, ya.</p>}
            </details>
          )}
          {dialogue.photo && <figure className="yzg-story-photo"><NextImage src="/game/assets/story/foto-saluran.png" width={1536} height={1024} sizes="(max-width: 640px) 90vw, 580px" alt="Foto cerita fiktif: dua garis pada batu di samping pintu air dan jembatan kebun."/><figcaption>{display("Foto pintu air · koleksi Nani · ilustrasi fiktif")}</figcaption></figure>}

          {dialogue.choosePhoto && <div className="yzg-photo-choices" aria-label="Pilih tempat foto">
            <button onClick={() => decidePhoto("nani")} disabled={unavailable}>{display("Percayakan foto asli kepada Nani")}<small>Kisah disimpan bersama keluarga.</small></button>
            <button onClick={() => decidePhoto("warung")} disabled={unavailable}>Titip salinan di warung<small>Warga dapat menambahkan nama.</small></button>
          </div>}
          {dialogue.npcId && dialogue.choices && questTalks(game,dialogue.npcId).map(id=>
            <button key={id} disabled={unavailable} onClick={()=>{
              const next=questTalk(game,dialogue.npcId!,id);
              if(next.state!==game){setGame(next.state);void persist(next.state);}
              setDialogue(next);
            }}>{game.personalQuests?.[id]?"Bahas misi":"Terima misi"} ? {tales[id].title}</button>)}
          {dialogue.npcId && dialogue.choices && followUpAvailable(game,dialogue.npcId) &&
            <button type="button" disabled={unavailable} onClick={()=>{
              const next=followUpTalk(game,dialogue.npcId!);
              if(next.state!==game){setGame(next.state);void persist(next.state);}
              setDialogue(next);
            }}>{game.followUpQuests?.[dialogue.npcId]?"Bahas permintaan":"Dengarkan permintaan"}: {followUpTales[dialogue.npcId].title}</button>}
          {dialogue.choices && <div className="yzg-response-list" aria-label="Pilih jawaban">{dialogue.choices.map(choice => {
            const locked = bondLevel(game.bonds[dialogue.npcId!].points) < (choice.minLevel || 0);
            return <button key={choice.id} disabled={unavailable || locked} onClick={() => respond(choice.id)}>{choice.label}{locked && <small>Terbuka pada kedekatan Lv. {choice.minLevel}</small>}</button>;
          })}</div>}
          {dialogue.sleep && <button onClick={rest} disabled={unavailable}>Tidur sampai pagi</button>}
          <button onClick={() => setDialogue(null)}>{dialogue.sleep ? "Belum tidur" : dialogue.choosePhoto ? "Putuskan nanti" : "Akhiri percakapan"}</button>
          </DialoguePanel>
        </GameDialog>}
        {storageOpen && <ToolWarehouse game={game} disabled={unavailable}
          onClose={()=>setStorageOpen(false)} onTransfer={transfer} onUpgrade={upgrade}/>}
        {phoneOpen && <GameDialog className="yzg-phone-backdrop" aria-label="YZ Phone" focusKey={phoneTab + ":" + (selectedCitizen ?? "list")}
          onBack={() => resetOpen ? (!resetBusy && setResetOpen(false)) : phoneTab === "characters" && selectedCitizen ? setSelectedCitizen(null) : phoneTab === "apps" ? setPhoneOpen(false) : setPhoneTab("apps")}
          onClick={e => { if (e.target === e.currentTarget && !resetOpen) setPhoneOpen(false); }}>
          <section className="yzg-phone" onClick={e => e.stopPropagation()} aria-label="Smartphone YZ Phone">
            <div className="yzg-phone-notch"/>
            <div className="yzg-phone-time"><span>{minutes}</span><span>●●●  ▰</span></div>
            <div className="yzg-phone-top">
              <button aria-label="Kembali" data-dialog-start={phoneTab !== "apps" ? "" : undefined} onClick={() => phoneTab === "characters" && selectedCitizen ? setSelectedCitizen(null) : phoneTab === "apps" ? setPhoneOpen(false) : setPhoneTab("apps")}>‹</button>
              <b>{phoneTab === "apps" ? "YZ PHONE" : phoneTab === "chat" ? "Pesan" : phoneTab === "farm" ? "Kebunku" : phoneTab === "chronicle" ? "Kronik" : phoneTab === "memories" ? "Kenangan" : phoneTab === "ikd" ? "IKD" : phoneTab === "friends" ? "Kedekatan" : phoneTab === "stats" ? "Statistik" : phoneTab === "characters" ? "Warga" : phoneTab === "guide" ? "Panduan" : "Jelajah"}</b>
              <button aria-label="Tutup ponsel" onClick={() => setPhoneOpen(false)}>×</button>
            </div>
            <div className="yzg-phone-content" data-dialog-scroll>
              {phoneTab === "apps" && <>
                <div className="yzg-phone-greeting">{timeGreeting(game.minutes).toUpperCase()}, YANZEN <strong>Ada kabar dari kebun dan tetangga.</strong><small>Hari {game.day} · Cuaca {weatherForDay(game.day)} · {areaTitle(game.location)}</small></div>
                <div className="yzg-app-grid">{APPS.map(app => <button key={app.id} data-dialog-start={app.id === "chat" ? "" : undefined} onClick={() => {
                  setRouteMessage("");
                  setPhoneTab(app.id);
                  setSelectedCitizen(null);
                  if (app.id === "chat") setGame(g => ({ ...g, phoneRead: true }));
                }}><span>{app.icon}{app.id === "chat" && unread && <i/>}</span><b>{app.name}</b></button>)}</div>
                <div className="yzg-phone-card"><b>Warga di sekitarmu</b><p>{npcHere(game).map(n => display(n.name)).join(", ") || "Kamu bisa mencari mereka lewat menu Warga."}</p><button onClick={() => setPhoneTab("characters")}>Lihat warga</button></div>
                <div className="yzg-phone-card"><b>Tujuan berikutnya</b><p>{display(journal.objective)}</p><button type="button" onClick={()=>setPhoneTab("chronicle")}>Lihat perjalananmu</button></div>
              </>}
              {phoneTab === "chat" && <>
                <div className="yzg-phone-card"><b>{display("✉ Inggit · Pemilik warung")}</b><p>&ldquo;Halo, Yanzen! Bisa bantu sediakan empat timun segar untuk warungku? Aku bayar {formatGameRupiah(160)} saat kamu antar.&rdquo;</p>
                  {!game.story.orderAccepted && <button onClick={markOrder}>Terima pesanan 4 timun</button>}
                  {game.story.orderAccepted && <small>{game.story.orderDone ? "✓ Pesanan selesai. Terima kasih!" : display("Pesanan diterima. Temui Inggit setelah panen.")}</small>}
                </div>
                {(game.seeds<=2 || sellableCucumbers(game)>0) && <div className="yzg-phone-card">
                  <b>{display("✉ Ayu · Lapak benih")}</b>
                  {game.seeds<=2 && <p>Bibit timunmu hampir habis? Mampir ke lapakku di Pasar Warga. Aku siapkan sebungkus isi lima seharga {formatGameRupiah(40)}.</p>}
                  {sellableCucumbers(game)>0 && <p>Kalau ada timun lebih dari pesanan Inggit, bawa ke lapakku. Aku terima hasil kebunmu seharga {formatGameRupiah(25)} per timun.</p>}
                  <small>Pembelian bibit dan penjualan timun dilakukan langsung di lapak Ayu.</small>
                </div>}
                <div className="yzg-phone-card"><b>{display("✉ Ryan")}</b><p>&ldquo;Kalau lewat dekat saluran nanti, panggil aku. Ada yang ingin kutunjukkan.&rdquo;</p></div>
              </>}
              {phoneTab === "farm" && <>
                <div className="yzg-phone-card"><b>Ringkasan kebun</b>
                  <div className="yzg-phone-stats"><span>Tanaman aktif<strong>{planted}</strong></span><span>Siap panen<strong>{readyCrops}</strong></span><span>Perlu disiram<strong>{farming.needsWater}</strong></span><span>Sudah disiram<strong>{farming.watered}</strong></span><span>Hasil panen<strong>{game.harvested}</strong></span><span>Saldo<strong>{formatGameRupiah(game.coins)}</strong></span></div>
                  <p>{farming.next}</p>
                </div>
                <div className="yzg-phone-card"><b>Misi warga</b>
                  {NPCS.map(n=><details key={n.id}><summary>{display(n.name)} · {tales[n.id].title}</summary>
                    <p>{display(questObjective(game,n.id))}</p></details>)}
                </div>
                <div className="yzg-phone-card"><b>Jurnal · Bab 1</b><p>{display(journal.objective)}</p>
                  <ol className="yzg-journal">{journal.entries.map(entry => <li key={entry.title}>{entry.done ? "Selesai: " : "Belum: "}{display(entry.title)}</li>)}</ol>
                  {game.story.photoSeen && <figure className="yzg-story-photo"><NextImage src="/game/assets/story/foto-saluran.png" width={1536} height={1024} sizes="300px" alt={display("Foto lama pintu air milik Nani, dengan dua garis pada batu.")}/><figcaption>Petunjuk: Cimincrang</figcaption></figure>}
                  {game.story.photoChoice && <p><b>Keputusan hari {game.story.completedDay}</b><br/>{game.story.photoChoice === "nani" ? display("Foto asli dipercayakan kepada Nani; kisah keluarga disiapkan dengan suaranya sendiri.") : display("Salinan foto dititipkan di warung; warga dapat menambahkan nama. Foto asli tetap bersama Nani.")}</p>}
                </div>
              </>}
              {phoneTab === "ikd" && <>
                <div className="yzg-phone-card yzg-id">
                  <span className="yzg-id-eyebrow">IKD · IDENTITAS KARAKTER DIGITAL</span>
                  <div className="yzg-id-portrait"><NextImage className="yzg-character-preview" src="/game/assets/portraits/bandung/professions/work-A01.png" alt="Potret Yanzen" width={80} height={80} unoptimized/></div>
                  <strong>YANZEN</strong>
                  <p className="yzg-id-subtitle">Warga Pasirluyu</p>
                  <dl>
                    <div><dt>ID Game</dt><dd>YZF-{(userId || "000001").slice(0, 6).toUpperCase()}</dd></div>
                    <div><dt>Domisili</dt><dd>Pasirluyu, Regol, Kota Bandung</dd></div>
                    <div><dt>Pekerjaan</dt><dd>Petani urban</dd></div>
                    <div><dt>Tahun tinggal</dt><dd>{game.day > 0 ? "Tahun 1" : "Baru pindah"}</dd></div>
                    <div><dt>Hari bermain</dt><dd>{game.day}</dd></div>
                  </dl>
                  <small className="yzg-id-disclaimer">Identitas ini hanya untuk cerita YZ Farm Life, bukan identitas kependudukan resmi.</small>
                </div>
                <div className="yzg-phone-card yzg-account">
                  <h3>Akun permainan</h3>
                  <p>Keluar tidak akan menghapus perjalananmu. Kamu bisa melanjutkan lagi saat masuk.</p>
                  <div className="yzg-account-actions">
                    <button type="button" className="yzg-account-logout" onClick={() => void logout()}
                      disabled={resetBusy || saveStatus === "loading" || saveStatus === "saving" || saveStatus === "error"}>
                      Keluar akun
                    </button>
                    <button type="button" className="yzg-account-reset" onClick={() => { setResetError(""); setResetOpen(true); }}
                      disabled={resetBusy || !userId || saveStatus === "loading" || saveStatus === "saving" || saveStatus === "error"}>
                      Reset akun
                    </button>
                  </div>
                </div>
              </>}
              {phoneTab === "characters" && <CharacterGallery game={game} residents={residents} selectedId={selectedCitizen} onSelect={setSelectedCitizen}/>}
              {phoneTab === "chronicle" && <PhoneChronicle game={game} residents={residents} displayName={display} onOpenWarga={id=>{setSelectedCitizen(id);setPhoneTab("characters");}}/>}
              {phoneTab === "memories" && <div className="yzg-phone-card yzg-memory-album">
                <b>Album Kenangan</b>
                <p>Beberapa momen layak disimpan lebih lama dari satu hari. Kamu bisa melihatnya kembali di sini.</p>
                <div className="yzg-memory-entry">
                  <div className={"yzg-memory-cover"+(hasSluiceMemory(game)?" unlocked":" locked")} aria-hidden="true">
                    {hasSluiceMemory(game)?"":"?"}
                  </div>
                  <div>
                    <strong>{hasSluiceMemory(game)?"Pintu Air Pasirluyu":"Kenangan yang belum terbuka"}</strong>
                    <small>{hasSluiceMemory(game)?"Roda yang lama diam kembali bergerak.":"Lanjutkan perjalanan dan bantu warga."}</small>
                    {hasSluiceMemory(game) && <button type="button" onClick={()=>{
                      setPhoneOpen(false);setToast("");setCutscene("sluice-replay");
                    }}>Putar ulang adegan</button>}
                  </div>
                </div>
              </div>}
              {phoneTab === "guide" && <>
                <div className="yzg-phone-card">
                  <b>Mulai bermain</b>
                  <p>Jelajahi Pasirluyu, kenali tetangga, rawat kebun timun, dan jalani cerita. Kalau lupa kelanjutan ceritanya, buka Kronik.</p>
                </div>
                <div className="yzg-phone-card"><b>Gerak & interaksi</b>
                  <p>PC: WASD atau tombol panah untuk berjalan. E atau Spasi untuk berinteraksi, P untuk membuka YZ Phone, Alt+Enter untuk layar penuh.</p>
                  <p>HP: gunakan tombol arah atau ketuk jalan dan objek. Tombol A untuk berinteraksi. Aktifkan Lari agar bergerak lebih cepat.</p>
                </div>
                <div className="yzg-phone-card"><b>Alat & bertani</b>
                  <p>PC: Q/R mengganti alat, 1–9 memilih alat. Gunakan cangkul untuk mengolah tanah, tanam bibit, siram dengan gembor, dan panen saat matang.</p>
                  <p>Buka gudang dari pintu bangunan untuk mengambil dan menyimpan alat.</p>
                </div>
                <div className="yzg-phone-card"><b>Memancing di sungai</b>
                  <p>Ambil joran dari gudang dan beli pelet di lapak Widi. Berdirilah di tepi sungai menghadap air, lalu tekan A atau E untuk melempar kail.</p>
                  <p>Tunggu pelampung tenggelam sebelum menarik. Kalau terlalu cepat atau terlambat, ikan bisa lolos. Bahkan ketika tarikannya tepat, belum tentu berhasil setiap kali.</p>
                  <p>Tekan Esc di PC atau Angkat joran pada layar HP untuk berhenti. Catatan hasil pancingmu ada di Statistik.</p>
                </div>
                <div className="yzg-phone-card"><b>Waktu & progres</b>
                  <p>Kalau sudah malam, pulang ke rumah, hadap ranjang, lalu pilih Tidur. Perjalananmu akan tersimpan.</p>
                  <p>Kenali warga lewat percakapan. Lihat kabarnya di Warga, dan perjalanan kalian di Kronik.</p>
                </div>
              </>}
              {phoneTab === "friends" && <>
                
                <div className="yzg-phone-card"><b>Warga Pasirluyu</b><p>Kedekatan tumbuh dari percakapan. Kamu bisa mengenal seseorang sedikit demi sedikit.</p></div>
                {NPCS.map(npc => {
                  const bond = game.bonds[npc.id], level = bondLevel(bond.points);
                  const place=npcWhere(game,npc.id),soul=NPC_SOULS[npc.id];
                  return <div className="yzg-phone-card yzg-bond-card" key={npc.id}>
                    {visualByLegacyId.has(npc.id) ? <ResidentPortrait resident={visualByLegacyId.get(npc.id)!}/> : <Portrait npcId={npc.id} emotion={bond.mood}/>}
                    <div><b>{display(npc.name)}</b><small>{npc.role} · {soul.work}</small><p>{bondLabel(bond.points)}</p>
                    <p className="yzg-npc-where">Lokasi: {areaTitle(place.location)} · {display(place.activity)}</p>
                    {level>=1&&<small>Kebiasaan: {soul.habit}</small>}
                    {level>=2&&<small>Harapan: {soul.desire}</small>}
                    {level>=3&&<small>Hal yang dikhawatirkan: {soul.fear}</small>}
                    {level>=2&&<small>Hubungan warga: {display(soul.connection)}</small>}
                    <meter min={0} max={1000} value={bond.points} aria-label={"Kedekatan " + display(npc.name)}/><small>{bond.talks?`Sudah ${bond.talks} kali berbincang`:"Belum pernah berbincang"}</small>
                    <small>{bond.lastTalkDay === game.day ? "Kalian sudah mengobrol hari ini" : "Mungkin ada cerita lain saat kalian bertemu lagi"}</small></div>
                  </div>;
                })}
              </>}
              {phoneTab === "stats" && <>
                <div className="yzg-phone-card"><b>YANZEN · Lv. {playerLevel(game)}</b><p>Petani urban · Hari {game.day}</p>
                  <p>Berjalan, bertani dan berinteraksi tanpa batas energi. Tidur di rumah untuk berganti hari dan menumbuhkan tanaman.</p>
                  <div className="yzg-phone-stats">
                    <span>Pengalaman<strong>{game.stats.xp} XP</strong></span><span>Aksi bertani<strong>{game.stats.actions}</strong></span>
                    <span>Total panen<strong>{game.stats.harvests}</strong></span><span>Percakapan<strong>{game.stats.conversations}</strong></span>
                    <span>Malam beristirahat<strong>{game.stats.nights}</strong></span><span>Saldo<strong>{formatGameRupiah(game.coins)}</strong></span>
                  </div>
                </div>
                <div className="yzg-phone-card">
                  <b>Catatan memancing</b>
                  <div className="yzg-phone-stats">
                    <span>Lemparan<strong>{game.fishing.stats.casts}</strong></span>
                    <span>Sambaran<strong>{game.fishing.stats.bites}</strong></span>
                    <span>Berhasil<strong>{game.fishing.caught}</strong></span>
                    <span>Meleset<strong>{game.fishing.stats.missed}</strong></span>
                    <span>Ikan lepas<strong>{game.fishing.stats.escaped}</strong></span>
                    <span>Tanpa sambaran<strong>{game.fishing.stats.noBite}</strong></span>
                  </div>
                  <p>Hasil dari sungai:</p>
                  <div className="yzg-fishing-species-grid">
                    {(["lele","nila"] as const).map(id=><div key={id}>
                      <img src={"/game/assets/fish/"+id+".png"} alt={FISH_MARKET[id].name}/>
                      <strong>{FISH_MARKET[id].name}</strong>
                      <small>Tertangkap {game.fishing.stats.caughtBySpecies[id]} kali · di tas {game.fishing.fish[id]}</small>
                    </div>)}
                  </div>
                </div>
              </>}
              {phoneTab === "map" && <>
                <div className="yzg-phone-card"><b>Lokasi kamu sekarang</b>
                  <p>{areaTitle(game.location)} · {START_LOCATION.village}, {START_LOCATION.district}<br/>{START_LOCATION.city}</p>
                  <div className="yzg-local-map yzg-master-minimap" aria-label="Denah jalur empat kawasan">
                    <div className={game.location==="pasar" || game.location==="warung" ? "current" : ""}>Pasar Warga</div>
                    <div className={["field","home","shed"].includes(game.location) ? "current" : ""}>Kebun Yanzen</div>
                    <div className={game.location==="gang" ? "current" : ""}>Gang Pasirluyu</div>
                    <div className={game.location==="sungai" ? "current" : ""}>Bantaran Sungai</div>
                  </div>
                  {isOutdoorLocation(game.location) ? <div className="yzg-neighbour-routes">
                    <b>Jalan dari sini</b>
                    {ROUTE_PORTALS.filter(p => p.from===game.location).map(p =>
                      <button type="button" key={p.to} onClick={() => walkToNeighbour(p)}>
                        <span>Berjalan ke {areaTitle(p.to)}</span><small>{compass[p.direction]}</small>
                      </button>)}
                    {routeMessage && <p role="status">{routeMessage}</p>}
                  </div> : <p>Keluar lewat pintu untuk menuju kawasan lain.</p>}
                  <details className="yzg-road-closure-info">
                    <summary>{ROUTE_BARRIERS.length} jalan yang belum terbuka — lihat alasannya</summary>
                    {ROUTE_BARRIERS.map(b=><p key={b.id}><b>{b.label}</b>
                      <small>{AREAS[b.location].name} → {b.future}. {display(b.message)}</small></p>)}
                  </details>
                  {(["field","gang","pasar","sungai"] as const).map(id=><p key={id}><b>{id===game.location?"● ":"○ "}{AREAS[id].name}</b><small>{display(AREAS[id].description)}</small></p>)}
                  <small>Nama wilayah mengikuti Bandung. Jalan, kebun, dan tokoh di sini adalah bagian dari cerita.</small>
                </div>
                <WorldRegionDirectory/>
              </>}
            </div>
            <div className="yzg-phone-bottom"><button onClick={() => setPhoneTab("apps")} aria-label="Beranda YZ Phone">●</button></div>
            {resetOpen && <div className="yzg-reset-overlay" role="alertdialog" aria-modal="true"
              aria-labelledby="yzg-reset-title" aria-describedby="yzg-reset-description"
              onClick={event => { if (event.target === event.currentTarget && !resetBusy) setResetOpen(false); }}>
              <div className="yzg-reset-dialog">
                <h3 id="yzg-reset-title">Mulai lagi dari awal?</h3>
                <p id="yzg-reset-description">
                  Semua progres permainan akan hilang: hari bermain, kebun, uang, barang,
                  hubungan dengan warga, statistik, serta cerita dan misi yang sudah kamu jalani.
                </p>
                <p className="yzg-reset-warning">Progres yang direset tidak bisa dikembalikan. Akun untuk masuk tetap ada.</p>
                {resetError && <p role="alert" className="yzg-reset-error">{resetError}</p>}
                <div className="yzg-reset-actions">
                  <button type="button" autoFocus onClick={() => setResetOpen(false)} disabled={resetBusy}>Batal, simpan progres</button>
                  <button type="button" className="yzg-reset-confirm" onClick={() => void resetGame()}
                    disabled={resetBusy || saveStatus === "error"}>
                    {resetBusy ? "Mengulang permainan…" : "Ya, reset semua progres"}
                  </button>
                </div>
              </div>
            </div>}
          </section>
        </GameDialog>}
      </div>
      <div className="yzg-controls">
        <div className="yzg-action-context">
          {context.kind !== "none" ? <button type="button" className="yzg-context-button"
            onClick={action} disabled={controlsLocked} aria-keyshortcuts="E">
            <kbd>E</kbd><span>{actionLabel}</span>
          </button> : <span className="yzg-place-name">{areaTitle(game.location)}</span>}
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
      <div className="yzg-footer"><span>WASD/panah: jalan | E/Enter: aksi | Q/R atau 1-9: alat | P: YZ Phone</span><span>Menu: panah/Tab untuk memilih, Enter untuk buka, Esc untuk kembali</span></div>
      {saveStatus === "error" && <div className="yzg-error" role="alert">
        <b>Penyimpanan lokal bermasalah</b><p>{errorText}</p>
        {userId && <p>Progres terbaru masih di layar. Coba simpan kembali sebelum menutup game.</p>}
        <button onClick={() => {
          if (!userId) { window.location.reload(); return; }
          saveLockedRef.current = false; setErrorText(""); void persist(game);
        }}>{userId ? "Coba simpan kembali" : "Coba muat progres kembali"}</button>
      </div>}
    </section>
  </main>;
}
