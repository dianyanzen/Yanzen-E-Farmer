/** Runtime HD building frames — 320x320 source for ~100–160px game placement.
 * Source masters are preserved separately in the asset source manifest.
 * Positions, NPC roles, collisions and progression remain in model.ts.
 */
export const HD_EXTERIOR_PATH="/game/assets/hd/housing-market-hd.webp";
export const HD_INTERIOR_PATH="/game/assets/hd/housing-interiors-hd.webp";
export const HD_FRAME_SIZE=320;
export const HD_EXTERIOR_FRAMES={
  yanzenHouse:0,yanzenShed:1,residentInggit:2,residentAyu:3,
  ayuGeneralStore:4,widiFishingShop:5
} as const;
export type HDSprite={frame:number;width:number;height:number};
const sprites:Record<string,HDSprite>={
  "rumah-yanzen":{frame:0,width:124,height:124},
  "gudang-kayu":{frame:1,width:104,height:104},
  "fasad-inggit":{frame:2,width:108,height:108},
  "fasad-ayu":{frame:3,width:108,height:108},
  "lapak-benih":{frame:4,width:154,height:154},
  "lapak-pancing":{frame:5,width:140,height:140},
};
export function exteriorHDSprite(asset:string):HDSprite|null {
  return sprites[asset]??null;
}
export function drawHDSprite(ctx:CanvasRenderingContext2D,image:CanvasImageSource,
 frame:number,x:number,y:number,width:number,height:number){
  ctx.save();ctx.imageSmoothingEnabled=true;
  const sx=(frame%3)*HD_FRAME_SIZE,sy=Math.floor(frame/3)*HD_FRAME_SIZE;
  ctx.drawImage(image,sx,sy,HD_FRAME_SIZE,HD_FRAME_SIZE,x,y,width,height);
  ctx.restore();
}
export type HDRoom="home"|"shed";
/** Four independent 320px interior frames in a 2x2 atlas:
 * house base, house furniture, shed base, shed furniture.
 * Model collision and interactive furniture hotspots do not move.
 */
export function drawHDInterior(ctx:CanvasRenderingContext2D,image:CanvasImageSource,
 room:HDRoom,evening=false){
  const base=room==="home"?0:2;
  const active=base+1;
  ctx.save();ctx.imageSmoothingEnabled=true;
  ctx.fillStyle="#24282a";ctx.fillRect(0,0,480,320);
  // These are full interior floor-plan assets, not tiny atlas placeholders.
  const x=132,y=63,w=232,h=244;
  const draw=(frame:number)=>{
    const sourceX=(frame%2)*320,sourceY=Math.floor(frame/2)*320;
    ctx.drawImage(image,sourceX,sourceY,320,320,x,y,w,h);
  };
  draw(base);draw(active);
  if(evening){ctx.fillStyle="rgba(16,24,42,0.23)";ctx.fillRect(x,y,w,h);}
  ctx.restore();
}
