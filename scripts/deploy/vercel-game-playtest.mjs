#!/usr/bin/env node
/**
 * Build-time route isolation for the dedicated Vercel *staging/playtest* project.
 *
 * The main E-Farmer production build is untouched. In an ephemeral Vercel
 * checkout only, remove Next.js route entrypoints that are unrelated to the
 * game. Shared components, models, assets, tests, CSS, layouts, and Supabase
 * helpers remain untouched. The source repository is never pruned.
 *
 * Usage:
 *   node scripts/deploy/vercel-game-playtest.mjs --check
 *   NEXT_PUBLIC_YZ_GAME_PLAYTEST=1 VERCEL=1 node ... --apply
 */
import {existsSync,readdirSync,readFileSync,writeFileSync,rmSync} from "node:fs";
import {resolve,relative,join} from "node:path";

const ROOT=resolve(process.cwd());
const APP=resolve(ROOT,"src/app");
const ENABLED=process.env.NEXT_PUBLIC_YZ_GAME_PLAYTEST==="1";
const EXPECTED_PROJECT="prj_NShhHPImzY1zNXHRksrYAOHGYkJ5";
const ROUTES=new Set([
 "src/app/page.tsx",
 "src/app/login/page.tsx",
 "src/app/game/page.tsx",
 "src/app/game/phaser/page.tsx",
 "src/app/game/canvas/page.tsx",
 "src/app/api/auth/session/route.ts",
 "src/app/api/auth/logout/route.ts",
 "src/app/api/game/health/route.ts",
 "src/app/api/game/roster-health/route.ts",
 "src/app/api/game/resident-bible/[id]/route.ts",
 "src/app/api/game/save/route.ts"
]);
const mode=process.argv[2];
if(!["--check","--apply"].includes(mode))throw new Error("Use --check or --apply");
if(!existsSync(APP))throw new Error("Missing src/app root");

const candidates=[];
function visit(dir){
 for(const item of readdirSync(dir,{withFileTypes:true})){
  const file=join(dir,item.name);
  if(item.isDirectory())visit(file);
  else if(item.isFile()&&/^(page|route)\.(?:tsx?|jsx?)$/.test(item.name))
   candidates.push(relative(ROOT,file).replaceAll("\\","/"));
 }
}
visit(APP);
const missing=[...ROUTES].filter(p=>!candidates.includes(p));
if(missing.length)throw new Error("Required playable route missing: "+missing.join(", "));
const discarded=candidates.filter(p=>!ROUTES.has(p));
if(discarded.length<12)throw new Error("Playtest route count unexpectedly low; inspect routes first");
if(ROUTES.size>11)throw new Error("Playtest route set is too large for Hobby quota");
if(mode==="--check"){
 console.log("PASS: game-only Vercel route selection: keep "+ROUTES.size+", skip "+discarded.length+" unrelated route entrypoints.");
 process.exit(0);
}
if(!ENABLED || process.env.VERCEL!=="1")
 throw new Error("Refusing to modify routes outside the dedicated Vercel playtest build");
if(process.env.VERCEL_PROJECT_ID&&process.env.VERCEL_PROJECT_ID!==EXPECTED_PROJECT)
 throw new Error("Refusing to prune routes in non-staging Vercel project");
for(const p of discarded)rmSync(resolve(ROOT,p));
const landing=resolve(ROOT,"src/app/page.tsx");
const initial=readFileSync(landing,"utf8");
if(!initial.includes("export default function Landing"))
 throw new Error("Unrecognized landing page; refusing override");
writeFileSync(landing,'import {redirect} from "next/navigation";\nexport default function Landing(){redirect("/game");}\n');
const after=[];
visitPost(APP,after);
function visitPost(dir,out){
 for(const item of readdirSync(dir,{withFileTypes:true})){
  const file=join(dir,item.name);
  if(item.isDirectory())visitPost(file,out);
  else if(item.isFile()&&/^(page|route)\.(?:tsx?|jsx?)$/.test(item.name))
   out.push(relative(ROOT,file).replaceAll("\\","/"));
 }
}
if(after.length!==ROUTES.size||after.some(p=>!ROUTES.has(p)))
 throw new Error("Post-prune Next.js route invariant failed");
console.log("PASS: Vercel game playtest retains "+after.length+" Next.js route entries, excluding "+discarded.length+" farm/admin routes without editing tracked source.");
