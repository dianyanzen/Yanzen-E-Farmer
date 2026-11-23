/** Pilot farmhouse art direction.
 * Base is intentionally furniture-free so walkable floor and collision
 * describe the same space. HD furniture remains on independent feet layers.
 * This renderer is shared by Phaser and the Canvas fallback.
 */
export const FARMHOUSE_VISUAL_VERSION = "yanzen-farmhouse-minimal-v1";

function rect(c:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,color:string){
  c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));
}
export function drawMinimalFarmhouseBase(
  ctx:CanvasRenderingContext2D,evening=false
){
  ctx.save();ctx.imageSmoothingEnabled=false;
  rect(ctx,0,0,480,320,"#232827");
  // Low-key shadow under the whole room; clear outer bounds.
  rect(ctx,123,69,254,238,"#111b19");
  rect(ctx,127,68,246,232,"#4a3025");
  rect(ctx,133,74,234,217,"#875131");
  // Wooden interior perimeter and warm plaster wall.
  rect(ctx,137,78,226,50,"#c59b70");
  rect(ctx,139,80,222,43,"#e3c49a");
  for(let x=147;x<=345;x+=38){
    rect(ctx,x,80,4,43,"#bc8657");
    rect(ctx,x+3,81,1,38,"#f0d8aa");
  }
  // Wall join, sill, and structural posts.
  rect(ctx,135,118,230,9,"#784b31");
  rect(ctx,135,118,230,3,"#d6a26c");
  rect(ctx,135,123,230,3,"#513322");
  rect(ctx,131,72,8,214,"#6c432d");
  rect(ctx,135,77,3,203,"#ce985e");
  rect(ctx,363,72,7,214,"#5b3829");
  rect(ctx,363,77,3,203,"#be8c58");
  // Natural planked floor, with restrained texture not large ornamental rugs.
  rect(ctx,139,126,224,154,"#b77945");
  for(let row=0;row<12;row++){
    const y=128+row*13;
    rect(ctx,139,y,224,1,"#75492f");
    rect(ctx,139,y+1,224,1,"#d49b62");
    for(let col=0;col<5;col++){
      const x=140+((row%3)*13+col*49)%220;
      rect(ctx,x,y+2,1,10,"#a16c3e");
      rect(ctx,x+1,y+2,1,8,"#c58c54");
    }
    if(row%2===0){
      rect(ctx,167+(row*17)%130,y+8,18,1,"#b08251");
      rect(ctx,184+(row*11)%119,y+5,13,1,"#d79b60");
    }
  }
  // Small farming-life touches on the wall: weather window and crop calendar.
  rect(ctx,169,85,38,30,"#694b37");
  rect(ctx,172,88,32,24,"#89ad9a");
  rect(ctx,173,89,30,14,"#b5cdab");
  rect(ctx,173,101,30,11,"#739c7b");
  rect(ctx,187,87,2,27,"#6b4a2f");
  rect(ctx,172,99,32,2,"#6b4a2f");
  rect(ctx,170,111,37,4,"#cf9c62");
  rect(ctx,278,86,19,28,"#e6d6b5");
  rect(ctx,279,86,17,3,"#84634b");
  rect(ctx,281,93,13,2,"#86965f");
  rect(ctx,281,98,10,1,"#b38c60");
  rect(ctx,281,102,12,1,"#b38c60");
  // A single tiny hanging farming apron, above player reach.
  rect(ctx,330,87,3,17,"#69442b");
  rect(ctx,323,93,16,15,"#64816c");
  rect(ctx,326,95,10,12,"#78977c");
  rect(ctx,329,93,4,5,"#d7b88c");
  // Minimal mat at the exit (decorative only, never blocks walking).
  rect(ctx,236,263,42,16,"#74583c");
  rect(ctx,240,265,34,11,"#9da775");
  rect(ctx,243,268,28,5,"#c3c398");
  // Bottom wooden wall stops either side of a visible open entrance.
  rect(ctx,128,280,108,17,"#6b402b");
  rect(ctx,128,281,108,3,"#bc8c5c");
  rect(ctx,277,280,95,17,"#6b402b");
  rect(ctx,277,281,95,3,"#bc8c5c");
  rect(ctx,235,280,5,20,"#4b3022");
  rect(ctx,277,280,5,20,"#4b3022");
  rect(ctx,240,284,37,11,"#976943");
  rect(ctx,241,287,34,2,"#d2a76f");
  rect(ctx,242,294,32,2,"#503a2a");
  rect(ctx,127,69,246,5,"#4b3026");
  rect(ctx,132,73,236,3,"#be8f61");
  // No physical props on the centre aisle: walkable floor is visually honest.
  if(evening){
    rect(ctx,137,78,226,46,"rgba(42,49,77,.18)");
    rect(ctx,138,125,225,154,"rgba(29,39,64,.14)");
    rect(ctx,240,264,36,12,"rgba(33,43,60,.12)");
  }
  ctx.restore();
}

/** Re-color only the overly turquoise roof of Yanzen's existing HD cottage.
 * Reuses the original high quality silhouette, windows, woodwork and planter.
 * Texture produced once, non-destructive: original atlas is the rollback.
 */
const facadeCache=new WeakMap<object,HTMLCanvasElement>();
export function farmhouseFacadeSource(image:CanvasImageSource):HTMLCanvasElement{
  const key=image as object,old=facadeCache.get(key);if(old)return old;
  const c=document.createElement("canvas");c.width=320;c.height=320;
  const ctx=c.getContext("2d",{willReadFrequently:true});
  if(!ctx)throw new Error("Farmhouse facade requires canvas");
  ctx.drawImage(image,0,0,320,320,0,0,320,320);
  const frame=ctx.getImageData(0,0,320,320),pix=frame.data;
  for(let y=0;y<234;y++)for(let x=22;x<305;x++){
    const i=(y*320+x)*4,r=pix[i],g=pix[i+1],b=pix[i+2];
    if(pix[i+3]<48)continue;
    // Roof tiles carry blue-green/cyan highlights; keep sky-blue windows.
    if(y>=50 && y<=204 && b>r*1.16 && g>r*1.10 &&
      b>66 && g>62 && g>=b*.48 && (b-r)>17){
      const intensity=(r*.22+g*.43+b*.35);
      pix[i]=Math.min(255,Math.round(intensity*1.06+32));
      pix[i+1]=Math.min(255,Math.round(intensity*.62+15));
      pix[i+2]=Math.min(255,Math.round(intensity*.40+12));
    }
  }
  ctx.putImageData(frame,0,0);
  facadeCache.set(key,c);return c;
}
