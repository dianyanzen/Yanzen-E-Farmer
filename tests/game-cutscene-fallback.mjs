import assert from "node:assert/strict";
import {readFileSync,existsSync} from "node:fs";
const cutscene=readFileSync("src/app/game/sluice-cutscene.tsx","utf8");
const css=readFileSync("src/app/game/game.css","utf8");
const catalog=readFileSync("src/lib/game/cutscene-catalog.ts","utf8");
const model=readFileSync("src/lib/game/model.ts","utf8");
for(const image of ["public/game/assets/cutscenes/frames/sluice-start.jpg",
 "public/game/assets/cutscenes/frames/sluice-end.jpg",
 "public/game/assets/cutscenes/sluice-poster.jpg"]){
 assert.ok(existsSync(image),"Approved still is missing: "+image);
 assert.equal(readFileSync(image)[0],0xff,"Still must be a valid JPEG");
}
assert.ok(cutscene.includes('status!=="storyboard" ? <video')&&
 cutscene.includes('onError={()=>{setSeconds(0);setStatus("storyboard");}}'),
 "Missing media must switch to an approved-frame continuity, not a broken video UI");
assert.ok(cutscene.includes("PASIRLUYU_SLUICE_CUTSCENE.startFrame")&&
 cutscene.includes("PASIRLUYU_SLUICE_CUTSCENE.endFrame"));
assert.ok(cutscene.includes("video asli belum tersedia"),
 "Storyboard must NEVER masquerade as approved original MP4");
assert.ok(cutscene.includes("durationSeconds")&&cutscene.includes("finish();return;"),
 "Temporary sequence must finish and unblock gameplay after 10s");
assert.ok(cutscene.includes("onEnded={finish}")&&cutscene.includes("playsInline"));
assert.ok(cutscene.includes("completed.current")&&cutscene.includes("onDone()"),
 "Both finished video and fallback may only complete once");
assert.ok(catalog.includes('src:"/game/assets/cutscenes/sluice-gate.mp4"'),
 "Do not replace the approved original film with a fabricated one");
assert.ok(css.includes(".yzg-cutscene-storyboard{")&&css.includes("aspect-ratio:910 / 512")&&
 css.includes(".yzg-cutscene-still")&&css.includes("object-fit:contain"),
 "Keep stills uncropped and preserve original aspect");
assert.ok(model.includes("sluiceCutsceneSeen"),"Cutscene must preserve story replay flags");
console.log("PASS: missing original MP4 produces truthful two-frame 10s continuity, same viewport, automatic exit and no false media substitution");
