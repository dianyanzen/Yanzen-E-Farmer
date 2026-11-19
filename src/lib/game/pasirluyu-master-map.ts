/** Original pixel-art atlas: a coherent master terrain is sliced into visible chunks.
 * This owns ONLY scenery; collision and unlock rules live in the same model registry. */
import {PASIRLUYU_CHUNKS,isMasterRoad,ROUTE_BARRIERS,
  type OutdoorLocation,type RouteBarrier} from "./model";
type Canvas=CanvasRenderingContext2D;
const T=20;
const fill=(c:Canvas,x:number,y:number,w:number,h:number,color:string)=>{
  c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),w,h);
};
function terrainNoise(x:number,y:number,salt=0):number{
  let h=((x+231)*374761393)^((y+631)*668265263)^((salt+37)*2246822519);
  h=Math.imul(h^(h>>>13),1274126177);return ((h^(h>>>16))>>>0)%1000;
}
/** ROAD STYLE v2 — shared world-coordinate gravel palette.
 * Legacy farm art already uses warm sand (#ddc38a); older darker slab
 * (#b99c70) was visually incompatible with its winding earth track.
 */
export const ROAD_STYLE={
  base:"#ddc38a",light:"#e3c992",shadow:"#c9ad78",pebble:"#ac956d",
  verge:"#91a96c",width:40
} as const;
export function drawMasterRoadTile(ctx:Canvas,where:OutdoorLocation,x:number,y:number){
  const p=PASIRLUYU_CHUNKS[where],px=x*T,py=y*T;
  const worldX=x+p.originX,worldY=y+p.originY,n=terrainNoise(worldX,worldY,3);
  // Consistent material and GLOBAL noise pattern even when adjacent scenes
  // are authored differently. Avoid alternating entire tiles by color.
  fill(ctx,px,py,T,T,ROAD_STYLE.base);
  if(n%3===0)fill(ctx,px+2,py+4,5,1,ROAD_STYLE.light);
  if(n%5===0)fill(ctx,px+13,py+16,4,1,ROAD_STYLE.shadow);
  if(n%7===0)fill(ctx,px+15,py+5,2,2,ROAD_STYLE.pebble);
  if(n%11===0)fill(ctx,px+8,py+12,3,1,"#efe0ac");
}
/** Replaces per-scene random terrain noise with world-space ground and roads. */
export function drawMasterGround(ctx:Canvas,where:OutdoorLocation){
  const origin=PASIRLUYU_CHUNKS[where];
  for(let y=0;y<16;y++)for(let x=0;x<24;x++){
    const px=x*T,py=y*T,wx=origin.originX+x,wy=origin.originY+y;
    const n=terrainNoise(wx,wy);
    fill(ctx,px,py,T,T,["#91a96c","#9ab273","#92ab70","#a1b879","#8aa66b"][n%5]);
    if(n%11===0)fill(ctx,px+4,py+12,3,1,"#607f53");
    if(n%17===0)fill(ctx,px+13,py+5,2,1,"#d9d5a2");
    if(isMasterRoad(where,x,y))drawMasterRoadTile(ctx,where,x,y);
  }
}
/** Geometric mask for the farm's EAST entrance.
 * The baked landscape has a winding dirt path arriving near x=320,y=220.
 * The road must widen gradually into the common 40px corridor at x=480,
 * rather than laying a two-tile-high rectangular strip across the field.
 */
