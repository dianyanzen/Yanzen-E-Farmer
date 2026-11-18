import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import ts from 'typescript';

const source = readFileSync(new URL('../src/lib/game/model.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: { esModuleInterop: true, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }
}).outputText;
const mod = { exports: {} };
vm.runInNewContext(compiled, { exports: mod.exports, module: mod, require: createRequire(new URL('../src/lib/game/model.ts', import.meta.url)) }, { timeout: 1500 });
const { newGame, movePlayer, applyFarmTool, nextDay, acceptOrder, meetNpc, safeLoad, buySeeds,
  choosePhoto, sellCucumbers, sellableCucumbers, chapterJournal } = mod.exports;
function sleepAtHome(s) {
  const rested = nextDay({ ...s, location: "home", player: { x: 9, y: 8, dir: "up" } });
  return { ...rested, location: s.location, player: s.player };
}
const initial = newGame();
assert.equal(initial.day, 1);
assert.equal(initial.coins, 280);
assert.equal(initial.plots.length, 0);
assert.equal(movePlayer(initial, 'up').player.y, 9);
assert.equal(movePlayer({ ...initial, player: {x: 12, y: 5, dir:'up'} }, 'up').player.y, 5, 'building collision');
assert.equal(movePlayer({ ...initial, player: {x: 12, y: 8, dir:'up'} }, 'right').player.x, 12, 'NPC collision');

let state = { ...newGame(), player: { x: 11, y: 8, dir: 'left' }};
let r = applyFarmTool(state, 'hoe');state = r.state;
assert.equal(state.plots[0].stage, -1, 'till soil');
r = applyFarmTool(state, 'seed');state = r.state;
assert.equal(state.seeds, 11);
assert.equal(state.plots[0].stage, 0);
for(let day = 1; day <= 3; day++){
  r = applyFarmTool(state, 'water'); state = r.state;
  assert.equal(state.plots[0].watered, true);
  state = sleepAtHome(state);
  assert.equal(state.plots[0].stage, day);
  assert.equal(state.plots[0].watered, false);
}
const before = state.coins;
r = applyFarmTool(state, 'harvest'); state = r.state;
assert.equal(state.harvested, 1);
assert.equal(state.coins, before, 'harvest is inventory, not an automatic sale');
assert.equal(state.plots.length, 0);
assert.equal(applyFarmTool(state, 'harvest').state.harvested, 1, 'no double harvest');

let story = newGame();
assert.equal(meetNpc(story, 'A03').state.story.canalClue, false, 'Ryan waits for delivery');
assert.equal(meetNpc(story, 'C01').state.story.photoSeen, false, 'Nani cannot skip the story');
assert.equal(choosePhoto(story, 'nani'), story, 'choice requires the photo scene');
story = acceptOrder(story);
// Grow the actual four cucumbers, rather than granting a quest fixture.
for (let x = 3; x <= 6; x++) {
  story = { ...story, player: { x, y: 7, dir: 'down' } };
  story = applyFarmTool(story, 'hoe').state;
  story = applyFarmTool(story, 'seed').state;
}
for (let day = 0; day < 3; day++) {
  for (let x = 3; x <= 6; x++) {
    story = { ...story, player: { x, y: 7, dir: 'down' } };
    story = applyFarmTool(story, 'water').state;
  }
  story = sleepAtHome(story);
}
for (let x = 3; x <= 6; x++) {
  story = { ...story, player: { x, y: 7, dir: 'down' } };
  story = applyFarmTool(story, 'harvest').state;
}
assert.equal(story.harvested, 4);
assert.equal(story.coins, 280);
assert.equal(sellableCucumbers(story), 0, 'active order stock is reserved');
assert.equal(sellCucumbers(story).harvested, 4);
assert.equal(meetNpc({ ...story, harvested: 3 }, 'C08').state.story.orderDone, false);
story = meetNpc(story, 'C08').state;
assert.equal(story.story.orderDone, true);
assert.equal(story.harvested, 0);
assert.equal(story.coins, 440);
assert.equal(meetNpc(story, 'C08').state.coins, 440, 'delivery reward cannot repeat');
assert.equal(meetNpc(story, 'C01').state.story.photoSeen, false, 'Ryan remains a prerequisite');
story = meetNpc(story, 'A03').state;
story = meetNpc(story, 'C01').state;
assert.equal(story.story.photoSeen, true);
assert.equal(story.story.photoChoice, null, 'viewing or postponing does not make a choice');
assert.equal(chapterJournal(story).stage, 4);
const postponed = safeLoad(JSON.parse(JSON.stringify(story)));
assert.equal(meetNpc(postponed, 'C01').choosePhoto, true, 'deferred choice reopens after reload');
for (const choice of ['nani', 'warung']) {
  const completed = choosePhoto(story, choice);
  assert.equal(completed.story.photoChoice, choice);
  assert.equal(completed.story.completedDay, 4);
  assert.equal(chapterJournal(completed).stage, 5);
  assert.equal(choosePhoto(completed, choice === 'nani' ? 'warung' : 'nani'), completed, 'choice is immutable');
  const restored = safeLoad(JSON.parse(JSON.stringify(completed)));
  assert.equal(restored.story.photoChoice, choice);
  assert.equal(meetNpc(restored, 'C01').choosePhoto, undefined);
  assert.equal(meetNpc(restored, 'C08').state.coins, completed.coins);
  assert.ok(meetNpc(restored, 'C08').lines.join(' ').includes(choice === 'nani' ? 'Foto asli' : 'Salinan'));
}
const purchased = buySeeds(story);
assert.equal(purchased.seeds, 13);
assert.equal(purchased.coins, 400);

