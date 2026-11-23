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
const outdoor = { ...model.newGame(), player: { x: 4, y: 5, dir: "up" } };
assert.equal(model.interactDoor(outdoor).location, "home", "the right side of the entrance must open");
const home = model.interactDoor(outdoor);
for (const y of [7,8,9]) {
  assert.equal(model.canSleep({ ...home, player: { x: 10, y, dir: "left" } }), true);
  assert.equal(model.areaBlocked("home",10,y),false,"Bed approach must be walkable");
}
assert.equal(model.canSleep({ ...home, player: { x: 9, y: 9, dir: "up" } }), false);
assert.equal(model.interactDoor({ ...home, player: { x: 13, y: 12, dir: "down" } }).location, "field");
for (const [state, id, points] of [
  [outdoor, "home-door", [[65, 69], [91, 99]]],
  [outdoor, "shed-door", [[181, 70], [200, 99]]],
  [home, "bed", [[158, 116], [201, 185]]],
  [home, "home-exit", [[240, 270], [279, 288]]],
  [{ ...home, location: "shed" }, "shed-exit", [[236, 270], [285, 288]]],
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
assert.equal(model.interactionHitboxAt("home", 228, 150), undefined, "the adjacent aisle is outside the bed");
console.log("Phaser prototype movement and four interactive signposts: PASS");
