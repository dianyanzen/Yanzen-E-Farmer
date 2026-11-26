import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import vm from "node:vm";
import ts from "typescript";
import {createRequire} from "node:module";

const root=new URL("../src/lib/game/model.ts",import.meta.url);
const m={exports:{}};
const compiled=ts.transpileModule(readFileSync(root,"utf8"),{compilerOptions:{
  esModuleInterop:true,module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022
}}).outputText;
vm.runInNewContext(compiled,{exports:m.exports,module:m,require:createRequire(root)},{timeout:1500});
const model=m.exports;
const {newGame,movePlayer,npcSchedule,npcHere,npcAmbient,npcWhere,areaTitle,
  getActionContext,chooseSocial,safeLoad,weatherForDay,nextDay,areaBlocked,mapExit,
  PASIRLUYU_MASTER,PASIRLUYU_CHUNKS,ROUTE_BARRIERS,toWorldTile,isMasterRoad,routeBarrierAt}=model;
let s=newGame();
assert.equal(npcHere(s).length,4,"intro NPCs all visible on early morning");
assert.equal(npcWhere(s,"A03").location,"field");
assert.equal(npcWhere({...s,minutes:13*60},"A03").location,"sungai");
assert.equal(npcWhere({...s,minutes:13*60},"C01").location,"gang");
assert.equal(npcWhere({...s,minutes:13*60},"C08").location,"field");
assert.ok(npcSchedule({...s,minutes:20*60}).every(npc=>npc.indoors));
const leaving = npcWhere({...s,minutes:1081},"A03");
assert.equal(leaving.location,"sungai");
assert.equal(Math.abs(leaving.x-8)+Math.abs(leaving.y-8),1);
assert.match(getActionContext({...s,location:"gang",player:{x:8,y:8,dir:"up"}}).text,/Rumah Nani terkunci/);
const {INGGIT_WARUNG: counter}=model;
const customer={...s,minutes:780,player:{x:counter.x,y:counter.y+1,dir:"up"}};
assert.match(model.meetNpc(customer,"C08").lines[0],/Mampir dulu/);
assert.equal(model.buyWarungItem(customer,"kopi-hitam").state.coins,customer.coins-model.WARUNG_MENU["kopi-hitam"].price);
assert.equal(model.buyWarungItem({...customer,coins:0},"kopi-hitam").state.coins,0);
assert.equal(model.buyWarungItem({...customer,minutes:960},"nasi-tutug").state.coins,customer.coins);
assert.equal(model.buyWarungItem({...customer,player:{...customer.player,dir:"down"}},"bala-bala").state.coins,customer.coins);
assert.equal(model.buyWarungItem(customer,"__proto__").state,customer);
assert.equal(getActionContext({...customer,player:{x:17,y:9,dir:"up"}}).kind,"sit");
assert.equal(model.isRenderedRoad("field",19,8),true,"the rendered T-road drives NPC cost");
assert.equal(model.isRenderedRoad("field",21,7),false,"erased side branch stays off the road graph");
assert.equal(getActionContext(customer).npcId,"C08");
assert.equal(model.interactDoor(customer),customer,"players cannot enter a warung interior");
assert.equal(movePlayer(customer,"up").player.y,counter.y+1,"staff lane is inaccessible to players");
assert.equal(npcHere({...customer,location:"pasar"}).some(npc=>npc.id==="C08"),false);
assert.equal(areaBlocked("pasar",19,8),false,"the old building footprint is walkable");
const restored=safeLoad({...s,location:"warung",day:3,coins:742});
assert.equal(restored.location,"field");
assert.deepEqual([restored.player.x,restored.player.y,restored.player.dir,restored.day,restored.coins],[counter.x,counter.y+1,"up",3,742]);
assert.match(getActionContext({...customer,minutes:1200}).text,/sudah tutup/i);
const at = (id,minutes) => npcWhere({...s,minutes},id);
assert.equal(at("C08",360).activity,"Melayani dari balik konter");
assert.equal(at("C08",900).activity,"Berjalan ke pasar");
assert.equal(at("C08",960).location,"pasar");
assert.equal(at("C08",1199).indoors,false);
assert.equal(at("C08",1200).indoors,true);
assert.equal(npcHere({...s,location:"rumah-inggit",minutes:1200})[0].id,"C08");
for(const id of ["A03","C07","C01"])assert.equal(at(id,380).location,"field");
assert.equal(at("C07",model.WIDI_OPENS_AT).activity,"Melayani pemancing di lapak ikan");
assert.equal(model.atMarketCounter({...s,location:"pasar",minutes:539,player:{x:27,y:9,dir:"up"}},"C07"),false);
assert.equal(model.atMarketCounter({...s,location:"pasar",minutes:540,player:{x:27,y:9,dir:"up"}},"C07"),true);
for(const [minutes,ryan,widi] of [[380,"full","full"],[479,"full","full"],[480,"full","empty"],[719,"full","empty"],[720,"empty","empty"],[892,"empty","empty"],[893,"cleared","cleared"]]){
 assert.deepEqual([model.warungCoffee(minutes,"ryan"),model.warungCoffee(minutes,"widi")],[ryan,widi]);
}
assert.equal(at("A03",719).activity,"Ngopi di Warung Inggit");
assert.equal(at("A03",720).activity,"Berjalan ke tempat kerja");
assert.equal(at("C08",893).activity,"Merapikan warung");
assert.deepEqual([at("C08",893).x,at("C08",893).y],[18,7]);
const locations=[counter.closesAt-1,counter.closesAt,counter.closesAt+1,counter.closesAt+2,counter.closesAt+3]
 .map(minutes=>npcWhere({...s,minutes},"C08"));