const restored = safeLoad(state);
assert.equal(restored.day, 4);
assert.equal(restored.player.x, 11);
assert.equal(safeLoad({ ...state, version: 3 }), null);
assert.equal(safeLoad({ ...state, plots: [{ x: 50, y: 50, stage: 0, watered: true }] }), null);
const legacy = JSON.parse(JSON.stringify(story));
delete legacy.story.photoSeen; delete legacy.story.photoChoice; delete legacy.story.completedDay;
const migrated = safeLoad(legacy);
assert.equal(migrated.coins, legacy.coins);
assert.equal(migrated.day, legacy.day);
assert.equal(migrated.story.orderDone, true);
assert.equal(migrated.story.photoSeen, false);
assert.equal(migrated.story.photoChoice, null);
assert.equal(safeLoad({ ...state, plots: [null] }), null);
const duplicatePlot = { x: 3, y: 8, stage: 0, watered: true };
assert.equal(safeLoad({ ...state, plots: [duplicatePlot, duplicatePlot] }), null, 'duplicate plot coordinates rejected');
for (const [key, value] of [['seeds', -1], ['harvested', NaN], ['minutes', '10'], ['phoneRead', 'yes']]) {
  assert.equal(safeLoad({ ...state, [key]: value }), null, `reject invalid ${key}`);
}
assert.equal(safeLoad({ ...state, player: { x: 12.5, y: 8, dir: 'up' } }), null);
assert.equal(safeLoad({ ...state, story: { ...state.story, photoChoice: 'warung', completedDay: 1 } }), null);
const sold = sellCucumbers({ ...story, harvested: 3 });
assert.equal(sold.harvested, 0);
assert.equal(sold.coins, story.coins + 75);
assert.equal(sellCucumbers(sold).coins, sold.coins, 'cannot sell the same produce twice');
console.log('YZ Farm Life Stage 1 model tests: PASS');

const regionsSource = readFileSync(new URL('../src/lib/game/bandung-locations.ts', import.meta.url), 'utf8');
const regionsCompiled = ts.transpileModule(regionsSource, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }
}).outputText;
const regionsModule = { exports: {} };
vm.runInNewContext(regionsCompiled, { exports: regionsModule.exports, module: regionsModule }, { timeout: 1500 });
const { BANDUNG_DISTRICTS, REGOL_VILLAGES, START_LOCATION, isDistrictPlayable } = regionsModule.exports;
assert.equal(BANDUNG_DISTRICTS.length, 30);
assert.equal(new Set(BANDUNG_DISTRICTS).size, 30);
assert.equal(REGOL_VILLAGES.length, 7);
assert.equal(new Set(REGOL_VILLAGES).size, 7);
assert.ok(BANDUNG_DISTRICTS.includes(START_LOCATION.district));
assert.ok(REGOL_VILLAGES.includes(START_LOCATION.village));
assert.equal(isDistrictPlayable('Regol'), true);
assert.equal(isDistrictPlayable('Coblong'), false);
console.log('YZ Farm Life Bandung atlas data tests: PASS');

const walkingSource = readFileSync(new URL('../src/lib/game/walking.ts', import.meta.url), 'utf8');
const compiledWalking = ts.transpileModule(walkingSource, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }
}).outputText;
const walking = {};
vm.runInNewContext(compiledWalking, { exports: walking }, { timeout: 1500 });
for (const hz of [30, 60, 120]) {
  const path = new walking.WalkPath({x:5,y:5,dir:'right'});
  path.aim({x:6,y:5,dir:'right'});
  path.aim({x:6,y:6,dir:'down'});
  for (let i=0; i<Math.ceil(hz*.32); ++i) {
    path.advance(1000/hz,false);
    assert.ok(path.x===6 || path.y===5, 'feet must follow the corner');
  }
  assert.equal(path.x,6); assert.equal(path.y,6);
  assert.ok(Math.abs(path.distance-2)<0.00001);
  path.aim({x:6,y:6,dir:'left'});
  assert.equal(path.dir,'left'); assert.equal(path.moving,false);
}
