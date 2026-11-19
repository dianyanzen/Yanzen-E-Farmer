import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import vm from "node:vm";
import ts from "typescript";
import {createRequire} from "node:module";

const root=new URL("../src/lib/game/model.ts",import.meta.url);
function compile(file,provided={}){
  const source=readFileSync(file,"utf8");
  const output=ts.transpileModule(source,{compilerOptions:{
    esModuleInterop:true,module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022
  }}).outputText;
  const module={exports:{}};
  const modRequire=id=>provided[id]??createRequire(file)(id);
  vm.runInNewContext(output,{module,exports:module.exports,require:modRequire},{timeout:3500});
  return module.exports;
}
const model=compile(root);
const roads=compile(new URL("../src/lib/game/pasirluyu-master-map.ts",import.meta.url),{"./model":model});
const {
  mapExit,areaBlocked,isMasterRoad,toWorldTile,ROUTE_PORTALS,PASIRLUYU_CHUNKS
}=model;
const {ROAD_STYLE,ROAD_SEAMS,drawMasterRoadTile,drawFieldRoads,drawMarketCourtyard,drawMasterGround}=roads;
assert.equal(ROAD_STYLE.base,"#ddc38a","road colour matches legacy farm gravel");
assert.equal(ROAD_STYLE.width,40);
assert.equal(ROAD_SEAMS.farmEast.topAtSeam,200);
assert.equal(ROAD_SEAMS.farmEast.bottomAtSeam,240);
assert.equal(ROAD_SEAMS.farmSouth.leftAtSeam,360);
assert.equal(ROAD_SEAMS.farmSouth.rightAtSeam,400);

const mock=()=>({
  cells:[],clips:0,saves:0,restores:0,
  beginPath(){},moveTo(){},bezierCurveTo(){},lineTo(){},closePath(){},
  clip(){this.clips++},save(){this.saves++},restore(){this.restores++},
  fillRect(x,y,w,h){this.cells.push({x,y,w,h,color:this.fillStyle})},
  fillStyle:""
});
const a=mock();drawFieldRoads(a);
assert.equal(a.clips,2,"field paths are masked silhouettes, not two rectangular road bands");
assert.equal(a.saves,2);
assert.equal(a.restores,2);
assert.ok(a.cells.length>100,"authored earth textures are drawn inside curves");
assert.ok(a.cells.some(c=>c.color===ROAD_STYLE.base));
const market=mock();drawMarketCourtyard(market);
assert.equal(market.clips,1,"market square has a curved border rather than full rectangular paving");
const field=mock();drawMasterRoadTile(field,"field",23,10);
const gang=mock();drawMasterRoadTile(gang,"gang",0,10);
assert.equal(field.cells[0].color,gang.cells[0].color,"same material across Kebun→Gang seam");
assert.equal(field.cells[0].color,ROAD_STYLE.base);
const fieldTop=mock();drawMasterRoadTile(fieldTop,"field",23,11);
const gangBottom=mock();drawMasterRoadTile(gangBottom,"gang",0,11);
assert.equal(fieldTop.cells[0].color,gangBottom.cells[0].color);
assert.equal(ROUTE_PORTALS.length,6);
for(const portal of ROUTE_PORTALS){
  const dir=portal.direction;
  const x=dir==="right"?23:dir==="left"?0:11;
  const y=dir==="up"?0:dir==="down"?15:portal.start;
  assert.equal(areaBlocked(portal.from,x,y),false,
    portal.from+" "+dir+" exit is physically passable");
  assert.equal(isMasterRoad(portal.from,x,y),true,
    portal.from+" "+dir+" exit is visibly a road");
  const next=mapExit(portal.from,x,y,dir);
  assert.ok(next,portal.from+" "+dir+" transition exists");
  assert.equal(next.location,portal.to);
  assert.equal(areaBlocked(next.location,next.x,next.y),false,
    portal.to+" arrival is not a wall");
  assert.equal(isMasterRoad(next.location,next.x,next.y),true,
    portal.to+" arrival has matching road");
  const before=toWorldTile(portal.from,x,y);
  const after=toWorldTile(next.location,next.x,next.y);
  const dx={right:1,left:-1,up:0,down:0}[dir];
  const dy={right:0,left:0,up:-1,down:1}[dir];
  assert.equal(after.x-before.x,dx,portal.from+" world X continuity");
  assert.equal(after.y-before.y,dy,portal.from+" world Y continuity");
}
const ground=mock();drawMasterGround(ground,"gang");
assert.ok(ground.cells.length>380,"all terrain tiles are drawn");
const drawSource=readFileSync(new URL("../src/lib/game/draw-world.ts",import.meta.url),"utf8");
const areasSource=readFileSync(new URL("../src/lib/game/pasirluyu-areas.ts",import.meta.url),"utf8");
const beforeDecoration=drawSource.indexOf('  drawFieldRoads(ctx);');
const decorations=drawSource.indexOf('  const villageArt =');
assert.ok(beforeDecoration>0&&decorations>beforeDecoration,
  "Farm roads render below building/yard overlays");
assert.ok(!areasSource.includes("for(let y=9;y<=11;y++)for(let x=0;x<W;x++)road("),
  "old three-tile gang slab removed");
assert.ok(!areasSource.includes('drawMasterRoadTile(ctx,where,x,y);'),
  "per-scene repaint cannot overdraw trees/buildings with rectangular road bands");
const engineSource=readFileSync(new URL("../src/lib/game/field-engine.ts",import.meta.url),"utf8");
assert.ok(engineSource.includes("scene.game.location!==this.lastScene.game.location"),
  "crossfade only triggers on a true location change");
assert.ok(engineSource.includes("transitionDurationMs=260"),"area transition has short cinematic fade");
assert.ok(engineSource.includes("if(!reduced"),"reduced motion preference is honored");
console.log("Road geometry QA: 6 aligned passages, curved farm junction, market apron, consistent palette and crossfade: PASS");
