import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createRequire} from "node:module";
import vm from "node:vm";
import ts from "typescript";

const script=ts.transpileModule(readFileSync("src/lib/game/model.ts","utf8"),{
  compilerOptions:{esModuleInterop:true,module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022},
}).outputText;
const mod={exports:{}};
vm.runInNewContext(script,{exports:mod.exports,module:mod,
  require:createRequire(new URL("../src/lib/game/model.ts",import.meta.url))});
const {newGame,safeLoad,hasSluiceMemory}=mod.exports;
const base=newGame();
const quest=phase=>({A03:{phase,day:base.day,baseline:0}});
const legacy=(phase,sluiceOpen)=>({...base,personalQuests:quest(phase),sluiceOpen});

assert.equal(hasSluiceMemory(base),false,"New game should not unlock memory");
assert.equal(hasSluiceMemory(legacy(1,true)),false,"Unfinished investigation should not unlock");
assert.equal(hasSluiceMemory(legacy(2,false)),false,"Gate not yet opened should remain locked");
assert.equal(hasSluiceMemory(legacy(2,true)),true,"Active Ryan mission plus open gate unlocks");
assert.equal(hasSluiceMemory(legacy(3,false)),true,"Handover complete unlocks even after gate closes");
assert.equal(hasSluiceMemory(legacy(4,false)),true,"Completed Ryan quest unlocks even after gate closes");
assert.equal(hasSluiceMemory({...base,sluiceOpen:true}),false,"Opening unrelated gate alone is not Ryan memory");
assert.equal(hasSluiceMemory({...base,story:{...base.story,canalClue:true}}),false,
  "General chapter clue is not proof of finished sluice quest");
assert.equal(hasSluiceMemory({...base,sluiceCutsceneSeen:true}),true,"Previously watched memory remains accessible");
const finishedChapter={...base,story:{...base.story,orderAccepted:true,orderDone:true,canalClue:true,
 photoSeen:true,photoChoice:"nani",completedDay:base.day}};
assert.equal(hasSluiceMemory(finishedChapter),true,
 "Players who finished the earlier Ryan/Chapter 1 storyline should get Kenangan");
const chapterMigrated=safeLoad(JSON.parse(JSON.stringify(finishedChapter)));
assert.equal(chapterMigrated.sluiceCutsceneSeen,true,"Completed old Chapter 1 save migrates unlock");
assert.equal(chapterMigrated.story.photoChoice,"nani","Narrative ending stays unchanged");
assert.equal(chapterMigrated.coins,finishedChapter.coins,"Migration never grants rewards");


for(const phase of [2,3,4]){
  const oldSave=legacy(phase,phase===2);
  delete oldSave.sluiceCutsceneSeen;
  const before=JSON.stringify(oldSave);
  const loaded=safeLoad(JSON.parse(before));
  assert.ok(loaded,"Older quest saves must still parse");
  assert.equal(loaded.sluiceCutsceneSeen,true,"Legacy unlock migrates idempotently");
  assert.equal(hasSluiceMemory(loaded),true);
  assert.equal(loaded.coins,oldSave.coins,"No quest reward should be granted twice");
  assert.deepEqual(loaded.bonds.A03,oldSave.bonds.A03);
  assert.equal(loaded.personalQuests.A03.phase,phase,"Quest stage must not be rewritten");
  assert.equal(JSON.stringify(oldSave),before,"Migration must be nonmutating");
  assert.equal(safeLoad(JSON.parse(JSON.stringify(loaded))).sluiceCutsceneSeen,true);
}
const stillLocked=safeLoad(legacy(1,true));
assert.equal(Boolean(stillLocked.sluiceCutsceneSeen),false);
assert.equal(hasSluiceMemory(stillLocked),false);
console.log("PASS: Ryan quest memory migration, locked/unlocked states, no reward duplication, old-save round trip");
