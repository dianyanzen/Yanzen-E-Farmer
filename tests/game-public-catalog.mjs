import {execFileSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
import {build} from 'esbuild';
import assert from 'node:assert/strict';

const file=path=>readFileSync(path,'utf8');
const report=execFileSync(process.execPath,['scripts/game-characters/verify-public-catalog.mjs'],{encoding:'utf8'});
assert.match(report,/PASS: public fictional 248 NPC catalog/);
const index=JSON.parse(file('public/game/data/npc/index.json'));
assert.equal(index.characterCount,248);
assert.equal(index.characters.length,248);
assert.equal(new Set(index.characters.map(person=>person.id)).size,248);
const reader=file('src/lib/game/private-residents.ts');
const gallery=file('src/app/game/character-gallery.tsx');
const phone=file('src/app/game/phone-wargapedia.tsx');
const encyclopedia=file('src/app/game/encyclopedia/encyclopedia-client.tsx');
const client=file('src/app/game/game-client.tsx');
const presenter=file('src/lib/game/public-wargapedia.ts');
assert.ok(reader.includes('npc-public-roster.json'),'roster comes from canonical 248 names');
assert.ok(gallery.includes('<PhoneWargapedia'));
assert.ok(client.includes('name: "Warga"'));
assert.doesNotMatch(client,/name: "Wargapedia"/,'no duplicate encyclopedia app');
assert.ok(client.includes('<CharacterGallery game={game} residents={residents} selectedId={selectedCitizen}'));
assert.ok(client.includes('onOpenWarga={id=>{setSelectedCitizen(id);setPhoneTab("characters");}}'));
assert.ok(phone.includes('/game/data/npc/index.json')&&phone.includes('/game/data/npc/'));
assert.ok(phone.includes('WARGAPEDIA_CATEGORIES.some'),'all internal 12 sections validated');
assert.ok(phone.includes('wargaPlayerView(profile)'));
assert.ok(encyclopedia.includes('wargaPlayerView(profile)'));
assert.ok(phone.includes('onSelect(person.id)'));
assert.ok(phone.includes('data-character-card={person.id}')&&phone.includes('data-character-detail={selectedId}'));
assert.ok(phone.includes('approvedLegacyId(currentResident)'));
assert.ok(phone.includes('game.bonds[activeNpc.id]'));
assert.ok(phone.includes('questObjective(game,activeNpc.id)'));
assert.doesNotMatch(phone,/WARGAPEDIA_CATEGORIES\.map|Object\.entries\(profile\.sections|EditorialDraftNotes|npcDraftPreview|\?draft=1|Tidak perlu berkenalan atau naik level|12 bagian|{known\.id}/,'no raw editor fields in Warga');
assert.doesNotMatch(encyclopedia,/WARGAPEDIA_CATEGORIES\.map|Object\.entries\(profile\.sections|Draf fiksi publik|12 bagian/);
assert.ok(presenter.includes('WARGA_PLAYER_FIELD_POLICY'));
assert.equal((presenter.match(/\['(?:0[1-9]|1[0-2])_[a-z_]+','[^']+'\]/g)||[]).length,12,'writer-facing schema still has 12 categories');

const compiled=await build({entryPoints:['src/lib/game/public-wargapedia.ts'],bundle:true,platform:'node',format:'esm',write:false,logLevel:'silent'});
const {wargaPlayerView,wargaDisplayName}=await import('data:text/javascript;base64,'+Buffer.from(compiled.outputFiles[0].text).toString('base64'));
let ordinary=0,cameos=0;
for(const entry of index.characters){
 const doc=JSON.parse(file('public/game/data/npc/'+entry.id+'.json'));
 const view=wargaPlayerView(doc);
 assert.equal(view.displayName,wargaDisplayName(entry.name));
 assert.ok(view.sections.length>=1&&view.sections.length<=3,'Player profile should be concise '+entry.id);
 assert.ok(view.sections.every(s=>s.lines.length>=1&&s.lines.length<=3),'No raw dossier dumps '+entry.id);
 assert.ok(view.sections.every(s=>!/(?:\b(?:runtime|fieldProvenance|draft|draf|gameplay|player|pemain|NPC|JSON|approval)\b|12 kategori|belum ditetapkan)/i.test(s.lines.join(' '))),'Developer jargon on '+entry.id);
 assert.equal(Object.hasOwn(view,'fieldProvenance'),false);
 if(['P01','P02'].includes(entry.id)){
  cameos++;assert.ok(view.sources.length>=2,'Public cameo must have verified sources');
  assert.ok(view.sections.some(s=>s.title==='Riwayat singkat'));
 }else{ordinary++;assert.equal(view.sources.length,0);}
}
assert.equal(ordinary,246);assert.equal(cameos,2);
console.log('PASS: 248 character dossiers projected into concise player stories; cameo references retained; developer metadata isolated');
