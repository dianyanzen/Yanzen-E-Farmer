"use client";

import {useCallback,useEffect,useLayoutEffect,useRef,useState} from "react";
import {PASIRLUYU_SLUICE_CUTSCENE,pasirluyuCutsceneCaption} from "@/lib/game/cutscene-catalog";

const VIDEO_ASPECT = 910 / 512;

/**
 * Playback is contained in the game viewport (not browser fullscreen).
 * The original MP4 and its natural aspect ratio are never transformed or cropped.
 * Story flags, rewards and replay are managed by the game model.
 */
export default function SluiceCutscene({onDone}:{onDone:()=>void}){
  const videoRef=useRef<HTMLVideoElement>(null);
  const overlayRef=useRef<HTMLDivElement>(null);
  const captionRef=useRef<HTMLDivElement>(null);
  const actionsRef=useRef<HTMLDivElement>(null);
  const completed=useRef(false);
  const [attempt,setAttempt]=useState(0);
  const [status,setStatus]=useState<"loading"|"ready"|"error">("loading");
  const [muted,setMuted]=useState(true);
  const [seconds,setSeconds]=useState(0);
  const [frameWidth,setFrameWidth]=useState<number|null>(null);
  const [canExpandGame,setCanExpandGame]=useState(false);

  const finish=useCallback(()=>{
    if(completed.current)return;
    completed.current=true;
    onDone();
  },[onDone]);
  useEffect(()=>{
    const onKey=(event:KeyboardEvent)=>{if(event.key==="Escape"){event.preventDefault();finish();}};
    document.addEventListener("keydown",onKey);
    setCanExpandGame(Boolean(document.fullscreenEnabled));
    return ()=>document.removeEventListener("keydown",onKey);
  },[finish]);
  useEffect(()=>{
    if(status!=="loading")return;
    const t=window.setTimeout(()=>setStatus("error"),14000);
    return ()=>window.clearTimeout(t);
  },[status,attempt]);

  // Reserve actual room for the subtitle and buttons before fitting the video.
  // ResizeObserver also catches rotations, desktop resizes and font-size changes.
  useLayoutEffect(()=>{
    const overlay=overlayRef.current;
    if(!overlay)return;
    const fit=()=>{
      const style=window.getComputedStyle(overlay);
      const paddingX=parseFloat(style.paddingLeft)+parseFloat(style.paddingRight);
      const paddingY=parseFloat(style.paddingTop)+parseFloat(style.paddingBottom);
      const gap=parseFloat(style.rowGap)||0;
      const otherHeight=(captionRef.current?.offsetHeight??0)+(actionsRef.current?.offsetHeight??0);
      const rows=(captionRef.current?1:0)+(actionsRef.current?1:0);
      const remainingHeight=Math.max(0,overlay.clientHeight-paddingY-otherHeight-gap*rows);
      const remainingWidth=Math.max(0,overlay.clientWidth-paddingX);
      const next=Math.max(0,Math.floor(Math.min(960,remainingWidth,remainingHeight*VIDEO_ASPECT)));
      setFrameWidth(current=>current===next?current:next);
    };
    const observer=new ResizeObserver(fit);
    observer.observe(overlay);
    if(captionRef.current)observer.observe(captionRef.current);
    if(actionsRef.current)observer.observe(actionsRef.current);
    fit();
    return ()=>observer.disconnect();
  },[status]);

  const retry=()=>{setSeconds(0);setStatus("loading");setAttempt(value=>value+1);};
  const expandGame=()=>{
    // Fullscreen the *game* (world + controls), never the video element.
    const page=overlayRef.current?.closest(".yzg-page") as HTMLElement|null;
    if(page?.requestFullscreen)void page.requestFullscreen().catch(()=>{});
  };

  return <div ref={overlayRef} className="yzg-cutscene" role="dialog" aria-modal="true" aria-label={PASIRLUYU_SLUICE_CUTSCENE.title}>
    <div className="yzg-cutscene-stage" style={frameWidth===null?undefined:{width:`${frameWidth}px`}}>
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
    {status!=="error"&&<div ref={captionRef} className="yzg-cutscene-readalong" aria-live="off">
      <small>KENANGAN · PINTU AIR PASIRLUYU</small>
      <strong>{pasirluyuCutsceneCaption(seconds)}</strong>
      {status==="loading"&&<span className="yzg-cutscene-buffering">Menyiapkan adegan…</span>}
    </div>}
    <div ref={actionsRef} className="yzg-cutscene-actions">
      {status!=="error"&&<>
        <button type="button" onClick={()=>{setMuted(value=>!value);if(videoRef.current?.paused)void videoRef.current.play().catch(()=>{});}}>
          {muted?"Aktifkan suara":"Matikan suara"}</button>
        {canExpandGame&&<button type="button" onClick={expandGame}>Layar permainan penuh</button>}
      </>}
      <button type="button" className="yzg-cutscene-skip" onClick={finish}>Lewati adegan</button>
    </div>
  </div>;
}