export const ROAD_SEAMS={
  farmEast:{left:319,right:480,topAtSeam:200,bottomAtSeam:240},
  farmSouth:{top:230,bottom:320,leftAtSeam:360,rightAtSeam:400},
} as const;
function traceFarmEast(ctx:Canvas){
  ctx.beginPath();
  ctx.moveTo(319,207);
  ctx.bezierCurveTo(333,198,354,199,378,200);
  ctx.bezierCurveTo(424,200,448,200,480,200);
  ctx.lineTo(480,240);
  ctx.bezierCurveTo(441,240,415,236,378,237);
  ctx.bezierCurveTo(356,234,333,234,319,231);
  ctx.closePath();
}
function traceFarmSouth(ctx:Canvas){
  ctx.beginPath();
  ctx.moveTo(368,229);
  ctx.bezierCurveTo(367,256,367,281,360,320);
  ctx.lineTo(400,320);
  ctx.bezierCurveTo(401,289,400,257,402,229);
  ctx.closePath();
}
function paintClippedRoad(ctx:Canvas,trace:(c:Canvas)=>void,where:OutdoorLocation,
                          minX:number,maxX:number,minY:number,maxY:number){
  ctx.save();
  trace(ctx);ctx.clip();
  for(let y=minY;y<=maxY;y++)for(let x=minX;x<=maxX;x++)
    drawMasterRoadTile(ctx,where,x,y);
  ctx.restore();
}
export function drawFieldRoads(ctx:Canvas){
  // Both trails merge into the ORIGINAL farm path. No full-width overlay band.
  paintClippedRoad(ctx,traceFarmEast,"field",15,23,9,12);
  paintClippedRoad(ctx,traceFarmSouth,"field",17,20,11,15);
  // Subtle roadside specks follow the curves; never create a rectangular slab.
  for(let i=0;i<35;i++){
    const x=345+(i*17)%132,y=200+((i*29)%40);
    if((x*7+i)%5===0)fill(ctx,x,y,2,1,"#c8bc83");
  }
}
/** A market is a cobbled COURTYARD, not a beige rectangle spanning an entire
 * 24×16 map. Its warm transition apron uses the very same base material as
 * the streets, preserving physical continuity at the north/south seam.
 */
