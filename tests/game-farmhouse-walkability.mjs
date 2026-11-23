import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createRequire} from "node:module";
import vm from "node:vm";
import ts from "typescript";

function loadTS(path,overrides={}){
 const code=ts.transpileModule(readFileSync(path,"utf8"),{compilerOptions:{
   target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,esModuleInterop:true
 }}).outputText;
 const out={exports:{}},req=createRequire(new URL("../"+path,import.meta.url));
 vm.runInNewContext(code,{module:out,exports:out.exports,
  require:id=>overrides[id]??req(id)},{timeout:4000});
 return out.exports;
}
const model=loadTS("src/lib/game/model.ts");
const route=loadTS("src/lib/game/tap-navigation.ts",{"./model":model});
const geom=loadTS("src/lib/game/world-layout.ts");
const data=JSON.parse(readFileSync("src/lib/game/world-layout-data.json","utf8"));
const home={...model.newGame(),location:"home"};
const floor=[];
for(let y=6;y<=13;y++)for(let x=7;x<=17;x++){
  if(model.areaBlocked("home",x,y))continue;
  floor.push([x,y]);
  const neighbors=[[1,0],[-1,0],[0,1],[0,-1]]
    .filter(([dx,dy])=>!model.areaBlocked("home",x+dx,y+dy));
  assert.ok(neighbors.length>=2,"Blind hallway ending at "+x+","+y);
  const click=route.planTapRoute({...home,player:{x:12,y:12,dir:"up"}},x,y);
  assert.ok(click,"Visible empty floor cannot be walked to: "+x+","+y);
}
assert.equal(floor.length,76,"Uncluttered house should have exactly 76 traversable tiles");
const interactive=data.tapTargets.home;
assert.deepEqual(interactive.map(p=>p.id).sort(),
 ["bed","bookshelf","chest","computer-desk"].sort());
for(const [x,y] of floor){
  for(const target of interactive){
    const [left,top,right,bottom]=target.rect;
    const px=(left+right)/2,py=(top+bottom)/2;
    const state={...home,player:{x,y,dir:"down"}};
    const routeTo=route.planTapRoute(state,Math.floor(px/20),Math.floor(py/20),{x:px,y:py});
    assert.ok(routeTo,"Cannot tap "+target.id+" from "+x+","+y);
    assert.equal(routeTo.targetLabel,target.label);
    let simulated=state;
    for(const direction of routeTo.steps){
      const advanced=model.movePlayer(simulated,direction);
      assert.ok(advanced.player.x!==simulated.player.x||advanced.player.y!==simulated.player.y,
       target.id+" path hit invisible wall at "+simulated.player.x+","+simulated.player.y);
      simulated=advanced;
    }
    const facing={...simulated,player:{...simulated.player,dir:routeTo.face}};
    assert.equal(model.getActionContext(facing).label,target.label,
      target.id+" interaction mismatched from "+x+","+y);
  }
}
assert.equal(model.areaBlocked("home",7,10),false);
assert.equal(model.areaBlocked("home",17,10),false);
assert.equal(model.areaBlocked("home",16,10),false);
assert.equal(model.areaBlocked("home",9,8),true,"Bed must be solid, despite open room");
assert.equal(model.areaBlocked("home",9,11),true,"Chest footprint remains solid");
assert.equal(model.areaBlocked("home",15,7),true,"Work desk remains solid");
assert.equal(model.areaBlocked("home",12,13),false,"Exit must be open");

const oldSave={...home,player:{x:8,y:8,dir:"down"}};
const recovered=model.safeLoad(JSON.parse(JSON.stringify(oldSave)));
assert.ok(recovered);
assert.equal(recovered.location,"home");
assert.equal(model.areaBlocked("home",recovered.player.x,recovered.player.y),false);

const base=readFileSync("src/lib/game/farmhouse-visual.ts","utf8");
const housing=readFileSync("src/lib/game/housing-hd.ts","utf8");
const phaser=readFileSync("src/lib/game/phaser-world.ts","utf8");
const canvas=readFileSync("src/lib/game/draw-world.ts","utf8");
assert.match(base,/drawMinimalFarmhouseBase/);
assert.match(base,/farmhouseFacadeSource/);
assert.match(housing,/drawMinimalFarmhouseBase\(ctx,evening\)/);
assert.match(phaser,/yz-yanzen-farmhouse/);
assert.match(canvas,/farmhouseFacadeSource\(image\)/);
assert.equal(geom.ROOM_FURNITURE.home.length,4);
console.log("PASS: farmhouse 76 walkable tiles, no dead ends, 304 tap routes, real bed/chest/desk collision and exterior renderer parity");
