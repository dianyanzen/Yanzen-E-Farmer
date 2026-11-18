import type { WeightPose } from "./footwork";
import type { ToolUse } from "./field-engine";
import { Direction, GameState, NPCS, WORLD, facing, isFarm, HOME } from "./model";

const { width: W, height: H, tile: T } = WORLD;
function box(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, c: string) {
  ctx.fillStyle = c; ctx.fillRect(Math.round(x), Math.round(y), w, h);
}
function label(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, color = "#fff7df") {
  ctx.fillStyle = "#24382e"; ctx.fillRect(x - 3, y - 10, ctx.measureText(text).width + 6, 13);
  ctx.fillStyle = color; ctx.fillText(text, x, y);
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
export type WorldArt = { people?: HTMLImageElement; gaits?: HTMLImageElement; turns?: HTMLImageElement; cucumber?: HTMLImageElement; landscape?: HTMLImageElement; effects?: HTMLImageElement; actions?: HTMLImageElement };
const actorRows = { A01: 0, A03: 1, C01: 2, C08: 3 } as const;
const facingRows = { down: 0, left: 1, right: 2, up: 3 } as const;

export type FarmAnimation = { use: ToolUse; frame: number; effect: number };
export function drawWorld(canvas: HTMLCanvasElement, state: GameState, art: WorldArt,
                          position: { x: number; y: number; dir: Direction }, pose: number | null, running: boolean, action: FarmAnimation | undefined, camera: {x:number;y:number},
                          ambient: number, plots: GameState["plots"], weight?: WeightPose,
                          dust?: {x:number;y:number;dir:Direction;phase:number}) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const cameraX = Math.round(Math.min(W*T - canvas.width, Math.max(0, (camera.x + .5)*T - canvas.width/2)));
  const cameraY = Math.round(Math.min(H*T - canvas.height, Math.max(0, (camera.y + .5)*T - canvas.height/2)));
  ctx.setTransform(1, 0, 0, 1, -cameraX, -cameraY);
  ctx.imageSmoothingEnabled = false;
  ctx.font = "bold 8px monospace";
  if (state.location === "home") {
    box(ctx,0,0,W*T,H*T,"#292b2b");
    box(ctx,7*T,5*T,11*T,10*T,"#4b392c");
    box(ctx,8*T,6*T,9*T,8*T,"#bc9668");
    for(let row=6;row<14;row++) for(let col=8;col<17;col++) {
      box(ctx,col*T,row*T,19,1,"#896949");
      box(ctx,col*T,row*T,1,20,"#d3ad7b");
    }
    box(ctx,7*T,5*T,11*T,15,"#83664c");
    box(ctx,9*T,6*T,2*T,2*T,"#5b3b32");
    box(ctx,9*T+3,6*T+3,34,12,"#f6ebce");
    box(ctx,9*T+3,6*T+17,34,20,"#698b82");
    box(ctx,9*T+3,7*T+12,34,4,"#b9d3b7");
    box(ctx,15*T,6*T,2*T,3*T,"#6c4b37");
    box(ctx,15*T+4,6*T+5,30,24,"#a1804d");
    box(ctx,12*T,7*T,20,20,"#785539");
    box(ctx,12*T+2,7*T+2,16,4,"#d6bb7d");
    box(ctx,13*T,5*T+2,25,12,"#94c2bd");
    box(ctx,HOME.exit.x*T,HOME.exit.y*T,20,20,"#694b34");
    label(ctx,"RUMAH YANZEN",9*T,5*T-4);
    label(ctx,"Tidur: dekati ranjang + Aksi",8*T,14*T+14);
    if(art.people) {
      const row=facingRows[position.dir];
      ctx.drawImage(art.people,24,row*32,24,32,Math.round(position.x*T)-2,Math.round(position.y*T)-12,24,32);
    } else drawPerson(ctx,position.x,position.y,"#295d4d","#e4b48b","#553a2c",true);
    return;
  }
  // Home entrance is an explicit interaction on the village building edge.
  if (art.landscape) ctx.drawImage(art.landscape, 0, 0);
  else {
    box(ctx,0,0,W*T,H*T,"#a7c465");
    box(ctx,3*T,8*T,8*T,6*T,"#b58c57");
  }
  box(ctx,HOME.door.x*T,HOME.door.y*T,20,8,"#725039");
  label(ctx,"RUMAH",HOME.door.x*T-4,HOME.door.y*T-8);
  // World-space ripples stay inside the original canal banks.
  for (let i=0;i<16;i++) {
    const x=2+(i*13+Math.floor(ambient/2))%25, y=186+(i*23+ambient)%130;
    box(ctx,x,y,3+(i%4),1,i%2?"#98d1bd":"#79c1b7");
  }
  // Soil, crop stages and watering markers.
  for(const crop of plots) {
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
  function actor(id: keyof typeof actorRows, x: number, y: number, dir: Direction, frame: number, color: string) {
    if (art.people) {
      const row = actorRows[id] * 4 + facingRows[dir];
      ctx!.drawImage(art.people, frame*24, row*32, 24, 32, Math.round(x*T)-2, Math.round(y*T)-12, 24, 32);
    } else {
      drawPerson(ctx!, x, y, color, "#e4b48b", "#553a2c", id === "A01");
    }
  }
  function drawNpc(npc: typeof NPCS[number]) {
    const dx=position.x-npc.x,dy=position.y-npc.y;
    const near=Math.abs(dx)+Math.abs(dy)<=2;
    let dir: Direction="down";
    if (near) dir=Math.abs(dx)>Math.abs(dy)?(dx<0?"left":"right"):(dy<0?"up":"down");
    actor(npc.id,npc.x,npc.y,dir,1,npc.color);
    if (near) label(ctx!,npc.name,npc.x*T-2,npc.y*T-15);
  }
  const ordered=NPCS.slice().sort((a,b)=>a.y-b.y);
  for (const npc of ordered) if (npc.y<=position.y) drawNpc(npc);
  // Player and their current tile target.
  const target=facing(state.player);
  if(isFarm(target.x,target.y)){ctx.strokeStyle="#f9e5b3";ctx.lineWidth=1;ctx.strokeRect(target.x*T+1,target.y*T+1,T-2,T-2);}
  const footX=Math.round(position.x*T)+10, footY=Math.round(position.y*T)+17;
  box(ctx,footX-5,footY-1,10,2,"rgba(55,54,33,.24)");
  box(ctx,footX-3,footY+1,6,1,"rgba(55,54,33,.16)");
  if (dust) {
    const trailX=dust.dir==="right"?-1:dust.dir==="left"?1:0;
    const trailY=dust.dir==="down"?-1:dust.dir==="up"?1:0;
    for (let i=0;i<3;i++) {
      const drift=(3+i*2)*dust.phase;
      box(ctx,dust.x*T+10+trailX*(2+drift)+(i-1)*2,
        dust.y*T+17+trailY*drift-drift*.65,1+(i===1?1:0),1,`rgba(222,195,135,${.8*(1-dust.phase)})`);
    }
  }
  if (action && art.actions && action.use.origin.x===state.player.x && action.use.origin.y===state.player.y) {
    const index = { hoe: 0, seed: 1, water: 2, harvest: 3 }[action.use.tool];
    const row = index*4 + facingRows[action.use.origin.dir];
    ctx.drawImage(art.actions, action.frame*48, row*48, 48, 48,
      Math.round(position.x*T)-14, Math.round(position.y*T)-23, 48, 48);
  } else if (weight && art.turns) {
    ctx.drawImage(art.turns,weight.column*32,weight.row*40,32,40,
      Math.round(position.x*T)-6+weight.shiftX,Math.round(position.y*T)-18+weight.shiftY,32,40);
  } else if (pose !== null && art.gaits) {
    const row = facingRows[position.dir] + (running ? 4 : 0);
    ctx.drawImage(art.gaits, pose*32, row*40, 32, 40,
      Math.round(position.x*T)-6, Math.round(position.y*T)-18, 32, 40);
  } else {
    actor("A01", position.x, position.y, position.dir, pose === null ? 1 : (pose < 3 ? 0 : 2), "#295d4d");
  }
  if (action && art.effects && action.effect>=0) {
    const row={hoe:0,seed:1,water:2,harvest:3}[action.use.tool];
    const {x,y}=action.use.target;
    ctx.drawImage(art.effects,action.effect*16,row*16,16,16,x*T+2,y*T+1,16,16);
  }
  for (const npc of ordered) if (npc.y>position.y) drawNpc(npc);
  const dusk=Math.max(0,Math.min(1,(state.minutes-960)/240));
  if (dusk) {
    ctx.fillStyle=`rgba(62,45,94,${dusk*.32})`;
    ctx.fillRect(cameraX,cameraY,canvas.width,canvas.height);
  }

}
