import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';

const allCharacters = [];
const namesFromManifests = new Map();
for (const [pack, prefix, mainCount] of [['gba-v2','A',1],['gba-v2-c','C',0]]) {
const dir = new URL(`../../game-assets/characters/${pack}/`, import.meta.url);
const m = JSON.parse(readFileSync(new URL('manifest.json', dir), 'utf8'));
assert.equal(m.characters.length, 16);
assert.equal(new Set(m.characters.map(c => c.id)).size, 16);
assert.equal(m.characters.filter(c => c.role === 'main-character').length, mainCount);
assert.equal(m.mainCharacter, mainCount ? 'A01' : null);
assert.equal(m.characters.filter(c => c.role === 'npc').length, 16-mainCount);
assert.deepEqual(m.characters.map(c=>c.id), Array.from({length:16},(_,i)=>prefix+String(i+1).padStart(2,'0')));
assert.deepEqual(readdirSync(new URL('sheets/', dir)).sort(), Array.from({length:16}, (_,i)=>`${prefix}${String(i+1).padStart(2,'0')}.png`));
for (const c of m.characters) {
  assert.equal(c.profileCatalog,'game-assets/catalog/cast.json');
  assert.equal(c.profileId,c.id);
  namesFromManifests.set(c.id,c.name);
  assert.equal(c.sheet, `sheets/${c.id}.png`);
  assert.equal(c.role, c.id==='A01' ? 'main-character' : 'npc');
  const png = readFileSync(new URL(c.sheet, dir));
  assert.equal(png.subarray(0,8).toString('hex'), '89504e470d0a1a0a');
  assert.equal(png[25], 6, 'RGBA PNG required');
  assert.deepEqual([png.readUInt32BE(16),png.readUInt32BE(20)],c.size);
  assert.equal(createHash('sha256').update(png).digest('hex'), c.sha256);
  assert.equal(c.runtimeIntegrated,false);
  assert.equal(c.frames.length,12);
  assert.equal(new Set(c.frames.map(f=>f.name)).size,12);
  if(c.id==='C15') {
    assert.equal(c.mobility,'manual-wheelchair');
    assert.ok(c.frames.every(f=>!f.name.includes('step-')));
    assert.equal(c.frames.filter(f=>f.name.endsWith('idle')).length,4);
    assert.equal(c.frames.filter(f=>f.name.includes('push-')).length,8);
  }
  for (const f of c.frames) {
    const [x,y,w,h]=f.rect;
    assert.ok([x,y,w,h].every(Number.isInteger));
    assert.ok(x>=0 && y>=0 && w>0 && h>0 && x+w<=c.size[0] && y+h<=c.size[1]);
    assert.ok(f.nonempty && f.contentBounds);
  }
  for(let i=0;i<c.frames.length;i++) for(let j=i+1;j<c.frames.length;j++) {
    const [x,y,w,h]=c.frames[i].rect,[a,b,u,v]=c.frames[j].rect;
    assert.ok(x+w<=a || a+u<=x || y+h<=b || b+v<=y,'overlapping frame rectangles');
  }
}
allCharacters.push(...m.characters.map(c=>({id:c.id,role:c.role,packManifest:`game-assets/characters/${pack}/manifest.json`})));
}
const cast = JSON.parse(readFileSync(new URL('../../game-assets/catalog/cast.json',import.meta.url),'utf8'));
assert.equal(cast.expectedCount,32);
assert.equal(cast.mainCharacter,'A01');
assert.deepEqual(cast.characters.map(({id,role,packManifest})=>({id,role,packManifest})),allCharacters);
assert.equal(cast.profileLanguage,'id');
assert.equal(cast.characters.find(c=>c.id==='A01').name,'Yanzen');
assert.equal(new Set(cast.characters.map(c=>c.name)).size,32,'short names must be unique');
for(const c of cast.characters) {
  assert.match(c.name,/^[A-Z][a-z]+$/,'single short name without titles required');
  assert.equal(namesFromManifests.get(c.id),c.name,'manifest and profile names differ');
  assert.equal(c.profileKind,'fictional-game-design');
  assert.ok(typeof c.occupation==='string' && c.occupation.trim().length>0);
  assert.ok(Array.isArray(c.hobby) && c.hobby.length>=1 && c.hobby.every(h=>typeof h==='string' && h.trim()));
  assert.ok(Array.isArray(c.personality) && c.personality.length>=1 && c.personality.every(p=>typeof p==='string' && p.trim()));
  assert.ok(typeof c.designRationale==='string' && c.designRationale.trim().length>0);
}
assert.equal(new Set(allCharacters.map(c=>c.id)).size,32);
assert.equal(allCharacters.filter(c=>c.role==='main-character').length,1);
assert.equal(allCharacters.filter(c=>c.role==='npc').length,31);
const catalog = JSON.parse(readFileSync(new URL('../../game-assets/catalog/characters.json',import.meta.url),'utf8'));
assert.equal(catalog.activeCastCount,32);
assert.deepEqual(catalog.activeGeneratedPacks, [...new Set(allCharacters.map(c=>c.packManifest))]);
assert.deepEqual(catalog.activeNpcIds,allCharacters.filter(c=>c.role==='npc').map(c=>c.id));
console.log('PASS: 32 RGBA sheets; A01 sole main character; 31 NPCs; 384 bounded, non-overlapping frame rectangles; hashes and combined cast verified; C15 wheelchair metadata checked. Visual anatomy is reviewed separately in each QA.md.');
console.log('PASS: 32 unique short names; Yanzen main character; fictional occupation, hobby and personality profiles; manifest links verified.');
