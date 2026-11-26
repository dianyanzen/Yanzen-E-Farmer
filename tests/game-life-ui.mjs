// Real game component + browser controls. Only Next routing and cloud transport
// are fixtures; this does not bypass auth or add any route to the shipped app.
import { build } from 'esbuild';
import { chromium } from '@playwright/test';
import { createServer } from 'node:http';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { browserPath } from './browser-path.mjs';
import { apiFixture, loadCheckpoint } from './game-ui-api-fixture.mjs';

const output = path.resolve(process.env.FARM_GAME_UI_OUTPUT || '../game-life-ui');
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
  const target = url.pathname.startsWith('/game/assets/') ? path.join(process.cwd(), 'public', url.pathname) :
    path.join(output, url.pathname === '/' ? 'index.html' : url.pathname);
  try {
    const data = await readFile(target);
    res.setHeader('Content-Type', target.endsWith('.css') ? 'text/css' : target.endsWith('.js') ? 'text/javascript' : target.endsWith('.png') ? 'image/png' : target.endsWith('.svg') ? 'image/svg+xml' : 'text/html');
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
 for (const width of [1280,393]) {
  const page=await browser.newPage({viewport:{width,height:width===393?852:900},reducedMotion:"reduce"});
  await start(page);
  assert.equal(await page.locator(".yzg-headsup").getByText(/stamina/i).count(),0,"stamina removed from HUD");
  assert.equal(await page.getByRole("button",{name:/Tidur \/ Hari Baru/}).count(),0);
  await page.getByRole("button",{name:"Pilih Gembor Penyiram"}).click();
  await page.getByText("Alat di tangan: Gembor Penyiram").waitFor();
  await go(page,"q");
  await page.getByText("Alat di tangan: Cangkul").waitFor();
  await go(page,"r");
  await page.getByText("Alat di tangan: Gembor Penyiram").waitFor();
  await page.getByRole("button",{name:"Pilih Cangkul"}).click();
  await loadCheckpoint(page,{location:'shed',player:{x:9,y:8,dir:'up'}});
  await go(page,'e');
  const storage=page.getByRole("dialog",{name:"Gudang peralatan"});
  await storage.waitFor();
  await storage.locator(".yzg-storage-item").filter({hasText:"Gembor Penyiram"}).getByRole("button",{name:"Simpan"}).click();
  await saved(page,()=>!JSON.parse(localStorage.getItem("yz-test-save")).data.carriedTools.includes("water"));
  await storage.locator(".yzg-storage-item").filter({hasText:"Gembor Penyiram"}).getByRole("button",{name:"Ambil"}).click();
  await saved(page,()=>JSON.parse(localStorage.getItem("yz-test-save")).data.carriedTools.includes("water"));
  await storage.getByRole("button",{name:"Tutup"}).click();
  await loadCheckpoint(page,{location:'field',minutes:7*60,player:{x:15,y:7,dir:'right'}});
  await go(page,'e');
  await page.getByRole("dialog").waitFor();
  while(await page.getByRole("button",{name:"Lanjut ›",exact:true}).isVisible()) {
    await page.getByRole("button",{name:"Lanjut ›",exact:true}).click();
  }
  await page.getByRole("button",{name:"Ada yang bisa kubantu?"}).click();
  await saved(page,()=>JSON.parse(localStorage.getItem("yz-test-save")).data.bonds.A03.points===20);
  assert.ok((await page.locator(".yzg-portrait").getAttribute("data-emotion")) === "surprised");
  await page.screenshot({path:path.join(output,"dialogue-"+width+".png"),fullPage:true});
  await page.getByRole("button",{name:"Akhiri percakapan"}).click();
  await page.getByRole("button",{name:/^▣ YZ Phone/}).click();
  await page.getByRole("button",{name:/Kedekatan$/}).click();
  const bond=page.getByLabel(/Kedekatan Ryan/).first();
  assert.equal(await bond.getAttribute("value"),"20");
  await page.getByRole("button",{name:"Kembali",exact:true}).click();
  await page.getByRole("button",{name:/Statistik$/}).click();
  await page.getByText("8 XP",{exact:true}).waitFor();
  await page.getByRole("button",{name:"Tutup ponsel"}).click();
  await page.getByRole("button",{name:"Pilih Gembor Penyiram"}).click();
  await saved(page,()=>JSON.parse(localStorage.getItem("yz-test-save")).data.equippedTool==="water");
  await loadCheckpoint(page,{location:'home',player:{x:9,y:8,dir:'up'}});
  await page.screenshot({path:path.join(output,"home-"+width+".png"),fullPage:true});
  await go(page,'e');
  await page.getByRole("button",{name:"Tidur sampai pagi",exact:true}).click();
  await saved(page,()=>JSON.parse(localStorage.getItem("yz-test-save")).data.day===2);
  await page.reload();await page.getByRole("button",{name:"Mengerti"}).click();
  await page.waitForFunction(()=>document.querySelector(".yzg-headsup").textContent.includes("Rumah"));
  await page.getByText("Alat di tangan: Gembor Penyiram").waitFor();
  await loadCheckpoint(page,{player:{x:12,y:12,dir:"down"}});
  await go(page,"e");
  await saved(page,()=>JSON.parse(localStorage.getItem("yz-test-save")).data.location==="field");
  await page.screenshot({path:path.join(output,"life-"+width+".png"),fullPage:true});
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
  assert.equal(overflow,false,"no horizontal overflow");
  assert.equal(await page.evaluate(()=>{const i=new Image();return new Promise(r=>{i.onload=()=>r(i.naturalWidth===1536);i.onerror=()=>r(false);i.src="/game/assets/portraits/A01.png"})}),true);
  await page.close();
 }
 assert.deepEqual(errors,[]);
 console.log("Desktop + mobile: dialogue choice, emotion, phone bonds/stats, enter home, bed sleep, reload, exit, portrait asset: PASS");
} finally { await browser.close(); await new Promise(resolve=>server.close(resolve)); }
