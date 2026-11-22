#!/usr/bin/env node
/** Public fictional catalog gate. No database secrets, legacy links or gameplay/save changes. */
import assert from 'node:assert/strict';
import {readFileSync,existsSync,statSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {join} from 'node:path';
const root=process.cwd();
const load=p=>JSON.parse(readFileSync(join(root,p),'utf8'));
const folder='public/game/data/npc';
const roster=load('game-assets/catalog/npc-public-roster.json');
const index=load(`${folder}/index.json`);
const rows=roster.currentRoster;
const categories=[
 '01_core_identity','02_physical_appearance','03_fashion_aesthetic','04_social_profile',
 '05_personality','06_psychological_profile','07_background_history','08_relationship_dynamics',
 '09_dialogue_behavior','10_narrative_development','11_visual_references',
 '12_continuity_current_state'
];
assert.equal(rows.length,248);
assert.equal(index.characterCount,248);
assert.equal(index.characters.length,248);
const digest=createHash('sha256').update(rows.slice().sort((a,b)=>a.id.localeCompare(b.id,'en'))
 .map(({id,name,occupation,portrait})=>[id,name,occupation,portrait].join('|')+'\n').join('')).digest('hex');
assert.equal(digest,'cd19795344bbb4fefc0022a3f17d25135d79624de4d5d9c6c618699cc1f871a0');
assert.equal(index.rosterFingerprintSha256,digest);
const ids=new Set(),names=new Set(),portraits=new Set();
for(const r of rows){
 assert.match(r.id,/^(?:[ACNK]\d{2}|P0[12]|W\d{3})$/);
 assert.equal(ids.has(r.id),false,'duplicated id');ids.add(r.id);
 assert.equal(names.has(r.name.toLowerCase()),false,'duplicated name');names.add(r.name.toLowerCase());
 assert.equal(portraits.has(r.portrait),false,'duplicated portrait');portraits.add(r.portrait);
 const doc=load(`${folder}/${r.id}.json`);
 for(const key of ['id','name','occupation','portrait'])assert.equal(doc[key],r[key]);
 assert.equal(doc.characterClass,'canonical-public-fictional-draft');
 assert.equal(doc.approval,'draft');
 assert.equal(doc.publicationStatus,'public-fictional-draft');
 assert.deepEqual(Object.keys(doc.sections),categories);
 assert.equal(doc.sections['01_core_identity'].ageYears,null);
 assert.equal(doc.sections['01_core_identity'].origin,null);
 assert.equal(doc.sections['04_social_profile'].education,null);
 assert.equal(doc.sections['07_background_history'].familyContext,null);
 assert.equal(doc.sections['07_background_history'].formativeMemory,null);
 assert.equal(doc.sections['08_relationship_dynamics'].connections.length,0);
 const s=doc.sections['12_continuity_current_state'];
 assert.equal(s.playableRuntimeConfirmed,false);
 assert.equal(s.questIntegrationConfirmed,false);
 assert.equal(s.legacyAssociationApproved,false);
 assert.equal(doc.sections['11_visual_references'].portraitKey,r.portrait);
 assert.ok(doc.portraitUrl.startsWith('/game/assets/portraits/bandung/'));
 const img=join(root,'public',doc.portraitUrl);
 assert.ok(existsSync(img)&&statSync(img).size>30,'portrait image missing');
 const e=index.characters.find(x=>x.id===r.id);
 assert.ok(e,'index entry missing');
 assert.equal(e.name,r.name);assert.equal(e.occupation,r.occupation);assert.equal(e.portrait,r.portrait);
 assert.ok(existsSync(join(root,`docs/game-dev/characters/${r.id}.md`)));
 if(['P01','P02'].includes(r.id)){
  const mind=doc.sections['06_psychological_profile'];
  for(const key of ['primaryMotivation','need','innerConflict','fear','motivationConcept','conflictConcept','agencyConcept'])
   assert.equal(mind[key],null,'real-world cameo personal psychology prohibited');
 }
}
console.log('PASS: public fictional 248 NPC catalog, 12 sections, immutable fingerprint, 248 portraits and 248 wiki pages');
