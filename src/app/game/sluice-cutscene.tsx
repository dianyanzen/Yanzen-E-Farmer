"use client";

import {useEffect,useRef,useState,useCallback} from "react";
import {PASIRLUYU_SLUICE_CUTSCENE,pasirluyuCutsceneCaption} from "@/lib/game/cutscene-catalog";

/** Video playback only; saving, quest rewards and replay flags stay in game model. */
export default function SluiceCutscene({onDone}:{onDone:()=>void}){
  const videoRef=useRef<HTMLVideoElement>(null);
  const completed=useRef(false);
  const [attempt,setAttempt]=useState(0);
  const [status,setStatus]=useState<"loading"|"ready"|"error">("loading");
  const [muted,setMuted]=useState(true);
  const [seconds,setSeconds]=useState(0);
  const finish=useCallback(()=>{
    if(completed.current)return;
    completed.current=true;
    onDone();
  },[onDone]);
  useEffect(()=>{
    const onKey=(event:KeyboardEvent)=>{if(event.key==="Escape"){event.preventDefault();finish();}};
    document.addEventListener("keydown",onKey);
    return ()=>document.removeEventListener("keydown",onKey);
  },[finish]);
  useEffect(()=>{
    if(status!=="loading")return;
    const t=window.setTimeout(()=>setStatus("error"),14000);
    return ()=>window.clearTimeout(t);
  },[status,attempt]);
  const retry=()=>{setSeconds(0);setStatus("loading");setAttempt(value=>value+1);};
  const fullscreen=()=>{
    const v=videoRef.current as (HTMLVideoElement&{webkitEnterFullscreen?:()=>void})|null;
    if(!v)return;
    if(typeof v.requestFullscreen==="function")void v.requestFullscreen().catch(()=>v.webkitEnterFullscreen?.());
    else v.webkitEnterFullscreen?.();
  };
  return <div className="yzg-cutscene" role="dialog" aria-modal="true" aria-label={PASIRLUYU_SLUICE_CUTSCENE.title}>
    <div className="yzg-cutscene-stage">
      {status!=="error" ? <video key={attempt} ref={videoRef} className="yzg-cutscene-video" src={PASIRLUYU_SLUICE_CUTSCENE.src}
        poster={PASIRLUYU_SLUICE_CUTSCENE.poster} autoPlay muted={muted} playsInline preload="auto"
        onLoadedData={()=>setStatus("ready")} onPlaying={()=>setStatus("ready")}
        onTimeUpdate={event=>setSeconds(event.currentTarget.currentTime)} onEnded={finish} onError={()=>setStatus("error")}
        aria-label="Yanzen memutar roda pintu air, kemudian air mengalir ke hilir"/> :
        <div className="yzg-cutscene-unavailable" role="status">
          <img src={PASIRLUYU_SLUICE_CUTSCENE.poster} alt="Pintu air Pasirluyu telah terbuka"/>
          <p>Adegan belum bisa diputar. Kamu bisa mencobanya lagi atau melanjutkan permainan.</p>
          <button type="button" onClick={retry}>Coba putar lagi</button>
        </div>}
    </div>
    {status!=="error"&&<div className="yzg-cutscene-readalong">
      <small>KENANGAN · PINTU AIR PASIRLUYU</small>
      <strong>{pasirluyuCutsceneCaption(seconds)}</strong>
      {status==="loading"&&<span className="yzg-cutscene-buffering">Menyiapkan adegan…</span>}
    </div>}
    <div className="yzg-cutscene-actions">
      {status!=="error"&&<>
        <button type="button" onClick={()=>{setMuted(value=>!value);if(videoRef.current?.paused)void videoRef.current.play().catch(()=>{});}}>
          {muted?"Aktifkan suara":"Matikan suara"}</button>
        <button type="button" onClick={fullscreen}>Layar penuh</button>
      </>}
      <button type="button" className="yzg-cutscene-skip" onClick={finish}>Lewati adegan</button>
    </div>
  </div>;
}
