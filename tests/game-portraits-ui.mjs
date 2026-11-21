// Real game component + browser controls. Only Next routing and cloud transport
// are fixtures; this does not bypass auth or add any route to the shipped app.
import { build } from 'esbuild';
import { chromium } from '@playwright/test';
import { createServer } from 'node:http';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { browserPath } from './browser-path.mjs';

const output = path.resolve(process.env.FARM_GAME_UI_OUTPUT || '../chapter1-ui');
await mkdir(output, { recursive: true });
const fixture = `
const id='10000000-0000-0000-0000-000000000001';
export function createClient(){return {
  auth:{getUser:async()=>({data:{user:{id}},error:null})},
  from:(table)=>{
    if(table!=='yz_game_saves') throw new Error('Unexpected table: '+table);
    return {
      select:()=>({eq:()=>({maybeSingle:async()=>({data:JSON.parse(localStorage.getItem('yz-test-save')||'null'),error:null})})}),
      upsert:async(row)=>{
        window.__saveAttempts=(window.__saveAttempts||0)+1;
        if(window.__failSave) return {error:{message:'Simulated offline'}};
        localStorage.setItem('yz-test-save',JSON.stringify(row));return {error:null};
      }
    };
  }
};}`;
await build({
  stdin: { contents: `import React from 'react';import {createRoot} from 'react-dom/client';import Game from './src/app/game/game-client';createRoot(document.getElementById('root')).render(<Game/>);`, resolveDir: process.cwd(), loader: 'tsx' },
  external: ["/game/*"],
  bundle: true, outfile: path.join(output, 'app.js'), jsx: 'automatic',
  define: { 'process.env.NODE_ENV': '"development"' },
  plugins: [{ name: 'game-test-only-adapters', setup(b) {
    b.onResolve({ filter: /^next\/(link|image|navigation)$/ }, a => ({ path: a.path, namespace: 'test-adapter' }));
    b.onResolve({ filter: /^@\/lib\/supabase\/browser$/ }, () => ({ path: 'cloud', namespace: 'test-adapter' }));
    b.onLoad({ filter: /.*/, namespace: 'test-adapter' }, a => ({
      contents: a.path === 'cloud' ? fixture : a.path === 'next/navigation' ?
        `export function useRouter(){return router} const router={replace:(url)=>{window.__redirect=url}};` :
        `import React from 'react';export default function Adapter({sizes,priority,...p}){return React.createElement('${a.path === 'next/link' ? 'a' : 'img'}',p)}`,
      resolveDir: process.cwd(),
    }));
  } }],
});
await writeFile(path.join(output, 'index.html'), '<!doctype html><html lang="id"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/app.css"><style>body{margin:0}button{cursor:pointer;font:inherit}*{box-sizing:border-box}</style><div id="root"></div><script src="/app.js"></script></html>');
const server = createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const target = url.pathname.startsWith('/game/assets/') ? path.join(process.cwd(), 'public', url.pathname) :
    path.join(output, url.pathname === '/' ? 'index.html' : url.pathname);
  try {
    const data = await readFile(target);
    res.setHeader('Content-Type', target.endsWith('.css') ? 'text/css' : target.endsWith('.js') ? 'text/javascript' : target.endsWith('.png') ? 'image/png' : 'text/html');
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
  for (let n = 0; n < count; n++) await page.keyboard.press(key);
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
 const requests=[];
 page.on("request",r=>{if(r.url().includes("/game/assets/portraits/")&&r.url().endsWith(".png"))requests.push(r.url());});
 await start(page);
 assert.equal(requests.length,0,"portraits are not fetched before use");
 await page.getByRole("button",{name:/^▣ YZ Phone/}).click();
 await page.getByRole("button",{name:/Warga$/}).click();
 assert.equal(await page.locator("[data-character-card]").count(),12,"phone shows a compact list first");
 const search=page.getByRole("searchbox",{name:"Cari nama atau pekerjaan"});
 const people=JSON.parse(await readFile("game-assets/catalog/cast.json","utf8")).characters;
 for(const person of people){
  await search.fill(person.name);
  const card=page.locator('[data-character-card="'+person.id+'"]');
  await card.click();
  const detail=page.locator('[data-character-detail="'+person.id+'"]');
  await detail.waitFor();
  assert.equal(await detail.locator(".yzg-citizen-section").count(),12,"all twelve profile categories available");
  await page.waitForFunction(id=>{
   const img=document.querySelector('[data-character-detail="'+id+'"] .yzg-portrait img');
   return img?.complete&&img.naturalWidth===1536;
  },person.id);
  assert.equal(await detail.locator(".yzg-portrait").getAttribute("data-character"),person.id);
  await detail.getByRole("button",{name:/Daftar warga/}).click();
 }
 await search.fill("Nida");
 await page.locator('[data-character-card="A13"]').click();
 const labels=["Netral","Senang","Sedih","Khawatir","Terkejut","Kesal","Malu","Tertawa"];
 const values=["neutral","happy","sad","worried","surprised","annoyed","shy","laughing"];
 for(let i=0;i<8;i++){
  await page.getByRole("button",{name:labels[i],exact:true}).click();
  assert.equal(await page.locator('[data-character-detail="A13"] .yzg-portrait').getAttribute("data-emotion"),values[i]);
  assert.equal(await page.locator('[data-character-detail="A13"] img').evaluate(im=>im.style.left),(-i*100)+"%");
 }
 await page.screenshot({path:path.join(output,"portrait-detail-mobile.png"),fullPage:true});
 await page.getByRole("button",{name:/Daftar warga/}).click();
 await search.fill("not-a-character");
 await page.getByRole("status").filter({hasText:"Belum ada warga dengan nama atau pekerjaan itu"}).waitFor();
 assert.equal(new Set(requests.map(u=>u.split("/").pop())).size,32);
 await page.getByRole("button",{name:"Kembali"}).click();
 await page.getByRole("button",{name:"Kronik",exact:true}).click();
 await page.getByRole("heading",{name:"Empat Timun dan Satu Nama"}).waitFor();
 assert.equal(await page.getByRole("progressbar",{name:"Kemajuan cerita utama"}).getAttribute("value"),"0");
 await page.getByRole("button",{name:"Misi",exact:true}).click();
 await page.getByText("Urusan warga").waitFor();
 await page.getByRole("button",{name:"Jejak hari",exact:true}).click();
 await page.getByRole("button",{name:"Salin ringkasan cerita"}).waitFor();
 const broken=await browser.newPage({viewport:{width:1280,height:900},reducedMotion:"reduce"});
 await broken.route("**/game/assets/portraits/C16.png",route=>route.abort());
 await start(broken);
 await broken.getByRole("button",{name:/^▣ YZ Phone/}).click();
 await broken.getByRole("button",{name:/Warga$/}).click();
 await broken.getByRole("searchbox").fill("Karisma");
 await broken.locator('[data-character-card="C16"]').click();
 await broken.locator('[data-character-detail="C16"] .yzg-portrait-fallback').waitFor();
 assert.equal(await broken.locator('[data-character-detail="C16"] .yzg-portrait-fallback').innerText(),"K");
 assert.deepEqual(errors,[]);
 console.log("Portrait browser: all 32 assets, eight expressions, search, lazy loading, responsive gallery and failed-image fallback: PASS");
} finally {await browser.close();await new Promise(resolve=>server.close(resolve));}
