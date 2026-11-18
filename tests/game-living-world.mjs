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
  getActionContext,chooseSocial,safeLoad,weatherForDay,nextDay,areaBlocked,mapExit}=model;
let s=newGame();
assert.equal(npcHere(s).length,3,"intro NPCs all visible on early morning");
assert.equal(npcWhere(s,"A03").location,"field");
assert.equal(npcWhere({...s,minutes:13*60},"A03").location,"sungai");
assert.equal(npcWhere({...s,minutes:13*60},"C01").location,"gang");
assert.equal(npcWhere({...s,minutes:13*60},"C08").location,"pasar");
assert.equal(npcWhere({...s,minutes:20*60},"C08").location,"field");
assert.equal(areaTitle("sungai"),"Bantaran Sungai");
assert.equal(mapExit("field",22,10,"up"),null);
assert.equal(mapExit("field",22,10,"right").location,"gang");
assert.equal(areaBlocked("sungai",3,11),true,"river is a physical limit");
assert.equal(areaBlocked("sungai",12,11),false);
assert.equal(areaBlocked("pasar",5,7),true,"stall collision");
assert.equal(areaBlocked("gang",5,7),true,"house collision");

let step=movePlayer({...s,player:{x:22,y:10,dir:"right"}},"right");
assert.equal(step.location,"gang");assert.equal(step.player.x,1);assert.equal(step.player.y,10);
assert.equal(safeLoad(JSON.parse(JSON.stringify(step))).location,"gang","zone survives save/reload");
let back=movePlayer({...step,player:{x:1,y:10,dir:"left"}},"left");
assert.equal(back.location,"field");assert.equal(back.player.x,22);
const market=movePlayer({...step,player:{x:11,y:5,dir:"up"}},"up");
assert.equal(market.location,"pasar");assert.equal(market.player.y,14);
const toGang=movePlayer({...market,player:{x:11,y:14,dir:"down"}},"down");
assert.equal(toGang.location,"gang");assert.equal(toGang.player.y,6);
const river=movePlayer({...toGang,player:{x:11,y:14,dir:"down"}},"down");
assert.equal(river.location,"sungai");assert.equal(river.player.y,5);
const riverBack=movePlayer({...river,player:{x:11,y:5,dir:"up"}},"up");
assert.equal(riverBack.location,"gang");assert.equal(riverBack.player.y,14);

const afternoon={...s,minutes:780,location:"pasar",player:{x:15,y:11,dir:"up"}};
assert.equal(getActionContext(afternoon).kind,"npc","Inggit is interactable at market");
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
const portal=planTapRoute(s,22,10);
assert.equal(portal.exit,"right");
const talk=planTapRoute(s,13,8);
assert.ok(talk?.interact,"tap NPC plans approach and talk");
assert.equal(planTapRoute(s,-1,8),null,"cannot tap outside world");
assert.equal(planTapRoute({...s,location:"sungai",player:{x:12,y:8,dir:"left"}},3,8),null,
  "cannot auto-walk through river");
console.log("Living-world QA: 4 maps, 6 transitions, NPC schedules, choice memory, rain, taps: PASS");
