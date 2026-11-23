/** Measured, versioned avatar scale contract shared by Canvas and Phaser.
 * Bounds are >50 alpha measured from the original source sheets.
 * Frame dimensions contain transparent padding; body height ≠ frame height.
 */
import frames from "./character-frame-bounds.json";
export const WORLD_TILE_PX = 20;
export const PLAYER_FEET_PIXEL = 18;
export const PLAYER_BODY_TARGET_PX = 30;
export type PlayerSheet = keyof typeof frames.sheets;
export function playerFrameBounds(sheet:PlayerSheet,frame:number){
  const spec=frames.sheets[sheet];
  const count=spec.verticalBounds.length;
  const index=((Math.trunc(frame)%count)+count)%count;
  const raw=spec.verticalBounds[index];
  if(!raw || raw.length!==2)throw new Error("Missing character alpha metrics: "+sheet+"/"+index);
  const pair:readonly [number,number]=[raw[0],raw[1]];
  return {frame:index,top:pair[0],bottom:pair[1],
    height:pair[1]-pair[0], frameWidth:spec.frameWidth,frameHeight:spec.frameHeight};
}
/** Top-left sprite Y for *all* animation states with an identical feet baseline.
 * The original canvas renderer uses 20px tiles and bottom image pixels as feet.
 */
export function playerSpriteTopY(tileY:number,sheet:PlayerSheet,frame:number,animationShift=0){
  return tileY*WORLD_TILE_PX + PLAYER_FEET_PIXEL - playerFrameBounds(sheet,frame).bottom+animationShift;
}
/** Source physique is intentionally not stretched per animation state:
 * the measured body height varies 28..33px because of animation poses.
 */
export function isPlausiblePlayerFrame(sheet:PlayerSheet,frame:number){
  const {height}=playerFrameBounds(sheet,frame);
  return height>=PLAYER_BODY_TARGET_PX-3 && height<=PLAYER_BODY_TARGET_PX+3;
}
