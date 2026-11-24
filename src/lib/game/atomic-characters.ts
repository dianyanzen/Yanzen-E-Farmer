/** One independent SVG per character pose; no sheet/atlas runtime references.
 * Both Canvas and Phaser use identical world foot anchors across frame sizes.
 * Extraction of legacy animation art still requires later artistic review.
 */
import index from "./atomic-frame-metrics.json";

export type Cardinal = "down"|"left"|"right"|"up";
export type Motion = "idle"|"walk"|"run"|"turn"|"hoe"|"seed"|"water"|"harvest";
export type AtomicFrame = {
  key:string;
  url:string;
  width:number;
  height:number;
  alphaBounds:readonly [number,number,number,number];
  footX:number;
  footY:number;
};

export const PLAYER_WORLD_FOOT_OFFSET = 18;
export const PLAYER_BODY_REFERENCE_HEIGHT = 30;
export const ATOMIC_FRAMES = index.frames as unknown as readonly AtomicFrame[];
const frameByKey:ReadonlyMap<string,AtomicFrame> = new Map(ATOMIC_FRAMES.map(frame=>[frame.key,frame]));

export function atomicKey(id:string,motion:Motion,lane:string,frame:number):string{
  return id+":"+motion+":"+lane+":"+String(Math.max(0,Math.trunc(frame))).padStart(3,"0");
}
export function atomicCharacterFrame(id:string,motion:Motion,lane:string,frame:number):AtomicFrame{
  const key=atomicKey(id,motion,lane,frame);
  const selected=frameByKey.get(key);
  if(!selected)throw new Error("Missing independent character frame: "+key);
  return selected;
}
export function atomicFramePosition(frame:AtomicFrame,tileX:number,tileY:number,shiftX=0,shiftY=0){
  const x=Math.round(tileX*20+10-frame.footX+shiftX);
  const y=Math.round(tileY*20+PLAYER_WORLD_FOOT_OFFSET-frame.footY+shiftY);
  return {x,y,footX:tileX*20+10,footY:tileY*20+PLAYER_WORLD_FOOT_OFFSET};
}
export function atomicVisibleHeight(frame:AtomicFrame):number{
  return frame.alphaBounds[3]-frame.alphaBounds[1];
}
export function isNominalStance(frame:AtomicFrame){
  return Math.abs(atomicVisibleHeight(frame)-PLAYER_BODY_REFERENCE_HEIGHT)<=3;
}
