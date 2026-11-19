/** Original, deterministic pixel-art zones for Pasirluyu. All paths align with model.ts collisions. */
import type {OutdoorLocation} from "./model";
import {drawMasterGround,drawMasterRoadTile,drawRouteClosures} from "./pasirluyu-master-map";
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
function plant(c:C,x:number,y:number,kind:number){
  const px=x*T,py=y*T;
  r(c,px+8,py+12,4,6,"#5b6d3c");
  r(c,px+3,py+5,14,9,kind%2?"#416b49":"#477b4a");
  r(c,px+5,py+2,10,8,kind%3?"#659757":"#779d55");
  r(c,px+8,py+4,3,4,"#9fc271");
}
function flower(c:C,x:number,y:number,color:string){
  r(c,x,y,3,3,color);r(c,x+1,y+1,1,1,"#f5e8b1");
}
function roof(c:C,x:number,y:number,w:number){
  r(c,x,y,w,13,"#6d4437");r(c,x+3,y+2,w-6,10,"#c77b4a");
  for(let j=0;j<2;j++)for(let i=0;i<Math.floor((w-6)/10);i++)
    r(c,x+4+i*10+(j%2)*5,y+3+j*5,7,1,"#925336");
}
function house(c:C,x:number,y:number,w:number,name:string){
  r(c,x+3,y+12,w-6,43,"#dab991");r(c,x+4,y+37,w-8,18,"#b48b62");
  roof(c,x,y,w);
  r(c,x+12,y+24,22,20,"#61422f");r(c,x+15,y+27,16,13,"#95b5ad");
  r(c,x+w-26,y+28,15,27,"#7e5038");r(c,x+w-24,y+29,11,23,"#aa7652");
  r(c,x+w-16,y+42,2,3,"#efc57a");txt(c,name,x+4,y-3);
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
function road(c:C,x:number,y:number,cobble=false){
  const px=x*T,py=y*T;
  r(c,px,py,T,T,cobble?"#ab9b7c":"#b99a6e");
  r(c,px+1,py+2,18,1,"#c7ad80");
  if(cobble){r(c,px+3,py+9,8,1,"#8d846d");r(c,px+13,py+16,5,1,"#d2bf9c");}
  else{r(c,px+11,py+14,4,1,"#927b5d");}
}
export function drawOutdoorArea(ctx:C,where:Exclude<OutdoorLocation,"field">,ambient:number) {
  drawMasterGround(ctx,where);
  if(where==="gang"){
    for(let y=9;y<=11;y++)for(let x=0;x<W;x++)road(ctx,x,y);
    for(let y=5;y<15;y++)for(let x=11;x<=12;x++)road(ctx,x,y);
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
    for(let y=5;y<15;y++)for(let x=1;x<23;x++)road(ctx,x,y,true);
    for(let x=0;x<W;x++){if(x!==11&&x!==12)boundaryTree(ctx,x,4,x+2);
      if(x!==11&&x!==12)boundaryTree(ctx,x,15,x);}
    for(let y=5;y<15;y++){boundaryTree(ctx,0,y,y);boundaryTree(ctx,23,y,y+2);}
    stall(ctx,3*T,6*T,140,"KIOS SAYUR","#6c9654");
    stall(ctx,15*T,6*T,110,"WARUNG INGGIT","#bc7153");
    r(ctx,5*T,11*T,48,23,"#9b784e");r(ctx,5*T+4,11*T+3,40,17,"#b99762");
    r(ctx,5*T+14,11*T-9,7,13,"#c7a352");r(ctx,5*T+24,11*T-5,8,11,"#628e4f");
    r(ctx,18*T,12*T+5,42,12,"#74583f");r(ctx,18*T+3,12*T+7,36,4,"#bfa16a");
    // In-world market stalls keep their name plaques; route help lives in the signpost.
  }else{
    // Natural western edge: deep river and rocky bank; central entrance path.
    for(let y=0;y<H;y++)for(let x=0;x<=6;x++){
      r(ctx,x*T,y*T,20,20,(x+y)%2?"#478a93":"#3f8491");
      if((x*5+y*7+Math.floor(ambient/2))%8===0)r(ctx,x*T+5,y*T+9,11,2,"#83c1be");
    }
    for(let y=4;y<15;y++){
      r(ctx,7*T,y*T,8,T,"#c9a978");
      r(ctx,7*T+8,y*T,10,T,"#8d795a");
      r(ctx,8*T,y*T,T,T,y%2?"#b0ac86":"#bdb895");
    }
    for(let y=5;y<15;y++)for(let x=11;x<=12;x++)road(ctx,x,y);
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
  // Shared road corridor is painted last so it never misaligns at a chunk seam.
  for(let y=0;y<16;y++)for(let x=0;x<24;x++){
    if(where==="gang"&&((x===11||x===12)||(y===10||y===11)) ||
       where==="pasar"&&(x===11||x===12||(x>=21&&(y===10||y===11))) ||
       where==="sungai"&&(x===11||x===12))
      drawMasterRoadTile(ctx,where,x,y);
  }
  drawRouteClosures(ctx,where);
  drawSignposts(ctx,where);
}
