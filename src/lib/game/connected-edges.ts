import { PASIRLUYU_CHUNKS, WORLD, type OutdoorLocation } from "./model";

type Edge = "left"|"right"|"up"|"down";
type Join = {first:OutdoorLocation;second:OutdoorLocation;horizontalRoad:boolean;laneCenter:number;seed:number};
export const MAP_JOINS: readonly Join[] = [
  {first:"field",second:"gang",horizontalRoad:true,laneCenter:220,seed:17},
  {first:"pasar",second:"gang",horizontalRoad:false,laneCenter:240,seed:41},
  {first:"gang",second:"sungai",horizontalRoad:false,laneCenter:240,seed:83},
];
const width=WORLD.width*WORLD.tile,height=WORLD.height*WORLD.tile;
function edgeAt(join:Join,location:OutdoorLocation):Edge|undefined{
  if(join.first===location)return join.horizontalRoad?"right":"down";
  if(join.second===location)return join.horizontalRoad?"left":"up";
}
export function connectsAt(location:OutdoorLocation,edge:Edge) {
  return MAP_JOINS.some(join=>edgeAt(join,location)===edge);
}
function worldOffset(location:OutdoorLocation) {
  const {originX,originY}=PASIRLUYU_CHUNKS[location];return {x:originX*WORLD.tile,y:originY*WORLD.tile};
}
export function sharedBorderProps(location:OutdoorLocation){
  const out:{asset:string;x:number;y:number;scale:number}[]=[];
  const origin=worldOffset(location);
  for(const join of MAP_JOINS){
    if(!edgeAt(join,location))continue;
    const start=worldOffset(join.second);
    const extent=join.horizontalRoad?height:width;
    let index=0;
    for(let along=14;along<extent;along+=26+(index++%3)*6){
      if(Math.abs(along-join.laneCenter)<42)continue;
      const normal=index%3===0?3:-3;
      const x=start.x-origin.x+(join.horizontalRoad?normal:along);
      const y=start.y-origin.y+(join.horizontalRoad?along:normal);
      // One physical object in atlas coordinates may be cut by either viewport.
      out.push({asset:index%3===2?"batu-kembar":"semak-rimbun",x,y,scale:index%3===2?.68:.82},
        {asset:index%2?"bunga-pinggir":"rumput-tinggi",x:x+5,y:y+3,scale:.5});
    }
  }
  return out;
}

// Both views sample a single swatch. Its first scanline is the shared edge;
// material scatters and the road shoulders continue into both neighbourhoods.
const swatches=new Map<Join,HTMLCanvasElement>();
function edgeSwatch(join:Join){
  let surface=swatches.get(join);if(surface)return surface;
  const depth=28,length=join.horizontalRoad?height:width;
  surface=document.createElement("canvas");surface.width=join.horizontalRoad?depth:length;surface.height=join.horizontalRoad?length:depth;
  const ctx=surface.getContext("2d")!;
  const pixels=ctx.createImageData(surface.width,surface.height);
  for(let along=0;along<length;along++)for(let d=0;d<depth;d++){
    let n=Math.imul(along+join.seed,19349663)^Math.imul(d+join.seed,73856093);
    n=(Math.imul(n^(n>>>13),1274126177)>>>0)%100;
    const dist=Math.abs(along-join.laneCenter);
    const palette=dist<17 ? [[216,190,137],[206,177,126],[228,204,154]] :
      dist<20 ? [[198,175,126],[183,161,103],[207,179,126]] :
      dist<22 ? [[168,166,104],[173,157,99],[178,171,107]] :
      [[163,184,108],[150,171,97],[180,194,122]];
    const color=palette[n<11?1:n>94?2:0];
    const i=4*(join.horizontalRoad?along*depth+d:d*length+along);
    pixels.data[i]=color[0];pixels.data[i+1]=color[1];pixels.data[i+2]=color[2];
    pixels.data[i+3]=d<6?255:Math.round(255*Math.pow((depth-1-d)/(depth-7),1.25));
  }
  ctx.putImageData(pixels,0,0);swatches.set(join,surface);return surface;
}
export function drawConnectedEdges(ctx:CanvasRenderingContext2D,location:OutdoorLocation){
  for(const join of MAP_JOINS){
    const edge=edgeAt(join,location);if(!edge)continue;
    ctx.save();
    if(edge==="right"){ctx.translate(width,0);ctx.scale(-1,1);}
    if(edge==="down"){ctx.translate(0,height);ctx.scale(1,-1);}
    ctx.drawImage(edgeSwatch(join),0,0);ctx.restore();
  }
}
