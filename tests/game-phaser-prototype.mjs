import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import { createRequire } from "node:module";
import ts from "typescript";

function loadTs(path, overrides = {}) {
  const source = readFileSync(path, "utf8");
  const code = ts.transpileModule(source, {
    compilerOptions: { esModuleInterop: true, module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022 }
  }).outputText;
  const mod = { exports: {} };
  const fallback = createRequire(new URL("../" + path, import.meta.url));
  vm.runInNewContext(code, {
    exports: mod.exports, module: mod, require: spec => overrides[spec] ?? fallback(spec)
  }, { timeout: 2500 });
  return mod.exports;
}
const model = loadTs("src/lib/game/model.ts");
const { outdoorObjects } = loadTs("src/lib/game/modular-outdoor.ts", {
  "./connected-edges": { connectsAt: () => false, sharedBorderProps: () => [] },
  "./model": model,
  "./pasirluyu-master-map": {},
  "./signposts": {},
  "./quest-props": { QUEST_PROPS: [] },
});
const fieldObjects = outdoorObjects("field", 12 * 60);
const homeRoof = fieldObjects.find(prop => prop.asset === "yanzen-home-roof");
const shedRoof = fieldObjects.find(prop => prop.asset === "yanzen-shed-roof");
for (let y = homeRoof.y - homeRoof.displayH; y <= homeRoof.y; y++) {
  assert.ok(homeRoof.x - homeRoof.displayW / 2 - model.fieldCanalBank(y) >= 12,
    "house roof clears the river and bank decorations at every row");
}
assert.ok(homeRoof.x + homeRoof.displayW / 2 < shedRoof.x - shedRoof.displayW / 2,
  "house and shed roof silhouettes must remain separate");
const navigation = loadTs("src/lib/game/tap-navigation.ts", {"./model":model});
const { WalkPath, STEP_MS } = loadTs("src/lib/game/walking.ts");

assert.equal(model.SIGNPOSTS.length, 4, "one natural signpost per playable outdoor area");
for (const sign of model.SIGNPOSTS) {
  assert.ok(model.areaBlocked(sign.location, sign.x, sign.y),
    sign.title + " must be a real sign, not a walkable floor tile");
  const neighbors = [
    { x:sign.x-1, y:sign.y, dir:"right" },
    { x:sign.x+1, y:sign.y, dir:"left" },
    { x:sign.x, y:sign.y-1, dir:"down" },
    { x:sign.x, y:sign.y+1, dir:"up" }
  ];
  const adjacent = neighbors.find(p => !model.areaBlocked(sign.location, p.x, p.y));
  assert.ok(adjacent, sign.title + " must be reachable from a walkable tile");
  const state = { ...model.newGame(), location: sign.location, player: adjacent };
  const action = model.getActionContext(state);
  assert.equal(action.kind, "inspect", sign.title + " must be inspectable with E/A");
  assert.equal(action.label, sign.title);
  const route = navigation.planTapRoute(state,sign.x,sign.y);
  assert.ok(route && route.interact, sign.title + " must be clickable");
  assert.equal(route.steps.length, 0, "nearby sign needs no walking before interacting");
}
const origin = {x:1,y:1,dir:"right"};
const p1 = new WalkPath(origin);
p1.aim({x:2,y:1,dir:"right"});
p1.advance(30,false,STEP_MS);
const shortX=p1.x;
const p2 = new WalkPath(origin);
for (let x=2;x<=5;x++) p2.aim({x,y:1,dir:"right"});
p2.advance(30,false,STEP_MS);
assert.ok(Math.abs(p2.x-shortX)<1e-6,
  "queued long route must not accelerate interpolation relative to one step");
