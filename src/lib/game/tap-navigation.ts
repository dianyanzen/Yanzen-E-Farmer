import { areaBlocked, HOME, SHED, isFarm, mapExit, npcHere,
  type Direction,type GameState, type OutdoorLocation } from "./model";

export type TapRoute={steps:Direction[];face:Direction|null;interact:boolean;exit:Direction|null};
const dirs:{dir:Direction;dx:number;dy:number}[]=[
  {dir:"up",dx:0,dy:-1},{dir:"right",dx:1,dy:0},
  {dir:"down",dx:0,dy:1},{dir:"left",dx:-1,dy:0}
];
const k=(x:number,y:number)=>x+","+y;
export function planTapRoute(s:GameState,tx:number,ty:number):TapRoute|null {
  if(!Number.isInteger(tx)||!Number.isInteger(ty)||tx<0||tx>=24||ty<0||ty>=16)return null;
  const people=npcHere(s);
  const occupied=(x:number,y:number)=>people.some(n=>n.x===x&&n.y===y);
  const traversable=(x:number,y:number)=>!areaBlocked(s.location,x,y)&&!occupied(x,y);
  const clickable=occupied(tx,ty) ||
    (s.location==="field" && (isFarm(tx,ty) ||
      (tx===HOME.door.x&&ty===HOME.door.y)||(tx===SHED.door.x&&ty===SHED.door.y))) ||
    (s.location==="home" && ((tx===HOME.bed.x&&ty===HOME.bed.y)||
      (tx===HOME.exit.x&&ty===HOME.exit.y))) ||
    (s.location==="shed" && ((tx===SHED.rack.x&&ty===SHED.rack.y)||
      (tx===SHED.exit.x&&ty===SHED.exit.y)));
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
    s.location!=="home"&&s.location!=="shed"&&
    mapExit(s.location as OutdoorLocation,tx,ty,d.dir)!==null);
  const exits=exitDirs.filter(()=>traversable(tx,ty));
  const targets=clickable?
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
