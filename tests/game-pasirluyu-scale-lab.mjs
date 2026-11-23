import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";
import {createRequire} from "node:module";
import vm from "node:vm";
import ts from "typescript";
const requireHere=createRequire(import.meta.url);
function loadTS(path,overrides={}){
 const source=readFileSync(path,"utf8");
 const compiled=ts.transpileModule(source,{compilerOptions:{
   module:ts.ModuleKind.CommonJS,esModuleInterop:true,target:ts.ScriptTarget.ES2022
 }}).outputText;
 const m={exports:{}};
 const req=createRequire(new URL("../"+path,import.meta.url));
 vm.runInNewContext(compiled,{module:m,exports:m.exports,require:spec=>overrides[spec]??req(spec)},{timeout:3500});
 return m.exports;
}
const metrics=JSON.parse(readFileSync("src/lib/game/character-frame-bounds.json","utf8"));
const scale=loadTS("src/lib/game/world-scale.ts");
const layout=loadTS("src/lib/game/world-layout.ts");
const hd=loadTS("src/lib/game/housing-hd.ts",{"./world-layout":layout,"./farmhouse-visual":{drawMinimalFarmhouseBase:()=>{}},"./farmhouse-native":{drawFarmhouseRoomBase:()=>{}}});
const model=loadTS("src/lib/game/model.ts");
for(const name of ["idle","gait","turn"]){
 const spec=metrics.sheets[name];
 const file="public/game/assets/characters/"+spec.asset;
 assert.equal(createHash("sha256").update(readFileSync(file)).digest("hex"),spec.sha256,
   "Re-measure alpha after editing "+name+" sheet");
 assert.equal(spec.verticalBounds.length,spec.columns*spec.rows);
 for(let i=0;i<spec.verticalBounds.length;i++){
   const f=scale.playerFrameBounds(name,i);
   const feet=scale.playerSpriteTopY(6,name,i)+f.bottom;
   assert.equal(feet,6*20+18,"Yanzen's feet jump between animation frames: "+name+"/"+i);
   assert.ok(scale.isPlausiblePlayerFrame(name,i),
     "Physical silhouette varies beyond pose tolerance: "+name+"/"+i);
 }
}
assert.equal(layout.ROOM_PROJECTION.width,layout.ROOM_PROJECTION.height,
 "Interior background must not stretch relative to world furniture");
const avatar=scale.PLAYER_BODY_TARGET_PX;
for(const room of ["home","shed"]){
 for(const crop of layout.ROOM_FURNITURE[room]){
  const rect=layout.furnitureScreenRect(crop);
  const sourceRatio=crop.width/crop.height;
  const renderRatio=rect.width/rect.height;
  assert.ok(Math.abs(sourceRatio/renderRatio-1)<.035,
    room+"/"+crop.id+" was stretched non-uniformly");
  assert.ok(rect.x>=132&&rect.x+rect.width<=364&&rect.y>=69&&rect.y+rect.height<=301,
    room+"/"+crop.id+" falls outside the floor image");
  assert.ok(rect.height<=avatar*2.75,room+"/"+crop.id+" feels oversized next to player");
 }
}
assert.ok(layout.ROOM_FURNITURE.home.every(x=>x.source==="native"),"No home atlas cuts allowed");
const bed=layout.ROOM_FURNITURE.home.find(x=>x.id==="bed");
assert.ok(bed.display.width<=55&&bed.display.height<=80,"Bed must be human-scale");
const house=hd.exteriorHDSprite("rumah-yanzen");
const shed=hd.exteriorHDSprite("gudang-kayu");
const actualGap=191-78-(house.width*284/320+shed.width*293/320)/2;
assert.ok(actualGap>0,"The native farmhouse and shed must not overlap at ground level");
const ayu=hd.exteriorHDSprite("lapak-benih");
const widi=hd.exteriorHDSprite("lapak-pancing");
assert.ok(ayu.width>widi.width,"Ayu must remain the main general store");
assert.equal(model.areaBlocked("home",9,9),true);
assert.equal(model.areaBlocked("home",12,10),false);
assert.equal(model.areaBlocked("shed",9,9),true);
assert.equal(model.areaBlocked("shed",12,10),false);
assert.equal(model.canSleep({...model.newGame(),location:"home",player:{x:10,y:8,dir:"left"}}),true);
const outdoor=readFileSync("src/lib/game/modular-outdoor.ts","utf8");
assert.match(outdoor,/patchBudget=\{field:840,gang:660,pasar:340,sungai:760\}/);
assert.match(outdoor,/index===0\?\.36:\.22/);
assert.ok(!outdoor.includes('ctx.fillText("PESISIR"'),"Inland fish tanks should not imply an ocean");
console.log("PASS: scale lab character source hashes, 144 animation frames, 8 uncluttered furniture props, market hierarchy and river vegetation");
