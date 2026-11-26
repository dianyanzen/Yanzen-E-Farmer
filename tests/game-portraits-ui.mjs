// Real game component + browser controls. Only Next routing and cloud transport
// are fixtures; this does not bypass auth or add any route to the shipped app.
import { build } from 'esbuild';
import { chromium } from '@playwright/test';
import { createServer } from 'node:http';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { browserPath } from './browser-path.mjs';
import { apiFixture } from './game-ui-api-fixture.mjs';

const output = path.resolve(process.env.FARM_GAME_UI_OUTPUT || '../game-portraits-ui');
await mkdir(output, { recursive: true });
await build({
  stdin: { contents: `import React from 'react';import {createRoot} from 'react-dom/client';import Game from './src/app/game/game-client';createRoot(document.getElementById('root')).render(<Game/>);`, resolveDir: process.cwd(), loader: 'tsx' },
  external: ["/game/*"],
  bundle: true, outfile: path.join(output, 'app.js'), jsx: 'automatic',
  define: { 'process.env.NODE_ENV': '"development"' },
  plugins: [{ name: 'game-test-only-adapters', setup(b) {
    b.onResolve({ filter: /^next\/(link|image|navigation)$/ }, a => ({ path: a.path, namespace: 'test-adapter' }));
    b.onLoad({ filter: /.*/, namespace: 'test-adapter' }, a => ({
      contents: a.path === 'next/navigation' ?
        `export function useRouter(){return router} const router={replace:(url)=>{window.__redirect=url}};` :
        `import React from 'react';export default function Adapter({sizes,priority,...p}){return React.createElement('${a.path === 'next/link' ? 'a' : 'img'}',p)}`,
      resolveDir: process.cwd(),
    }));
  } }],
});
await writeFile(path.join(output, 'index.html'), '<!doctype html><html lang="id"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/app.css"><style>body{margin:0}button{cursor:pointer;font:inherit}*{box-sizing:border-box}</style><div id="root"></div>'+apiFixture+'<script src="/app.js"></script></html>');
const server = createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const target = (url.pathname.startsWith('/game/assets/') || url.pathname.startsWith('/game/data/')) ? path.join(process.cwd(), 'public', url.pathname) :
    path.join(output, url.pathname === '/' ? 'index.html' : url.pathname);
  try {
    const data = await readFile(target);
    res.setHeader('Content-Type', target.endsWith('.css') ? 'text/css' : target.endsWith('.js') ? 'text/javascript' : target.endsWith('.json') ? 'application/json' : target.endsWith('.png') ? 'image/png' : 'text/html');
    res.end(data);
  } catch { res.statusCode = 404; res.end('Not found'); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const url = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ executablePath: await browserPath(), headless: true });
const errors = [];
async function saved(page, predicate) {
  await page.waitForFunction(predicate, null, { timeout: 10000 });
}
async function go(page, key, count = 1) {
  for (let n = 0; n < count; n++) { await page.keyboard.press(key); await page.waitForTimeout(170); }
}
async function start(page) {
  page.on('pageerror', e => errors.push(e.message));
  await page.goto(url);
  await page.getByRole('button', { name: 'Mengerti' }).click();
  await page.getByRole('button', { name: 'Buka jurnal' }).waitFor({ state: 'visible' });
  await page.waitForFunction(() => document.querySelector('.yzg-headsup').textContent.includes('Siap') || document.querySelector('.yzg-headsup').textContent.includes('Tersimpan'));
}


