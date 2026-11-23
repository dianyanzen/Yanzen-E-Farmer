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
  const [status,setStatus]=useState<"loading"|"ready"|"storyboard">("loading");
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
    const t=window.setTimeout(()=>{setSeconds(0);setStatus("storyboard");},14000);
    return ()=>window.clearTimeout(t);
  },[status]);
  // Preserve the original approved first/last frames while the 10-second owner
  // MP4 is missing. This is visibly labeled as a two-frame illustration, not a
  // synthetic replacement video and never grants extra quest rewards.
  useEffect(()=>{
    if(status!=="storyboard")return;
    const start=performance.now();
    const timer=window.setInterval(()=>{
      const elapsed=(performance.now()-start)/1000;
      if(elapsed>=PASIRLUYU_SLUICE_CUTSCENE.durationSeconds){finish();return;}
      setSeconds(elapsed);
    },100);
    return ()=>window.clearInterval(timer);
  },[status,finish]);

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

  const expandGame=()=>{
    // Fullscreen the *game* (world + controls), never the video element.
    const page=overlayRef.current?.closest(".yzg-page") as HTMLElement|null;
    if(page?.requestFullscreen)void page.requestFullscreen().catch(()=>{});
  };

  return <div ref={overlayRef} className="yzg-cutscene" role="dialog" aria-modal="true" aria-label={PASIRLUYU_SLUICE_CUTSCENE.title}>
    <div className="yzg-cutscene-stage" style={frameWidth===null?undefined:{width:`${frameWidth}px`}}>
      {status!=="storyboard" ? <video ref={videoRef} className="yzg-cutscene-video" src={PASIRLUYU_SLUICE_CUTSCENE.src}
        poster={PASIRLUYU_SLUICE_CUTSCENE.poster} autoPlay muted={muted} playsInline preload="auto"
        onLoadedData={()=>setStatus("ready")} onPlaying={()=>setStatus("ready")}
        onTimeUpdate={event=>setSeconds(event.currentTarget.currentTime)} onEnded={finish}
        onError={()=>{setSeconds(0);setStatus("storyboard");}}
        aria-label="Yanzen memutar roda pintu air, kemudian air mengalir ke hilir"/> :
        <div className="yzg-cutscene-storyboard" role="img"
          aria-label="Ilustrasi dua frame asli pintu air Pasirluyu, sebelum dan sesudah pintu dibuka">
          <img className="yzg-cutscene-still yzg-cutscene-still--start"
            src={PASIRLUYU_SLUICE_CUTSCENE.startFrame} alt=""/>
          <img className="yzg-cutscene-still yzg-cutscene-still--end"
            src={PASIRLUYU_SLUICE_CUTSCENE.endFrame} alt=""
            style={{opacity:Math.min(1,Math.max(0,(seconds-4)/2))}}/>
        </div>}
    </div>
    <div ref={captionRef} className="yzg-cutscene-readalong" aria-live="off">
      <small>KENANGAN · PINTU AIR PASIRLUYU</small>
      <strong>{pasirluyuCutsceneCaption(seconds)}</strong>
      {status==="loading"&&<span className="yzg-cutscene-buffering">Menyiapkan adegan…</span>}
      {status==="storyboard"&&<span className="yzg-cutscene-buffering">Ilustrasi dua frame · video asli belum tersedia</span>}
    </div>
    <div ref={actionsRef} className="yzg-cutscene-actions">
      {status!=="storyboard"&&<>
        <button type="button" onClick={()=>{setMuted(value=>!value);if(videoRef.current?.paused)void videoRef.current.play().catch(()=>{});}}>
          {muted?"Aktifkan suara":"Matikan suara"}</button>
        {canExpandGame&&<button type="button" onClick={expandGame}>Layar permainan penuh</button>}
      </>}
      <button type="button" className="yzg-cutscene-skip" onClick={finish}>Lewati adegan</button>
    </div>
  </div>;
}
