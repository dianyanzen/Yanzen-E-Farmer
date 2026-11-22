import {execFileSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';

const file=path=>readFileSync(path,'utf8');
const report=execFileSync(process.execPath,['scripts/game-characters/verify-public-catalog.mjs'],{encoding:'utf8'});
assert.match(report,/PASS: public fictional 248 NPC catalog/);
const index=JSON.parse(file('public/game/data/npc/index.json'));
assert.equal(index.characterCount,248);
assert.equal(index.characters.length,248);
assert.equal(new Set(index.characters.map(person=>person.id)).size,248);

const rosterReader=file('src/lib/game/private-residents.ts');
assert.ok(rosterReader.includes('npc-public-roster.json'),'canonical roster must fall back to published authorized NPC identities');
const gallery=file('src/app/game/character-gallery.tsx');
const phone=file('src/app/game/phone-wargapedia.tsx');
const client=file('src/app/game/game-client.tsx');
const guide=file('src/lib/game/public-wargapedia.ts');

assert.ok(gallery.includes('<PhoneWargapedia'),'one canonical Warga component must contain the whole encyclopedia');
assert.ok(client.includes('name: "Warga"'),'YZ Phone must expose Warga in the app grid');
assert.doesNotMatch(client,/name: "Wargapedia"/,'no separate Wargapedia app should remain');
assert.doesNotMatch(client,/phoneTab === "wargapedia"|selectedWikiId/,'no duplicated navigation state');
assert.ok(client.includes('<CharacterGallery game={game} residents={residents} selectedId={selectedCitizen}'), 'Warga remains embedded inside YZ Phone');
assert.ok(client.includes('onOpenWarga={id=>{setSelectedCitizen(id);setPhoneTab("characters");}}'),'Kronik links into the same Warga detail');

assert.ok(phone.includes('/game/data/npc/index.json'),'Warga must fetch public canonical index');
assert.ok(phone.includes('/game/data/npc/'),'Warga must load 248 public dossiers on demand');
assert.ok(phone.includes('WARGAPEDIA_CATEGORIES.map'),'all 12 sections must be visible in the one detail screen');
assert.ok(phone.includes('WARGAPEDIA_HIDDEN_FIELDS'),'internal editorial fields should not leak into public presentation');
assert.ok(phone.includes('onSelect(person.id)'),'roster list must navigate by canonical ID');
assert.ok(phone.includes('Tidak perlu berkenalan atau naik level'),'Warga must make free access explicit');
assert.ok(phone.includes('data-character-card={person.id}')&&phone.includes('data-character-detail={selectedId}'),'stable detail and list selectors');
assert.ok(phone.includes('approvedLegacyId(currentResident)'),'gameplay relationships must only use approved legacy associations');
assert.ok(phone.includes('game.bonds[activeNpc.id]'),'friendship must be derived from save data, not invented public lore');
assert.ok(phone.includes('questObjective(game,activeNpc.id)'),'quest text must reflect gameplay state');
assert.doesNotMatch(phone,/open=\{(?:level|bond|met|knowsMore|knowsPrivate)/,'lore visibility may not depend on friendship');
assert.ok(phone.includes('EditorialDraftNotes')&&phone.includes('?draft=1'),'protected editorial preview must remain available for editors');
assert.ok(phone.includes('profile?.id===selectedId'),'no stale profile from another character');
assert.equal((guide.match(/\['(?:0[1-9]|1[0-2])_[a-z_]+','[^']+'\]/g)||[]).length,12,'twelve shared wiki categories required');

console.log('PASS: single Warga app, 248 public NPC profiles, twelve open lore sections, approved-only save relationships, protected editor preview');
