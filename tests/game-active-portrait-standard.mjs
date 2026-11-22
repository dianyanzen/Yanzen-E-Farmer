/**
 * Active-NPC portrait regression guard.
 * Visual harmony is checked by reviewers according to docs/game-dev/ACTIVE_NPC_PORTRAIT_STANDARD.md;
 * this test only verifies technical composition and does NOT certify human visual QA.
 */
import assert from "node:assert/strict";
import {readFileSync,statSync} from "node:fs";

const read = path => readFileSync(path,"utf8");
const json = path => JSON.parse(read(path));
const activeIds = ["A03","A04","C01","C07","C08"];
const standard = read("docs/game-dev/ACTIVE_NPC_PORTRAIT_STANDARD.md");
assert.ok(standard.includes("Widi")&&standard.includes("dipilih pemilik"),"Widi portrait approval and remaining runtime QA must be documented");

const model = read("src/lib/game/model.ts");
const placementSection = model.match(/const placements = \[([\s\S]*?)\] as const;/)?.[1];
assert.ok(placementSection,"Active NPC placement list not found");
const idsInWorld = [...placementSection.matchAll(/id:\s*"([AC]\d{2})"/g)].map(m=>m[1]);
assert.deepEqual(idsInWorld.slice().sort(),activeIds.slice().sort(),"The portrait standard must cover only playable NPCs");
assert.ok(model.includes("emotions?: Emotion[]"),"Optional page-by-page emotion contract is missing");

const registry = json("game-assets/catalog/npc-portrait-register.json");
const manifest = json("public/game/assets/portraits/manifest.json");
const rows = registry.characters.filter(c=>c.active===true);
assert.equal(rows.length,5,"Wrong number of active NPCs in portrait register");
assert.deepEqual(rows.map(c=>c.id).sort(),activeIds.slice().sort());
const emotions = ["neutral","happy","sad","worried","surprised","annoyed","shy","laughing"];

function pngSize(file){
 const png=readFileSync(file);
 assert.equal(png.subarray(1,4).toString(),"PNG",file+" must be PNG");
 return [png.readUInt32BE(16),png.readUInt32BE(20),png.length];
}
let ownerSelectedCount=0;
for(const id of activeIds){
 const entry=rows.find(x=>x.id===id);
 const member=manifest.characters.find(x=>x.id===id);
 assert.ok(entry&&member,"Missing active portrait "+id);
 assert.equal(entry.expressionSheet,"/game/assets/portraits/"+id+".png");
 assert.deepEqual(entry.emotionOrder,emotions,id+" expression order changed");
 assert.deepEqual(member.emotions,emotions,id+" manifest order changed");
 assert.deepEqual(entry.frameSize,[192,256]);
 assert.deepEqual(pngSize("public"+entry.expressionSheet).slice(0,2),[1536,256],id+" expression strip size changed");
 assert.ok(statSync("public"+entry.expressionSheet).size<300000,id+" dialogue sheet is too large");
 const conceptPath="public"+entry.variant.workConcept;
 const dims=pngSize(conceptPath).slice(0,2);
 if(id==="C07"){
  assert.deepEqual(dims,[256,256],"Owner-selected Widi profile must match portrait standard");
  assert.match(entry.styleReview,/owner-selected-art-20261122-pending-in-game-visual-qa/,"Widi owner approval must retain viewport QA status");
  ownerSelectedCount++;
 }else{
  assert.deepEqual(dims,[256,256],id+" profession portrait target size changed");
 }
}
assert.equal(ownerSelectedCount,1,"Owner-selected Widi portrait count differs");

const dialogue=read("src/app/game/dialogue-panel.tsx");
assert.ok(dialogue.includes("dialogue.emotions?.[page] ?? dialogue.emotion"),"Per-page expression should override the default");
assert.ok(dialogue.includes("<Portrait npcId={npc.id}"),"Live dialogues must render expression strips");
assert.ok(!dialogue.includes("resident?<ResidentPortrait"),"Static resident photo must not replace emotion sheet");
assert.ok(dialogue.includes("export function ResidentPortrait"),"Static citizen portraits must still be available for Warga");
const client=read("src/app/game/game-client.tsx");
assert.ok(client.includes("visualByLegacyId.get(dialogue.npcId)"),"Keep conservative canonical display-name matching");
console.log("PASS: five live NPCs, 10 portrait assets, 8 ordered expressions, dynamic dialogue, canonical separation; Widi owner-selected art integrated, in-game viewport review pending");