try {
 const page=await browser.newPage({viewport:{width:393,height:852},reducedMotion:"reduce"});
 const failures=[];
 page.on('pageerror',e=>failures.push(e.message));
 const portraits=[];
 page.on("request",request=>{
  if(request.url().includes("/game/assets/portraits/bandung/")&&request.url().endsWith(".png"))
   portraits.push(request.url());
 });
 await start(page);
 assert.equal(portraits.length,0,"no citizen portraits fetched before Warga opens");
 await page.getByRole("button",{name:/^▣ YZ Phone/}).click();
 await page.getByRole("button",{name:/Warga$/}).click();
 await page.waitForFunction(()=>document.querySelectorAll('[data-character-card]').length===10);
 assert.equal(await page.locator('[data-character-card]').count(),10,"single Warga list paginates public 248 NPCs");
 assert.equal(await page.getByRole('button',{name:"Wargapedia",exact:true}).count(),0,"no duplicate Wargapedia app");

 const index=JSON.parse(await readFile('public/game/data/npc/index.json','utf8'));
 assert.equal(index.characterCount,248);
 const sample=[index.characters[0],index.characters[1],index.characters[17],index.characters[247]];
 const displayName=name=>name.trim().split(/\s+/).map(part=>part.length<=2?part.toLocaleUpperCase('id'):part[0].toLocaleUpperCase('id')+part.slice(1).toLocaleLowerCase('id')).join(' ');
 const search=page.getByRole("searchbox",{name:"Cari nama atau pekerjaan"});
 for(const person of sample){
  await search.fill(person.name);
  const card=page.locator('[data-character-card="'+person.id+'"]');
  await card.waitFor();
  await card.click();
  const detail=page.locator('[data-character-detail="'+person.id+'"]');
  await detail.waitFor();
  await detail.getByText(displayName(person.name),{exact:true}).waitFor();
  await detail.locator('.yzg-wargapedia-chapters details').first().waitFor();
  const chapters=await detail.locator('.yzg-wargapedia-chapters details').count();
  assert.ok(chapters>=1&&chapters<=3,"Warga shows short, readable sections");
  assert.equal(await detail.getByText('Belum ada hubungan permainan').count(),0,"no technical legacy mapping notice");
  assert.equal(await detail.getByText(/12 kategori|Draf fiksi|Lv. 0|provenance|status runtime|konsep publik/i).count(),0,"no editor labels");
  assert.equal(await detail.getByText(person.id,{exact:true}).count(),0,"canonical ID is invisible to players");
  await detail.locator('img').first().evaluate(async img=>{
   if(!img.complete)await new Promise((resolve,reject)=>{
    img.addEventListener('load',resolve,{once:true});
    img.addEventListener('error',reject,{once:true});
   });
   if(!img.naturalWidth)throw Error("Missing canonical portrait asset");
  });
  await detail.getByRole("button",{name:"Daftar warga"}).click();
 }

 for(const cameoId of ['P01','P02']){
  const cameo=index.characters.find(person=>person.id===cameoId);
  assert.ok(cameo,'public cameo present in canonical index');
  await search.fill(cameo.name);
  await page.locator('[data-character-card="'+cameoId+'"]').click();
  const cameoDetail=page.locator('[data-character-detail="'+cameoId+'"]');
  await cameoDetail.getByText(displayName(cameo.name),{exact:true}).waitFor();
  await cameoDetail.getByText('Sumber profil').waitFor();
  assert.ok(await cameoDetail.locator('a[href^="https://"]').count()>=2,'cameo biography sources are visible');
  await cameoDetail.getByRole('button',{name:'Daftar warga'}).click();
 }
 await search.fill("not-a-character");
 await page.getByRole("status").filter({hasText:"Belum ada nama yang cocok. Coba kata lain."}).waitFor();
 await search.fill("");
 await page.screenshot({path:path.join(output,"warga-merged-mobile.png"),fullPage:true});
 assert.ok(portraits.length>0,"portrait files are lazy-loaded as citizen directory is browsed");

 await page.getByRole("button",{name:"Kembali"}).click();
 await page.getByRole("button",{name:/Kronik$/}).click();
 await page.getByRole("heading",{name:"Empat Timun dan Satu Nama"}).waitFor();
 assert.equal(await page.getByRole("progressbar",{name:"Kemajuan cerita utama"}).getAttribute("value"),"0");
 await page.getByRole("button",{name:"Misi",exact:true}).click();
 await page.getByText("Urusan warga").waitFor();
 await page.getByRole("button",{name:"Jejak hari",exact:true}).click();
 await page.getByRole("button",{name:"Salin ringkasan cerita"}).waitFor();

 const broken=await browser.newPage({viewport:{width:390,height:844},reducedMotion:"reduce"});
 const missing=sample[0].portraitUrl;
 await broken.route("**"+missing,route=>route.abort());
 await start(broken);
 await broken.getByRole("button",{name:/^▣ YZ Phone/}).click();
 await broken.getByRole("button",{name:/Warga$/}).click();
 await broken.getByRole("searchbox",{name:"Cari nama atau pekerjaan"}).fill(sample[0].name);
 await broken.locator('[data-character-card="'+sample[0].id+'"]').click();
 await broken.getByText(displayName(sample[0].name),{exact:true}).waitFor();
 assert.ok(await broken.locator('.yzg-wargapedia-chapters details').count()>=1,"missing portrait cannot hide story");

 assert.deepEqual(failures,[]);
 assert.deepEqual(errors,[]);
 console.log("Warga browser: humanized names, curated stories, source-backed cameos, image fallback and save-based Kronik: PASS");
} finally {await browser.close();await new Promise(resolve=>server.close(resolve));}
