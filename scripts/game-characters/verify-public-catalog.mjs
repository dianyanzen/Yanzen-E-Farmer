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
assert.equal(digest,'24525af2c8e8b69bdb37a43691ebba158d40749b86890bdaf23a53a2805c426e');
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
 // Creator-authorized fictional draft updates. Exact ages are creative options,
 // never claims inferred from a real person's photograph.
 const isCameo=['P01','P02'].includes(r.id);
 const core=doc.sections['01_core_identity'];
 const social=doc.sections['04_social_profile'];
 const history=doc.sections['07_background_history'];
 const physical=doc.sections['02_physical_appearance'];
 const visual=doc.sections['11_visual_references'];
 if(isCameo){
  assert.ok(core.origin?.includes('Jawa Barat'),'officially sourced cameo origin missing');
  assert.ok(Number.isInteger(core.ageYears)&&core.ageYears>=50,'verified cameo age missing');
  assert.ok(social.education?.length>35,'verified cameo education missing');
  assert.ok(history.familyContext?.length>40,'verified public family context missing');
  assert.ok(doc.publicBiography?.sources?.length>=2,'public fact citations missing');
  for(const key of ['01_core_identity.ageYears','01_core_identity.origin','04_social_profile.education','07_background_history.familyContext']){
   const provenance=doc.fieldProvenance[key];
   assert.equal(provenance?.claimType,'public-fact-not-gameplay');
   assert.ok(provenance.sourceUrls?.length,'public provenance source missing '+key);
  }
 }else{
  assert.ok(typeof core.origin==='string'&&core.origin.includes('(latar fiksi; draf)'),'fictional origin missing');
  assert.ok(typeof history.familyContext==='string'&&history.familyContext.includes('(latar fiksi; draf)'),'fictional family context missing');
  assert.equal(doc.fieldProvenance['01_core_identity.origin']?.claimType,'fictional-worldbuilding-proposal');
  assert.equal(doc.fieldProvenance['07_background_history.familyContext']?.claimType,'fictional-worldbuilding-proposal');
 }
 assert.ok(typeof physical.physicalTraits==='string'&&physical.physicalTraits.length>45,'portrait observations missing');
 assert.equal(doc.visualEvidence.assetKey,r.portrait);
 assert.equal(doc.visualEvidence.path,'public'+doc.portraitUrl);
 assert.equal(doc.visualEvidence.source,'original-canonical-GitHub-portrait');
 assert.ok(doc.fieldProvenance['02_physical_appearance.physicalTraits']);
 if(!isCameo){
  assert.ok(Number.isInteger(core.ageYears)&&core.ageYears>=21&&core.ageYears<=90,'fictional age candidate missing');
  assert.ok(typeof core.preferredName==='string'&&core.preferredName.length>1);
  assert.ok(typeof core.language==='string'&&core.language.includes('Bahasa Indonesia'));
  assert.ok(typeof social.education==='string'&&social.education.length>20);
  assert.ok(typeof history.formativeMemory==='string'&&history.formativeMemory.length>45);
  assert.ok(doc.fieldProvenance['01_core_identity.ageYears'].claimType==='not-a-factual-age');
 }else{
  assert.equal(history.formativeMemory,null,'do not invent real cameo formative memories');
 }
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
console.log('PASS: public fictional 248 NPC catalog, 12 sections, immutable fingerprint, 248 portraits and 248 wiki pages; 248 visual notes and guarded fictional lore');
