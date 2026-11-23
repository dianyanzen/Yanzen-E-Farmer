import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createRequire} from "node:module";
import vm from "node:vm";
import ts from "typescript";
const layoutData=JSON.parse(readFileSync("src/lib/game/world-layout-data.json","utf8"));
function loadTs(path,overrides={}){
  const code=ts.transpileModule(readFileSync(path,"utf8"),{compilerOptions:{
    target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,esModuleInterop:true
  }}).outputText;
  const mod={exports:{}};
  const fallback=createRequire(new URL("../"+path,import.meta.url));
  vm.runInNewContext(code,{module:mod,exports:mod.exports,
    require:name=>overrides[name]??fallback(name)},{timeout:3500});
  return mod.exports;
}
const model=loadTs("src/lib/game/model.ts");
const routing=loadTs("src/lib/game/tap-navigation.ts",{"./model":model});
const layout=loadTs("src/lib/game/world-layout.ts");
for(const room of ["home","shed"]){
  const origin={...model.newGame(),location:room,player:{x:12,y:12,dir:"up"}};
  let floor=0;
  for(let y=6;y<=13;y++)for(let x=8;x<=16;x++){
    if(model.areaBlocked(room,x,y))continue;
    floor++;
    const neighbours=[[1,0],[-1,0],[0,1],[0,-1]]
      .filter(([dx,dy])=>!model.areaBlocked(room,x+dx,y+dy));
    assert.ok(neighbours.length>=2,room+": one-tile dead-end at "+x+","+y);
    const route=routing.planTapRoute(origin,x,y);
    assert.ok(route,room+": inaccessible floor at "+x+","+y);
    assert.equal(route.interact,false);
  }
  assert.ok(floor>=40,room+": too much floor blocked by décor");
  for(const target of layoutData.tapTargets[room]){
    const [l,t,r,b]=target.rect;
    const world={x:(l+r)/2,y:(t+b)/2};
    const route=routing.planTapRoute(origin,Math.floor(world.x/20),Math.floor(world.y/20),world);
    assert.ok(route,room+" cannot reach "+target.id);
    assert.equal(route.interact,true,room+" should interact with "+target.id);
    assert.equal(route.targetLabel,target.label,room+" should identify "+target.id);
    let state=origin;
    for(const dir of route.steps){
      const next=model.movePlayer(state,dir);
      assert.notDeepEqual([next.player.x,next.player.y],[state.player.x,state.player.y],
        room+"/"+target.id+": stuck on blocked tile");
      state=next;
    }
    state={...state,player:{...state.player,dir:route.face}};
    const action=model.getActionContext(state);
    assert.equal(action.label,target.label,
      room+"/"+target.id+": tapped item opened "+action.label);
    assert.equal(action.kind,target.kind);
    const piece=layout.ROOM_FURNITURE[room].find(p=>p.id===target.id);
    assert.ok(piece,room+" interactive object not rendered: "+target.id);
    const rect=layout.furnitureScreenRect(piece);
    assert.ok(l<=rect.x && t<=rect.y && r>=rect.x+rect.width && b>=rect.y+rect.height,
      room+"/"+target.id+": hitbox must wrap rendered sprite");
  }
  const wall=routing.planTapRoute(origin,10,6,{x:210,y:130});
  assert.ok(wall && !wall.interact,room+": tapping ordinary wall should approach open floor");
}
assert.equal(layout.ROOM_FURNITURE.home.length,5);
assert.equal(layout.ROOM_FURNITURE.shed.length,4);
const sizes=Object.values(layout.RESIDENT_FACADE_SPECS);
assert.equal(sizes.length,5);
assert.ok(sizes.every(h=>Math.abs(h.visibleHeight-layout.ONE_STOREY_HOUSE_VISIBLE_HEIGHT)<=1));
assert.ok(Math.max(...sizes.map(h=>h.visibleWidth))-Math.min(...sizes.map(h=>h.visibleWidth))<=11,
  "One-storey visible widths should form one consistent category");
const phd=readFileSync("src/lib/game/phaser-world.ts","utf8");
const fallback=readFileSync("src/lib/game/draw-world.ts","utf8");
assert.match(phd,/residentFacadeSpec\(prop.asset\)/);
assert.match(fallback,/residentFacadeSpec\(prop.asset\)/);
assert.match(phd,/camera\.height\/248/);
console.log("PASS: 9 natural furniture tap targets, 2 dead-end-free interiors, matching house silhouette and unclipped room camera");
