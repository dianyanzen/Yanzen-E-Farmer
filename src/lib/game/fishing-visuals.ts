/** Fishing graphics are measured in the same 20px WORLD tiles as Yanzen.
 * A single geometry model drives Phaser and fallback Canvas; no viewport-centered
 * rod, float, popup or DOM overlay is allowed.
 */
import type {Direction,FishingOutcome,RiverFishId} from "./model";
import type {FishingPhase} from "./fishing-session";

export type FishingVisual={
  session?:{phase:FishingPhase;elapsed:number};
  popup?:{outcome:FishingOutcome;species?:RiverFishId;elapsed:number};
};
export type FishingPoint={x:number;y:number};
export const FISHING_TILE_PX=20;
export const FISHING_CAST_DURATION_MS=560;
export const FISHING_REEL_DURATION_MS=1750;

const clamp=(v:number,low=0,high=1)=>Math.max(low,Math.min(high,v));
const lerp=(a:number,b:number,t:number)=>a+(b-a)*t;
export function fishingPopupLabel(outcome:FishingOutcome,species?:RiverFishId):string{
  if(outcome==="caught")return species==="lele"?"LELE +1":species==="nila"?"NILA +1":"DAPAT IKAN!";
  return ({escaped:"IKAN LEPAS",early:"TERLALU CEPAT",late:"TERLAMBAT",
    no_bite:"BELUM ADA IKAN",cancelled:"KAIL DIANGKAT"} as Record<Exclude<FishingOutcome,"caught">,string>)[outcome];
}
/** Returned coordinates are WORLD pixels, never viewport CSS pixels. */
export function fishingGeometry(player:{x:number;y:number;dir:Direction},
  phase:FishingPhase,elapsed:number){
  const {dir}=player,age=Math.max(0,elapsed),T=FISHING_TILE_PX;
  const cx=(player.x+.5)*T,cy=(player.y+.5)*T;
  const axes={up:{x:0,y:-1},down:{x:0,y:1},left:{x:-1,y:0},right:{x:1,y:0}}[dir];
  const water={x:cx+axes.x*T,y:cy+axes.y*T};
  const cast=phase==="casting"?clamp(age/FISHING_CAST_DURATION_MS):1;
  const pull=phase==="reeling"?clamp(age/FISHING_REEL_DURATION_MS):0;
  const tug=phase==="bite"?Math.sin(age/55)*1.25:0;
  // Swing the body's visible arm and the held pole together (Harvest Moon-style).
  const armLift=phase==="casting"?(1-cast)*-5:
    phase==="reeling"?-Math.sin(pull*Math.PI)*4:
    phase==="bite"?tug:Math.sin(age/950)*.5;
  const shoulder={x:cx+(dir==="left"?-5:dir==="right"?5:2),y:cy-4};
  const hand={x:shoulder.x+(dir==="left"?-2:dir==="right"?2:1),
    y:shoulder.y+4+armLift};
  const tipOffset={up:{x:4,y:-21},down:{x:12,y:7},
    left:{x:-18,y:-17},right:{x:18,y:-17}}[dir];
  const tip={x:hand.x+tipOffset.x*(.35+.65*cast),
    y:hand.y+tipOffset.y-(1-cast)*10-(phase==="reeling"?6*pull:0)};
  const lead=phase==="casting"?clamp((cast-.1)/.9):phase==="reeling"?1-pull*.83:1;
  const float={x:lerp(tip.x,water.x,lead),
    y:lerp(tip.y,water.y,lead)+(phase==="waiting"?Math.sin(age/360)*.65:
      phase==="bite"?2.2+Math.sin(age/70)*1.4:0)};
  const bodyShift=phase==="casting"?Math.round(-Math.sin(cast*Math.PI)*2):
    phase==="reeling"?Math.round(Math.sin(pull*Math.PI*3)*1):phase==="bite"?Math.round(tug/1.25):0;
  const spriteFrame=phase==="casting"?cast<.32?0:cast<.73?2:1:
    phase==="reeling"?Math.floor(age/130)%3:phase==="bite"?Math.floor(age/100)%3:1;
  return {center:{x:cx,y:cy},shoulder,hand,tip,float,water,bodyShift,spriteFrame,
    showFloat:phase!=="casting"||cast>.18,
    splash:phase==="bite"||phase==="casting"&&cast>.82,
    ripple:phase==="waiting"||phase==="bite",
    rippleRadius:3+Math.sin(age/350)*.8,
    rodLength:Math.hypot(tip.x-hand.x,tip.y-hand.y)};
}
export function fishingPopupPosition(player:{x:number;y:number},elapsed:number){
  const t=clamp(elapsed/250);
  return {x:(player.x+.5)*FISHING_TILE_PX,
    y:player.y*FISHING_TILE_PX-22-Math.sin(t*Math.PI/2)*4,
    alpha:clamp(elapsed/150)*clamp((2900-elapsed)/420),
  };
}
