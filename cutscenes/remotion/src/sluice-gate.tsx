import React from "react";
import {AbsoluteFill, Img, interpolate, Easing, staticFile, useCurrentFrame, Html5Audio} from "remotion";
// All animation comes from the Remotion frame clock; render is deterministic.
const clamp={extrapolateLeft:"clamp" as const,extrapolateRight:"clamp" as const};
const tween=(frame:number,a:number,b:number,start=0,end=1)=>interpolate(frame,[a,b],[start,end],{...clamp,easing:Easing.inOut(Easing.cubic)});
const Color={sky:"#78918b",forest:"#304d42",water:"#63a7a7",wood:"#9b7043",dark:"#132923"};
function Character({frame}:{frame:number}){
  const lean=tween(frame,84,129,0,12)-tween(frame,158,193,0,12);
  const arm=frame>120?1:0;
  return <div style={{position:"absolute",left:268+lean,top:260,width:24,height:32,transform:"scale(5)",transformOrigin:"top left",overflow:"hidden",imageRendering:"pixelated"}}>
   <Img src={staticFile("yanzen-actor.png")} style={{position:"absolute",width:144,height:192,top:0,left:-24*arm,imageRendering:"pixelated"}} />
  </div>;
}
function Scene({frame}:{frame:number}){
 const lift=tween(frame,172,253,0,-138),wheel=tween(frame,87,164,0,245);
 const flow=tween(frame,202,268,0,1),shake=frame>=176&&frame<195?Math.sin(frame*4)*3*(1-(frame-176)/19):0;
 const camera=frame<85?1+tween(frame,0,85,0,.13):frame<232?1.13+tween(frame,90,230,0,.1):1.23-tween(frame,240,325,0,.18);
 const pan=frame<166?tween(frame,0,166,-48,-30):tween(frame,175,320,-30,0);
 const night=tween(frame,0,140,.32,.45)-tween(frame,195,325,0,.3);
 return <div style={{width:"100%",height:"100%",overflow:"hidden",background:Color.sky,position:"relative"}}>
  <div style={{width:960,height:540,transform:`translate(${pan+shake}px,${shake}px) scale(${camera})`,transformOrigin:"50% 55%",position:"absolute"}}>
    <svg viewBox="0 0 960 540" style={{position:"absolute",inset:0,width:"100%",height:"100%",imageRendering:"pixelated"}}>
      <defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#9cb4a8"/><stop offset="1" stopColor="#cad3a9"/></linearGradient>
        <pattern id="bricks" width="56" height="34" patternUnits="userSpaceOnUse"><rect width="56" height="34" fill="#8d8f77"/><path d="M0 0H56M28 0V17M0 17H56M0 17V34M56 17V34" fill="none" stroke="#727a66" strokeWidth="5"/></pattern>
        <linearGradient id="water" x2="0" y2="1"><stop stopColor="#c6dbbf"/><stop offset=".4" stopColor="#78c0bc"/><stop offset="1" stopColor="#386f75"/></linearGradient>
      </defs>
      <rect width="960" height="540" fill="url(#sky)"/><path d="M0 212L125 114 248 170 346 122 510 202 648 124 780 180 960 95V385H0Z" fill="#587a67"/>
      <path d="M0 262Q135 184 286 255T612 234T960 221V417H0Z" fill={Color.forest}/>
      <path d="M0 401Q278 378 402 422T960 387V540H0Z" fill="#496d55"/>
      <rect x="0" y="423" width="960" height="117" fill="#4b9298"/>
      <path d="M0 440Q210 426 430 450T960 435" fill="none" stroke="#aed5c9" strokeWidth="10" opacity=".55"/>
      <rect x="391" y="215" width="82" height="258" fill="url(#bricks)" stroke="#586751" strokeWidth="6"/>
      <rect x="718" y="215" width="87" height="258" fill="url(#bricks)" stroke="#586751" strokeWidth="6"/>
      <rect x="453" y="225" width="267" height="238" fill="#243d3a"/>
      <rect x="438" y="195" width="301" height="36" fill="#5a4a37"/>
      <rect x="92" y="415" width="270" height="35" fill="#797b60"/><rect x="805" y="411" width="155" height="35" fill="#797b60"/>
      <g transform={`translate(0,${lift})`}><rect x="475" y="251" width="222" height="206" fill="#8e603b" stroke="#412f27" strokeWidth="14"/>
       <path d="M484 286H687M484 339H687M484 392H687M528 259V452M645 259V452" stroke="#563c2b" strokeWidth="13"/></g>
      <g opacity={flow}><rect x="474" y="287" width="221" height="205" fill="url(#water)"/>
        {Array.from({length:9},(_,i)=><path key={i} d={`M${494+i*24} ${292+(frame*13+i*37)%54}v${100+i%3*24}`} stroke="#d9ede3" strokeWidth="11" opacity={.5+i%3*.14}/>)}</g>
      <rect x="294" y="305" width="100" height="24" fill="#615641"/>
      <g transform={`rotate(${wheel} 349 307)`}><circle cx="349" cy="307" r="52" stroke="#755634" strokeWidth="16" fill="#3d4439"/>
       <path d="M349 251V363M293 307H405M312 270L387 344M388 270L311 345" stroke="#c39e5c" strokeWidth="11"/><circle cx="349" cy="307" r="17" fill="#a98751"/></g>
      <path d="M0 482H360M770 490H960" fill="none" stroke="#9da88b" strokeWidth="15"/>
    </svg>
    <Character frame={frame}/>
    <div style={{position:"absolute",inset:0,background:"#122b2c",opacity:night,pointerEvents:"none"}} />
  </div>
  <div style={{position:"absolute",inset:0,pointerEvents:"none",background:"radial-gradient(ellipse at 50% 45%,transparent 30%,#0b181b99 100%)"}}/>
 </div>;
}
const caption=(frame:number)=>frame<70?["PASIRLUYU","Saluran yang lama terdiam"]:frame<166?["MOMEN PENENTU","Roda tua itu akhirnya bergerak"]:frame<261?["AIR KEMBALI MENGALIR","Dari pintu air menuju kebun warga"]:["SATU TINDAKAN KECIL","Membawa perubahan ke hilir"];
export function SluiceGateFilm(){
 const frame=useCurrentFrame();const lines=caption(frame);
 const alpha=frame<12?tween(frame,0,12):frame>310?tween(frame,310,330,1,0):1;
 const fade=tween(frame,0,20,1,0);
 return <AbsoluteFill style={{background:Color.dark,color:"#fff2d3",fontFamily:"Georgia, serif"}}>
   <Scene frame={frame}/>
   <AbsoluteFill style={{pointerEvents:"none",background:`rgba(2,10,8,${fade})`}}/>
   <div style={{position:"absolute",left:56,right:56,bottom:43,opacity:alpha,textShadow:"0 3px 12px #000,0 1px 2px #000"}}>
     <div style={{font:"bold 17px Arial, sans-serif",letterSpacing:5,color:"#eac88f"}}>{lines[0]}</div>
     <div style={{fontSize:33,fontWeight:700,lineHeight:1.3,marginTop:9}}>{lines[1]}</div>
   </div>
   <div style={{position:"absolute",left:48,right:48,top:36,height:4,background:"#f5e6bf",opacity:.45}}/>
   <div style={{position:"absolute",left:48,right:48,bottom:21,height:4,background:"#f5e6bf",opacity:.3}}/>
   <Html5Audio src={staticFile("kanal.wav")} volume={0.42}/>
 </AbsoluteFill>;
}
