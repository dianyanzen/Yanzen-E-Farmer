import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import vm from "node:vm";
import {createRequire} from "node:module";
import ts from "typescript";
function loadTypescript(path){
 const compiled=ts.transpileModule(readFileSync(path,"utf8"),{
   compilerOptions:{esModuleInterop:true,module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 const module={exports:{}};
 vm.runInNewContext(compiled,{exports:module.exports,module,require:createRequire(new URL("../"+path,import.meta.url))});
 return module.exports;
}
const {facing,newGame,safeLoad,fishingWaterAt,newFishingInventory,castRod,finishFishingAttempt}=
 loadTypescript("src/lib/game/model.ts");
const {planFishingSession,fishingCatchSucceeds,FISHING_WAIT_MIN_MS,FISHING_WAIT_SPAN_MS,
  FISHING_CAST_MS,FISHING_BITE_WINDOW_MS,FISHING_REEL_MS}=loadTypescript("src/lib/game/fishing-session.ts");

assert.ok(FISHING_WAIT_MIN_MS>=4000,"The player must visibly wait several real seconds");
assert.ok(FISHING_WAIT_MIN_MS+FISHING_WAIT_SPAN_MS>=8000,"Waiting must be variable");
assert.ok(FISHING_CAST_MS>300&&FISHING_REEL_MS>=1200&&FISHING_BITE_WINDOW_MS>=1200);
assert.equal(JSON.stringify(planFishingSession(0,0,0)),JSON.stringify({waitMs:4800,willBite:true,species:"lele"}));
assert.equal(JSON.stringify(planFishingSession(.999,.999,.999)),JSON.stringify({waitMs:9195,willBite:false,species:"nila"}));
assert.equal(fishingCatchSucceeds(0),true);
assert.equal(fishingCatchSucceeds(.999),false);
assert.throws(()=>planFishingSession(NaN,.5,.5));
assert.throws(()=>fishingCatchSucceeds(1));
let bites=0,catches=0;
for(let i=0;i<1000;i++){
  const a=planFishingSession((i*67%1000)/1000,(i*199%1000)/1000,(i*37%1000)/1000);
  if(a.willBite)bites++;
  if(a.willBite&&fishingCatchSucceeds((i*83%1000)/1000))catches++;
}
assert.ok(bites>650&&bites<900,"No-bite probability must stay meaningful");
assert.ok(catches>380&&catches<780,"100% guaranteed catch is forbidden");

const base=newGame();
const state={...base,location:"sungai",equippedTool:"fishing_rod",
 carriedTools:["fishing_rod"],storedTools:base.storedTools.filter(x=>x!=="fishing_rod"),
 fishing:{...newFishingInventory(),bait:12}};
let spot=null;
for(let y=0;y<16&&!spot;y++)for(let x=0;x<32&&!spot;x++){
 for(const dir of ["up","down","left","right"]){
  const sample={...state,player:{x,y,dir}};
  const target=facing(sample.player);
  if(fishingWaterAt(sample,target.x,target.y)){spot=sample;break;}
 }
}
assert.ok(spot,"Find a valid river fishing tile");
const cast=castRod(spot);
assert.notEqual(cast,spot);
assert.equal(cast.fishing.bait,11);
assert.equal(cast.fishing.stats.casts,1);
assert.equal(cast.fishing.caught,0);
assert.equal(cast.fishing.line,null,"Casting must not instantly hook an item");
assert.equal(JSON.stringify(cast.fishing.fish),JSON.stringify(spot.fishing.fish),"Fish inventory unchanged while waiting");
const withoutBait={...spot,fishing:{...spot.fishing,bait:0}};
assert.equal(castRod(withoutBait),withoutBait);
const noBite=finishFishingAttempt(cast,"no_bite");
assert.equal(noBite.fishing.stats.noBite,1);
assert.equal(noBite.fishing.caught,0);
const early=finishFishingAttempt(cast,"early");
assert.equal(early.fishing.stats.missed,1);
assert.equal(early.fishing.stats.bites,0);
const late=finishFishingAttempt(cast,"late");
assert.equal(late.fishing.stats.missed,1);
assert.equal(late.fishing.stats.bites,1);
const escaped=finishFishingAttempt(cast,"escaped");
assert.equal(escaped.fishing.stats.escaped,1);
assert.equal(escaped.fishing.caught,0);
assert.equal(escaped.fishing.stats.bites,1);
const cancelled=finishFishingAttempt(cast,"cancelled");
assert.equal(cancelled.fishing.stats.cancelled,1);
const caught=finishFishingAttempt(cast,"caught","lele");
assert.equal(caught.fishing.stats.bites,1);
assert.equal(caught.fishing.caught,1);
assert.equal(caught.fishing.fish.lele,1);
assert.equal(caught.fishing.stats.caughtBySpecies.lele,1);
assert.equal(caught.fishing.fish.bandeng,0,"No marine fish from inland river");
const loaded=safeLoad(JSON.parse(JSON.stringify(caught)));
assert.ok(loaded,"Save roundtrip must support V2 fishing statistics");
assert.equal(loaded.fishing.stats.caughtBySpecies.lele,1);
assert.equal(loaded.fishing.fish.lele,1);
const legacy=JSON.parse(JSON.stringify(spot));
legacy.fishing={bait:4,fish:{bandeng:2,kakap_putih:1,belanak:3},line:"bandeng",caught:6,sold:8,seedPacks:1,cropsSold:2};
const migrated=safeLoad(legacy);
assert.ok(migrated,"Legacy fish bags and data must remain valid");
assert.equal(migrated.fishing.caught,6);
assert.equal(migrated.fishing.line,null,"Never award an instant fish from an old unfinished line");
assert.equal(migrated.fishing.fish.bandeng,2);
assert.equal(migrated.fishing.fish.lele,0);
assert.equal(migrated.fishing.stats.casts,0,"Do not invent historical casts");
const sold={...caught,fishing:{...caught.fishing,fish:{...caught.fishing.fish,lele:0},sold:1}};
assert.equal(sold.fishing.stats.caughtBySpecies.lele,1,"Species achievements survive selling");
const ui=readFileSync("src/app/game/game-client.tsx","utf8");
const css=readFileSync("src/app/game/game.css","utf8");
assert.ok(ui.includes("<FishingScene")&&ui.includes('phase==="bite"')&&ui.includes('fishingRef.current'));
assert.ok(ui.includes("finishFishing")&&ui.includes("fishingCatchSucceeds"));
assert.ok(css.includes("yzg-fishing-float")&&css.includes("yzg-fish-cast")&&css.includes("yzg-fishing-bite"));
assert.ok(css.includes("prefers-reduced-motion:reduce"));
console.log("PASS: delayed variable bites, misses, no-bite, escapes, catches, animations and legacy save migration");
