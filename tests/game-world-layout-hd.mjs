import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createRequire} from "node:module";
import vm from "node:vm";
import ts from "typescript";
const compile=path=>{
  const code=ts.transpileModule(readFileSync(path,"utf8"),{compilerOptions:{
    esModuleInterop:true,module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022
  }}).outputText;
  const mod={exports:{}};
  vm.runInNewContext(code,{exports:mod.exports,module:mod,require:createRequire(new URL("../"+path,import.meta.url))},{timeout:3000});
  return mod.exports;
};
const model=compile("src/lib/game/model.ts");
const layout=compile("src/lib/game/world-layout.ts");
const {interiorTileBlocked,MARKET_STOREFRONTS,storefrontEnvelopesOverlap,
  ROOM_FURNITURE,furnitureScreenRect,EXTERIOR_THRESHOLDS}=layout;
const route=(room,origin,target)=>{
  const visited=new Set([origin.join(",")]),todo=[origin];
  for(let q=0;q<todo.length;q++){
    const [x,y]=todo[q];
    if(x===target[0]&&y===target[1])return true;
    for(const [dx,dy] of [[0,1],[1,0],[0,-1],[-1,0]]){
      const nx=x+dx,ny=y+dy,k=nx+","+ny;
      if(visited.has(k)||model.areaBlocked(room,nx,ny))continue;
      visited.add(k);todo.push([nx,ny]);
    }
  }
  return false;
};
for(const room of ["home","shed"]){
  assert.equal(interiorTileBlocked(room,12,12),false,"Spawn must be on open floor");
  assert.equal(interiorTileBlocked(room,12,13),false,"Door landing must remain accessible");
  assert.ok(ROOM_FURNITURE[room].length>=6,"Separate furniture clusters for depth");
  for(const p of ROOM_FURNITURE[room]){
    const rect=furnitureScreenRect(p);
    assert.ok(rect.x>=132 && rect.y>=63 && rect.x+rect.width<=366 &&
      rect.y+rect.height<=310,"Furniture must stay on matching base floor");
    assert.ok(rect.footY>=rect.y&&rect.footY<=310,"Invalid foot-based depth");
  }
  assert.ok(route(room,[12,12],[12,13]),"Exit needs open floor");
}
assert.equal(model.areaBlocked("home",9,9),true,"Bed may not be stepped on");
assert.equal(model.areaBlocked("home",16,10),true,"Cabinet may not be stepped on");
assert.equal(model.areaBlocked("shed",9,9),true,"Crates may not be stepped on");
assert.equal(model.areaBlocked("shed",16,10),true,"Sacks may not be stepped on");
assert.equal(model.areaBlocked("home",12,10),false);
assert.equal(model.areaBlocked("shed",12,10),false);
assert.ok(route("home",[12,12],[10,8]),"Bed interaction aisle must be reachable");
assert.ok(route("shed",[12,12],[10,7]),"Tool rack aisle must be reachable");
const game=model.newGame();
assert.equal(model.canSleep({...game,location:"home",player:{x:10,y:8,dir:"up"}}),true);
assert.equal(model.canManageTools({...game,location:"shed",player:{x:10,y:7,dir:"left"}}),true);
assert.equal(model.canManageTools({...game,location:"shed",player:{x:12,y:8,dir:"up"}}),true);
assert.equal(model.canManageTools({...game,location:"shed",player:{x:13,y:10,dir:"right"}}),true);
for(const [x,y,dir,label] of [
  [12,8,"up","Periksa rak buku"],
  [14,9,"up","Periksa meja kerja"],
  [14,10,"right","Periksa lemari"],
  [10,10,"left","Periksa peti"]
]){
  const state={...game,location:"home",player:{x,y,dir}};
  assert.equal(model.areaBlocked("home",x,y),false,"Interactive prop must be approached from open floor");
  assert.equal(model.getActionContext(state).label,label,"Wrong HD furniture hotspot");
}
const oldRoom={...game,location:"home",player:{x:9,y:8,dir:"up"}};
const migrated=model.safeLoad(JSON.parse(JSON.stringify(oldRoom)));
assert.ok(migrated,"HD furniture may not invalidate old saved rooms");
assert.equal(model.areaBlocked("home",migrated.player.x,migrated.player.y),false);
assert.equal(migrated.location,"home");
const market=MARKET_STOREFRONTS;
for(let i=0;i<market.length;i++)for(let j=i+1;j<market.length;j++)
  assert.equal(storefrontEnvelopesOverlap(market[i],market[j],3),false,
    "Two primary shops overlap "+market[i].asset+" "+market[j].asset);
assert.equal(model.areaBlocked("pasar",6,9),false,"Ayu must still serve from x6/y9");
assert.equal(model.areaBlocked("pasar",27,8),false,"Widi must still serve from x27/y8");
assert.equal(model.areaBlocked("pasar",11,11),false,"Market walking lane must be clear");
assert.equal(model.areaBlocked("pasar",22,11),false,"Market crosswalk must be clear");
assert.equal(model.areaBlocked("pasar",6,7),true,"Ayu shop body needs collision");
assert.equal(model.areaBlocked("pasar",27,7),true,"Widi shop body needs collision");
assert.equal(model.areaBlocked("pasar",22,14),true,"Vegetable kiosk needs collision");
for(const [zone,door,central] of [
  ["field",[3,5],[14,11]],["field",[9,5],[14,11]],
  ["gang",[8,8],[12,11]],["gang",[20,8],[12,11]],
  ["gang",[4,14],[12,11]],["gang",[15,14],[12,11]],
  ["gang",[26,8],[12,11]],
  ["pasar",[6,9],[12,11]],["pasar",[27,8],[12,11]]
]){
  assert.ok(route(zone,door,central),zone+": doorstep must reach its active main-road corridor");
}

const world=readFileSync("src/lib/game/modular-outdoor.ts","utf8");
const hd=readFileSync("src/lib/game/housing-hd.ts","utf8");
const canvas=readFileSync("src/lib/game/draw-world.ts","utf8");
const phaser=readFileSync("src/lib/game/phaser-world.ts","utf8");
for(const door of ["rumah-yanzen","gudang-kayu","fasad-inggit","fasad-ayu","fasad-widi"]){
  assert.ok(EXTERIOR_THRESHOLDS[door],door+" needs canonical threshold");
  assert.ok(world.includes('asset:"'+door+'"'),door+" must be represented in world");
}
assert.ok(world.includes("drawEntranceLandings(ctx,location)"),"Road endings must be painted");
assert.ok(world.includes('x:441,y:298') && world.includes('x:516,y:299'),"Small kiosks relocate south");
assert.ok(world.includes('reservedMarketRoof(p)'),"No free-floating props under store facades");
assert.match(hd,/drawHDInteriorProps/);
assert.match(hd,/footOffset:number/);
for(const n of [6,14,15,18,6,4])assert.ok(hd.includes("footOffset:"+n));
assert.ok(world.includes('x:78,y:102'),"Yanzen must fit roof within top of world");

assert.match(canvas,/drawHDInteriorProps\(ctx,art.housingHDInteriors,"home"/);
assert.match(phaser,/private interiorProps/);
assert.match(phaser,/ROOM_FURNITURE\[location\]/);
console.log("PASS: 2 layered interiors, 12 depth crops, bed/tools access, market clearance, door-to-road landings");
