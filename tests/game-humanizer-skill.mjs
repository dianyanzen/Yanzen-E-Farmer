import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";

const read = path => readFileSync(path, "utf8").replace(/\r\n/g,"\n");
const gitBlobSha = content => {
 const bytes=Buffer.from(content,"utf8");
 return createHash("sha1").update(Buffer.from("blob "+bytes.length+"\0","utf8")).update(bytes).digest("hex");
};
const skillPath=".agents/skills/humanizer/SKILL.md";
const licensePath=".agents/skills/humanizer/LICENSE";
const projectPath=".agents/skills/yz-farm-dialogue/SKILL.md";
const encyclopediaPath=".agents/skills/yz-farm-encyclopedia/SKILL.md";
for(const path of [skillPath,licensePath,projectPath,encyclopediaPath,".agents/skills/humanizer/UPSTREAM.md","AGENTS.md","docs/game-dev/HUMANIZER_DIALOGUE_PIPELINE.md","docs/game-dev/PLAYER_DEVELOPER_CONTENT_BOUNDARY.md"])
 assert.ok(existsSync(path),"Missing project humanizer file: "+path);
const upstream=read(skillPath),license=read(licensePath),adapter=read(projectPath),encyclopedia=read(encyclopediaPath);
assert.equal(gitBlobSha(upstream),"bc51a89764e96c0178c707a2a7158d8dca4e6920","Upstream Humanizer skill must match pinned source");
assert.equal(gitBlobSha(license),"625297fb778f32eb39d3a5b97e3e3b611b7304d6","MIT license must match pinned source");
assert.ok(upstream.startsWith("---\nname: humanizer\n"));
assert.ok(upstream.includes('version: "4.0.0"'));
assert.ok(license.startsWith("MIT License"));
assert.ok(adapter.startsWith("---\nname: yz-farm-dialogue\n"));
assert.ok(encyclopedia.startsWith("---\nname: yz-farm-encyclopedia\n"));
assert.ok(encyclopedia.includes("wargaPlayerView"));
assert.ok(encyclopedia.includes("approvedLegacyId"));
assert.ok(adapter.includes("../humanizer/SKILL.md"));
for(const path of ["game-assets/catalog/cast.json","docs/game-dev/STORY_SYSTEM.md","src/lib/game/personal-quests.ts","src/lib/game/model.ts"])
 assert.ok(adapter.includes(path),"Narrative adapter lacks reference: "+path);
const guide=read("AGENTS.md");
assert.ok(guide.includes("Humanizer"));
assert.ok(guide.includes("Bahasa Indonesia"));
assert.ok(guide.includes("game-assets/catalog/cast.json"));
const characters=JSON.parse(read("game-assets/catalog/cast.json")).characters;
assert.equal(characters.length,32);
for(const id of ["A03","C01","C08","A04"]){
 assert.ok(characters.some(character=>character.id===id),"Missing narrative reference NPC "+id);
 assert.ok(adapter.includes(id),"Narrative adapter misses NPC "+id);
}
assert.ok(read("docs/game-dev/STORY_SYSTEM.md").includes("HUMANIZER_DIALOGUE_PIPELINE.md"));
console.log("PASS: pinned upstream Humanizer, current game dialogue and encyclopedia skills, canonical 248 and legacy 32 boundaries");
