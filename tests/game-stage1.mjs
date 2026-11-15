import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

const source = readFileSync(new URL('../src/lib/game/model.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }
}).outputText;
const mod = { exports: {} };
vm.runInNewContext(compiled, { exports: mod.exports, module: mod }, { timeout: 1500 });
const { newGame, movePlayer, applyFarmTool, nextDay, acceptOrder, meetNpc, safeLoad, buySeeds } = mod.exports;
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
  state = nextDay(state);
  assert.equal(state.plots[0].stage, day);
  assert.equal(state.plots[0].watered, false);
}
const before = state.coins;
r = applyFarmTool(state, 'harvest'); state = r.state;
assert.equal(state.harvested, 1);
assert.equal(state.coins, before+25);
assert.equal(state.plots.length, 0);
assert.equal(applyFarmTool(state, 'harvest').state.harvested, 1, 'no double harvest');

let story = newGame();
story = meetNpc(story, 'raka').state;
assert.equal(story.story.canalClue, true);
story = meetNpc(story, 'sari').state;
assert.equal(story.story.sarisStory, true);
story = acceptOrder(story);
story = { ...story, harvested: 4 };
story = meetNpc(story, 'naya').state;
assert.equal(story.story.orderDone, true);
assert.equal(story.harvested, 0);
assert.equal(story.coins, 440);
const purchased = buySeeds(story);
assert.equal(purchased.seeds, 17);
assert.equal(purchased.coins, 400);

const restored = safeLoad(state);
assert.equal(restored.day, 4);
assert.equal(restored.player.x, 11);
assert.equal(safeLoad({ ...state, version: 3 }), null);
assert.equal(safeLoad({ ...state, plots: [{ x: 50, y: 50, stage: 0, watered: true }] }), null);
console.log('YZ Farm Life Stage 1 model tests: PASS');
