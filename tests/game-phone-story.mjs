import assert from "node:assert/strict";
import {mkdtempSync,readFileSync,rmSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {pathToFileURL} from "node:url";
import {build} from "esbuild";

/** Test real model and narrative code without a browser or external database. */
const dir=mkdtempSync(join(tmpdir(),"yz-farm-phone-"));
try{
 const bundled=join(dir,"chronicle.mjs");
 await build({
  stdin:{
   contents:'export {newGame,safeLoad} from "./src/lib/game/model.ts"; export {phoneChronicle,chronicleExport} from "./src/lib/game/phone-story.ts";',
   resolveDir:process.cwd(),
   loader:"ts",
  },
  outfile:bundled,bundle:true,platform:"node",format:"esm",logLevel:"silent",
 });
 const {newGame,safeLoad,phoneChronicle,chronicleExport}=await import(pathToFileURL(bundled).href);
 const initial=newGame();
 const oldSave=JSON.parse(JSON.stringify(initial));
 const restored=safeLoad(oldSave);
 assert.ok(restored,"existing v1 save must load without chronicle data");
 const first=phoneChronicle(restored);
 assert.equal(first.completed,0);
 assert.equal(first.percentage,0);
 assert.equal(first.timeline[0].status,"now");
 assert.equal(first.timeline[1].title,"Catatan berikutnya","unseen stories stay sealed");
 assert.equal(first.activeMissions,0);
 assert.equal(first.finishedMissions,0);
 assert.equal(first.contacts,0);
 const afterOrder={...restored,story:{...restored.story,orderAccepted:true}};
 assert.equal(phoneChronicle(afterOrder).completed,1);
 assert.equal(phoneChronicle(afterOrder).timeline[1].status,"now");
 const branch={...restored,day:3,
  story:{...restored.story,orderAccepted:true,orderDone:true,canalClue:true,photoSeen:true,photoChoice:"warung",completedDay:3},
  personalQuests:{A03:{phase:4,day:2,baseline:0},C08:{phase:2,day:3,baseline:0}},
  bonds:{...restored.bonds,A03:{...restored.bonds.A03,talks:3,points:220,lastTalkDay:3}},
  stats:{...restored.stats,conversations:3,harvests:4,nights:2}
 };
 const snapshot=JSON.stringify(branch);
 const full=phoneChronicle(branch);
 assert.equal(full.completed,5);
 assert.equal(full.percentage,100);
 assert.ok(full.timeline.every(step=>step.status==="done"));
 assert.equal(full.choice.day,3);
 assert.match(full.choice.text,/Salinannya dititipkan di warung/);
 assert.equal(full.finishedMissions,1);
 assert.equal(full.activeMissions,1);
 assert.equal(full.contacts,1);
 assert.deepEqual(full.lastContact,{name:"Ryan",day:3});
 assert.equal(full.relationshipSummary[0].level,2);
 const exportText=chronicleExport(branch);
 assert.match(exportText,/Empat Timun dan Satu Nama/);
 assert.match(exportText,/Catatan kegiatan:/);
 assert.match(exportText,/Menunggu|Sedang|Tanyakan|Kembali|Selesai|Mengerjakan/);
 assert.doesNotMatch(exportText,/undefined|NaN|\[object Object\]/);
 assert.equal(JSON.stringify(branch),snapshot,"phone companion must never mutate game saves");
 const nani={...branch,story:{...branch.story,photoChoice:"nani"}};
 assert.match(phoneChronicle(nani).choice.text,/Foto asli tetap bersama Nani/);
 assert.equal(phoneChronicle(branch).completed,5);
 // Reset clears every narrative gate, side mission, NPC bond and collected story choice.
 const firstDay=safeLoad(newGame());
 const cleared=phoneChronicle(firstDay);
 assert.equal(cleared.completed,0,"story restarts at the opening");
 assert.equal(cleared.finishedMissions,0,"completed side quests are forgotten");
 assert.equal(cleared.activeMissions,0,"accepted side quests are forgotten");
 assert.equal(cleared.contacts,0,"NPC conversations are forgotten");
 assert.equal(firstDay.personalQuests?.A03,undefined,"NPC quests are not kept after reset");
 assert.ok(Object.values(firstDay.bonds).every(b=>b.points===0&&b.talks===0&&b.lastChoice===null),
   "all NPC relationships return to their original state");
 assert.equal(firstDay.story.orderAccepted,false);
 assert.equal(firstDay.story.photoChoice,null);

 const profile=readFileSync("src/lib/game/phone-profiles.ts","utf8");
 const source=JSON.parse(readFileSync("game-assets/characters/profiles/index.json","utf8"));
 for(const resident of source.characters){
  const path=resident.file.replace(/^game-assets/,"../../../game-assets");
  assert.ok(profile.includes("import("+JSON.stringify(path)+")"),"Missing lazy profile "+resident.id);
 }
 assert.equal(source.characters.length,70);
 // Destructive reset must require an explicit warning and cannot race with autosave.
 const client=readFileSync("src/app/game/game-client.tsx","utf8");
 const styles=readFileSync("src/app/game/game.css","utf8");
 assert.match(client,/role="alertdialog" aria-modal="true"/,"reset must present an accessible confirmation dialog");
 assert.match(client,/Semua progres permainan akan hilang/,"reset must explain what is lost");
 assert.match(client,/Ya, reset semua progres/,"reset must require an explicit affirmative choice");
 assert.match(client,/Batal, simpan progres/,"reset must offer a safe cancellation");
 assert.match(client,/await queueRef.current;/,"reset must wait for earlier saves");
 assert.match(client,/resetInFlightRef.current/,"autosave must be blocked during reset");
 assert.match(client,/fetch\("\/api\/game\/save", \{ method: "POST" \}\)/,"reset must use authenticated reset handler on the staging-supported route");
 assert.match(saveApi,/export \{ POST \} from "\.\.\/reset\/route"/,"staging save POST must reuse the authenticated reset endpoint");
 assert.match(client,/expectedUpdatedAt: saveRevisionRef.current/,"save must carry a revision for stale-tab protection");
 assert.match(client,/new BroadcastChannel\("yz-farm-progress"\)/,"reset should notify other open tabs");
 const resetApi=readFileSync("src/app/api/game/reset/route.ts","utf8");
 const saveApi=readFileSync("src/app/api/game/save/route.ts","utf8");
 assert.match(resetApi,/const initial = newGame\(\);/,"server must generate the actual beginning state");
 assert.match(resetApi,/\.eq\("user_id", user.id\)/,"server must scope reset to authenticated player");
 assert.match(saveApi,/\.eq\("updated_at", expectedUpdatedAt\)/,"stale saves must not overwrite reset");
 assert.match(saveApi,/status: 409/,"a stale save must be rejected");
 assert.match(styles,/\.yzg-account-actions\{display:grid/,"account buttons must be spaced, not inline with title");
 assert.match(styles,/\.yzg-reset-overlay\{position:absolute/,"confirmation must remain inside YZ Phone");
 console.log("PASS: real save-compatible chronicle, 5 milestones, choices, side quests, privacy, 70 lazy profiles and no game-state mutation");
}finally{rmSync(dir,{recursive:true,force:true});}
