import { Direction, FarmTool, GameState, NPCS, WORLD, facing, isFarm } from "./model";

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
export type WorldArt = { people?: HTMLImageElement; cucumber?: HTMLImageElement; landscape?: HTMLImageElement; actions?: HTMLImageElement };
const actorRows = { A01: 0, A03: 1, C01: 2, C08: 3 } as const;
const facingRows = { down: 0, left: 1, right: 2, up: 3 } as const;

export type FarmAnimation = { tool: FarmTool; frame: number };
export function drawWorld(canvas: HTMLCanvasElement, state: GameState, art: WorldArt,
                          position: { x: number; y: number; dir: Direction }, pose: number, action?: FarmAnimation) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const cameraX = Math.round(Math.min(W*T - canvas.width, Math.max(0, (position.x + .5)*T - canvas.width/2)));
  const cameraY = Math.round(Math.min(H*T - canvas.height, Math.max(0, (position.y + .5)*T - canvas.height/2)));
  ctx.setTransform(1, 0, 0, 1, -cameraX, -cameraY);
  ctx.imageSmoothingEnabled = false;
  ctx.font = "bold 8px monospace";
  if (art.landscape) ctx.drawImage(art.landscape, 0, 0);
  else {
    box(ctx,0,0,W*T,H*T,"#a7c465");
    box(ctx,3*T,8*T,8*T,6*T,"#b58c57");
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
  function actor(id: keyof typeof actorRows, x: number, y: number, dir: Direction, frame: number, color: string) {
    if (art.people) {
      const row = actorRows[id] * 4 + facingRows[dir];
      ctx!.drawImage(art.people, frame*24, row*32, 24, 32, Math.round(x*T)-2, Math.round(y*T)-12, 24, 32);
    } else {
      drawPerson(ctx!, x, y, color, "#e4b48b", "#553a2c", id === "A01");
    }
  }
  for (const npc of NPCS) {
    actor(npc.id, npc.x, npc.y, "down", 1, npc.color);
    if (Math.abs(npc.x-state.player.x)+Math.abs(npc.y-state.player.y)<=2) label(ctx, npc.name, npc.x*T-2, npc.y*T-15);
  }
  // Player and their current tile target.
  const target=facing(state.player);
  if(isFarm(target.x,target.y)){ctx.strokeStyle="#f9e5b3";ctx.lineWidth=1;ctx.strokeRect(target.x*T+1,target.y*T+1,T-2,T-2);}
  if (action && art.actions) {
    const index = { hoe: 0, seed: 1, water: 2, harvest: 3 }[action.tool];
    const row = index*4 + facingRows[state.player.dir];
    ctx.drawImage(art.actions, action.frame*48, row*48, 48, 48,
      Math.round(position.x*T)-14, Math.round(position.y*T)-23, 48, 48);
  } else {
    actor("A01", position.x, position.y, position.dir, pose, "#295d4d");
  }
}
