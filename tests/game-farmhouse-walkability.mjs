import assert from "node:assert/strict";
import {readFileSync,existsSync} from "node:fs";
import {createRequire} from "node:module";
import vm from "node:vm";
import ts from "typescript";
import sharp from "sharp";

function loadTS(path,overrides={}){
  const transpiled=ts.transpileModule(readFileSync(path,"utf8"),{compilerOptions:{
    target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,esModuleInterop:true
  }}).outputText;
  const entry={exports:{}},fallback=createRequire(new URL("../"+path,import.meta.url));
  vm.runInNewContext(transpiled,{
    module:entry,exports:entry.exports,require:id=>overrides[id]??fallback(id)
  },{timeout:4000});
  return entry.exports;
}
const model=loadTS("src/lib/game/model.ts");
const routes=loadTS("src/lib/game/tap-navigation.ts",{"./model":model});
const layout=loadTS("src/lib/game/world-layout.ts");
const native=loadTS("src/lib/game/farmhouse-native.ts");
const data=JSON.parse(readFileSync("src/lib/game/world-layout-data.json","utf8"));
const home={...model.newGame(),location:"home"};
const open=[];
for(let y=8;y<=13;y++)for(let x=8;x<=16;x++){
  if(model.areaBlocked("home",x,y))continue;
  open.push([x,y]);
  const neighbors=[[1,0],[-1,0],[0,1],[0,-1]]
    .filter(([dx,dy])=>!model.areaBlocked("home",x+dx,y+dy));
  assert.ok(neighbors.length>=2,"Dead-end at farmhouse "+x+","+y);
  const route=routes.planTapRoute({...home,player:{x:12,y:12,dir:"up"}},x,y);
  assert.ok(route,"Unreachable illustrated floor: "+x+","+y);
}
assert.equal(open.length,40,"Home must have exactly 40 safe floor tiles");
assert.deepEqual(data.tapTargets.home.map(x=>x.id).sort(),
  ["bed","bookshelf","chest","computer-desk"].sort());
let attempted=0;
for(const [x,y] of open){
  const initial={...home,player:{x,y,dir:"up"}};
  const door=routes.planTapRoute(initial,12,13,{x:250,y:277});
  assert.ok(door?.interact,"Exit cannot be reached from "+x+","+y);
  let toward=initial;
  for(const step of door.steps)toward=model.movePlayer(toward,step);
  assert.equal(model.getActionContext({...toward,player:{...toward.player,dir:door.face}}).label,"Keluar rumah");
  for(const object of data.tapTargets.home){
    const [l,t,r,b]=object.rect;
    const px=(l+r)/2,py=(t+b)/2;
    const route=routes.planTapRoute(initial,Math.floor(px/20),Math.floor(py/20),{x:px,y:py});
    assert.ok(route,"Cannot reach "+object.id+" from "+x+","+y);
    assert.equal(route.targetLabel,object.label);
    let arrived=initial;
    for(const step of route.steps){
      const next=model.movePlayer(arrived,step);
      assert.ok(next.player.x!==arrived.player.x||next.player.y!==arrived.player.y,
        "Route collides on "+object.id+" from "+x+","+y);
      arrived=next;
    }
    const action=model.getActionContext({...arrived,player:{...arrived.player,dir:route.face}});
    assert.equal(action.label,object.label);
    assert.equal(action.kind,object.kind);
    attempted++;
  }
}
assert.equal(attempted,160);
assert.equal(model.areaBlocked("home",7,10),true,"Wall cannot be walked through");
assert.equal(model.areaBlocked("home",12,7),true,"Upper wall cannot be walked through");
assert.equal(model.areaBlocked("home",9,9),true,"Solid bed");
assert.equal(model.areaBlocked("home",16,8),true,"Solid work desk");
assert.equal(model.areaBlocked("home",16,13),true,"Solid wooden chest");
assert.equal(model.areaBlocked("home",10,11),false,"Open corridor");
assert.equal(model.areaBlocked("home",12,13),false,"Door remains open");
const fromOutside={...model.newGame(),location:"field",player:{x:3,y:5,dir:"up"}};
assert.equal(model.interactDoor(fromOutside).location,"home");
const legacy={...home,player:{x:7,y:7,dir:"up"}};
const loaded=model.safeLoad(JSON.parse(JSON.stringify(legacy)));
assert.ok(loaded && !model.areaBlocked("home",loaded.player.x,loaded.player.y),
  "Legacy saved position must be moved safely to walkable floor");
const roomObjects=layout.ROOM_FURNITURE.home;
assert.equal(roomObjects.length,4);
for(const sprite of roomObjects){
  assert.equal(sprite.source,"native","Home object unexpectedly cropped from atlas");
  const bounds=layout.furnitureScreenRect(sprite);
  const sourceRatio=sprite.width/sprite.height;
  assert.ok(Math.abs(bounds.width/bounds.height/sourceRatio-1)<.04,
    sprite.id+" stretched outside native aspect ratio");
  assert.ok(bounds.height<=66,"No giant furniture: "+sprite.id);
  assert.ok(data.tapTargets.home.some(x=>x.id===sprite.id));
}
const manifest=JSON.parse(readFileSync("public/game/assets/farmhouse-native/v1/manifest.json","utf8"));
assert.equal(manifest.files.length,6);
let total=0;
for(const asset of manifest.files){
  const file="public"+asset.src;
  assert.ok(existsSync(file),"Runtime asset missing: "+asset.id);
  const meta=await sharp(file).metadata();
  assert.equal(meta.width,asset.exportWidth);
  assert.equal(meta.height,asset.exportHeight);
  assert.ok(meta.width>=200,"Export quality unexpectedly too small: "+asset.id);
  total+=asset.bytes;
}
assert.ok(total<300000,"Six farmhouse WebP textures should be mobile friendly");
const phaser=readFileSync("src/lib/game/phaser-world.ts","utf8");
const canvas=readFileSync("src/lib/game/draw-world.ts","utf8");
assert.match(phaser,/yz-native-exterior/);
assert.match(phaser,/yz-native-"\+piece.id/);
assert.match(canvas,/farmhouseNative/);
assert.match(canvas,/drawHDInteriorProps/);
assert.ok(native.FARMHOUSE_EXTERIOR.width>=100 && native.FARMHOUSE_EXTERIOR.height<=92);
console.log("PASS: 40 navigable floor tiles, 160 native-furniture tap paths, 40 exits, 6 optimized assets, 0 atlas crops");
