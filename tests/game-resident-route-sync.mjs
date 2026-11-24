import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
for(const route of ["src/app/game/page.tsx","src/app/game/phaser/page.tsx","src/app/game/canvas/page.tsx"]){
 const source=readFileSync(route,"utf8");
 assert.match(source,/loadGameResidents/,"Game route must fetch canonical Docker/Vercel NPC identities: "+route);
 assert.match(source,/residents=\{residents\}/,"Game route must pass roster to YZ Phone and dialogue: "+route);
}
const server=readFileSync("src/lib/game/server-resident-data.ts","utf8");
assert.match(server,/YZ_GAME_RESIDENT_ROSTER_JSON/);
assert.match(server,/docker\?\?env\?\?publishedResidents/,"Docker first, sensitive branch snapshot second, legacy fallback last");
console.log("PASS: all 3 game entry routes use the same Docker/Vercel NPC roster");
