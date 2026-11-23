/** Runtime HD building frames — 320x320 source for ~100–160px game placement.
 * Source masters are preserved separately in the asset source manifest.
 * Positions, NPC roles, collisions and progression remain in model.ts.
 */
import {ROOM_FURNITURE,ROOM_PROJECTION,furnitureScreenRect,type FurnitureCrop,type RoomKind} from "./world-layout";
export const HD_EXTERIOR_PATH="/game/assets/hd/housing-market-hd.webp";
export const HD_INTERIOR_PATH="/game/assets/hd/housing-interiors-hd.webp";
export const HD_FRAME_SIZE=320;
export const HD_EXTERIOR_FRAMES={
  yanzenHouse:0,yanzenShed:1,residentInggit:2,residentAyu:3,
  ayuGeneralStore:4,widiFishingShop:5
} as const;
export type HDSprite={frame:number;width:number;height:number;footOffset:number};
const sprites:Record<string,HDSprite>={
  // footOffset compensates transparent bottom padding in each 320px atlas cell.
  // House moved +6px and resized to stay fully inside the top of the field map.
  "rumah-yanzen":{frame:0,width:100,height:100,footOffset:6},
  "gudang-kayu":{frame:1,width:104,height:104,footOffset:14},
  "fasad-inggit":{frame:2,width:108,height:108,footOffset:15},
  "fasad-ayu":{frame:3,width:108,height:108,footOffset:18},
  "lapak-benih":{frame:4,width:146,height:146,footOffset:6},
  "lapak-pancing":{frame:5,width:132,height:132,footOffset:4},
};
export function exteriorHDSprite(asset:string):HDSprite|null {
  return sprites[asset]??null;
}
export function drawHDSprite(ctx:CanvasRenderingContext2D,image:CanvasImageSource,
 frame:number,x:number,y:number,width:number,height:number){
  ctx.save();ctx.imageSmoothingEnabled=true;
  const sx=(frame%3)*HD_FRAME_SIZE,sy=Math.floor(frame/3)*HD_FRAME_SIZE;
  if(frame===5)ctx.drawImage(cleanWidiSource(image),0,0,320,320,x,y,width,height);
  else ctx.drawImage(image,sx,sy,HD_FRAME_SIZE,HD_FRAME_SIZE,x,y,width,height);
  ctx.restore();
}
export type HDRoom=RoomKind;
/** Full floor stays below the avatar. Furniture is divided into independent
 * sprites, each sorted against the PLAYER'S FEET, never as one giant overlay.
 */
export function drawHDInterior(ctx:CanvasRenderingContext2D,image:CanvasImageSource,
 room:HDRoom,evening=false,layer:"all"|"base"="all"){
  const base=room==="home"?0:2,p=ROOM_PROJECTION;
  ctx.save();ctx.imageSmoothingEnabled=true;
  ctx.fillStyle="#24282a";ctx.fillRect(0,0,480,320);
  ctx.drawImage(image,(base%2)*320,Math.floor(base/2)*320,320,320,
    p.x,p.y,p.width,p.height);
  if(layer==="all")for(const piece of ROOM_FURNITURE[room])
    drawHDInteriorPiece(ctx,image,room,piece);
  if(evening){ctx.fillStyle="rgba(16,24,42,0.23)";
    ctx.fillRect(p.x,p.y,p.width,p.height);}
  ctx.restore();
}
export function drawHDInteriorPiece(ctx:CanvasRenderingContext2D,image:CanvasImageSource,
 room:HDRoom,piece:FurnitureCrop){
  const rect=furnitureScreenRect(piece),frame=room==="home"?1:3;
  ctx.drawImage(image,(frame%2)*320+piece.x,Math.floor(frame/2)*320+piece.y,
    piece.width,piece.height,rect.x,rect.y,rect.width,rect.height);
}
/** Canvas fallback uses the exact same foot-depth ordering as Phaser.
 * The behind pass draws before avatar; foreground draws afterwards.
 */
export function drawHDInteriorProps(ctx:CanvasRenderingContext2D,image:CanvasImageSource,
 room:HDRoom,avatarFeetY:number,pass:"behind"|"front"){
  ctx.save();ctx.imageSmoothingEnabled=true;
  for(const piece of ROOM_FURNITURE[room]){
    const inFront=furnitureScreenRect(piece).footY>=avatarFeetY;
    if(inFront===(pass==="front"))drawHDInteriorPiece(ctx,image,room,piece);
  }
  ctx.restore();
}

/**
 * Image generation placed a pale checkerboard behind Widi's shop, unlike the
 * other transparent exteriors. Isolate its dominant connected foreground in a
 * one-time 320x320 canvas pass; never upload a checkerboard as a game backdrop.
 * This keeps the artwork, sign, merchandise and antenna intact.
 */
const cleanCache=new WeakMap<object,HTMLCanvasElement>();
export function cleanWidiSource(image:CanvasImageSource):HTMLCanvasElement{
  const cacheKey=image as object;
  const old=cleanCache.get(cacheKey);if(old)return old;
  const size=HD_FRAME_SIZE,total=size*size;
  const c=document.createElement("canvas");c.width=size;c.height=size;
  const ctx=c.getContext("2d",{willReadFrequently:true});
  if(!ctx)throw new Error("Canvas required for Widi's pixel transparency");
  ctx.drawImage(image,2*size,size,size,size,0,0,size,size);
  const pix=ctx.getImageData(0,0,size,size),p=pix.data;
  const fg=new Uint8Array(total),labels=new Int32Array(total);
  const queue=new Uint32Array(total);
  for(let i=0;i<total;i++){
    const j=i*4,r=p[j],g=p[j+1],b=p[j+2],alpha=p[j+3];
    const mn=Math.min(r,g,b),mx=Math.max(r,g,b);
    if(alpha>180 && !(mn>215 && mx-mn<20))fg[i]=1;
  }
  let label=0,best=0,bestSize=0;
  for(let i=0;i<total;i++){
    if(!fg[i]||labels[i])continue;
    label++;let head=0,tail=0;queue[tail++]=i;labels[i]=label;
    while(head<tail){
      const cur=queue[head++],x=cur%size,y=Math.floor(cur/size);
      for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
        if(!dx&&!dy)continue;
        const xx=x+dx,yy=y+dy;
        if(xx<0||yy<0||xx>=size||yy>=size)continue;
        const n=yy*size+xx;
        if(!fg[n]||labels[n])continue;
        labels[n]=label;queue[tail++]=n;
      }
    }
    if(tail>bestSize){best=label;bestSize=tail;}
  }
  if(bestSize>1000){
    const support=new Uint8Array(total);
    for(let i=0;i<total;i++)if(labels[i]===best){
      const x=i%size,y=Math.floor(i/size);
      for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++){
        const xx=x+dx,yy=y+dy;
        if(xx>=0&&yy>=0&&xx<size&&yy<size)support[yy*size+xx]=1;
      }
    }
    for(let i=0;i<total;i++)if(!support[i])p[i*4+3]=0;
    ctx.putImageData(pix,0,0);
  }
  cleanCache.set(cacheKey,c);
  return c;
}
