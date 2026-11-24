import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createRequire} from "node:module";
import vm from "node:vm";
import ts from "typescript";

const source=readFileSync("src/lib/game/fishing-visuals.ts","utf8");
const js=ts.transpileModule(source,{
 compilerOptions:{esModuleInterop:true,module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}
}).outputText;
const module={exports:{}};
vm.runInNewContext(js,{exports:module.exports,module,
 require:createRequire(new URL("../src/lib/game/fishing-visuals.ts",import.meta.url))});
const {fishingGeometry,fishingPopupLabel,fishingPopupPosition,FISHING_TILE_PX}=module.exports;
assert.equal(FISHING_TILE_PX,20);
const axes={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]};
for(const dir of Object.keys(axes)){
 const pos={x:5,y:11,dir};
 const casting=fishingGeometry(pos,"casting",0);
 const middle=fishingGeometry(pos,"casting",300);
 const waiting=fishingGeometry(pos,"waiting",4200);
 const bite=fishingGeometry(pos,"bite",100);
 const reeling=fishingGeometry(pos,"reeling",600);
 assert.equal(waiting.center.x,110);assert.equal(waiting.center.y,230);
 assert.equal(waiting.water.x,110+axes[dir][0]*20);
 assert.equal(waiting.water.y,230+axes[dir][1]*20);
 assert.ok(Math.abs(waiting.float.x-waiting.water.x)<.2,
  "Bobber's X must be inside the adjacent water tile: "+dir);
 assert.ok(Math.abs(waiting.float.y-waiting.water.y)<1,
  "Bobber's Y must stay on water: "+dir);
 assert.ok(waiting.rodLength>=8 && waiting.rodLength<30,
  "Fishing pole must be small compared with the 20px actor grid: "+dir);
 assert.ok(!casting.showFloat && middle.showFloat);
 assert.ok(casting.bodyShift!==middle.bodyShift || casting.spriteFrame!==middle.spriteFrame,
  "Casting must animate Yanzen's body and hands");
 assert.notEqual(bite.float.y,waiting.float.y,"Bite must dip the bobber");
 assert.ok(reeling.float.x!==waiting.float.x || reeling.float.y!==waiting.float.y,
  "Reeling must draw the line back toward Yanzen");
 for(const phase of [casting,middle,waiting,bite,reeling]){
  for(const p of [phase.hand,phase.shoulder,phase.tip,phase.float]){
   assert.ok(Number.isFinite(p.x)&&Number.isFinite(p.y),"No invalid fishing coords");
  }
 }
}
assert.equal(fishingPopupLabel("caught","lele"),"LELE +1");
assert.equal(fishingPopupLabel("caught","nila"),"NILA +1");
assert.equal(fishingPopupLabel("escaped"),"IKAN LEPAS");
const above=fishingPopupPosition({x:5,y:11},850);
assert.ok(above.y<11*20,"Catch notification belongs above Yanzen, not viewport center");
assert.ok(above.alpha>0);
assert.equal(fishingPopupPosition({x:5,y:11},3200).alpha,0);
const ui=readFileSync("src/app/game/fishing-scene.tsx","utf8");
const client=readFileSync("src/app/game/game-client.tsx","utf8");
assert.ok(!ui.includes("yzg-fishing-effect")&&!ui.includes("yzg-fishing-rod"),
 "HUD must not draw detached fishing gear");
assert.ok(!client.includes("<FishingResult")&&client.includes("startedAt:performance.now()"),
 "Overhead result must be drawn only inside the game world");
console.log("PASS: four-direction Yanzen casting, real water-tile bobber, small rod, reel and overhead result; no viewport-center overlay");
