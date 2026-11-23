/** One-source, six-file Yanzen farmhouse contract.
 * All furniture is a separately generated full-sprite WebP, NEVER a crop
 * from the old 2x2 interior atlas. Art lives outside saved gameplay state.
 */
export const FARMHOUSE_NATIVE_PATHS={
  roomBase:"/game/assets/farmhouse-native/v1/room-base.webp",
  exterior:"/game/assets/farmhouse-native/v1/house-exterior.webp",
  bed:"/game/assets/farmhouse-native/v1/bed.webp",
  chest:"/game/assets/farmhouse-native/v1/chest.webp",
  bookshelf:"/game/assets/farmhouse-native/v1/shelf.webp",
  "computer-desk":"/game/assets/farmhouse-native/v1/workdesk.webp"
} as const;
export type FarmhouseAssetId=keyof typeof FARMHOUSE_NATIVE_PATHS;
export type FarmhouseNativeArt=Partial<Record<FarmhouseAssetId,HTMLImageElement>>;
export const FARMHOUSE_EXTERIOR={width:112,height:85,footOffset:0} as const;
/** The source illustration is 1:1, avoiding any distortion on projection. */
export const FARMHOUSE_ROOM_BASE={x:132,y:69,width:232,height:232} as const;
export function isFarmhouseArtReady(a?:FarmhouseNativeArt):a is Record<FarmhouseAssetId,HTMLImageElement>{
  return !!a && (Object.keys(FARMHOUSE_NATIVE_PATHS) as FarmhouseAssetId[])
    .every(k=>!!a[k]?.complete && (a[k]?.naturalWidth??0)>0);
}
export function drawFarmhouseRoomBase(ctx:CanvasRenderingContext2D,image:CanvasImageSource,evening=false){
  ctx.save();
  ctx.fillStyle="#22292a";ctx.fillRect(0,0,480,320);
  ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality="high";
  const p=FARMHOUSE_ROOM_BASE;
  ctx.drawImage(image,p.x,p.y,p.width,p.height);
  if(evening){
    ctx.fillStyle="rgba(18,27,45,.24)";
    ctx.fillRect(p.x,p.y,p.width,p.height);
  }
  ctx.restore();
}
