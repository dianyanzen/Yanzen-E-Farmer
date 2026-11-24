import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createRequire} from "node:module";
import vm from "node:vm";
import ts from "typescript";

const root=new URL("../src/lib/game/bandung-world.ts",import.meta.url);
const compiled=ts.transpileModule(readFileSync(root,"utf8"),{
  compilerOptions:{esModuleInterop:true,module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}
}).outputText;
const testModule={exports:{}};
vm.runInNewContext(compiled,{exports:testModule.exports,module:testModule,require:createRequire(root)},{timeout:2000});
const {
  BANDUNG_WORLD,WORLD_DISTRICTS,WORLD_VILLAGES,getWorldDistrict,getWorldVillages,
  getWorldVillageById,isVillagePlayable,searchWorldVillages,
  WORLD_ZONE_CATEGORIES,PASIRLUYU_LOCATIONS,PASIRLUYU_CONNECTIONS,VERIFIED_CITY_ROUTES
}=testModule.exports;
const raw=JSON.parse(readFileSync(new URL("../src/lib/game/data/bandung-master-registry.json",import.meta.url),"utf8"));
assert.equal(BANDUNG_WORLD.districtCount,30);
assert.equal(BANDUNG_WORLD.villageCount,151);
assert.equal(WORLD_DISTRICTS.length,30);
assert.equal(WORLD_VILLAGES.length,151);
assert.equal(new Set(WORLD_DISTRICTS.map(d=>d.name)).size,30);
assert.equal(new Set(WORLD_VILLAGES.map(v=>v.name)).size,151);
assert.equal(new Set(WORLD_VILLAGES.map(v=>v.id)).size,151);
assert.equal(raw.geometry_status,"not_imported","no fabricated GIS boundaries");
assert.equal(VERIFIED_CITY_ROUTES.length,0,"no fabricated city-level roads");
const old=readFileSync(new URL("../src/lib/game/bandung-locations.ts",import.meta.url),"utf8");
const existing=old.match(/export const BANDUNG_DISTRICTS = \[([\s\S]*?)\] as const;/);
assert.ok(existing);
const districts=[...existing[1].matchAll(/"([^"]+)"/g)].map(x=>x[1]);
assert.deepEqual(WORLD_DISTRICTS.map(d=>d.name),districts,"districts remain backward-compatible");
const knownCounts={
  "Andir":6,"Antapani":4,"Arcamanik":4,"Astanaanyar":6,"Babakan Ciparay":6,
  "Bandung Kidul":4,"Bandung Kulon":8,"Bandung Wetan":3,"Batununggal":8,
  "Bojongloa Kaler":5,"Bojongloa Kidul":6,"Buahbatu":4,"Cibeunying Kaler":4,
  "Cibeunying Kidul":6,"Cibiru":4,"Cicendo":6,"Cidadap":3,"Cinambo":4,
  "Coblong":6,"Gedebage":4,"Kiaracondong":6,"Lengkong":7,"Mandalajati":4,
  "Panyileukan":4,"Rancasari":4,"Regol":7,"Sukajadi":5,"Sukasari":4,
  "Sumur Bandung":4,"Ujungberung":5
};
for(const d of WORLD_DISTRICTS){
  assert.equal(d.villages.length,knownCounts[d.name],"district count "+d.name);
  assert.equal(getWorldDistrict(d.name),d,"lookup returns exact district");
  assert.equal(getWorldVillages(d.name),d.villages);
  assert.ok(d.villages.every(v=>v.id.startsWith(d.id+"/")));
  assert.equal(d.boundary_state,"not_imported");
}
assert.equal(getWorldVillages("Unknown").length,0,"unknown district has no villages");
assert.equal(getWorldDistrict("unknown"),null);
assert.equal(getWorldDistrict("regol").name,"Regol");
assert.equal(getWorldVillageById("bdg/regol/pasirluyu").name,"Pasirluyu");
assert.equal(isVillagePlayable("Regol","Pasirluyu"),true);
assert.equal(isVillagePlayable("Regol","Ancol"),false);
assert.equal(isVillagePlayable("Coblong","Dago"),false);
assert.equal(WORLD_VILLAGES.filter(v=>v.play_state==="playable").length,1);
assert.equal(WORLD_DISTRICTS.filter(d=>d.play_state==="partial").length,1);
assert.equal(WORLD_ZONE_CATEGORIES.length,11);
assert.equal(PASIRLUYU_LOCATIONS.length,4);
assert.equal(PASIRLUYU_CONNECTIONS.length,3);
assert.ok(PASIRLUYU_LOCATIONS.every(v=>v.villageId==="bdg/regol/pasirluyu"));
assert.equal(new Set(PASIRLUYU_LOCATIONS.map(v=>v.sceneId)).size,4);
assert.ok(PASIRLUYU_LOCATIONS.every(v=>v.status==="playable"));
assert.equal(searchWorldVillages("Pasirluyu")[0].districtName,"Regol");
assert.ok(searchWorldVillages("Dago").some(v=>v.districtName==="Coblong"));
assert.equal(searchWorldVillages("Cihargeulis")[0].districtName,"Cibeunying Kaler");
assert.equal(searchWorldVillages("cihaurgeulis")[0].name,"Cihargeulis","source spelling aliases retained");
assert.equal(searchWorldVillages("cimencrang")[0].name,"Cimincrang");
assert.equal(searchWorldVillages("cijaura")[0].name,"Cijawura");
assert.equal(searchWorldVillages("")[0],undefined);
const originalAtlas=readFileSync(new URL("../public/game/atlas/index.html",import.meta.url),"utf8");
const needle="const entries=";
const start=originalAtlas.indexOf(needle);
assert.ok(start>=0);
const end=originalAtlas.indexOf(";",start+needle.length);
assert.ok(end>start,"atlas entries declaration terminates with a semicolon");
const list=JSON.parse(originalAtlas.slice(start+needle.length,end));
const atlasNames=list.filter(row=>row[0]==="Kelurahan").map(row=>row[1]).sort();
assert.equal(atlasNames.length,151);
assert.deepEqual(WORLD_VILLAGES.map(v=>v.atlas_label).sort(),atlasNames,
  "all 151 names exactly correspond to existing game assets");
const worldData=raw.districts.flatMap(d=>d.villages);
assert.ok(worldData.every(v=>v.boundary_state==="not_imported"));
assert.ok(raw.source_references.some(s=>s.purpose.includes("district_village_name_parent")));
console.log("Bandung world registry QA: 30 kecamatan, 151 kelurahan, 4 playable Pasirluyu zones: PASS");
