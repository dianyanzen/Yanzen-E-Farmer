/** Server-only reader. Never commit deploy/private/residents.json or approved identity links. */
import {readFile,access} from "node:fs/promises";
import {createHash} from "node:crypto";
import {resolve,join,isAbsolute} from "node:path";
import {z} from "zod";
import type {ResidentProfile} from "./resident-profile";
import cast from "../../../game-assets/catalog/cast.json";
import previews from "./data/bandung-character-previews.json";
import publicRoster from "../../../game-assets/catalog/npc-public-roster.json";
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
// A whole-roster fingerprint protects against stale/incomplete/misassigned names.
// Derived from the 248 rows approved in the 2026-11-22 owner-supplied catalog,
// without committing its names or occupations to this public repository.
const OWNER_REVIEWED_ROSTER_SHA256="24525af2c8e8b69bdb37a43691ebba158d40749b86890bdaf23a53a2805c426e";
const fingerprint=(rows:readonly {id:string;name:string;occupation:string;portrait:string}[])=>
 createHash("sha256").update(rows.slice().sort((a,b)=>a.id<b.id?-1:a.id>b.id?1:0)
   .map(r=>[r.id,r.name,r.occupation,r.portrait].join("|")+"\n").join("")).digest("hex");

export async function readPrivateResidents():Promise<ResidentProfile[]> {
 const path=canonPath(process.env.GAME_RESIDENT_ROSTER||"","deploy/private/residents.json");
 let source:unknown;
 try {
  // Optional secret environment value for Vercel. Never use NEXT_PUBLIC_ for this data.
  const injected=process.env.GAME_RESIDENT_ROSTER_JSON;
  if(injected!==undefined){
   source=JSON.parse(injected);
  }else{
   try{
    source=JSON.parse(await readFile(path,"utf8"));
   }catch(error){
    // Owner authorizes publication of the fictional canonical NPC roster.
    // Only the absent default private file falls back to public; malformed explicit
    // secrets and an explicitly configured missing private path remain fail-closed.
    if((error as NodeJS.ErrnoException).code==="ENOENT"&&!process.env.GAME_RESIDENT_ROSTER)
     source=publicRoster;
    else throw error;
   }
  }
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
  const expected=process.env.GAME_CANONICAL_ROSTER_SHA256||OWNER_REVIEWED_ROSTER_SHA256;
  if(!/^[0-9a-f]{64}$/.test(expected)||fingerprint(residents)!==expected)
   throw new Error("canonical-owner-roster-fingerprint-mismatch");
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
