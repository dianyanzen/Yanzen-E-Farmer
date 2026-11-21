import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const required = [
  "Dockerfile",
  "docker-compose.yml",
  "database/yz-farm-life.sql",
  "src/app/layout.game.tsx",
  "src/app/page.game.tsx",
  "src/app/game/page.game.tsx",
  "src/app/game/canvas/page.game.tsx",
  "src/app/game/phaser/page.game.tsx",
  "src/app/api/health/route.game.ts",
  "src/lib/game",
  "src/lib/local-auth",
];
for (const path of required) {
  assert.ok(existsSync(path), `Missing standalone game path: ${path}`);
}
const config = readFileSync("next.config.ts", "utf8");
assert.match(config, /pageExtensions/);
assert.match(config, /game\.tsx/);
const compose = readFileSync("docker-compose.yml", "utf8");
for (const service of ["db:", "app:", "proxy:"]) {
  assert.ok(compose.includes(service), `Missing Compose service: ${service}`);
}
assert.ok(!/5432:5432|0\.0\.0\.0:5432/.test(compose), "PostgreSQL must not publish a host port");
const pkg = JSON.parse(readFileSync("package.json", "utf8"));
assert.ok(pkg.dependencies.phaser && pkg.dependencies.pg, "Game engine or database driver missing");
console.log("YZ Farm Life standalone boundary: PASS");
