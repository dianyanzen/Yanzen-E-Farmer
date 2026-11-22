#!/usr/bin/env node
/** Guard against known immersion-breaking, boilerplate, AI-like game phrases.
 * Qualitative Indonesian copy review still requires a human editor.
 */
import {readFileSync} from "node:fs";
const sources=[
 "src/app/game/game-client.tsx",
 "src/app/game/character-gallery.tsx",
 "src/app/game/phone-wargapedia.tsx",
 "src/app/game/encyclopedia/encyclopedia-client.tsx",
 "src/app/game/phone-chronicle.tsx",
 "src/app/game/world-region-directory.tsx",
 "src/app/game/dialogue-panel.tsx",
 "src/app/game/tool-warehouse.tsx",
 "src/lib/game/model.ts",
 "src/lib/game/personal-quests.ts",
 "src/lib/game/signposts.ts"
];
const banned=[
 [/sebagai (?:sebuah )?ai\b/i,"AI self-reference in player text"],
 [/\bpada dasarnya\b/i,"generic filler"],
 [/\bbukan sekadar\b.{0,100}\bmelainkan\b/i,"staged contrast"],
 [/\bquest:\s*bawa\b/i,"developer-style quest toast"],
 [/Ayu \? Benih|Widi \? Es/,"broken speaker title"],
 [/Fitur mengganti pakaian belum tersedia/i,"development status in furniture"],
 [/Hari sudah sore\. Harapanku tetap sama:/i,"generic NPC sentence"],
 [/Kalian sudah berbincang hari ini\. Poin kedekatan berikutnya/i,"system reward spoken by NPC"],
 [/Jurnal tugas tersedia di aplikasi Kebunku/i,"outdated guide"],
 [/PostgreSQL lokal/i,"database implementation mentioned in game UI"],
 [/Kronik membaca progres dari permainanmu/i,"meta-narrator chronicle"],
 [/Warung bukan cuma tempat jual beli, tetapi/i,"formulaic dialogue"],
 [/\btentunya\b.{0,80}\bmenarik\b/i,"generic AI enthusiasm"],
];
const violations=[];
const npcDialog=readFileSync("src/lib/game/model.ts","utf8");
const storyStart=npcDialog.indexOf("function storyDialogue(");
const storyEnd=npcDialog.indexOf("export function choosePhoto(",storyStart);
const reactionStart=npcDialog.indexOf("const reactions:");
const reactionEnd=npcDialog.indexOf("export function chooseSocial(",reactionStart);
if(storyStart<0||storyEnd<0||reactionStart<0||reactionEnd<0)
 throw new Error("NPC speech source moved: update copy-audit scopes");
for(const source of [npcDialog.slice(storyStart,storyEnd),npcDialog.slice(reactionStart,reactionEnd)]){
 if(/\b(?:Ayu|Ryan|Nani|Inggit|Widi): [A-Z]/.test(source))
  violations.push("NPC dialogue includes repeated speaker names in speech bubble");
}
for(const file of sources){
 const content=readFileSync(file,"utf8");
 for(const [pattern,reason] of banned){
  const match=content.match(pattern);
  if(match) violations.push(`${file}: ${reason}: ${match[0]}`);
 }
}

const phoneCopy=readFileSync("src/app/game/phone-wargapedia.tsx","utf8");
const webCopy=readFileSync("src/app/game/encyclopedia/encyclopedia-client.tsx","utf8");
for(const [view,source] of [["YZ Phone Warga",phoneCopy],["Web Warga",webCopy]]){
 if(/WARGAPEDIA_CATEGORIES\.map|Object\.entries\(profile\.sections|EditorialDraftNotes|npcDraftPreview|12 bagian|Tidak perlu berkenalan atau naik level/.test(source))
  violations.push(view+": raw editor fields or developer guidance mixed into player-facing copy");
}
if(violations.length){
 console.error(violations.join("\n"));process.exitCode=1;
}else console.log(`PASS: ${sources.length} game-copy files free of known AI boilerplate and immersion-breaking phrases (editorial QA still required)`);
