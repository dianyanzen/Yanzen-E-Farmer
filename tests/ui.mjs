import { browserPath } from "./browser-path.mjs";
import { build } from "esbuild";
import { chromium } from "@playwright/test";
import chromiumBinary from "@sparticuz/chromium";
import { createServer } from "node:http";
import { mkdtemp, readFile, readdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import assert from "node:assert/strict";
const temp = await mkdtemp(path.join(tmpdir(), "farmer-ui-"));
await build({
  stdin: {
    contents: `import React from 'react';import {createRoot} from 'react-dom/client';import Workspace from './src/components/farm/workspace';createRoot(document.getElementById('root')).render(<Workspace view={new URLSearchParams(location.search).get('view')||'catat'}/>);`,
    resolveDir: process.cwd(),
    loader: "tsx",
  },
  bundle: true,
  write: true,
  outfile: path.join(temp, "app.js"),
  jsx: "automatic",
  define: { "process.env.NODE_ENV": '"development"' },
  plugins: [
    {
      name: "next-link-fixture",
      setup(b) {
        b.onResolve({ filter: /^next\/link$/ }, () => ({
          path: "link",
          namespace: "fixture",
        }));
        b.onLoad({ filter: /.*/, namespace: "fixture" }, () => ({
          contents:
            "import React from 'react';export default function Link(p){return React.createElement('a',p)}",
          resolveDir: process.cwd(),
        }));
      },
    },
  ],
});
const id = "20000000-0000-0000-0000-000000000001";
const account = "30000000-0000-0000-0000-000000000001";
const fixture = {
  organizations: [{ id, name: "Usaha Uji" }],
  organization: { id, name: "Usaha Uji" },
  role: "owner",
  userId: "10000000-0000-0000-0000-000000000001",
  lands: [],
  blocks: [],
  cycles: [],
  accounts: [{ id: account, name: "Kas tunai" }],
  parties: [],
  entries: [],
  references: [],
  members: [],
  total: 0,
  page: 0,
  report: {
    cash: [{ id: account, name: "Kas tunai", balance: 0 }],
    cash_in: 0,
    cash_out: 0,
    by_kind: [],
    harvests: [],
    outstanding: [],
  },
  analysis: { cycles: [], inventory: [], labor: [], daily: [] },
};
const captured = [];
let css = "";
try {
  for (const name of await readdir(".next/static/chunks"))
    if (name.endsWith(".css"))
      css += await readFile(".next/static/chunks/" + name, "utf8");
} catch {}
const server = createServer(async (req, res) => {
  if (req.url.startsWith("/api/farm")) {
    res.setHeader("Content-Type", "application/json");
    if (req.method === "POST") {
      let b = "";
      for await (const chunk of req) b += chunk;
      captured.push(JSON.parse(b));
      res.end(JSON.stringify({ ok: true }));
    } else res.end(JSON.stringify(fixture));
    return;
  }
  if (req.url === "/style.css") {
    res.setHeader("Content-Type", "text/css");
    res.end(css);
    return;
  }
  if (req.url === "/app.js") {
    res.setHeader("Content-Type", "text/javascript");
    res.end(await readFile(path.join(temp, "app.js")));
    return;
  }
  res.setHeader("Content-Type", "text/html");
  res.end(
    '<!doctype html><html><head><link rel="stylesheet" href="/style.css"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body><div id="root"></div><script src="/app.js"></script></body></html>',
  );
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const browser = await chromium.launch({
  executablePath: await browserPath(),
  args: chromiumBinary.args,
  headless: true,
});
try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const url = "http://127.0.0.1:" + server.address().port;
  await page.goto(url);
  await page
    .getByRole("button", { name: "Pekerja kelompok", exact: true })
    .click();
  await page.getByLabel("Keterangan singkat").fill("Memetik timun");
  await page.getByPlaceholder("Macul, manggul, memetik…").fill("Memetik");
  await page.getByLabel("Jumlah orang", { exact: true }).fill("30");
  await page
    .getByLabel("Tarif per orang per unit", { exact: true })
    .fill("70000");
  await page.getByText("+ Tambahan lembur", { exact: true }).click();
  await page.getByLabel("Orang lembur", { exact: true }).fill("10");
  await page.getByLabel("Jam per orang", { exact: true }).fill("2");
  await page.getByLabel("Rp/orang/jam", { exact: true }).fill("15000");
  assert.match(
    await page.getByText("Total biaya pekerja:").textContent(),
    /2\.400\.000/,
  );
  await page.getByLabel("Bayar sekarang", { exact: true }).check();
  await page
    .getByLabel("Kas / rekening", { exact: false })
    .selectOption(account);
  await page.getByRole("button", { name: "Simpan", exact: true }).click();
  await page.getByText("Tersimpan.", { exact: true }).waitFor();
  assert.equal(captured[0].rows.length, 2);
  assert.equal(captured[0].rows[0].details.lines[0].people, 30);
  assert.equal(captured[0].rows[1].amount, 2400000);
  assert.equal(captured[0].rows[1].parent_id, captured[0].rows[0].id);
  await page.goto(url + "/?view=lahan");
  await page
    .getByRole("button", { name: "+ Tambah", exact: true })
    .first()
    .click();
  await page.getByLabel(/^Satuan/).selectOption("m²");
  assert.equal(
    await page.getByLabel("m² per satuan", { exact: false }).inputValue(),
    "1",
  );
  await page.goto(url);
  await page.getByRole("button", { name: "Pengeluaran", exact: true }).click();
  await page.getByLabel("Keterangan singkat").fill("Draf pupuk");
  await page.getByRole("button", { name: "Simpan draf", exact: true }).click();
  await page.reload();
  await page.getByRole("button", { name: "Pulihkan draf" }).click();
  assert.equal(
    await page.getByLabel("Keterangan singkat").inputValue(),
    "Draf pupuk",
  );
  await page.screenshot({
    path: "/tmp/farmer-mobile-form.png",
    fullPage: true,
  });
  assert.deepEqual(errors, []);
  console.log(
    "PASS UI: mobile labor/overtime, atomic payment payload, conversion, offline draft restore",
  );
} finally {
  await browser.close();
  await new Promise((r) => server.close(r));
}
