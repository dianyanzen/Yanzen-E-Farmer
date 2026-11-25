import { fishingWaterAt, areaBlocked, WORLD, SHED, NURSERY_BENCH, facesInteractionHitbox, interactionHitboxAt, isOutdoorLocation, isFarm, mapExit, npcHere, routeBarrierAt,
  type Direction,type GameState, signpostAt, questPropAt, questPropActive } from "./model";

export type TapRoute={steps:Direction[];face:Direction|null;interact:boolean;exit:Direction|null};
const dirs:{dir:Direction;dx:number;dy:number}[]=[
  {dir:"up",dx:0,dy:-1},{dir:"right",dx:1,dy:0},
  {dir:"down",dx:0,dy:1},{dir:"left",dx:-1,dy:0}
];
const k=(x:number,y:number)=>x+","+y;
export function planTapRoute(s:GameState,tx:number,ty:number, point?: { x: number; y: number }):TapRoute|null {
  if(!Number.isInteger(tx)||!Number.isInteger(ty)||tx<0||tx>=WORLD.width||ty<0||ty>=WORLD.height)return null;
  const people=npcHere(s);
  const occupied=(x:number,y:number)=>people.some(n=>n.x===x&&n.y===y);
  const traversable=(x:number,y:number)=>!areaBlocked(s.location,x,y,s)&&!occupied(x,y);
  const isLocked=isOutdoorLocation(s.location)&&!!routeBarrierAt(s.location,tx,ty);
  const isSign = isOutdoorLocation(s.location) && !!signpostAt(s.location,tx,ty);
  const hitbox = interactionHitboxAt(s.location, point?.x ?? (tx + .5) * WORLD.tile,
    point?.y ?? (ty + .5) * WORLD.tile);
  const questProp=questPropAt(s.location,tx,ty);
  const clickable=(!!questProp && questPropActive(s,questProp)) ||
    (s.location==="field" && tx===2 && ty===8) ||
    (s.location==="field" && tx===NURSERY_BENCH.x && ty===NURSERY_BENCH.y) || (s.equippedTool==="fishing_rod" && fishingWaterAt(s,tx,ty)) || (s.location==="sungai" && tx===6 && ty===7) || isLocked || isSign || occupied(tx,ty) ||
    (s.location==="field" && isFarm(tx,ty)) ||
    (s.location==="shed" && tx===SHED.rack.x && ty===SHED.rack.y);
  const origin=k(s.player.x,s.player.y),queue=[{x:s.player.x,y:s.player.y}];
  const distance=new Map<string,number>([[origin,0]]);
  const parent=new Map<string,{prev:string;dir:Direction}>();
  for(let i=0;i<queue.length;i++){
    const {x,y}=queue[i];
    for(const {dx,dy,dir} of dirs){
      const nx=x+dx,ny=y+dy,key=k(nx,ny);
      if(distance.has(key)||!traversable(nx,ny))continue;
      distance.set(key,(distance.get(k(x,y))??0)+1);
      parent.set(key,{prev:k(x,y),dir});
      queue.push({x:nx,y:ny});
    }
  }
  const exitDirs=dirs.filter(d=>
    isOutdoorLocation(s.location)&&
    mapExit(s.location,tx,ty,d.dir)!==null);
  const exits=exitDirs.filter(()=>traversable(tx,ty));
  const targets=hitbox ? queue.flatMap(tile => dirs.filter(d =>
    facesInteractionHitbox({ ...tile, dir: d.dir }, hitbox)).map(d =>
    ({ ...tile, face: d.dir, interact: true, exit: null }))) : clickable?
    dirs.map(d=>({x:tx-d.dx,y:ty-d.dy,face:d.dir,interact:true,exit:null as Direction|null})):
    [{x:tx,y:ty,face:null as Direction|null,interact:false,exit:exits[0]?.dir??null}];
  const possibilities=targets.filter(g=>distance.has(k(g.x,g.y)))
    .sort((a,b)=>(distance.get(k(a.x,a.y))??999)-(distance.get(k(b.x,b.y))??999));
  const goal=possibilities[0];
  if(!goal)return null;
  const steps:Direction[]=[];
  for(let cursor=k(goal.x,goal.y);cursor!==origin;){
    const link=parent.get(cursor);if(!link)return null;
    steps.push(link.dir);cursor=link.prev;
  }
  steps.reverse();
  return {steps,face:goal.face,interact:goal.interact,exit:goal.exit};
}