assert.ok(Math.abs(shortX-1.2)<1e-6);
p2.advance(30,false,STEP_MS);
assert.ok(p2.x>1.2 && p2.x<2, "animation should keep moving between accepted steps");
const p3=new WalkPath(origin);
p3.aim({x:2,y:1,dir:"right"});
p3.advance(0,true,STEP_MS);
assert.equal(p3.x,2,"reduced-motion should finish the tile without interpolation");
const continuous = new WalkPath(origin);
const route = [
  { x: 2, y: 1, dir: "right" },
  { x: 3, y: 1, dir: "right" },
  { x: 3, y: 2, dir: "down" },
];
for (let frame = 1; frame <= 22; frame++) {
  continuous.advance(20, false, STEP_MS, () => route.shift());
  assert.ok(Math.abs(continuous.distance - frame * 20 / STEP_MS) < 1e-6,
    "a long route should use the whole frame budget, even when crossing a tile or corner");
}
continuous.advance(20, false, STEP_MS, () => route.shift());
assert.deepEqual([continuous.x, continuous.y, continuous.dir, continuous.moving], [3, 2, "down", false]);
const outdoor = { ...model.newGame(), player: { x: model.HOME.door.x, y: 5, dir: "up" } };
assert.equal(model.interactDoor(outdoor).location, "home", "the stairs must lead to the home");
const home = model.interactDoor(outdoor);
for (const x of [8, 9, 10, 11]) {
  assert.equal(model.canSleep({ ...home, player: { x, y: 8, dir: "up" } }), x===9);
}
assert.equal(model.canSleep({ ...home, player: { x: 10, y: 7, dir: "left" } }), true);
assert.equal(model.canSleep({ ...home, player: { x: 8, y: 7, dir: "right" } }), true);
const aisleTap=navigation.planTapRoute(home,10,7,{x:210,y:150});
assert.ok(aisleTap && !aisleTap.interact,"empty aisle tap must walk, not sleep");
let aisleWalk=home;
for(const direction of aisleTap.steps) aisleWalk=model.movePlayer(aisleWalk,direction);
assert.equal(aisleWalk.player.x,10);assert.equal(aisleWalk.player.y,7);
assert.equal(model.canSleep({ ...home, player: { x: 9, y: 9, dir: "up" } }), false);
assert.equal(model.interactDoor({ ...home, player: { x: 12, y: 12, dir: "down" } }).location, "field");
for (const [state, id, points] of [
  [outdoor, "home-door", [[97, 69], [123, 99]]],
  [outdoor, "shed-door", [[220, 70], [239, 99]]],
  [home, "bed", [[180, 108], [203, 159]]],
  [home, "home-exit", [[233, 270], [266, 288]]],
  [{ ...home, location: "shed" }, "shed-exit", [[233, 270], [266, 288]]],
]) {
  for (const [x, y] of points) {
    assert.equal(model.interactionHitboxAt(state.location, x, y)?.id, id);
    const tap = navigation.planTapRoute(state, Math.floor(x / 20), Math.floor(y / 20), { x, y });
    assert.ok(tap?.interact, "all visible corners must route to the object");
    let target = state;
    for (const direction of tap.steps) target = model.movePlayer(target, direction);
    target = { ...target, player: { ...target.player, dir: tap.face } };
    assert.equal(model.getActionContext(target).kind, id === "bed" ? "sleep" : "door");
  }
}
assert.equal(outdoorObjects("pasar",15*60).some(item=>item.asset.startsWith("inggit-")),false);
const counter=fieldObjects.find(item=>item.asset==="inggit-service-counter");
const morning={...model.newGame(),minutes:380,player:{x:18,y:10,dir:"up"}};
const customer={...morning,minutes:14*60,player:{x:15,y:8,dir:"right"}};
const morningTap=navigation.planTapRoute(morning,19,5,{x:counter.x,y:counter.y-11});
assert.ok(morningTap?.interact,"morning guests and furniture leave the front path clear");
const morningArrival=morningTap.steps.reduce((state,step)=>model.movePlayer(state,step),morning);
assert.deepEqual([morningArrival.player.x,morningArrival.player.y,morningTap.face],[19,6,"up"]);
assert.ok(!fieldObjects.some(item=>item.asset==="inggit-side-door"),"staff door is hidden in the player view");
assert.equal(navigation.planTapRoute(morning,21,5,{x:430,y:108}),null,
  "staff entrance stays off the player interaction map");
const tap=navigation.planTapRoute(customer,19,5,{x:counter.x,y:counter.y-11});
assert.ok(tap?.interact);
let approaching=customer;
for(const step of tap.steps)approaching=model.movePlayer(approaching,step);
approaching={...approaching,player:{...approaching.player,dir:tap.face}};
assert.equal(model.getActionContext(approaching).npcId,"C08");
assert.equal(model.interactDoor(approaching),approaching);
const coffeeAssets = minutes => outdoorObjects("field",minutes)
  .filter(item=>item.asset.includes("-coffee-")&&item.asset!=="inggit-coffee-table"&&item.visible)
  .map(item=>item.asset);
assert.deepEqual(Array.from(coffeeAssets(380)),["inggit-ryan-coffee-full","inggit-widi-coffee-full"]);
assert.deepEqual(Array.from(coffeeAssets(719)),["inggit-ryan-coffee-full","inggit-widi-coffee-empty"]);
assert.deepEqual(Array.from(coffeeAssets(720)),["inggit-ryan-coffee-empty","inggit-widi-coffee-empty"]);
assert.equal(coffeeAssets(893).length,0);
const nursery=model.NURSERY_BENCH;
assert.ok(navigation.planTapRoute(outdoor,nursery.x,nursery.y)?.interact);
assert.equal(model.interactionHitboxAt("home", 210, 150), undefined, "the adjacent aisle is outside the bed");
console.log("Phaser prototype movement and four interactive signposts: PASS");
