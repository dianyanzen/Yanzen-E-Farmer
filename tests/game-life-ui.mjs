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
 for (const width of [1280,393]) {
  const page=await browser.newPage({viewport:{width,height:width===393?852:900},reducedMotion:"reduce"});
  await start(page);
  assert.equal(await page.getByRole("button",{name:/Tidur \/ Hari Baru/}).count(),0);
  await page.getByRole("button",{name:"Pilih Gembor Penyiram"}).click();
  await page.getByText("Alat di tangan: Gembor Penyiram").waitFor();
  await go(page,"q");
  await page.getByText("Alat di tangan: Cangkul").waitFor();
  await go(page,"r");
  await page.getByText("Alat di tangan: Gembor Penyiram").waitFor();
  await page.getByRole("button",{name:"Pilih Cangkul"}).click();
  await go(page,"e");
  await page.getByText("Tidak ada objek untuk berinteraksi di depanmu.",{exact:false}).waitFor();
  await page.getByRole("button",{name:"Pilih Gembor Penyiram"}).click();
  // Gudang: simpan dan ambil alat, lalu kembali ke titik awal tanpa kehilangan progres.
  await go(page,"ArrowRight",5); await go(page,"ArrowUp",5); await go(page,"e");
  await saved(page,()=>JSON.parse(localStorage.getItem("yz-test-save")).data.location==="shed");
  await go(page,"ArrowLeft",3); await go(page,"ArrowUp",4); await go(page,"e");
  const storage=page.getByRole("dialog",{name:"Gudang peralatan"});
  await storage.waitFor();
  await storage.locator(".yzg-storage-item").filter({hasText:"Gembor Penyiram"}).getByRole("button",{name:"Simpan"}).click();
  await saved(page,()=>!JSON.parse(localStorage.getItem("yz-test-save")).data.carriedTools.includes("water"));
  await storage.locator(".yzg-storage-item").filter({hasText:"Gembor Penyiram"}).getByRole("button",{name:"Ambil"}).click();
  await saved(page,()=>JSON.parse(localStorage.getItem("yz-test-save")).data.carriedTools.includes("water"));
  await storage.getByRole("button",{name:"Tutup"}).click();
  await go(page,"ArrowDown",4); await go(page,"ArrowRight",3); await go(page,"ArrowDown"); await go(page,"e");
  await saved(page,()=>JSON.parse(localStorage.getItem("yz-test-save")).data.location==="field");
  await go(page,"ArrowDown",5); await go(page,"ArrowLeft",5);
  await page.getByRole("button",{name:"Pilih Gembor Penyiram"}).click();
  await go(page,"ArrowUp",2);await go(page,"ArrowRight");await go(page,"e");
  await page.getByRole("dialog").waitFor();
  await page.getByRole("button",{name:"Ada yang bisa kubantu?"}).click();
  await saved(page,()=>JSON.parse(localStorage.getItem("yz-test-save")).data.bonds.A03.points===20);
  assert.ok((await page.locator(".yzg-portrait").getAttribute("data-emotion")) === "surprised");
  await page.screenshot({path:path.join(output,"dialogue-"+width+".png"),fullPage:true});
  await page.getByRole("button",{name:"Lanjut ›"}).click();
  await page.getByRole("button",{name:"Akhiri percakapan"}).click();
  await page.getByRole("button",{name:/^▣ YZ Phone/}).click();
  await page.getByRole("button",{name:/Kedekatan$/}).click();
  await page.getByText("20/1000 poin", {exact:false}).waitFor();
  await page.getByRole("button",{name:"Kembali",exact:true}).click();
  await page.getByRole("button",{name:/Statistik$/}).click();
  await page.getByText("8 XP",{exact:true}).waitFor();
  await page.getByRole("button",{name:"Tutup ponsel"}).click();
  await go(page,"ArrowLeft",9);await go(page,"ArrowUp",3);await go(page,"e");
  await saved(page,()=>JSON.parse(localStorage.getItem("yz-test-save")).data.location==="home");
  await go(page,"e");
  await page.getByText("Tidak ada objek untuk berinteraksi di depanmu.",{exact:false}).waitFor();
  assert.equal(JSON.parse(await page.evaluate(()=>localStorage.getItem("yz-test-save"))).data.stats.actions,0);
  assert.equal(JSON.parse(await page.evaluate(()=>localStorage.getItem("yz-test-save"))).data.equippedTool,"water");
  assert.deepEqual(JSON.parse(await page.evaluate(()=>localStorage.getItem("yz-test-save"))).data.carriedTools,["hoe","water"]);
  await page.screenshot({path:path.join(output,"home-"+width+".png"),fullPage:true});
  await go(page,"ArrowLeft",3);await go(page,"ArrowUp",4);await go(page,"e");
  await page.getByRole("button",{name:"Tidur sampai pagi",exact:true}).click();
  await saved(page,()=>JSON.parse(localStorage.getItem("yz-test-save")).data.day===2);
  await page.reload();await page.getByRole("button",{name:"Mengerti"}).click();
  await page.waitForFunction(()=>document.querySelector(".yzg-headsup").textContent.includes("Rumah"));
  await page.getByText("Alat di tangan: Gembor Penyiram").waitFor();
  await go(page,"ArrowDown",4);await go(page,"ArrowRight",3);await go(page,"ArrowDown");await go(page,"e");
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
