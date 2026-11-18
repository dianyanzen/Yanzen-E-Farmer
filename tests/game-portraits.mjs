import assert from "node:assert/strict";
import { readFileSync, statSync } from "node:fs";
import { createRequire } from "node:module";
import vm from "node:vm";
import ts from "typescript";
const source=readFileSync("src/lib/game/portraits.ts","utf8");
const compiled=ts.transpileModule(source,{compilerOptions:{esModuleInterop:true,module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
const mod={exports:{}};
vm.runInNewContext(compiled,{exports:mod.exports,module:mod,require:createRequire(new URL("../src/lib/game/portraits.ts",import.meta.url))});
const {PORTRAIT_CHARACTERS:people,PORTRAIT_EMOTIONS:emotions,portraitCharacter,portraitColumn}=mod.exports;
const cast=JSON.parse(readFileSync("game-assets/catalog/cast.json","utf8"));
assert.equal(people.length,32);assert.equal(new Set(people.map(p=>p.id)).size,32);
assert.deepEqual(Array.from(people,p=>p.id),cast.characters.map(p=>p.id));
assert.equal(emotions.length,8);assert.equal(portraitColumn("laughing"),7);assert.equal(portraitColumn("unknown"),0);
assert.equal(portraitCharacter("missing"),undefined,"unknown IDs never show another NPC");
let bytes=0;
for(const person of people){
 const file="public"+person.sheet, png=readFileSync(file);
 assert.equal(png.subarray(1,4).toString(),"PNG");
 assert.equal(png.readUInt32BE(16),1536,person.id+" strip width");
 assert.equal(png.readUInt32BE(20),256,person.id+" strip height");
 assert.ok(png.length<300000,person.id+" mobile size budget");
 bytes+=statSync(file).size;
}
const manifest=JSON.parse(readFileSync("public/game/assets/portraits/manifest.json","utf8"));
assert.equal(manifest.characters.length,32);assert.equal(manifest.portraitCount,256);
assert.ok(bytes<6*1024*1024);
console.log("Portrait catalog: 32 characters, 256 expression cells, PNG dimensions, unique IDs, fallback and size budget: PASS ("+bytes+" bytes)");
