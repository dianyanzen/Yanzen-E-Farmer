import { Direction, GameState, NPCS, WORLD, facing, isFarm } from "./model";

const { width: W, height: H, tile: T } = WORLD;
function box(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, c: string) {
  ctx.fillStyle = c; ctx.fillRect(Math.round(x), Math.round(y), w, h);
}
function label(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, color = "#fff7df") {
  ctx.fillStyle = "#24382e"; ctx.fillRect(x - 3, y - 10, ctx.measureText(text).width + 6, 13);
  ctx.fillStyle = color; ctx.fillText(text, x, y);
}
function flower(ctx: CanvasRenderingContext2D, x: number, y: number, seed: number) {
  if (seed % 11 !== 0) return;
  box(ctx,x+7,y+11,2,3,"#f1c4a0"); box(ctx,x+5,y+12,6,2,"#f3ead1");
  box(ctx,x+7,y+9,2,6,"#f1c4a0");
}
function drawPerson(ctx: CanvasRenderingContext2D, tx: number, ty: number,
                    coat: string, head: string, hair: string, hat = false) {
  const x = tx*T, y = ty*T;
  box(ctx,x+5,y+9,11,9,"#25342d");
  box(ctx,x+6,y+8,9,8,coat);
  box(ctx,x+6,y+15,4,4,"#273e48");box(ctx,x+12,y+15,4,4,"#273e48");
  box(ctx,x+6,y+4,9,7,head);
  box(ctx,x+5,y+3,11,3,hair);
  box(ctx,x+6,y+6,1,1,"#283c35");box(ctx,x+12,y+6,1,1,"#283c35");
  if(hat){box(ctx,x+3,y+2,15,3,"#d2b16b");box(ctx,x+7,y,8,3,"#e6d69c");}
}
export type WorldArt = { people?: HTMLImageElement; cucumber?: HTMLImageElement };
const actorRows = { A01: 0, A03: 1, C01: 2, C08: 3 } as const;
const facingRows = { down: 0, left: 1, right: 2, up: 3 } as const;

