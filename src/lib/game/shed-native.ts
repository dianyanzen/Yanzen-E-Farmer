/** YZ Farm Life shed: six independent, individually generated textures.
 * Master files are never cut into props or assembled into an atlas.
 */
export const SHED_NATIVE_PATHS={
  roomBase:"/game/assets/shed-native/v1/room-base.webp",
  exterior:"/game/assets/shed-native/v1/exterior.webp",
  "tools-shelves":"/game/assets/shed-native/v1/tools-shelves.webp",
  workbench:"/game/assets/shed-native/v1/workbench.webp",
  "produce-crates":"/game/assets/shed-native/v1/produce-crates.webp",
  "irrigation-rack":"/game/assets/shed-native/v1/irrigation-rack.webp"
} as const;
export type ShedAssetId=keyof typeof SHED_NATIVE_PATHS;
export type ShedNativeArt=Partial<Record<ShedAssetId,HTMLImageElement>>;
export const SHED_EXTERIOR={width:104,height:94,footOffset:0} as const;
export const SHED_ROOM_BASE={x:132,y:69,width:232,height:232} as const;
export function isShedArtReady(art?:ShedNativeArt):art is Record<ShedAssetId,HTMLImageElement>{
  return !!art && (Object.keys(SHED_NATIVE_PATHS) as ShedAssetId[])
    .every(k=>!!art[k]?.complete && (art[k]?.naturalWidth??0)>0);
}
export function drawShedRoomBase(ctx:CanvasRenderingContext2D,
 image:CanvasImageSource,evening=false){
  ctx.save();
  ctx.fillStyle="#22292a";ctx.fillRect(0,0,480,320);
  ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality="high";
  const b=SHED_ROOM_BASE;
  ctx.drawImage(image,b.x,b.y,b.width,b.height);
  if(evening){
    ctx.fillStyle="rgba(19,29,48,.24)";
    ctx.fillRect(b.x,b.y,b.width,b.height);
  }
  ctx.restore();
}
