import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

for (const file of [
  "src/app/page.tsx",
  "src/app/layout.tsx",
  "src/app/login/page.tsx",
  "src/app/home/page.tsx",
  "src/app/anggaran/page.tsx",
  "src/app/game/page.tsx",
  "src/lib/supabase/server.ts",
]) {
  assert.ok(existsSync(file), `E-Farmer website route/dependency is missing: ${file}`);
}
assert.ok(existsSync("src/app/keuangan"), "E-Farmer finance module is missing");
const dependencies = JSON.parse(readFileSync("package.json", "utf8")).dependencies || {};
assert.ok(dependencies["@supabase/ssr"] && dependencies["@supabase/supabase-js"], "E-Farmer web auth dependencies were removed");
if (existsSync("next.config.ts")) {
  const config = readFileSync("next.config.ts", "utf8");
  assert.ok(!/pageExtensions\s*:\s*\[\s*["']game\.ts["']/.test(config),
    "Game-only page extensions would hide E-Farmer website routes");
}
console.log("YZ E-Farmer website release boundary: PASS");
