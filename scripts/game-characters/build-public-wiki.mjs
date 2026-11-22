#!/usr/bin/env node
/** Rebuild the 248-person public fictional wiki exclusively from reviewed public JSON.
 * The canonical roster fingerprint and narrative approval status are never modified.
 */
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {join} from 'node:path';
import assert from 'node:assert/strict';
const cwd=process.cwd();
const check=process.argv.includes('--check');
const read=p=>JSON.parse(readFileSync(join(cwd,p),'utf8'));
const catalog=read('public/game/data/npc/index.json');
assert.equal(catalog.characterCount,248);
const headers={
 '01_core_identity':'Identitas',
 '02_physical_appearance':'Penampilan dan bahasa tubuh',
 '03_fashion_aesthetic':'Busana dan estetika',
 '04_social_profile':'Pekerjaan dan kehidupan sosial',
 '05_personality':'Kepribadian fiksi',
 '06_psychological_profile':'Motivasi dan konflik fiksi',
 '07_background_history':'Latar cerita',
 '08_relationship_dynamics':'Interaksi dan hubungan',
 '09_dialogue_behavior':'Suara dan dialog',
 '10_narrative_development':'Perkembangan cerita',
 '11_visual_references':'Referensi visual',
 '12_continuity_current_state':'Kontinuitas dan status runtime'
};
function value(v){
 if(v===null||v===undefined)return 'Belum ditetapkan';
 if(typeof v==='boolean')return v?'Ya':'Tidak';
 if(typeof v==='string')return v;
 if(Array.isArray(v))return v.length?v.map(t=>'- '+value(t)).join('\n'):'Belum ditetapkan';
 if(typeof v==='object')return Object.entries(v).length?
  Object.entries(v).map(([k,x])=>'- **'+k+':** '+value(x)).join('\n'):'Belum ditetapkan';
 return String(v);
}
const ignored=new Set(['name','fullName','canonicalId','occupation','portraitKey','conceptPortrait']);
const compareOrWrite=(path,text)=>{
 const abs=join(cwd,path);
 if(check){assert.ok(existsSync(abs),'wiki missing '+path);assert.equal(readFileSync(abs,'utf8'),text,'wiki drift '+path);}
 else writeFileSync(abs,text,'utf8');
};
let count=0;
for(const entry of catalog.characters){
 const r=read('public/game/data/npc/'+entry.id+'.json');
 assert.equal(r.id,entry.id);assert.equal(r.approval,'draft');
 const lines=[
  '# '+r.name+' ('+r.id+')', '',
  '**Peran:** '+r.occupation,
  '**Potret:** ![Potret '+r.id+'](../../../public'+r.portraitUrl+')',
  '**Status:** Rancangan fiksi publik — belum disahkan sebagai kisah atau gameplay aktif.',
  '',
  '> Seluruh cerita dan sifat di halaman ini adalah konsep untuk tokoh fiksi YZ Farm Life, bukan biografi seseorang di dunia nyata.', ''
 ];
 for(const [key,title] of Object.entries(headers)){
  lines.push('## '+title,'');
  const section=r.sections[key];
  assert.ok(section&&typeof section==='object');
  for(const [field,v] of Object.entries(section)){
   if(ignored.has(field)||v===null)continue;
   const label=field.replaceAll('_',' ');
   if(Array.isArray(v)||typeof v==='object'){
    if(v.length===0||Object.keys(v).length===0)continue;
    lines.push('**'+label+'**',value(v),'');
   }else lines.push('**'+label+':** '+value(v),'');
  }
  if(key==='06_psychological_profile'&&['P01','P02'].includes(r.id))
   lines.push('Tidak ada atribusi psikologi, motivasi, atau riwayat pribadi untuk kameo tokoh publik.','');
 }
 if(Array.isArray(r.publicBiography?.sources)&&r.publicBiography.sources.length){
  lines.push('## Sumber biografi publik','','Rujukan hanya untuk fakta profil kameo; dialog serta kejadian di dalam game sepenuhnya fiksi.','');
  for(const source of r.publicBiography.sources){
   if(typeof source.title==='string'&&typeof source.url==='string'&&source.url.startsWith('https://'))lines.push('- ['+source.title+']('+source.url+')');
  }
  lines.push('');
 }
 lines.push('---','Karakter ini merupakan bagian dari katalog fiksi YZ Farm Life. Data identitas canonical dikunci; pengesahan lore dan implementasi gameplay dilakukan terpisah.','');
 compareOrWrite('docs/game-dev/characters/'+r.id+'.md',lines.join('\n'));
 count++;
}
const roll=[
 '# Ensiklopedia Warga — YZ Farm Life', '',
 '> **Semesta fiksi.** Ini adalah katalog 248 NPC yang dirancang untuk game YZ Farm Life berlatar Bandung. Nama, pekerjaan, potret, dan ID adalah identitas **karakter game** yang dikunci. Karakterisasi dan plot masih draf fiksi, bukan fakta tentang seseorang; belum seluruh karakter playable.',
 '', '## Indeks karakter', '', '| ID | Karakter | Profesi | Dossier |', '|---|---|---|---|'
];
for(const x of catalog.characters)roll.push('| '+x.id+' | '+x.name+' | '+x.occupation+' | [12 kategori](./'+x.id+'.md) |');
roll.push('', '## Aturan publikasi', '',
 '- Status publikasi tidak sama dengan persetujuan naratif: semua profil tetap `draft`.',
 '- Tidak memindahkan save, relationship, quest, dan story flags dari legacy tanpa persetujuan terpisah.',
 '- Batasan kameo P01/P02: tidak membuat motif/psikologi, riwayat pribadi atau menganggap dialog fiksi sebagai kutipan nyata.',
 '- Potret merupakan konsep; sprite, sheet ekspresi, jadwal dan lokasi spawn harus melalui QA runtime.',
 '', '## Penggunaan', '',
 '- Dokumen lengkap per tokoh terdapat di folder ini.',
 '- JSON publik per tokoh ada di `public/game/data/npc/{ID}.json` (diakses on demand dari YZ Phone).',
 '- `public/game/data/npc/index.json` adalah indeks katalog publik.',
 '- Konten proposal dapat berubah setelah editorial review, tetapi 4 identitas canonical hanya boleh diubah melalui audit fingerprint.', '');
compareOrWrite('docs/game-dev/characters/README.md',roll.join('\n'));
console.log('PASS: '+count+' fictional Character Bible wiki entries '+(check?'match public JSON':'generated'));