export function drawWorld(canvas: HTMLCanvasElement, state: GameState, art: WorldArt = {}, pose = 1) {
  const ctx = canvas.getContext("2d"); if (!ctx) return;
  canvas.width = W*T; canvas.height = H*T;
  ctx.imageSmoothingEnabled = false;
  ctx.font = "bold 8px monospace";
  for(let y=0;y<H;y++) for(let x=0;x<W;x++) {
    const px=x*T, py=y*T, rand=((x*17+y*29+x*y*7)%47);
    const city=y<=4, road=y===5 || y===6 || (x>=12 && x<=22 && y<=14);
    const water=x<=1 && y>=9;
    box(ctx,px,py,T,T,city?"#879da1":water?"#70b9bd":road?"#b9b6aa":"#7daa70");
    if(city){ if(y===4)box(ctx,px,py+16,T,4,"#52636a");}
    else if(water){box(ctx,px+(rand%6),py+10,8,2,"#b4ddd3");}
    else if(road){ if(y===6 && x%3===0)box(ctx,px+4,py+9,12,2,"#e0d9c0"); }
    else {
      if(rand%5===0)box(ctx,px+3,py+7,2,4,"#497b56");
      flower(ctx,px,py,rand);
    }
    if(isFarm(x,y)){
      box(ctx,px+1,py+1,18,18,"#8d6546");box(ctx,px+3,py+3,14,14,"#9d7450");
      box(ctx,px+3,py+10,14,2,"#b08b63");
    }
  }
  // Multi-layer city blocks, street stalls and homes.
  box(ctx,13,0,128,63,"#536a73");box(ctx,18,5,118,56,"#d4b88b");
  for(let j=0;j<3;j++)for(let i=0;i<5;i++){box(ctx,25+i*22,11+j*14,12,10,"#7fb7ad");box(ctx,26+i*22,12+j*14,8,6,"#bedad0");}
  box(ctx,9,57,136,7,"#6d4e3f");
  box(ctx,290,0,166,61,"#8b6b5a");box(ctx,296,6,153,50,"#f1d2ad");
  for(let i=0;i<5;i++){box(ctx,303+i*27,16,17,18,"#a6c2b4");box(ctx,304+i*27,34,20,4,"#74544a");}
  box(ctx,287,54,174,10,"#a34e43");box(ctx,318,61,4,17,"#775349");
  box(ctx,424,61,4,17,"#775349");
  box(ctx,232,25,42,38,"#d8b3a6");box(ctx,224,19,58,9,"#955e54");
  box(ctx,237,38,12,20,"#6c8f83");box(ctx,256,38,11,13,"#6c8f83");
  // Garden paths and fences.
  for(let x=2;x<=11;x++) {box(ctx,x*T,7*T,19,3,"#e9d4a3");box(ctx,x*T,14*T,19,3,"#e9d4a3");}
  for(let y=7;y<=14;y++){box(ctx,2*T,y*T,3,19,"#e9d4a3");box(ctx,11*T,y*T,3,19,"#e9d4a3");}
  box(ctx,228,138,13,4,"#e9d4a3");
  // Trees and greenery.
  for(const [tx,ty] of [[3,5],[9,5],[22,8],[21,12],[4,15]]) {
    const px=tx*T, py=ty*T;box(ctx,px+8,py+10,4,9,"#7b5b40");
    box(ctx,px+2,py+5,16,11,"#396b4d");box(ctx,px+4,py+2,12,10,"#579566");
    box(ctx,px+6,py+4,4,3,"#a9c385");
  }
  // Soil, crop stages and watering markers.
  for(const crop of state.plots) {
    const x=crop.x*T,y=crop.y*T;
    box(ctx,x+2,y+3,16,13,crop.watered ? "#583e32" : "#775239");
    if(crop.stage===-1){box(ctx,x+4,y+7,12,2,"#b4865d");}
    if(crop.stage>=0 && art.cucumber){
      ctx.drawImage(art.cucumber, crop.stage*16, 0, 16, 16, x+2, y+2, 16, 16);
    } else if(crop.stage>=0){
      const h=4+crop.stage*3;
      box(ctx,x+10,y+17-h,2,h,"#2d6c3f");
      box(ctx,x+6,y+12-crop.stage*2,5+crop.stage,3,"#428b4c");
      box(ctx,x+11,y+9-crop.stage*2,5+crop.stage,3,"#639a55");
      if(crop.stage===3){box(ctx,x+7,y+10,4,6,"#8ac95a");box(ctx,x+13,y+13,3,5,"#b3d679");}
    }
    if(crop.watered){box(ctx,x+2,y+2,3,3,"#8ad0da");}
  }
  // Sign boards.
  label(ctx,"PASIRLUYU",158,47);
  label(ctx,"WARUNG REGOL",333,46);
  label(ctx,"KEBUN PASIRLUYU",73,146);
  function actor(id: keyof typeof actorRows, x: number, y: number, dir: Direction, frame: number, color: string) {
    if (art.people) {
      const row = actorRows[id] * 4 + facingRows[dir];
      ctx!.drawImage(art.people, frame*24, row*32, 24, 32, x*T-2, y*T-12, 24, 32);
    } else {
      drawPerson(ctx!, x, y, color, "#e4b48b", "#553a2c", id === "A01");
    }
  }
  for (const npc of NPCS) {
    actor(npc.id, npc.x, npc.y, "down", 1, npc.color);
    label(ctx, npc.name, npc.x*T-2, npc.y*T-14);
  }
  // Player and their current tile target.
  const target=facing(state.player);
  if(isFarm(target.x,target.y)){ctx.strokeStyle="#f9e5b3";ctx.lineWidth=1;ctx.strokeRect(target.x*T+1,target.y*T+1,T-2,T-2);}
  actor("A01", state.player.x, state.player.y, state.player.dir, pose, "#295d4d");
}
