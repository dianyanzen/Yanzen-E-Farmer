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
export function drawMasterRoadTile(ctx:Canvas,where:OutdoorLocation,x:number,y:number){
  const p=PASIRLUYU_CHUNKS[where],px=x*T,py=y*T;
  const worldX=x+p.originX,worldY=y+p.originY,n=terrainNoise(worldX,worldY,3);
  // Same palette and world-coordinate texture on either side of every seam.
  fill(ctx,px,py,T,T,n%3===0?"#b99c70":n%3===1?"#b69a71":"#bca379");
  fill(ctx,px+2,py+2,T-4,1,"#c5aa83");
  if(n%3===0)fill(ctx,px+8,py+14,5,1,"#907959");
  if(n%5===0)fill(ctx,px+3,py+8,4,1,"#d0b48a");
  if(n%7===0)fill(ctx,px+15,py+5,2,2,"#8f836d");
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
/** Let a legacy hand-drawn starter map keep its buildings while stitching its road edges to the atlas. */
export function drawFieldRoads(ctx:Canvas){
  for(let y=10;y<=11;y++)for(let x=17;x<24;x++)drawMasterRoadTile(ctx,"field",x,y);
  for(let y=13;y<=15;y++)for(let x=18;x<=19;x++)drawMasterRoadTile(ctx,"field",x,y);
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
