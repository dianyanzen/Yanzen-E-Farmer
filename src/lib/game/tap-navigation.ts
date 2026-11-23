import { fishingWaterAt, areaBlocked, WORLD, SHED, facesInteractionHitbox, interactionHitboxAt, isOutdoorLocation, isFarm, mapExit, npcHere, routeBarrierAt,
  type Direction,type GameState, signpostAt, questPropAt, questPropActive, getActionContext } from "./model";
import roomUX from "./world-layout-data.json";

export type TapRoute={steps:Direction[];face:Direction|null;interact:boolean;exit:Direction|null;targetLabel?:string};
const dirs:{dir:Direction;dx:number;dy:number}[]=[
  {dir:"up",dx:0,dy:-1},{dir:"right",dx:1,dy:0},
  {dir:"down",dx:0,dy:1},{dir:"left",dx:-1,dy:0}
];
const k=(x:number,y:number)=>x+","+y;
type RoomTapTarget=(typeof roomUX.tapTargets.home)[number] | (typeof roomUX.tapTargets.shed)[number];
function indoorTapTarget(s:GameState,px:number,py:number):RoomTapTarget|null {
  if(s.location!=="home"&&s.location!=="shed")return null;
  return roomUX.tapTargets[s.location].find(obj=>{
    const [l,t,r,b]=obj.rect;
    return px>=l&&px<=r&&py>=t&&py<=b;
  })??null;
}
function distanceToRect(px:number,py:number,rect:readonly number[]){
  const [l,t,r,b]=rect;
  return Math.hypot(Math.max(l-px,0,px-r),Math.max(t-py,0,py-b));
}

export function planTapRoute(s:GameState,tx:number,ty:number, point?: { x: number; y: number }):TapRoute|null {
  if(!Number.isInteger(tx)||!Number.isInteger(ty)||tx<0||tx>=WORLD.width||ty<0||ty>=WORLD.height)return null;
  const people=npcHere(s);
  const occupied=(x:number,y:number)=>people.some(n=>n.x===x&&n.y===y);
  const traversable=(x:number,y:number)=>!areaBlocked(s.location,x,y,s)&&!occupied(x,y);
  const isLocked=isOutdoorLocation(s.location)&&!!routeBarrierAt(s.location,tx,ty);
  const isSign = isOutdoorLocation(s.location) && !!signpostAt(s.location,tx,ty);
  const px=point?.x??(tx+.5)*WORLD.tile,py=point?.y??(ty+.5)*WORLD.tile;
  const indoor=indoorTapTarget(s,px,py);
  const hitbox = interactionHitboxAt(s.location,px,py);
  const questProp=questPropAt(s.location,tx,ty);
  const clickable=(!!questProp && questPropActive(s,questProp)) ||
    (s.location==="field" && tx===6 && ty===5) || (s.equippedTool==="fishing_rod" && fishingWaterAt(s,tx,ty)) || (s.location==="sungai" && tx===6 && ty===7) || isLocked || isSign || occupied(tx,ty) ||
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
  // For room objects, navigate to a reachable standing tile and face the
  // actual object. A tap on furniture is NOT a request to walk into furniture.
  const indoorCandidates=indoor ? queue.flatMap(tile=>dirs.flatMap(d=>{
    const frontX=tile.x+d.dx,frontY=tile.y+d.dy;
    const centerX=(frontX+.5)*WORLD.tile,centerY=(frontY+.5)*WORLD.tile;
    // A player can stand a whole tile away from an object's visual edge.
    if(distanceToRect(centerX,centerY,indoor.rect)>26)return [];
    const context=getActionContext({...s,player:{...s.player,x:tile.x,y:tile.y,dir:d.dir}});
    return context.kind===indoor.kind && context.label===indoor.label ?
      [{...tile,face:d.dir,interact:true,exit:null as Direction|null,targetLabel:indoor.label}]:[];
  })) : null;
  // If the user taps a solid tile that is not a functional object, stop at
  // the nearest reachable floor instead of silently refusing to move.
  const nearestFloor=(!indoor && !hitbox && !clickable && !traversable(tx,ty) &&
    (s.location==="home"||s.location==="shed")) ?
    queue.slice().sort((a,b)=>{
      const da=(a.x+.5)*WORLD.tile-px,db=(b.x+.5)*WORLD.tile-px;
      const ya=(a.y+.5)*WORLD.tile-py,yb=(b.y+.5)*WORLD.tile-py;
      return da*da+ya*ya-(db*db+yb*yb) ||
        (distance.get(k(a.x,a.y))??0)-(distance.get(k(b.x,b.y))??0);
    }).slice(0,1).map(tile=>({...tile,face:null as Direction|null,
      interact:false,exit:null as Direction|null})) : null;
  const targets=indoorCandidates ?? (hitbox ? queue.flatMap(tile => dirs.filter(d =>
    facesInteractionHitbox({ ...tile, dir: d.dir }, hitbox)).map(d =>
    ({ ...tile, face: d.dir, interact: true, exit: null }))) : clickable?
    dirs.map(d=>({x:tx-d.dx,y:ty-d.dy,face:d.dir,interact:true,exit:null as Direction|null})):
    nearestFloor??[{x:tx,y:ty,face:null as Direction|null,interact:false,exit:exits[0]?.dir??null}]);
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
  return {steps,face:goal.face,interact:goal.interact,exit:goal.exit,...("targetLabel" in goal && typeof goal.targetLabel==="string"?{targetLabel:goal.targetLabel}:{})};
}
