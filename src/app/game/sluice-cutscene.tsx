"use client";

import {useEffect,useState,useCallback,useRef} from "react";

/**
 * Player-facing micro-cutscene. The save transition happens in the game model,
 * never in this visual component, so skipping cannot duplicate quest rewards.
 */
export default function SluiceCutscene({onDone}: {onDone:()=>void}) {
  const [videoUnavailable,setVideoUnavailable]=useState(false);
  const [muted,setMuted]=useState(true);
  const [playbackSeconds,setPlaybackSeconds]=useState(0);
  const cinematicLine=playbackSeconds<2.4?"Saluran yang lama terdiam":playbackSeconds<5.5?"Yanzen memutar roda pintu air":playbackSeconds<8.7?"Air mulai bergerak menuju hilir":"Kebun warga kembali mendapat air";
  const videoRef=useRef<HTMLVideoElement>(null);
  const finished=useRef(false);
  const finish=useCallback(()=>{if(finished.current)return;finished.current=true;onDone();},[onDone]);
  useEffect(()=>{
    const timer=window.setTimeout(()=>videoUnavailable?finish():setVideoUnavailable(true),videoUnavailable?4800:15000);
    const onKey=(event:KeyboardEvent)=>{
      if(event.key==="Escape" || event.key==="Enter" || event.key===" "){event.preventDefault();finish();}
    };
    document.addEventListener("keydown",onKey);
    return ()=>{window.clearTimeout(timer);document.removeEventListener("keydown",onKey);};
  },[finish,videoUnavailable]);
  return <div className="yzg-cutscene" role="dialog" aria-modal="true" aria-label="Yanzen membuka pintu air">
    <div className="yzg-cutscene-stage">
      {!videoUnavailable && <video ref={videoRef} className="yzg-cutscene-video" autoPlay muted={muted} playsInline preload="auto" onTimeUpdate={event=>setPlaybackSeconds(event.currentTarget.currentTime)}
        src="/game/assets/cutscenes/sluice-gate.mp4" onEnded={finish} onError={()=>setVideoUnavailable(true)}
        aria-label="Adegan sinematik Yanzen membuka pintu air di Pasirluyu"/>}
      {videoUnavailable && <svg viewBox="0 0 320 180" role="img" aria-label="Yanzen memutar roda pintu air hingga air mengalir kembali" preserveAspectRatio="xMidYMid meet">
        <defs><linearGradient id="sluice-sky" x2="0" y2="1"><stop stopColor="#a3c7a2"/><stop offset="1" stopColor="#d9d6a0"/></linearGradient>
          <pattern id="sluice-stone" width="22" height="14" patternUnits="userSpaceOnUse"><rect width="22" height="14" fill="#9c9b7a"/><path d="M0 0H22M0 7H11M11 7V14" stroke="#7b826a" strokeWidth="2"/></pattern>
        </defs>
        <rect width="320" height="180" fill="url(#sluice-sky)"/>
        <path d="M0 60L45 28 97 58 153 29 208 52 259 30 320 56V120H0Z" fill="#5e8364"/>
        <path d="M0 91Q71 75 139 91T320 83V180H0" fill="#659e75"/>
        <rect y="125" width="320" height="55" fill="#4d918e"/>
        <g className="yzg-cutscene-stream" stroke="#d1ebe1" strokeWidth="3" strokeLinecap="square"><path d="M3 146H69M130 150H198M231 142H307M58 168H145M196 173H289"/></g>
        <rect x="140" y="65" width="28" height="95" fill="url(#sluice-stone)"/><rect x="233" y="65" width="34" height="95" fill="url(#sluice-stone)"/>
        <rect x="163" y="58" width="72" height="13" fill="#644c34"/>
        <rect x="168" y="71" width="61" height="81" fill="#323f3f"/>
        <g className="yzg-cutscene-gate">
          <rect x="172" y="76" width="53" height="80" fill="#986e45" stroke="#4a3b2b" strokeWidth="5"/>
          <path d="M177 91H220M177 108H220M177 125H220M190 80V151M210 80V151" stroke="#59402d" strokeWidth="4"/>
        </g>
        <g className="yzg-cutscene-waterfall"><rect x="174" y="86" width="49" height="72" fill="#77c5cc" opacity=".85"/>
          <path d="M183 89V158M195 94V167M210 84V156" stroke="#e4f3eb" strokeWidth="4" strokeDasharray="9 6"/></g>
        <path d="M4 142H130V154H4ZM263 140H316V153H263" fill="#777b62"/>
        <g className="yzg-cutscene-yanzen">
          <ellipse cx="103" cy="151" rx="16" ry="4" fill="#344c3e" opacity=".45"/>
          <rect x="95" y="127" width="8" height="21" fill="#344b59"/><rect x="105" y="127" width="8" height="21" fill="#344b59"/>
          <rect x="92" y="100" width="23" height="32" fill="#ece2ba" stroke="#304b46" strokeWidth="4"/>
          <rect x="94" y="78" width="20" height="25" fill="#e8ad83"/>
          <path d="M91 84L91 72 103 66 116 72 117 86 111 80 105 79 98 84Z" fill="#282d30"/>
          <path d="M112 104L130 94 134 98 119 115" fill="#ece2ba" stroke="#5b6551" strokeWidth="2"/>
        </g>
        <rect x="125" y="83" width="33" height="9" fill="#72604a"/>
        <g className="yzg-cutscene-wheel" transform-origin="140px 88px">
          <circle cx="140" cy="88" r="15" fill="none" stroke="#654c2d" strokeWidth="5"/>
          <path d="M140 73V103M125 88H155M130 78L150 98M150 78L130 98" stroke="#b78d55" strokeWidth="3"/>
          <circle cx="140" cy="88" r="5" fill="#4b3b2e"/>
        </g>
      </svg>}
      {videoUnavailable && <div className="yzg-cutscene-caption"><strong>Pintu air di Pasirluyu</strong>
        <p>Yanzen memutar roda tua itu. Kayunya berderit, lalu air kembali mengalir ke hilir.</p></div>}
    </div>
    {!videoUnavailable && <div className="yzg-cutscene-readalong" aria-live="off"><small>KENANGAN · PINTU AIR PASIRLUYU</small><strong>{cinematicLine}</strong></div>}
    <div className="yzg-cutscene-actions">
      {!videoUnavailable && <button type="button" onClick={()=>{setMuted(x=>!x);if(videoRef.current?.paused)void videoRef.current.play().catch(()=>{});}}>
        {muted?"Aktifkan suara":"Matikan suara"}</button>}
      {!videoUnavailable && <button type="button" onClick={()=>{const player=videoRef.current as (HTMLVideoElement & {webkitEnterFullscreen?:()=>void})|null;if(!player)return; if(typeof player.requestFullscreen==="function")void player.requestFullscreen().catch(()=>player.webkitEnterFullscreen?.());else player.webkitEnterFullscreen?.();}}>Layar penuh</button>}
      <button type="button" className="yzg-cutscene-skip" onClick={finish}>Lewati adegan</button>
    </div>
  </div>;
}
