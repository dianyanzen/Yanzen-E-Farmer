/** Server-only reader. Never commit deploy/private/residents.json or approved identity links. */
import {readFile,access} from "node:fs/promises";
import {resolve,join,isAbsolute} from "node:path";
import {z} from "zod";
import type {ResidentProfile} from "./resident-profile";
import cast from "../../../game-assets/catalog/cast.json";
import previews from "./data/bandung-character-previews.json";
import {bandungConceptPortraitPath} from "./bandung-concept-portrait";

const residentSchema=z.object({
 id:z.string().regex(/^(?:[ACNK]\d{2}|P0[12]|W\d{3})$/),
 name:z.string().trim().min(1).max(120),
 occupation:z.string().trim().min(1).max(120),
 portrait:z.string().regex(/^(?:P0[12]|N0[1-6]|K(?:0[1-9]|[12]\d|30)|R\d{3}|phone-(?:A(?:0[1-9]|1[0-6])|C0[158])|work-[AC](?:0[1-9]|1[0-6]))$/)
}); // Zod strips private extra columns rather than exposing them to the browser.
const rosterSchema=z.union([
 z.array(residentSchema),
 z.object({schemaVersion:z.number(),currentRoster:z.array(residentSchema)}).passthrough()
]);
const linkSchema=z.object({
 rosterId:z.string(),rosterName:z.string(),rosterOccupation:z.string(),
 legacyId:z.string(),legacyName:z.string(),legacyOccupation:z.string(),
 approvedBy:z.string().min(3),approvedAt:z.string().min(10)
}).strict();
const approvedLinkSchema=z.array(linkSchema);
const canonPath=(value:string,defaultPath:string)=>{
 const path=value||defaultPath;
 return isAbsolute(path)?path:resolve(process.cwd(),path);
};
const oldCast=[...cast.characters,...previews] as Array<{id:string;name:string;occupation:string}>;

export async function readPrivateResidents():Promise<ResidentProfile[]> {
 const path=canonPath(process.env.GAME_RESIDENT_ROSTER||"","deploy/private/residents.json");
 let source:unknown;
 try {
  // Optional secret environment value for Vercel. Never use NEXT_PUBLIC_ for this data.
  const injected=process.env.GAME_RESIDENT_ROSTER_JSON;
  source=JSON.parse(injected!==undefined?injected:await readFile(path,"utf8"));
 }
 catch(error){
   if((error as NodeJS.ErrnoException).code!=="ENOENT") console.error("[residents] private roster unreadable");
   return [];
 }
 try {
  const parsed=rosterSchema.parse(source);
  const residents=Array.isArray(parsed)?parsed:parsed.currentRoster;
  if(residents.length!==248)throw new Error("invalid-count");
  const ids=new Set<string>(),names=new Set<string>(),portraits=new Set<string>();
  // Next/Vercel may serve public images from a CDN rather than mounting public/ inside a lambda.
  const assetRoot=join(process.cwd(),"public/game/assets/portraits/bandung");
  let assetDirectoryMounted=true;
  try{await access(assetRoot);}catch{assetDirectoryMounted=false;}
  for(const r of residents) {
   if(ids.has(r.id))throw new Error("duplicate-id");
   if(names.has(r.name.toLocaleLowerCase("id")))throw new Error("duplicate-name");
   if(portraits.has(r.portrait))throw new Error("duplicate-portrait");
   ids.add(r.id);names.add(r.name.toLocaleLowerCase("id"));portraits.add(r.portrait);
   const relative=bandungConceptPortraitPath(r.portrait).replace(/^\//,"");
   if(assetDirectoryMounted)await access(join(process.cwd(),"public",relative));
  }
  const approved=new Map<string,string>();
  const linkPath=process.env.GAME_APPROVED_LEGACY_ASSOCIATIONS;
  if(linkPath){
   const links=approvedLinkSchema.parse(JSON.parse(await readFile(canonPath(linkPath,linkPath),"utf8")));
   const seen=new Set<string>(),seenLegacy=new Set<string>();
   for(const link of links){
    if(seen.has(link.rosterId)||seenLegacy.has(link.legacyId))throw new Error("duplicate-approval");
    seen.add(link.rosterId);seenLegacy.add(link.legacyId);
    const current=residents.find(r=>r.id===link.rosterId);
    const old=oldCast.find(p=>p.id===link.legacyId);
    if(!current||!old||current.name!==link.rosterName||current.occupation!==link.rosterOccupation||
       old.name!==link.legacyName||old.occupation!==link.legacyOccupation)
       throw new Error("stale-or-conflicting-approval");
    approved.set(link.rosterId,link.legacyId);
   }
  }
  return residents.map(r=>({...r,legacyApproved:approved.has(r.id),
    ...(approved.has(r.id)?{legacyId:approved.get(r.id)}:{})}));
 }catch{
  // Fail closed: never silently mix a partial roster with old game characters.
  console.error("[residents] invalid roster, portrait mapping or approved legacy links");
  return [];
 }
}
