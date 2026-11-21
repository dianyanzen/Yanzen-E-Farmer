import assert from "node:assert/strict";
import {readFileSync,existsSync} from "node:fs";
import {createHash} from "node:crypto";
import {resolve} from "node:path";
const secret=process.env.GAME_RESIDENT_ROSTER_JSON;
if(!secret){
 console.log("SKIP: private canonical roster not available to this CI environment; server health will gate deployment.");
}else{
 const source=JSON.parse(secret);
 const rows=Array.isArray(source)?source:source.currentRoster;
 assert.equal(rows?.length,248,"Canonical roster count must be exactly 248");
 const seenId=new Set(),seenNames=new Set(),seenPortrait=new Set();
 const groups={R:"residents",K:"neighborhood",N:"specialists",P:"civic",work:"professions",phone:"phone"};
 for(const r of rows){
  assert.match(r.id,/^(?:[ACNK]\d{2}|P0[12]|W\d{3})$/);
  assert.equal(typeof r.name,"string");
  assert.equal(typeof r.occupation,"string");
  assert.equal(typeof r.portrait,"string");
  assert.ok(r.name.trim().length>0&&r.occupation.trim().length>0);
  const group=r.portrait.startsWith("work-")?"work":r.portrait.startsWith("phone-")?"phone":r.portrait[0];
  assert.ok(groups[group],"Unknown portrait category "+r.id);
  const asset=resolve("public/game/assets/portraits/bandung",groups[group],r.portrait+".png");
  assert.ok(existsSync(asset),"Missing canonical portrait for "+r.id);
  assert.ok(!seenId.has(r.id)&&!seenNames.has(r.name)&&!seenPortrait.has(r.portrait),"Duplicate canonical ID, name or portrait");
  seenId.add(r.id);seenNames.add(r.name);seenPortrait.add(r.portrait);
 }
 const fingerprint=createHash("sha256").update(rows.slice().sort((a,b)=>a.id<b.id?-1:a.id>b.id?1:0)
   .map(r=>[r.id,r.name,r.occupation,r.portrait].join("|")+"\n").join("")).digest("hex");
 const sourceFile=readFileSync("src/lib/game/private-residents.ts","utf8");
 const expected=sourceFile.match(/OWNER_REVIEWED_ROSTER_SHA256="([a-f0-9]{64})"/)?.[1];
 assert.equal(fingerprint,expected,"At least one canonical NPC name, occupation, ID or portrait differs from the owner-reviewed catalog");
 console.log("PASS: 248 canonical residents, all names and jobs pinned, all 248 portraits on disk");
}