for(let i=1;i<locations.length;i++){
 assert.equal(locations[i].location,"field");
 assert.ok(Math.abs(locations[i].x-locations[i-1].x)+Math.abs(locations[i].y-locations[i-1].y)<=1);
}
const coords = minutes => {
 const {x,y}=at("C08",minutes);
 return [x,y];
};
const door = [counter.staffExitX,counter.y];
const landing = [counter.staffExitX,counter.y+1];
assert.deepEqual(coords(counter.opensAt-3),landing);
assert.deepEqual(coords(counter.opensAt-2),door);
assert.deepEqual(coords(counter.cleanupAt+2),door);
assert.deepEqual(coords(counter.cleanupAt+3),landing);
assert.deepEqual(coords(counter.closesAt),landing);
assert.equal(areaBlocked("field",...door),true,"side doorway only admits the staff route");
assert.equal(areaBlocked("field",...landing),false,"the side landing lies outside the building");
const nani = at("C01",380);
assert.deepEqual([nani.x,nani.y],[counter.x-1,counter.y+1],"Nani chats at the end of the counter");
for(const id of ["A03","C07"]){
 const standing=at(id,380);
 const gap=Math.abs(standing.x-counter.table.x)+Math.abs(standing.y-counter.table.y);
 assert.ok(gap<=2,"morning guests stand around the table");
 assert.equal(areaBlocked("field",standing.x,standing.y),false);
}
assert.equal(areaTitle("sungai"),"Bantaran Sungai");
assert.equal(mapExit("field",22,10,"up"),null);
assert.equal(mapExit("field",31,10,"right").location,"gang");
assert.equal(areaBlocked("sungai",3,11),true,"river is a physical limit");
assert.equal(areaBlocked("sungai",12,11),false);
assert.equal(areaBlocked("pasar",5,7),true,"stall collision");
assert.equal(areaBlocked("field",31,9),true,"solid east hedge");
assert.equal(areaBlocked("field",12,15),true,"natural south hedge");
assert.equal(safeLoad({...newGame(),player:{x:23,y:15,dir:"right"}}).player.x,23,"old edge save migrates safely");
assert.equal(safeLoad({...newGame(),player:{x:23,y:15,dir:"right"}}).player.y,14,"old southern edge migrates safely");
assert.equal(areaBlocked("gang",5,7),true,"house collision");

let step=movePlayer({...s,player:{x:31,y:10,dir:"right"}},"right");
assert.equal(step.location,"gang");assert.equal(step.player.x,0);assert.equal(step.player.y,10);
assert.equal(safeLoad(JSON.parse(JSON.stringify(step))).location,"gang","zone survives save/reload");
let back=movePlayer({...step,player:{x:0,y:10,dir:"left"}},"left");
assert.equal(back.location,"field");assert.equal(back.player.x,31);
const market=movePlayer({...step,player:{x:11,y:0,dir:"up"}},"up");
assert.equal(market.location,"pasar");assert.equal(market.player.y,15);
const toGang=movePlayer({...market,player:{x:11,y:15,dir:"down"}},"down");
assert.equal(toGang.location,"gang");assert.equal(toGang.player.y,0);
const river=movePlayer({...toGang,player:{x:11,y:15,dir:"down"}},"down");
assert.equal(river.location,"sungai");assert.equal(river.player.y,0);
const riverBack=movePlayer({...river,player:{x:11,y:0,dir:"up"}},"up");
assert.equal(riverBack.location,"gang");assert.equal(riverBack.player.y,15);

