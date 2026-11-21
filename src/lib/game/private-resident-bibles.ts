/** Private, explicitly approved 12-section biographies, served only to authenticated players. */
import {readFile} from "node:fs/promises";
import {resolve,isAbsolute} from "node:path";
import type {ResidentProfile} from "./resident-profile";
import type {CharacterBible} from "./phone-profiles";
import {bandungConceptPortraitPath} from "./bandung-concept-portrait";
const keys=[
 "01_core_identity","02_physical_appearance","03_fashion_aesthetic","04_social_profile",
 "05_personality","06_psychological_profile","07_background_history","08_relationship_dynamics",
 "09_dialogue_behavior","10_narrative_development","11_visual_references",
 "12_continuity_current_state"
] as const;
const isRecord=(x:unknown):x is Record<string,unknown>=>x!==null&&typeof x==="object"&&!Array.isArray(x);
export async function readPrivateResidentBible(resident:ResidentProfile):Promise<CharacterBible|null>{
 const inputPath=process.env.GAME_RESIDENT_BIBLES||"deploy/private/character-bibles.json";
 const file=isAbsolute(inputPath)?inputPath:resolve(process.cwd(),inputPath);
 let data:unknown;
 try{data=JSON.parse(await readFile(file,"utf8"));}
 catch{return null;}
 if(!isRecord(data))return null;
 const source=isRecord(data.profiles)?data.profiles:data;
 const raw=source[resident.id];
 if(!isRecord(raw)||raw.id!==resident.id||raw.approval!=="approved"||!isRecord(raw.sections))return null;
 if(!keys.every(key=>isRecord(raw.sections)&&isRecord(raw.sections[key])))return null;
 const sections={...raw.sections} as Record<string,Record<string,unknown>>;
 // Canonical truth always comes from the roster, never from a copied old biography.
 sections["01_core_identity"]={...sections["01_core_identity"],name:resident.name};
 sections["04_social_profile"]={...sections["04_social_profile"],occupation:resident.occupation};
 sections["11_visual_references"]={...sections["11_visual_references"],conceptPortrait:bandungConceptPortraitPath(resident.portrait)};
 return {id:resident.id,approval:"approved",characterClass:"canonical-private",sections} as unknown as CharacterBible;
}
