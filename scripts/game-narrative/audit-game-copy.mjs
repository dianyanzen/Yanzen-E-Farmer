#!/usr/bin/env node
/** Guard against known immersion-breaking, boilerplate, AI-like game phrases.
 * Qualitative Indonesian copy review still requires a human editor.
 */
import {readFileSync} from "node:fs";
const sources=[
 "src/app/game/game-client.tsx",
 "src/app/game/character-gallery.tsx",
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
 [/\b(?:Ayu|Ryan|Nani|Inggit|Widi): [A-Z]/,"speaker prefix repeated inside portrait dialogue"],
 [/\btentunya\b.{0,80}\bmenarik\b/i,"generic AI enthusiasm"],
];
const violations=[];
for(const file of sources){
 const content=readFileSync(file,"utf8");
 for(const [pattern,reason] of banned){
  const match=content.match(pattern);
  if(match) violations.push(`${file}: ${reason}: ${match[0]}`);
 }
}
if(violations.length){
 console.error(violations.join("\n"));process.exitCode=1;
}else console.log(`PASS: ${sources.length} game-copy files free of known AI boilerplate and immersion-breaking phrases (editorial QA still required)`);
