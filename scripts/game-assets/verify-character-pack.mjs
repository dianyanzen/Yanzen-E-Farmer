import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';

const dir = new URL('../../game-assets/characters/gba-v2/', import.meta.url);
const m = JSON.parse(readFileSync(new URL('manifest.json', dir), 'utf8'));
assert.equal(m.characters.length, 16);
assert.equal(new Set(m.characters.map(c => c.id)).size, 16);
assert.equal(m.characters.filter(c => c.role === 'main-character').length, 1);
assert.equal(m.characters.find(c => c.role === 'main-character').id, 'A01');
assert.equal(m.characters.filter(c => c.role === 'npc').length, 15);
assert.deepEqual(readdirSync(new URL('sheets/', dir)).sort(), Array.from({length:16}, (_,i)=>`A${String(i+1).padStart(2,'0')}.png`));
for (const c of m.characters) {
  assert.match(c.sheet, /^sheets\/A(?:0[1-9]|1[0-6])\.png$/);
  const png = readFileSync(new URL(c.sheet, dir));
  assert.equal(png.subarray(0,8).toString('hex'), '89504e470d0a1a0a');
  assert.equal(png[25], 6, 'RGBA PNG required');
  assert.deepEqual([png.readUInt32BE(16),png.readUInt32BE(20)],c.size);
  assert.equal(createHash('sha256').update(png).digest('hex'), c.sha256);
  assert.equal(c.runtimeIntegrated,false);
  assert.equal(c.frames.length,12);
  assert.equal(new Set(c.frames.map(f=>f.name)).size,12);
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
console.log('PASS: 16 RGBA sheets; one main character; 15 NPCs; 192 bounded, non-overlapping frame rectangles; all hashes verified. Visual anatomy is a separate review in QA.md.');
