#!/usr/bin/env node
/** Regression guard: owner-authorized visual descriptions + fictional lore, not actual personal facts. */
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {join} from 'node:path';
const read=path=>JSON.parse(readFileSync(path,'utf8'));
const index=read('public/game/data/npc/index.json');
const imageLedger=read('docs/game-dev/characters/PORTRAIT_ASSET_AUDIT.json');
const shaById=new Map(imageLedger.portraits.map(x=>[x.id,x]));
assert.equal(imageLedger.identityCount,248);
assert.equal(imageLedger.canonicalFingerprintSha256,index.rosterFingerprintSha256);
assert.equal(index.characterCount,248);
let filled=0, cameos=0;
const ids=new Set();
for(const entry of index.characters){
 assert.ok(!ids.has(entry.id));ids.add(entry.id);
 const doc=read(`public/game/data/npc/${entry.id}.json`);
 assert.equal(doc.id,entry.id);
 assert.equal(doc.name,entry.name);assert.equal(doc.occupation,entry.occupation);
 assert.equal(doc.portrait,entry.portrait);assert.equal(doc.portraitUrl,entry.portraitUrl);
 assert.equal(doc.approval,'draft');assert.equal(Object.keys(doc.sections).length,12);
 assert.ok(doc.sections['02_physical_appearance'].physicalTraits?.length>30);
 assert.equal(doc.visualEvidence.path,'public'+entry.portraitUrl);
 assert.equal(doc.visualEvidence.assetKey,entry.portrait);
 assert.equal(doc.visualEvidence.humanVisualQARequired,true);
 assert.ok(doc.fieldProvenance['02_physical_appearance.physicalTraits']);
 assert.equal(doc.sections['01_core_identity'].origin,null);
 assert.equal(doc.sections['07_background_history'].familyContext,null);
 const s=doc.sections['12_continuity_current_state'];
 assert.equal(s.playableRuntimeConfirmed,false);
 assert.equal(s.questIntegrationConfirmed,false);
 assert.equal(s.legacyAssociationApproved,false);
 const img=join('public',entry.portraitUrl);
 assert.ok(existsSync(img),'Missing linked portrait: '+img);
 const match=shaById.get(entry.id);
 assert.ok(match&&match.assetPath===img&&match.portrait===entry.portrait,'observed portrait/source mismatch: '+entry.id);
 const raw=readFileSync(img);
 const gitSha=createHash('sha1').update(Buffer.from('blob '+raw.length+'\0')).update(raw).digest('hex');
 assert.equal(gitSha,match.gitBlobSha,'portrait changed since visual description was written: '+entry.id);
 if(['P01','P02'].includes(entry.id)){
  cameos++;
  assert.equal(doc.sections['01_core_identity'].ageYears,null);
  assert.equal(doc.sections['07_background_history'].formativeMemory,null);
  assert.equal(doc.sections['04_social_profile'].education,null);
  continue;
 }
 const identity=doc.sections['01_core_identity'];
 assert.ok(Number.isInteger(identity.ageYears)&&identity.ageYears>=21&&identity.ageYears<=90);
 assert.ok(identity.ageDesignNote?.includes('bukan pengukuran umur'));
 assert.ok(identity.preferredName?.trim());
 assert.ok(identity.language?.includes('Bahasa Indonesia'));
 assert.ok(doc.sections['04_social_profile'].education?.length>10);
 assert.ok(doc.sections['07_background_history'].formativeMemory?.length>30);
 assert.equal(doc.fieldProvenance['01_core_identity.ageYears'].claimType,'not-a-factual-age');
 filled++;
}
assert.equal(ids.size,248);assert.equal(filled,246);assert.equal(cameos,2);
console.log('PASS: 248 canonical portraits reviewed, 246 fictional profiles enriched, cameo safeguards and identity/save locks intact');
