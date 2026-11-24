#!/usr/bin/env node
/**
 * Push the exact reviewed Docker NPC identity roster to the branch-scoped
 * Vercel Preview secret. Never commit residents.json, player data, or a token.
 *
 * Before applying, run the Character Bible compiler and review the audit.
 * Usage:
 *   node scripts/game-characters/sync-docker-roster-vercel.mjs --input deploy/private/residents.json
 *   VERCEL_TOKEN=... node scripts/game-characters/sync-docker-roster-vercel.mjs --input deploy/private/residents.json --apply
 */
import {readFileSync,existsSync} from "node:fs";
import {resolve,dirname} from "node:path";
import {createHash} from "node:crypto";
import {fileURLToPath} from "node:url";

const root=resolve(dirname(fileURLToPath(import.meta.url)),"../..");
const project="prj_NShhHPImzY1zNXHRksrYAOHGYkJ5";
const team="team_yxyt0iWTpTZd16XexstBlVAN";
const branch="fix/game-npc-docker-vercel-roster-20261121";
const key="YZ_GAME_RESIDENT_ROSTER_JSON";
const idPattern=/^(?:[ACNK]\d{2}|P0[12]|W\d{3})$/;
const portraitPattern=/^(?:P0[12]|N0[1-6]|K(?:0[1-9]|[12]\d|30)|R\d{3}|phone-[AC]\d{2}|work-[AC]\d{2})$/;
function group(p){
 return /^R\d{3}$/.test(p)?"residents":/^K\d{2}$/.test(p)?"neighborhood":
  /^N\d{2}$/.test(p)?"specialists":/^P\d{2}$/.test(p)?"civic":
  p.startsWith("phone-")?"phone":"professions";
}
export function validateSyncRoster(value,{requireComplete=true,checkPortraits=false}={}){
 if(!Array.isArray(value)||value.length>500)throw Error("Invalid Docker roster.");
 if(requireComplete&&value.length!==248)throw Error("Refusing incomplete Docker sync: expected 248 NPC records.");
 const ids=new Set(),names=new Set();
 return value.map((r,i)=>{
  if(!r||typeof r!=="object"||Array.isArray(r)||
     Object.keys(r).sort().join(",")!=="id,name,occupation,portrait"||
     typeof r.id!=="string"||!idPattern.test(r.id)||r.id==="A01"||
     typeof r.name!=="string"||!r.name.trim()||r.name.length>120||
     typeof r.occupation!=="string"||!r.occupation.trim()||r.occupation.length>120||
     typeof r.portrait!=="string"||!portraitPattern.test(r.portrait)||
     /[<>\u0000-\u001f]/u.test(r.name+r.occupation))
    throw Error("Invalid or private NPC field at index "+i);
  const alias=r.name.trim().toLocaleLowerCase("id");
  if(ids.has(r.id)||names.has(alias))throw Error("Duplicate roster ID/name.");
  ids.add(r.id);names.add(alias);
  if(checkPortraits){
   const path=resolve(root,"public","game","assets","portraits","bandung",group(r.portrait),r.portrait+".png");
   if(!existsSync(path))throw Error("Canonical portrait not found for "+r.id+" ("+r.portrait+")");
  }
  return {id:r.id,name:r.name.trim(),occupation:r.occupation.trim(),portrait:r.portrait};
 });
}
export function contentToSync(rows){
 const content=JSON.stringify(rows);
 if(Buffer.byteLength(content,"utf8")>=60_000)
  throw Error("Roster is too large for a branch-scoped env variable; use secure storage.");
 return content;
}
async function main(){
 const args=process.argv.slice(2);
 const at=args.indexOf("--input");
 const input=at>=0?args[at+1]:"deploy/private/residents.json";
 const legal=new Set(["--input",input,"--apply"]);
 if(!input||args.some(a=>!legal.has(a)))throw Error("Usage: node scripts/game-characters/sync-docker-roster-vercel.mjs [--input <file>] [--apply]");
 const roster=JSON.parse(readFileSync(resolve(process.cwd(),input),"utf8"));
 const rows=validateSyncRoster(roster,{requireComplete:true,checkPortraits:true});
 const content=contentToSync(rows);
 const hash=createHash("sha256").update(content).digest("hex");
 if(!args.includes("--apply")){
  console.log("DRY RUN",rows.length,"NPCs;",Buffer.byteLength(content),"bytes; SHA256",hash,
   "; Vercel preview branch",branch);
  return;
 }
 const token=process.env.VERCEL_TOKEN;
 if(!token)throw Error("VERCEL_TOKEN must be provided via a protected environment variable; never paste it into chat.");
 const url="https://api.vercel.com/v10/projects/"+project+"/env?teamId="+team+"&upsert=true";
 const response=await fetch(url,{method:"POST",headers:{
  "Authorization":"Bearer "+token,"Content-Type":"application/json"
 },body:JSON.stringify({key,value:content,type:"sensitive",target:["preview"],gitBranch:branch,
  comment:"Reviewed full Docker NPC roster, 248 identities; branch-scoped preview only."})});
 if(!response.ok)throw Error("Vercel environment update failed (HTTP "+response.status+").");
 const result=await response.json();
 if(result?.failed?.length)throw Error("Vercel rejected "+result.failed.length+" env update(s).");
 console.log("VERCEL PREVIEW SYNCED",rows.length,"NPCs; SHA256",hash);
 console.log("Redeploy Preview from branch "+branch+"; production remains unchanged.");
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 main().catch(e=>{console.error(e.message);process.exitCode=1;});
}
