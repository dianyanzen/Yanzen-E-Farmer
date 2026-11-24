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
export async function readPrivateResidentBible(resident:ResidentProfile,options:{allowDraft?:boolean}={}):Promise<CharacterBible|null>{
 const inputPath=process.env.GAME_RESIDENT_BIBLES||"deploy/private/character-bibles.json";
 const file=isAbsolute(inputPath)?inputPath:resolve(process.cwd(),inputPath);
 let data:unknown;
 try{data=JSON.parse(await readFile(file,"utf8"));}
 catch{return null;}
 if(!isRecord(data))return null;
 const source=isRecord(data.profiles)?data.profiles:data;
 const raw=source[resident.id];
 if(!isRecord(raw)||raw.id!==resident.id||!isRecord(raw.sections))return null;
 const preview=options.allowDraft===true&&raw.approval==="draft";
 if(raw.approval!=="approved"&&!preview)return null;
 // Reject contradictory top-level identities; absent fields are supported for old private scaffolds.
 if((raw.name!==undefined&&raw.name!==resident.name)||
   (raw.occupation!==undefined&&raw.occupation!==resident.occupation)||
   (raw.portrait!==undefined&&raw.portrait!==resident.portrait))return null;
 if(!keys.every(key=>isRecord(raw.sections)&&isRecord(raw.sections[key])))return null;
 const sections={...raw.sections} as Record<string,Record<string,unknown>>;
 // Approval must mean all 12 categories were individually authored and reviewed.
 const notWritten=/(?:Belum ditulis|Belum ditetapkan|Tinjau referensi potret)/i;
 const hasPlaceholder=(value:unknown):boolean=>
  typeof value==="string"?notWritten.test(value):
  Array.isArray(value)?value.some(hasPlaceholder):
  isRecord(value)?Object.values(value).some(hasPlaceholder):false;
 if(!preview&&keys.some(key=>hasPlaceholder(sections[key])))return null;
 const traitList=sections["05_personality"].traits;
 const beats=sections["10_narrative_development"].threeActBeats;
 const line=sections["09_dialogue_behavior"].sampleLine;
 if(!preview&&(!Array.isArray(traitList)||traitList.length<2||
   !Array.isArray(beats)||beats.length!==3||new Set(beats).size!==3||
   typeof line!=="string"||line.trim().length<20))return null;
 // Canonical truth always comes from the roster, never from a copied old biography.
 sections["01_core_identity"]={...sections["01_core_identity"],name:resident.name,fullName:resident.name};
 sections["04_social_profile"]={...sections["04_social_profile"],occupation:resident.occupation};
 sections["11_visual_references"]={...sections["11_visual_references"],portraitKey:resident.portrait,conceptPortrait:bandungConceptPortraitPath(resident.portrait)};
 // The caller must separately authorize draft access. No state, flags or approvals are modified.
 return {id:resident.id,approval:raw.approval,characterClass:"canonical-private",sections} as unknown as CharacterBible;
}
