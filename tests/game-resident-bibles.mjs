import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {execFileSync} from "node:child_process";
import {draftResidentBible,makePublishedResidentBibles} from "../scripts/game-characters/build-resident-bibles.mjs";

const core={id:"A03",name:"Ryan",occupation:"Pengelola irigasi"};
const cameo={id:"P01",name:"Dedi Mulyadi",occupation:"Gubernur Jawa Barat"};
const known=new Map([[core.id,core],[cameo.id,cameo]]);
const row={id:"W001",name:"Raka Uji",occupation:"Penjual bibit",portrait:"R001"};
const profile=draftResidentBible(row);
const sections=Object.keys(profile.sections);
assert.equal(sections.length,12);
assert.deepEqual(sections.map(s=>s.slice(0,2)),["01","02","03","04","05","06","07","08","09","10","11","12"]);
assert.equal(profile.sections["01_core_identity"].name,row.name);
assert.equal(profile.sections["04_social_profile"].occupation,row.occupation);
assert.match(profile.sections["11_visual_references"].conceptPortrait,/residents\/R001.png$/);
assert.equal(profile.sections["10_narrative_development"].threeActBeats.length,3);
assert.equal(profile.sections["01_core_identity"].ageYears,null,"No invented real age");
assert.match(profile.approval,/draft/);
const changed={...core,name:"Nama Docker"};
const bibles=makePublishedResidentBibles([row,changed,{...cameo,portrait:"P01"}],known);
assert.equal(Object.keys(bibles).length,2,"Matching canon/cameos retain their authored Bible");
assert.equal(bibles.A03.sections["01_core_identity"].name,"Nama Docker");
assert.equal(bibles.A03.sections["04_social_profile"].occupation,core.occupation);
assert.throws(()=>makePublishedResidentBibles([{...row,email:"secret"}],known),/Unexpected/);
assert.throws(()=>makePublishedResidentBibles([{...row,id:"A01"}],known),/Invalid/);
assert.throws(()=>makePublishedResidentBibles([{...cameo,name:"Recast",portrait:"P01"}],known),/cameo/);
const published=JSON.parse(readFileSync("src/lib/game/data/published-residents.json","utf8"));
const data=JSON.parse(readFileSync("src/lib/game/data/published-resident-bibles.json","utf8"));
assert.deepEqual(Object.keys(makePublishedResidentBibles(published,new Map([
 ...JSON.parse(readFileSync("game-assets/catalog/cast.json","utf8")).characters,
 ...JSON.parse(readFileSync("src/lib/game/data/bandung-character-previews.json","utf8"))
].map(x=>[x.id,x])))),Object.keys(data));
execFileSync(process.execPath,["scripts/game-characters/build-resident-bibles.mjs","--check"],{stdio:"pipe"});
console.log("PASS: 12-part resident Bible, canon reconciliation, privacy, and generated index");
