import type { WeightPose } from "./footwork";
import type { ToolUse } from "./field-engine";
import { Direction, GameState, WORLD, facing, isFarm, HOME, SHED, npcHere, weatherForDay, type NpcPlacement } from "./model";
import { drawOutdoorArea } from "./pasirluyu-areas";
import {drawFieldRoads,drawRouteClosures} from "./pasirluyu-master-map";

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
export type WorldArt = { people?: HTMLImageElement; gaits?: HTMLImageElement; turns?: HTMLImageElement; cucumber?: HTMLImageElement; landscape?: HTMLImageElement; effects?: HTMLImageElement; actions?: HTMLImageElement;
  pasirluyuDay?: HTMLImageElement; pasirluyuEvening?: HTMLImageElement;
  rumahDay?: HTMLImageElement; rumahEvening?: HTMLImageElement; gudangInterior?: HTMLImageElement;
};
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
  if(state.location==="shed"){
    if (art.gudangInterior) ctx.drawImage(art.gudangInterior,0,0,W*T,H*T);
    else {
    box(ctx,0,0,W*T,H*T,"#282c2b");
    box(ctx,7*T,5*T,11*T,10*T,"#53402f");
    box(ctx,8*T,6*T,9*T,8*T,"#af8960");
    for(let row=6;row<14;row++)for(let col=8;col<17;col++){
      box(ctx,col*T,row*T,19,1,"#75593d");box(ctx,col*T,row*T,1,20,"#cea67a");
    }
    box(ctx,9*T,6*T,2*T,2*T,"#60442d");
    box(ctx,9*T+3,6*T+3,34,9,"#caa476");
    box(ctx,9*T+3,6*T+14,34,8,"#7b5232");
    box(ctx,9*T+3,7*T+6,34,8,"#9c743f");
    box(ctx,14*T,6*T,2*T,2*T,"#526750");
    box(ctx,14*T+3,6*T+3,30,8,"#849a78");
    box(ctx,SHED.exit.x*T,SHED.exit.y*T,20,20,"#60432f");
    label(ctx,"GUDANG ALAT",9*T,5*T-4);
    label(ctx,"Rak: dekati + Aksi",8*T,14*T+14);
    }
    if(art.people){const row=facingRows[position.dir];ctx.drawImage(art.people,24,row*32,24,32,
      Math.round(position.x*T)-2,Math.round(position.y*T)-12,24,32);}
    else drawPerson(ctx,position.x,position.y,"#295d4d","#e4b48b","#553a2c",true);
    return;
  }
  if (state.location === "home") {
    if (art.rumahDay || art.rumahEvening) ctx.drawImage((state.minutes>=18*60 && art.rumahEvening ? art.rumahEvening : (art.rumahDay ?? art.rumahEvening!)),0,0,W*T,H*T);
    else {
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
    }
    if(art.people) {
      const row=facingRows[position.dir];
      ctx.drawImage(art.people,24,row*32,24,32,Math.round(position.x*T)-2,Math.round(position.y*T)-12,24,32);
    } else drawPerson(ctx,position.x,position.y,"#295d4d","#e4b48b","#553a2c",true);
    return;
  }
  // Keep farm art and terrain separate from other real, connected neighborhoods.
  const byTile = new Map(plots.map(crop => [crop.x + "," + crop.y, crop]));
  if(state.location!=="field"){
    drawOutdoorArea(ctx,state.location,ambient);
  }else{
  // Home entrance is an explicit interaction on the village building edge.
  if (art.landscape) ctx.drawImage(art.landscape, 0, 0);
  else {
    box(ctx,0,0,W*T,H*T,"#a7c465");
    box(ctx,3*T,8*T,8*T,6*T,"#b58c57");
  }
  // Decorative overlay is aligned with the original 480×320 Pasirluyu collision map.
  // The town's right-hand Warung Inggit remains visible and interactive.
  const villageArt = state.minutes>=18*60 && art.pasirluyuEvening ?
    art.pasirluyuEvening : (art.pasirluyuDay ?? art.pasirluyuEvening);
  if(villageArt) ctx.drawImage(villageArt,0,0,W*T,H*T);
  else {
    box(ctx,HOME.door.x*T,HOME.door.y*T,20,8,"#725039");
    box(ctx,SHED.door.x*T,SHED.door.y*T,20,8,"#59412f");
    label(ctx,"GUDANG",SHED.door.x*T-4,SHED.door.y*T-8);
    label(ctx,"RUMAH",HOME.door.x*T-4,HOME.door.y*T-8);
  }
  // Both sides of the road use identical world-coordinate atlas texture.
  drawFieldRoads(ctx);
  label(ctx,"GANG →",19*T,10*T-6);
  // Natural East and South edges now have visible trees/fence matching collisions.
  for(let y=5;y<16;y++)if(y!==10&&y!==11){
    box(ctx,23*T,y*T,20,20,"#406745");
    box(ctx,23*T+4,y*T+2,14,11,"#629059");
    box(ctx,23*T+8,y*T+12,5,7,"#6a5137");
  }
  for(let x=0;x<23;x++){
    box(ctx,x*T,15*T,20,20,x%2?"#547d4b":"#466c44");
    box(ctx,x*T+2,15*T+2,16,9,"#75a265");
    box(ctx,x*T+3,15*T+15,15,2,"#6d583f");
  }
  // World-space ripples stay inside the original canal banks.
  for (let i=0;i<16;i++) {
    const x=2+(i*13+Math.floor(ambient/2))%25, y=186+(i*23+ambient)%130;
    box(ctx,x,y,3+(i%4),1,i%2?"#98d1bd":"#79c1b7");
  }
  // IMPORTANT: pasirluyu.png shows decorative mature cucumber rows.
  // Cover the whole farm with state-backed tiles so the visuals NEVER lie:
  // empty = dry soil, -1 = furrows, 0..2 = growing, 3 = harvestable.
  for(let y=8;y<=13;y++)for(let x=3;x<=10;x++){
    const px=x*T, py=y*T;
    const plot=byTile.get(x+","+y);
    const variant=(x*5+y*3)%4;
    const base=["#a47d52","#ae855a","#aa8056","#b28b5e"][variant];
    box(ctx,px,py,T,T,"#684f39");
    box(ctx,px+1,py+1,T-2,T-2,base);
    box(ctx,px+2,py+3,T-4,2,"#c29b67");
    box(ctx,px+4,py+12,T-8,1,"#96704c");
    box(ctx,px+9,py+7,2,1,"#d0ac73");
    if(!plot){
      box(ctx,px+14,py+16,2,1,"#8b6949");
      continue;
    }
    box(ctx,px+1,py+2,T-2,T-4,plot.watered?"#58473a":"#76513c");
    box(ctx,px+3,py+6,T-6,2,plot.watered?"#78634b":"#98704f");
    box(ctx,px+3,py+13,T-6,2,plot.watered?"#6e5943":"#916446");
    if(plot.stage===-1){
      box(ctx,px+3,py+8,14,1,"#b88f60");
      box(ctx,px+5,py+11,10,1,"#b88f60");
    }else if(art.cucumber){
      ctx.drawImage(art.cucumber,plot.stage*16,0,16,16,px+2,py+2,16,16);
    }else{
      const height=5+plot.stage*3;
      box(ctx,px+9,py+16-height,2,height,"#347346");
      box(ctx,px+4,py+12-plot.stage*2,7+plot.stage,3,"#4d994f");
      box(ctx,px+11,py+10-plot.stage*2,6,3,"#80ad5d");
      if(plot.stage===3){box(ctx,px+6,py+10,4,6,"#9bcf52");box(ctx,px+13,py+12,3,5,"#c2d971");}
    }
    if(plot.watered&&plot.stage<3){
      box(ctx,px+15,py+3,3,4,"#68bacf");
      box(ctx,px+16,py+2,1,2,"#b5e7e8");
    }
    if(plot.stage===3){
      // Gold corner for ready harvest, contrasting with green growing crops.
      box(ctx,px+2,py+2,5,2,"#ffdb81");
      box(ctx,px+2,py+4,2,3,"#ffdb81");
    }
  }
  drawRouteClosures(ctx,"field");
  }
  function actor(id: keyof typeof actorRows, x: number, y: number, dir: Direction, frame: number, color: string) {
    if (art.people) {
      const row = actorRows[id] * 4 + facingRows[dir];
      ctx!.drawImage(art.people, frame*24, row*32, 24, 32, Math.round(x*T)-2, Math.round(y*T)-12, 24, 32);
    } else {
      drawPerson(ctx!, x, y, color, "#e4b48b", "#553a2c", id === "A01");
    }
  }
  function drawNpc(npc: NpcPlacement) {
    const dx=position.x-npc.x,dy=position.y-npc.y;
    const near=Math.abs(dx)+Math.abs(dy)<=2;
    let dir: Direction="down";
    if (near) dir=Math.abs(dx)>Math.abs(dy)?(dx<0?"left":"right"):(dy<0?"up":"down");
    actor(npc.id,npc.x,npc.y,dir,1,npc.color);
    if (near) label(ctx!,npc.name,npc.x*T-2,npc.y*T-15);
  }
  const ordered=npcHere(state).sort((a,b)=>a.y-b.y);
  for (const npc of ordered) if (npc.y<=position.y) drawNpc(npc);
  // Player and their current tile target.
  const target=facing(state.player);
  if(state.location==="field" && isFarm(target.x,target.y)){
    const plot=byTile.get(target.x+","+target.y);
    ctx.strokeStyle=plot?.stage===3?"#ffd46e":plot?.watered?"#89dbe8":"#f9e5b3";
    ctx.lineWidth=1;
    ctx.strokeRect(target.x*T+1,target.y*T+1,T-2,T-2);
  }
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
  if(weatherForDay(state.day)==="hujan"){
    // Deterministic, low-cost rain overlay; crop moisture is simulated in nextDay().
    for(let i=0;i<44;i++){
      const px=(i*79+ambient*7)%(W*T),py=(i*47+ambient*11)%(H*T);
      box(ctx,px,py,1,5,"rgba(188,226,242,.63)");
    }
    ctx.fillStyle="rgba(37,71,82,.08)";
    ctx.fillRect(cameraX,cameraY,canvas.width,canvas.height);
  }
}
