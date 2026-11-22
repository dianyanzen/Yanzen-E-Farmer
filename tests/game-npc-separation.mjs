import assert from "node:assert/strict";
import {readFileSync,mkdtempSync,rmSync} from "node:fs";
import {resolve,join} from "node:path";
import {pathToFileURL} from "node:url";
import {build} from "esbuild";
const file=p=>readFileSync(p,"utf8");
const manifest=JSON.parse(file("game-assets/catalog/npc-legacy-id-review-manifest.json"));
assert.equal(manifest.count,69);
assert.equal(manifest.legacyStoryCandidateCount,39);
assert.equal(manifest.legacyExpansionConceptCount,30);
assert.equal(new Set(manifest.review.map(x=>x.legacyId)).size,69);
assert.ok(manifest.review.every(x=>x.approved===false&&x.associationStatus==="manual-review-required"));
const temp=mkdtempSync(resolve(process.cwd(),"node_modules/.npc-links-fixture-"));
try{
 const entry=join(temp,"legacy-identity.mjs");
 await build({entryPoints:["src/lib/game/legacy-identity.ts"],outfile:entry,bundle:true,
  platform:"node",format:"esm",packages:"external",logLevel:"silent"});
 const {approvedLegacyId,legacyNpcDisplayName,conservativeDisplayMatch}=await import(pathToFileURL(entry).href);
 const current={id:"A03",name:"TOKOH BARU UJI",occupation:"Uji",portrait:"work-A03",legacyApproved:false};
 assert.equal(approvedLegacyId({...current,legacyId:"A03"}),null,"Colliding IDs do not establish identity");
 assert.equal(legacyNpcDisplayName("A03","Nama lama",[current]),"Nama lama");
 const approved={...current,legacyApproved:true,legacyId:"A03"};
 assert.equal(approvedLegacyId(approved),"A03");
 assert.equal(legacyNpcDisplayName("A03","Nama lama",[approved]),current.name);
 assert.equal(conservativeDisplayMatch(
  {id:"A03",name:"TOKOH",role:"Uji"},[current])?.name,current.name,
  "Display-only match is allowed for same nickname and occupation");
 assert.equal(conservativeDisplayMatch(
  {id:"A03",name:"RYAN",role:"Uji"},[current]),null,
  "Do not assume identity when name does not match");
 assert.equal(conservativeDisplayMatch(
  {id:"A03",name:"TOKOH",role:"Profesi berbeda"},[current]),null,
  "Do not assume identity when profession does not match");
 assert.equal(conservativeDisplayMatch(
  {id:"A03",name:"TOKOH",role:"Uji"},[{...current,id:"A06"}]),null,
  "Do not assume identity when ID does not match");

 const ui=file("src/app/game/phone-wargapedia.tsx");
 const gallery=file("src/app/game/character-gallery.tsx");
 assert.ok(gallery.includes("<PhoneWargapedia"),"Only one canonical Warga app remains");
 assert.ok(ui.includes('approvedLegacyId(currentResident)'),"Relationship/save links require owner-approved legacy association");
 assert.ok(ui.includes('game.bonds[activeNpc.id]'),"Relationship level must come from actual saved game progress");
 assert.ok(ui.includes('/game/data/npc/'),"Canonical citizen loads the public fiction dossier by ID");
 assert.ok(ui.includes('src={known.portraitUrl}'),"Every canonical citizen uses its own catalog portrait");
 assert.ok(!ui.includes("game-assets/catalog/cast.json"),"Citizen directory must never fall back to legacy cast");
 assert.ok(!ui.includes("fromExpansion"),"Citizen directory must not mix old expansion identities");
 assert.ok(ui.includes("catalog?.characters.filter"),"All 248 public characters must be searchable by default");
 assert.ok(!ui.includes("EditorialDraftNotes")&&!ui.includes("npcDraftPreview"),"Private editorial controls must not appear inside player Warga");
 for(const route of ["src/app/game/page.tsx","src/app/game/phaser/page.tsx","src/app/game/canvas/page.tsx"]){
  assert.ok(file(route).includes("readPrivateResidents()"),"Missing canonical server hydration: "+route);
 }
 const health=file("src/app/api/game/roster-health/route.ts");
 assert.ok(health.includes("readPrivateResidents()"),"Health endpoint must use canonical data source");
 assert.ok(health.includes("residents.length===248"),"Health endpoint must reject missing roster");
 assert.ok(!health.includes("name:")&&!health.includes("occupation:"),"Health endpoint must not expose private identities");
 const client=file("src/app/game/game-client.tsx");
 assert.ok(!client.includes("residentById.has(npc.id)"),"Unsafe automatic face replacement remains");
 assert.ok(client.includes("visualByLegacyId.get(dialogue.npcId)"),"Dialogue portrait must use conservative canonical image matching");
 assert.ok(client.includes("conservativeDisplayMatch(npc,residents)"),"Only name and occupation corroboration may update active nameplates");
 assert.ok(client.includes("approvedByLegacyId"),"Explicit approval must stay separate from display-only mapping");
 const ignore=file(".gitignore");
 assert.ok(ignore.includes("deploy/private/"));
 assert.ok(ignore.includes("**/*_PRIVATE.json"),"Private exported JSON must be ignored outside Docker");
 const draftRoute=file("src/app/api/game/resident-bible/[id]/route.ts");
 assert.ok(draftRoute.includes("GAME_BIBLE_EDITOR_USER_IDS"),"Draft route requires editor allowlist");
 assert.ok(draftRoute.includes("status:403"),"Draft route must reject unauthorized users");
 assert.ok(ui.includes("?draft=1"),"Editor preview route is explicitly opt-in");
 console.log("PASS: 69 legacy ID collisions quarantined, 39 story candidates, 30 concepts, route/UI identity guard");
}finally{rmSync(temp,{recursive:true,force:true});}
