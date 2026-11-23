/** YZ Farm Life — generated modular housing V2.
 * Atlas frame size: 48px; 4 columns x 2 rows. Source art by game owner.
 * Render only visual pixels: collisions, quest state, transitions and saves stay
 * authoritative in model.ts. The original full-resolution masters are not replaced.
 */
export const HOUSING_ATLAS_PATH="/game/assets/locations/yanzen/housing-atlas-v2.png";
export const HOUSING_TILE=48;
export const HOUSING_FRAMES={
  houseExterior:0,houseBase:1,houseFurniture:2,
  shedExterior:3,shedBase:4,shedFurniture:5,
  residentA:6,residentB:7,
} as const;

export type HousingRoom="home"|"shed";
export type HousingSprite={frame:number;width:number;height:number};
/** Test replacements for four existing buildings; do not change coordinates. */
export function exteriorHousingSprite(asset:string):HousingSprite|null {
  switch(asset){
    case "rumah-yanzen":return {frame:HOUSING_FRAMES.houseExterior,width:78,height:70};
    case "gudang-kayu":return {frame:HOUSING_FRAMES.shedExterior,width:67,height:68};
    case "fasad-inggit":return {frame:HOUSING_FRAMES.residentA,width:106,height:73};
    case "fasad-ayu":return {frame:HOUSING_FRAMES.residentB,width:106,height:73};
    default:return null;
  }
}
export function housingFrameSource(frame:number){
  return {x:(frame%4)*HOUSING_TILE,y:Math.floor(frame/4)*HOUSING_TILE,
    w:HOUSING_TILE,h:HOUSING_TILE};
}
export function drawHousingFrame(ctx:CanvasRenderingContext2D,source:CanvasImageSource,
 frame:number,x:number,y:number,width:number,height:number){
  const r=housingFrameSource(frame);
  ctx.drawImage(source,r.x,r.y,r.w,r.h,x,y,width,height);
}
/** Player inside: render background and independent, repositionable active furniture.
 * The player is painted afterwards, so furniture cannot make the character vanish.
 */
export function drawHousingInterior(ctx:CanvasRenderingContext2D,
 source:CanvasImageSource,room:HousingRoom,evening=false){
  const base=room==="home"?HOUSING_FRAMES.houseBase:HOUSING_FRAMES.shedBase;
  const furniture=room==="home"?HOUSING_FRAMES.houseFurniture:HOUSING_FRAMES.shedFurniture;
  ctx.save();
  ctx.imageSmoothingEnabled=false;
  ctx.fillStyle="#24282a";ctx.fillRect(0,0,480,320);
  ctx.fillStyle="#533d2e";ctx.fillRect(136,76,228,232);
  drawHousingFrame(ctx,source,base,140,80,220,220);
  drawHousingFrame(ctx,source,furniture,140,80,220,220);
  if(evening){ctx.fillStyle="rgba(20,29,52,0.24)";ctx.fillRect(140,80,220,220);}
  ctx.restore();
}
