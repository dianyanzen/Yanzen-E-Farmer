import assert from "node:assert/strict";
import {makeCompleteDockerBibles} from "../scripts/game-characters/complete-docker-bibles.mjs";

const known=new Map([
 ["A02",{id:"A02",name:"Nabila",occupation:"Perawat kebun bunga"}],
 ["A06",{id:"A06",name:"Asep",occupation:"Kurir hasil kebun"}],
 ["P01",{id:"P01",name:"Dedi Mulyadi",occupation:"Gubernur Jawa Barat"}]
]);
const rows=[
 {id:"A02",name:"NABILA SEPTIA JULFIADI",occupation:"Perawat kebun bunga",portrait:"work-A02"},
 {id:"A06",name:"ADANG",occupation:"Kurir hasil kebun",portrait:"work-A06"},
 {id:"W001",name:"ELIS DEWI",occupation:"Penyunting majalah kampung",portrait:"R073"},
 {id:"P01",name:"Dedi Mulyadi",occupation:"Gubernur Jawa Barat",portrait:"P01"}
];
const legacy={
 characters:[],
 traits:[{karakter_id:"A02",jenis:"hobi",isi:"Merangkai bunga"}],
 stories:[{npc:"A02",judul:"Bunga yang dibiarkan mekar",premis:"Nabila menjaga benih bunga lama"},
          {npc:"A06",judul:"Kisah Asep",premis:"Keluarga fiksi milik Asep"}],
 routines:[{npc:"A02",kondisi:"Pagi",jam:"07.00–10.00",kelurahan:"kel-neglasari",aktivitas:"Memeriksa bunga"}]
};
const result=makeCompleteDockerBibles(rows,known,legacy);
assert.equal(Object.keys(result).length,4);
for(const row of rows){
 const b=result[row.id];
 assert.equal(Object.keys(b.sections).length,12);
 assert.equal(b.sections["01_core_identity"].name,row.name);
 assert.equal(b.sections["04_social_profile"].occupation,row.occupation);
 assert.equal(b.sections["11_visual_references"].dockerPortraitId,row.portrait);
}
assert.equal(result.A02.characterClass,"docker-expanded-identity");
assert.match(result.A02.sections["07_background_history"].narrativeBackground,/Nabila/);
assert.equal(result.A02.sections["12_continuity_current_state"].proposedRoutines.length,1);
assert.equal(result.A06.characterClass,"docker-identity-revision");
assert.equal(result.A06.sections["07_background_history"].narrativeBackground,undefined);
assert.equal(result.A06.sections["12_continuity_current_state"].previousLoreStatus,"quarantined");
assert.equal(result.W001.sections["01_core_identity"].ageYears,null);
assert.equal(result.P01.sections["07_background_history"].personalFamily?.includes("Tidak"),true);
assert.throws(()=>makeCompleteDockerBibles([{...rows[0],email:"secret"}],known,legacy),/Unexpected/);
console.log("PASS: complete private Docker Bible, aliases, recasts, portraits, 12 categories, legacy story guard");