export function drawMarketCourtyard(ctx:Canvas){
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(115,131);
  ctx.bezierCurveTo(142,117,339,118,355,134);
  ctx.bezierCurveTo(389,161,387,232,359,249);
  ctx.bezierCurveTo(333,263,155,265,116,249);
  ctx.bezierCurveTo(99,227,97,154,115,131);
  ctx.closePath();ctx.clip();
  for(let y=5;y<=13;y++)for(let x=4;x<=20;x++)
    drawMasterRoadTile(ctx,"pasar",x,y);
  ctx.restore();
  // Warm local pavers, not a change of road width or a disconnected seam.
  for(let i=0;i<35;i++){
    const x=133+(i*37)%200,y=153+(i*19)%77;
    fill(ctx,x,y,5,1,i%3===0?"#b9a080":"#e8d5a8");
  }
}
function woodenRail(c:Canvas,x:number,y:number,length:number){
  fill(c,x,y+13,length,3,"#77583d");
  for(let j=2;j<length;j+=11){fill(c,x+j,y+4,4,14,"#8c6b44");fill(c,x+j+1,y+5,2,3,"#c29c63");}
}
function leaf(c:Canvas,x:number,y:number,variant:number){
  fill(c,x+4,y+7,3,12,"#5e734a");
  fill(c,x,y+5,11,7,variant%2?"#467346":"#639459");
  fill(c,x+2,y+1,7,7,"#7fac69");
  fill(c,x+8,y+7,4,3,"#c7dc8f");
}
function bloom(c:Canvas,x:number,y:number,rose=false){
  fill(c,x+2,y+3,3,3,rose?"#f4bfce":"#ffda86");
  fill(c,x+4,y+1,3,3,rose?"#e6a4be":"#fff0b5");
  fill(c,x+3,y+2,2,2,"#f4e9ab");fill(c,x+4,y+6,1,5,"#52784c");
}
function cat(c:Canvas,x:number,y:number){
  fill(c,x+2,y+8,13,7,"#c58c57");fill(c,x+4,y+7,8,3,"#d9a775");
  fill(c,x+2,y+5,4,4,"#b37a4e");fill(c,x+11,y+5,4,4,"#b37a4e");
  fill(c,x+3,y+11,2,1,"#493e32");fill(c,x+12,y+11,2,1,"#493e32");
  fill(c,x+15,y+10,4,2,"#be8957");
}
function duck(c:Canvas,x:number,y:number){
  fill(c,x+2,y+8,14,7,"#fff2c9");fill(c,x+9,y+4,7,7,"#f2e5b5");
  fill(c,x+15,y+8,5,2,"#d49b4b");fill(c,x+12,y+6,1,1,"#534937");
  fill(c,x+4,y+15,2,3,"#b78048");fill(c,x+12,y+15,2,3,"#b78048");
}
function iconSign(c:Canvas,x:number,y:number,tag:string){
  fill(c,x,y,40,12,"#5b4939");fill(c,x+2,y+2,36,8,"#efe1ab");
  c.fillStyle="#5d4933";c.font="bold 6px monospace";c.fillText(tag,x+4,y+8);
}
function drawBlockade(ctx:Canvas,b:RouteBarrier){
  const edgeHorizontal=b.side==="up"||b.side==="down";
  const bx=(edgeHorizontal?b.start:(b.side==="left"?0:23))*T;
  const by=(edgeHorizontal?(b.side==="up"?0:15):b.start)*T;
  // Each closure spans at least two tiles, is solid, visible, and has inspectable text.
  if(b.artwork==="jasmine_gate"){
    woodenRail(ctx,bx-7,by+2,52);leaf(ctx,bx-9,by-3,0);leaf(ctx,bx+32,by-6,1);
    for(let i=0;i<4;i++)bloom(ctx,bx-5+i*13,by+1,i%2===0);
    iconSign(ctx,bx,by+15,"TAMAN");
  }else if(b.artwork==="fruit_cart"){
    fill(ctx,bx-14,by+1,42,30,"#745339");fill(ctx,bx-12,by+4,39,19,"#b48c5b");
    fill(ctx,bx-17,by-5,44,12,"#e8b17b");
    for(let i=0;i<9;i++){
      const x=bx-10+(i%5)*7,y=by+6+Math.floor(i/5)*9;
      fill(ctx,x,y,5,6,i%3===0?"#f2c456":i%3===1?"#e78c58":"#86a94b");
    }
    fill(ctx,bx-9,by+25,8,7,"#4d483d");fill(ctx,bx+17,by+25,8,7,"#4d483d");
    cat(ctx,bx-11,by+21);
  }else if(b.artwork==="bamboo_bridge"){
    woodenRail(ctx,bx-3,by+4,46);
    for(let i=0;i<4;i++){
      fill(ctx,bx+i*11,by+1,8,4,"#c79d66");
      fill(ctx,bx+i*11,by+5,8,2,"#6c583e");
    }
    fill(ctx,bx+2,by+1,37,2,"#efbf6a");
    fill(ctx,bx+2,by+8,37,2,"#efbf6a");
    for(let i=0;i<5;i++)fill(ctx,bx+5+i*7,by+8,3,4,i%2?"#e58d58":"#f8dfa0");
    duck(ctx,bx+6,by-16);duck(ctx,bx+24,by-16);
    iconSign(ctx,bx,by+14,"PERBAIKAN");
  }else if(b.artwork==="goat_fence"){
    woodenRail(ctx,bx-4,by-6,49);
    for(let i=0;i<2;i++){
      const x=bx+i*19,y=by-14;
      fill(ctx,x,y,14,9,i?"#f3eee0":"#ba9b70");
      fill(ctx,x+2,y-4,10,5,i?"#f8f0dc":"#c7ad80");
      fill(ctx,x-2,y-3,4,4,"#ad895e");
      fill(ctx,x+11,y-3,4,4,"#ad895e");
      fill(ctx,x+10,y+3,2,1,"#483e32");
    }
    bloom(ctx,bx+17,by-15);bloom(ctx,bx+33,by-6,true);
  }else{
    fill(ctx,bx-9,by-4,4,43,"#795942");fill(ctx,bx+31,by-4,4,43,"#795942");
    fill(ctx,bx-8,by-3,40,3,"#e1b274");
    for(let i=0;i<7;i++){
      const x=bx-5+i*6;
      fill(ctx,x,by,5,7,["#ed8e7a","#f0cb6e","#8abd8a","#9cb2dd"][i%4]);
      fill(ctx,x+1,by+8,2,2,"#ccb17d");
    }
    fill(ctx,bx-4,by+18,36,12,"#996a41");
    iconSign(ctx,bx-4,by+19,"FESTIVAL");
  }
}
export function drawRouteClosures(ctx:Canvas,zone:OutdoorLocation){
  for(const blockade of ROUTE_BARRIERS)if(blockade.location===zone)drawBlockade(ctx,blockade);
}
