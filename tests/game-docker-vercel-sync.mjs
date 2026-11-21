import assert from "node:assert/strict";
import {validateSyncRoster,contentToSync} from "../scripts/game-characters/sync-docker-roster-vercel.mjs";
const rows=Array.from({length:248},(_,i)=>({
 id:"W"+String(i+1).padStart(3,"0"),name:"Warga Uji "+i,
 occupation:"Petani kebun uji",portrait:"R"+String(i%179+1).padStart(3,"0")
}));
const validated=validateSyncRoster(rows);
assert.equal(validated.length,248);
assert.ok(contentToSync(validated).length>5000);
assert.throws(()=>validateSyncRoster(rows.slice(1)),/248/);
assert.throws(()=>validateSyncRoster([{...rows[0],email:"example@example.com"}],{requireComplete:false}),/private/);
assert.throws(()=>validateSyncRoster([{...rows[0],id:"A01"}],{requireComplete:false}),/Invalid/);
assert.throws(()=>validateSyncRoster([rows[0],rows[0]],{requireComplete:false}),/Duplicate/);
console.log("PASS: exact 248 Docker identities, portrait/field schema, no private fields, no accidental partial sync");
