import "server-only";
import {readFile} from "node:fs/promises";
import {resolve} from "node:path";
import cast from "../../../game-assets/catalog/cast.json";
import previews from "./data/bandung-character-previews.json";
import publishedResidents from "./data/published-residents.json";
import publishedBibles from "./data/published-resident-bibles.json";
import {makeCompleteDockerBibles} from "../../../scripts/game-characters/complete-docker-bibles.mjs";
import {bandungConceptPortraitPath} from "./bandung-concept-portrait";
import type {ResidentProfile} from "./resident-profile";
import type {CharacterBible} from "./phone-profiles";

const idPattern=/^(?:[ACNK]\d{2}|P0[12]|W\d{3})$/;
const portraitPattern=/^(?:P0[12]|N0[1-6]|K(?:0[1-9]|[12]\d|30)|R\d{3}|phone-[AC]\d{2}|work-[AC]\d{2})$/;
function privatePath(env:string,name:string):string{
 return process.env[env]||resolve(process.cwd(),"deploy","private",name);
}
async function optionalJson(path:string):Promise<unknown|null>{
 try{return JSON.parse(await readFile(path,"utf8")) as unknown;}
 catch(error){
  if((error as NodeJS.ErrnoException).code==="ENOENT")return null;
  throw new Error("Gagal memuat data NPC privat: periksa berkas pada Docker.");
 }
}
function verifiedResidents(value:unknown):ResidentProfile[]{
 if(!Array.isArray(value)||value.length>500)throw new Error("Roster NPC tidak valid.");
 const ids=new Set<string>(),names=new Set<string>();
 return value.map((v:unknown)=>{
  if(!v||typeof v!=="object"||Array.isArray(v))throw new Error("Baris NPC tidak valid.");
  const p=v as Record<string,unknown>;
  if(Object.keys(p).sort().join(",")!=="id,name,occupation,portrait"||
   typeof p.id!=="string"||!idPattern.test(p.id)||p.id==="A01"||
   typeof p.name!=="string"||!p.name.trim()||p.name.length>120||
   typeof p.occupation!=="string"||!p.occupation.trim()||p.occupation.length>120||
   typeof p.portrait!=="string"||!portraitPattern.test(p.portrait)||
   /[<>\u0000-\u001f]/u.test(p.name+p.occupation))
   throw new Error("Field atau ID NPC tidak valid.");
  const name=p.name.trim(),key=name.toLocaleLowerCase("id");
  if(ids.has(p.id)||names.has(key))throw new Error("ID atau nama NPC ganda.");
  ids.add(p.id);names.add(key);
  return {id:p.id,name,occupation:p.occupation.trim(),portrait:p.portrait};
 });
}
function approvedBibles(value:unknown,residents:readonly ResidentProfile[]):Record<string,CharacterBible>{
 if(!value||typeof value!=="object"||Array.isArray(value))throw new Error("Bible privat bukan objek.");
 const rows=new Map(residents.map(r=>[r.id,r])),result:Record<string,CharacterBible>={};
 for(const [id,raw] of Object.entries(value as Record<string,unknown>)){
  const row=rows.get(id),bible=raw as CharacterBible;
  if(!row||!bible||bible.id!==id||!bible.sections||
   Object.keys(bible.sections).length!==12||
   bible.sections["01_core_identity"]?.name!==row.name||
   bible.sections["04_social_profile"]?.occupation!==row.occupation||
   bible.sections["11_visual_references"]?.conceptPortrait!==bandungConceptPortraitPath(row.portrait))
   throw new Error("Bible privat tidak sesuai dengan roster Docker.");
  result[id]=bible;
 }
 return result;
}
export async function loadGameResidentData():Promise<{residents:ResidentProfile[];bibles:Record<string,CharacterBible>}>{
 const docker=await optionalJson(privatePath("YZ_GAME_RESIDENT_ROSTER_FILE","residents.json"));
 const residents=verifiedResidents(docker??publishedResidents);
 const known=new Map([...cast.characters,...previews].map(p=>[p.id,p]));
 const draft=makeCompleteDockerBibles(residents,known);
 const privateBibles=docker!==null?await optionalJson(privatePath("YZ_GAME_RESIDENT_BIBLES_FILE","resident-bibles.json")):null;
 const edited=privateBibles===null?{}:approvedBibles(privateBibles,residents);
 return {residents,bibles:{...(publishedBibles as Record<string,CharacterBible>),...draft,...edited}};
}