const afternoon={...customer,minutes:780};
assert.equal(getActionContext(afternoon).kind,"npc","Inggit is interactable from the customer side");
assert.equal(getActionContext(afternoon).npcId,"C08");
assert.equal(getActionContext({...s,location:"field",minutes:780,player:{x:12,y:8,dir:"right"}}).kind,"none",
  "Ryan does not secretly interact while working by the river");
const n=chooseSocial(s,"A03","dismiss").state;
assert.equal(n.bonds.A03.lastChoice,"dismiss");
const tomorrow={...n,day:n.day+1};
assert.ok(npcAmbient(tomorrow,"A03").includes("Kemarin"),"NPC remembers yesterday's response");
assert.equal(safeLoad(JSON.parse(JSON.stringify(tomorrow))).bonds.A03.lastChoice,"dismiss");
const old=JSON.parse(JSON.stringify(tomorrow));delete old.bonds.A03.lastChoice;
assert.equal(safeLoad(old).bonds.A03.lastChoice,null,"legacy cloud saves migrate");
assert.equal(weatherForDay(5),"hujan");
const rain={...s,day:4,location:"home",player:{x:9,y:8,dir:"up"},
  plots:[{x:3,y:8,stage:1,watered:false}]};
const newDay=nextDay(rain);
assert.equal(newDay.day,5);assert.equal(newDay.plots[0].stage,1);
assert.equal(newDay.plots[0].watered,true,"rain irrigates growing crops on the new day");

const file=new URL("../src/lib/game/tap-navigation.ts",import.meta.url);
const program=ts.transpileModule(readFileSync(file,"utf8"),{compilerOptions:{
  esModuleInterop:true,module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022
}}).outputText;
const nav={exports:{}};
const localRequire=id=>id==="./model"?model:createRequire(file)(id);
vm.runInNewContext(program,{exports:nav.exports,module:nav,require:localRequire},{timeout:1500});
const {planTapRoute}=nav.exports;
const till=planTapRoute(s,10,10);
assert.ok(till && till.interact && till.face,"tap farm plot plans interaction");
assert.ok(till.steps.length>=1);
const portal=planTapRoute(s,31,10);
assert.equal(portal.exit,"right");
const talk=planTapRoute(s,16,7);
assert.ok(talk?.interact,"tap NPC plans approach and talk");
assert.equal(planTapRoute(s,-1,8),null,"cannot tap outside world");
assert.equal(planTapRoute({...s,location:"sungai",player:{x:12,y:8,dir:"left"}},3,8),null,
  "cannot auto-walk through river");

assert.equal(PASIRLUYU_MASTER.width,64);
assert.equal(PASIRLUYU_MASTER.height,48);
assert.equal(Object.keys(PASIRLUYU_CHUNKS).length,4);
const a=toWorldTile("field",31,10),b=toWorldTile("gang",0,10);
assert.equal(b.x-a.x,1);assert.equal(a.y,b.y,"East-west road shares the same global row");
assert.equal(isMasterRoad("field",23,10),true);
assert.equal(isMasterRoad("gang",0,10),true);
const c=toWorldTile("pasar",11,15),d=toWorldTile("gang",11,0);
assert.equal(d.y-c.y,1);assert.equal(c.x,d.x,"Market and gang borders meet with no teleport");
const e=toWorldTile("gang",12,15),f=toWorldTile("sungai",12,0);
assert.equal(f.y-e.y,1);assert.equal(f.x,e.x);
for(const location of ["pasar","gang","sungai","field"]){
  const closures=ROUTE_BARRIERS.filter(r=>r.location===location);
  for(const block of closures){
    const x=block.side==="left"?0:block.side==="right"?31:block.start;
    const y=block.side==="up"?0:block.side==="down"?15:block.start;
    assert.equal(areaBlocked(location,x,y),true,"Closure is a real collision: "+block.id);
    assert.equal(routeBarrierAt(location,x,y).id,block.id);
    assert.ok(block.message.length>35,"Closure has a narrative reason: "+block.id);
  }
}
assert.equal(new Set(ROUTE_BARRIERS.map(b=>b.artwork)).size,5,"Five unique blocked road artworks");
assert.equal(getActionContext({...s,location:"pasar",player:{x:11,y:1,dir:"up"}}).kind,"inspect");
const lockedTap=planTapRoute({...s,location:"pasar",player:{x:11,y:6,dir:"up"}},11,0);
assert.ok(lockedTap?.interact,"Tap on locked gate approaches for inspection");
assert.equal(safeLoad({...newGame(),location:"gang",player:{x:11,y:0,dir:"up"}}).location,"gang","Portal-border save persists");
assert.equal(safeLoad({...newGame(),location:"field",player:{x:23,y:10,dir:"right"}}).player.x,23);
console.log("Master Atlas QA: border continuity, 5 blockers, tap inspections, save continuity: PASS");

