#!/usr/bin/env node
/** YZ Farm Life asset audit. No network, no third-party dependencies, no production mutations. */
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
const root = resolve(fileURLToPath(new URL("../../", import.meta.url)));
const sources = JSON.parse(readFileSync(resolve(root, "game-assets/catalog/sources.json"), "utf8"));
const characters = JSON.parse(readFileSync(resolve(root, "game-assets/catalog/characters.json"), "utf8"));
const allowedLicenses = new Set(["CC0-1.0", "custom-free-commercial"]);
const allowedRedistribution = new Set(["CC0", "commercial-no-standalone-redistribution"]);
const allowedStatuses = new Set(["shortlisted", "external-download-required", "downloaded", "reviewed", "integrated"]);
const seen = new Set();
assert.equal(sources.schemaVersion, 1);
assert.equal(sources.standards.grid.join("x"), "16x16");
assert.ok(Array.isArray(sources.records) && sources.records.length >= 4);
for (const p of sources.records) {
  assert.match(p.id, /^[a-z0-9]+(?:-[a-z0-9]+)*$/, "invalid asset id");
  assert.ok(!seen.has(p.id), "duplicate asset id " + p.id); seen.add(p.id);
  assert.ok(p.name && p.author && p.sourceUrl && p.licenseEvidenceUrl, "missing provenance " + p.id);
  const source = new URL(p.sourceUrl);
  assert.equal(source.protocol, "https:", "source must use HTTPS: " + p.id);
  assert.ok(["kenney.nl", "opengameart.org", "reodesuxz.itch.io"].includes(source.hostname), "unreviewed upstream: " + source.hostname);
  assert.ok(allowedLicenses.has(p.license), "unknown license: " + p.id);
  assert.ok(allowedRedistribution.has(p.redistribution), "redistribution not reviewed: " + p.id);
  assert.ok(allowedStatuses.has(p.status), "invalid status: " + p.id);
  assert.equal(p.checkedOn, "2026-11-16", "unexpected evidence date (update manifest after recheck)");
  assert.ok(Array.isArray(p.tags) && p.tags.length > 0, "missing category: " + p.id);
  if (p.rawPresent) {
    assert.ok(["reviewed", "integrated"].includes(p.status), "raw source requires completed license review: " + p.id);
    assert.ok(Array.isArray(p.rawFiles) && p.rawFiles.length >= 2, "raw asset path list is missing: " + p.id);
    assert.match(p.sourceGitBlobSha ?? "", /^[a-f0-9]{40}$/, "raw asset source git blob SHA-1 required: " + p.id);
    for (const relative of p.rawFiles) {
      assert.ok(relative.startsWith("game-assets/vendor/") && !relative.includes(".."), "invalid vendor file path");
      const local = resolve(root, relative);
      assert.ok(local.startsWith(root + sep), "vendor path escapes repo");
      assert.ok(existsSync(local), "missing imported vendor asset: " + relative);
      if (relative.toLowerCase().endsWith(".png")) {
        assert.equal(readFileSync(local).subarray(0,8).toString("hex"), "89504e470d0a1a0a", "invalid PNG magic: " + relative);
      }
      if (relative.endsWith("LICENSE.txt")) {
        const license = readFileSync(local, "utf8");
        assert.match(license, /CC0|Creative Commons Zero/i, "license evidence missing: " + relative);
      }
    }
  }
  if (p.runtimePresent) {
    assert.ok(p.status === "integrated", "runtime file requires integrated status: " + p.id);
    assert.match(p.sha256 ?? "", /^[a-f0-9]{64}$/, "integrated file requires sha256: " + p.id);
    const local = resolve(root, p.plannedDirectory);
    assert.ok(local === root || local.startsWith(root + sep), "path escapes repo: " + p.id);
    assert.ok(existsSync(local), "declared runtime directory missing: " + p.id);
  } else {
    assert.equal(p.sha256, null, "no runtime sha until integrated: " + p.id);
  }
  if (p.redistribution !== "CC0") {
    assert.equal(p.runtimePresent, false, "restricted redistribution needs an explicit separate usage review");
  }
}
assert.equal(characters.expectedCount, 32);
assert.equal(characters.publicAccess, false);
assert.equal(characters.characters.length, 32);
const ids = new Set(characters.characters.map(c => c.id));
assert.equal(ids.size, 32);
for (const prefix of ["A", "C"]) for (let i = 1; i <= 16; i++) {
  const id = prefix + String(i).padStart(2, "0");
  const c = characters.characters.find(c => c.id === id);
  assert.ok(c, "missing character " + id);
  assert.equal(c.filename, id + (id === "C08" ? ".jpg" : ".png"));
  assert.equal(c.status, "reference-only", "source sheets must remain private");
  assert.equal(c.gameSpriteReady, false, "Do not claim reference sheets are sprites");
  assert.equal(c.publicAssetPath, null, "Do not publish private source imagery");
}
const combinedText = JSON.stringify({sources,characters});
assert.ok(!combinedText.includes("drive.google.com/drive/folders/"), "private Drive folder link must stay out of public repo");
console.log("YZ Farm Life asset catalog validation: PASS");
console.log(sources.records.length + " shortlisted source packs; vendor imported: " + sources.records.filter(s=>s.rawPresent).length + "; 32 private character references; runtime imported: " + sources.records.filter(s=>s.runtimePresent).length);
