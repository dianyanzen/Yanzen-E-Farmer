/** Original, deterministic pixel-art zones for Pasirluyu. All paths align with model.ts collisions. */
import { riverBanks, type OutdoorLocation } from "./model";
import {drawMasterGround,drawMarketCourtyard,drawRouteClosures} from "./pasirluyu-master-map";
import {drawSignposts} from "./signposts";
type C=CanvasRenderingContext2D;
const T=20,W=24,H=16;
function r(c:C,x:number,y:number,w:number,h:number,color:string){
  c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),w,h);
}
function txt(c:C,value:string,x:number,y:number){
  c.fillStyle="#263b31";c.fillRect(x-3,y-9,c.measureText(value).width+7,13);
  c.fillStyle="#fff1c7";c.fillText(value,x,y);
}
function flower(c:C,x:number,y:number,color:string){
  r(c,x,y,3,3,color);r(c,x+1,y+1,1,1,"#f5e8b1");
}
function house(c:C,x:number,y:number,w:number,name:string){
  const nani = name === "RUMAH NANI";
  const tile = nani ? "#70895e" : "#b55e47";
  const ridge = nani ? "#8ea076" : "#ce7959";
  const timber = "#674937";
  r(c,x+2,y+44,w-2,14,"#98a269");
  r(c,x+3,y+12,w-6,43,nani?"#e1c79f":"#d6b492");
  r(c,x+4,y+38,w-8,17,nani?"#bf9a6d":"#ae8265");
  r(c,x+3,y+15,4,40,timber);
  r(c,x+w-7,y+15,4,40,timber);
  // Stepped silhouette and short staggered rows of roof tiles.
  r(c,x+9,y-3,w-18,5,timber);
  r(c,x+5,y+2,w-10,6,tile);
  r(c,x+2,y+8,w-4,6,tile);
  r(c,x,y+14,w,4,timber);
  r(c,x+12,y-2,w-24,3,ridge);
  for (let n=10;n<w-8;n+=9) {
    r(c,x+n,y+5,5,1,ridge);
    r(c,x+n-3,y+11,5,1,ridge);
  }
  r(c,x+12,y+25,22,19,timber);
  r(c,x+15,y+28,16,13,"#9dbdb0");
  r(c,x+22,y+28,2,13,"#805e43");
  r(c,x+15,y+34,16,1,"#805e43");
  r(c,x+10,y+44,26,3,"#76523a");
  r(c,x+w-28,y+28,18,27,timber);
  r(c,x+w-25,y+30,12,23,"#9b6c4c");
  r(c,x+w-17,y+41,2,3,"#e9c373");
  r(c,x+w-30,y+54,22,3,"#978464");
  r(c,x+w-31,y+57,24,2,"#cbb28a");
  if (nani) {
    r(c,x+6,y+49,37,6,"#785438");
    for (let i=0;i<5;i++) flower(c,x+8+i*7,y+47,"#f2e8c4");
  } else {
    r(c,x+46,y+25,9,2,"#75523c");
    r(c,x+48,y+27,5,6,"#e9b96f");
  }
  txt(c,name,x+4,y-9);
}
function stall(c:C,x:number,y:number,w:number,label:string,shade:string){
  r(c,x,y+10,w,42,"#7e593a");
  r(c,x+2,y+27,w-4,19,"#b48a58");
  r(c,x-3,y+5,w+6,12,"#f1dcaf");
  for(let i=0;i<w;i+=12)r(c,x-3+i,y+10,8,7,i%24?shade:"#f3ebca");
  for(let i=0;i<w-12;i+=15){
    r(c,x+6+i,y+29,11,5,i%3?"#5f9c50":"#c79549");
    r(c,x+6+i,y+35,9,4,"#476b39");
  }
  txt(c,label,x+4,y);
}
function boundaryTree(c:C,x:number,y:number,seed:number){
  r(c,x*T+7,y*T+8,7,12,"#715539");
  r(c,x*T+1,y*T,18,13,seed%2?"#345e44":"#3b714a");
  r(c,x*T+4,y*T+1,12,7,"#6b9859");
  r(c,x*T+12,y*T+3,4,2,"#92b875");
}
export function drawOutdoorArea(ctx:C,where:Exclude<OutdoorLocation,"field">,_ambient:number) {
  drawMasterGround(ctx,where);
  if(where==="gang"){
    for (let x=0;x<W;x++) {
      if (x>=10 && x<=13) continue;
      const y = 1 + (x*7)%3;
      boundaryTree(ctx,x,y,x);
      if (x%3===0 && y<3) boundaryTree(ctx,x,y+1,x+1);
    }
    // Path ends are proper connected roads; other edges are hedges and fences.
    for(let x=0;x<W;x++){
      if(x!==11&&x!==12){boundaryTree(ctx,x,4,x);boundaryTree(ctx,x,15,x+4);}
    }
    for(let y=5;y<15;y++){
      if(y===10||y===11)continue;
      boundaryTree(ctx,0,y,y);boundaryTree(ctx,23,y,y+2);
    }
    house(ctx,3*T,5*T,120,"RUMAH NANI");
    house(ctx,16*T,5*T,100,"KELUARGA WARGA");
    // Bench, laundry, flower beds and neighborhood details.
    r(ctx,6*T,12*T+5,47,7,"#775739");r(ctx,6*T+3,12*T+1,41,4,"#c09864");
    r(ctx,6*T+5,12*T+12,3,8,"#684b36");r(ctx,6*T+38,12*T+12,3,8,"#684b36");
    r(ctx,15*T,12*T,52,2,"#8c7258");r(ctx,15*T+2,12*T+1,2,20,"#766042");r(ctx,15*T+48,12*T+1,2,20,"#766042");
    r(ctx,16*T,12*T+3,10,9,"#ddc69e");r(ctx,16*T+15,12*T+3,13,9,"#b4c8bf");
    for(let i=0;i<5;i++)flower(ctx,4*T+i*10,13*T+7,i%2?"#efc7b0":"#f5e1a2");
    // Road directions are marked by the signpost entity at the north entrance.
  }else if(where==="pasar"){
    drawMarketCourtyard(ctx);
    for(let x=0;x<W;x++){if(x!==11&&x!==12)boundaryTree(ctx,x,4,x+2);
      if(x!==11&&x!==12)boundaryTree(ctx,x,15,x);}
    for(let y=5;y<15;y++){boundaryTree(ctx,0,y,y);boundaryTree(ctx,23,y,y+2);}
    stall(ctx,3*T,6*T,140,"LAPAK BENIH","#6c9654");
    stall(ctx,15*T,6*T,110,"WARUNG INGGIT","#bc7153");
    r(ctx,390,147,18,23,"#604633");
    r(ctx,392,149,14,19,"#99734c");
    r(ctx,402,159,2,2,"#e8c783");
    r(ctx,5*T,11*T,48,23,"#9b784e");r(ctx,5*T+4,11*T+3,40,17,"#b99762");
    r(ctx,5*T+14,11*T-9,7,13,"#c7a352");r(ctx,5*T+24,11*T-5,8,11,"#628e4f");
    r(ctx,18*T,12*T+5,42,12,"#74583f");r(ctx,18*T+3,12*T+7,36,4,"#bfa16a");
    // In-world market stalls keep their name plaques; route help lives in the signpost.
  }else{
    // Natural western edge: deep river and rocky bank; central entrance path.
    r(ctx,0,0,140,320,"#407f89");
    for(let y=0;y<H;y++) {
      const offset=(y*13)%9;
      r(ctx,98+offset,y*T,42-offset,T,"#549a96");
      r(ctx,130+offset/2,y*T,10-offset/2,T,"#77afa0");
      r(ctx,14+(y*29)%87,y*T+5,15,2,"#4b8f95");
      r(ctx,106+offset,y*T+14,13,1,"#82bbb0");
    }
    for(let y=4;y<15;y++){
      r(ctx,7*T,y*T,8,T,"#c9a978");
      r(ctx,7*T+8,y*T,10,T,"#8d795a");
      r(ctx,8*T,y*T,T,T,y%2?"#b0ac86":"#bdb895");
    }
    for(let x=8;x<=22;x++)if(x!==11&&x!==12)boundaryTree(ctx,x,4,x);
    for(let x=7;x<W;x++)if(x!==11&&x!==12)boundaryTree(ctx,x,15,x+3);
    for(let y=5;y<15;y++)boundaryTree(ctx,23,y,y+5);
    // Functional-looking water gate on the bank, with dry walkable path to Ryan.
    r(ctx,6*T,7*T,30,7,"#675d51");r(ctx,6*T+9,7*T+7,5,40,"#948777");
    r(ctx,7*T,8*T,43,8,"#8c6b4c");r(ctx,7*T+2,8*T+1,40,2,"#c3aa7c");
    r(ctx,13*T,10*T,63,2,"#765f46");r(ctx,13*T,10*T+2,2,13,"#6f563f");
    r(ctx,13*T+60,10*T+2,2,13,"#6f563f");
    for(let i=0;i<7;i++)flower(ctx,14*T+i*9,12*T+5,i%2?"#d9dfab":"#f4c6d5");
    // A small wooden sign replaces persistent location banners.
  }
  drawRouteClosures(ctx,where);
  drawSignposts(ctx,where);
}

/** Sparse animated glints stay within the authored water silhouettes. */
export function waterRipples(location: string, phase: number, sluiceOpen=false): [number, number, number][] {
  if (location !== "field" && location !== "sungai") return [];
  if(location==="field")return Array.from({length:14},(_,i)=>[2+(i*13)%25,186+(i*23+phase)%132,3+i%5]);
  const glints:[number,number,number][]=[];
  for(let i=0;i<46;i++){
    const y=(i*17+phase*2)%320;
    if(y>=129 && y<=163 || y>=246 && y<=292)continue;
    const [left,right]=riverBanks(y);
    const x=left+4+(i*41)%Math.max(1,right-left-15);
    if(x<0 || x>62 && x<146 && y>195 && y<230)continue;
    glints.push([x,y,3+i%5]);
  }
  if(sluiceOpen)for(let i=0;i<26;i++){
    const y=161+(phase*3+i*3)%28;
    const [left,right]=riverBanks(y);
    const x=(i%2?58:108)+(i%7)*3;
    if(x>left+2 && x+5<right)glints.push([x,y,3+i%4]);
  }
  return glints;
}