console.log("Living-world QA: 4 maps, 6 transitions, NPC schedules, choice memory, rain, taps: PASS");

for(const location of ["field","gang","pasar","sungai"]){
  const {startX,targetX}=location==="pasar"?{startX:20,targetX:28}:{startX:22,targetX:30};
  const visit={...newGame(),location,player:{x:startX,y:13,dir:"right"}};
  const route=planTapRoute(visit,targetX,13);
  assert.ok(route?.steps.length,location+" has a reachable eastern lane");
  const arrived=route.steps.reduce((state,dir)=>movePlayer(state,dir),visit);
  assert.equal(arrived.player.x,targetX);
  assert.equal(safeLoad(arrived)?.player.x,targetX);
  assert.ok(areaBlocked(location,32,13));
}

const riverVisit={...newGame(),location:"sungai",player:{x:8,y:13,dir:"left"}};
const bridgeRoute=planTapRoute(riverVisit,1,13);
assert.ok(bridgeRoute);
const across=bridgeRoute.steps.reduce((state,dir)=>movePlayer(state,dir),riverVisit);
assert.equal(across.player.x,1);
assert.equal(safeLoad(across).player.x,1);
assert.equal(areaBlocked("sungai",4,12),true);
assert.equal(areaBlocked("sungai",4,14),true);
const valveVisit={...riverVisit,player:{x:7,y:7,dir:"left"}};
assert.equal(getActionContext(valveVisit).kind,"sluice");
assert.equal(planTapRoute(valveVisit,6,7).interact,true);
assert.equal(safeLoad({...valveVisit,sluiceOpen:true}).sluiceOpen,true);

assert.equal(mapExit("field",23,10,"right"),null,"the former edge is now inside the farm");
for(const zone of ["field","gang","pasar","sungai"])
  assert.equal(areaBlocked(zone,23,10),false,"the former edge is walkable in "+zone);
assert.equal(areaBlocked("gang",26,8),false,"Widi doorstep stays accessible");
for(const [zone,x,y] of [["field",26,6],["gang",26,7],["pasar",27,7],["sungai",18,7]]){
  assert.equal(areaBlocked(zone,x,y),true,"solid scenery in "+zone);
  const standing=safeLoad({...newGame(),coins:345,location:zone,player:{x,y,dir:"up"}});
  assert.equal(standing.coins,345);
  assert.equal(areaBlocked(zone,standing.player.x,standing.player.y),false,"reload beside new footprint");
}
let prior=npcSchedule({...s,minutes:299});
let blockedCrossings=0;
for(let minutes=300;minutes<=1210;minutes++){
  const placements=npcSchedule({...s,minutes});
  const occupied=new Set();
  for(const [i,placement] of placements.entries()){
    const {location,x,y,indoors}=placement;
    const staffLane=placement.id==="C08" && location==="field" && y===counter.y && x>=counter.x && x<=counter.staffExitX;
    assert.equal(areaBlocked(location,x,y),staffLane,placement.id+" route must be traversable for its role");
    const last=toWorldTile(prior[i].location,prior[i].x,prior[i].y);
    const next=toWorldTile(location,x,y);
    assert.ok(Math.abs(next.x-last.x)+Math.abs(next.y-last.y)<=1,"NPC takes consecutive steps across seams");
    if(!indoors){
      const key=location+":"+x+","+y;
      assert.ok(!occupied.has(key),"residents have distinct positions at "+minutes);
      occupied.add(key);
    }
    if(location!==prior[i].location){
      const departure=prior[i];
      const dir=x===0?"right":x===model.WORLD.width-1?"left":y===0?"down":"up";
      const attempt=movePlayer({...s,minutes,location:departure.location,player:{x:departure.x,y:departure.y,dir}},dir);
      assert.equal(attempt.location,departure.location,"occupied portal destination prevents crossing");
      blockedCrossings++;
    }
  }
  prior=placements;
}
assert.ok(blockedCrossings>=6);
