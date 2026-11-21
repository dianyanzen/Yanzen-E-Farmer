#!/usr/bin/env python3
"""Export the tracked, read-only asset catalog to an isolated local SQLite file.

Does NOT connect to Supabase, Docker game DB, or production. Requires Python 3 stdlib only.
"""
from __future__ import annotations
import argparse
import hashlib
import json
import sqlite3
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
CATALOG = ROOT / "game-assets" / "catalog"

def load(name: str) -> dict:
    with (CATALOG / name).open(encoding="utf-8") as f:
        return json.load(f)

def main() -> None:
    parser = argparse.ArgumentParser(description="Rebuild local YZ asset SQLite database from Git catalogs")
    parser.add_argument("--output", default="game-assets/_generated/yz-asset-library.sqlite")
    args = parser.parse_args()
    output = (ROOT / args.output).resolve()
    vault = (ROOT / "game-assets" / "_generated").resolve()
    if not output.is_relative_to(vault) or output.suffix not in (".sqlite", ".db"):
        raise SystemExit("Refusing output outside game-assets/_generated; this protects real farm databases.")
    assets = load("asset-database.json")
    experiences = load("asset-experiences.json")
    portraits = load("npc-portrait-register.json")
    if len(assets["rows"]) != assets["stats"]["fileCount"]:
        raise SystemExit("Invalid media inventory count")
    output.parent.mkdir(parents=True, exist_ok=True)
    temporary = output.with_suffix(output.suffix + ".tmp")
    if temporary.exists():
        temporary.unlink()
    conn = sqlite3.connect(temporary)
    conn.execute("PRAGMA foreign_keys=ON")
    conn.executescript("""
    CREATE TABLE metadata (key TEXT PRIMARY KEY, value TEXT NOT NULL);
    CREATE TABLE assets (
       path TEXT PRIMARY KEY, stable_id TEXT UNIQUE NOT NULL,
       git_blob_sha TEXT NOT NULL, size_bytes INTEGER NOT NULL,
       media_kind TEXT NOT NULL, storage_stage TEXT NOT NULL,
       purpose TEXT NOT NULL, style_family TEXT NOT NULL,
       source_license TEXT NOT NULL, duplicate_of_path TEXT,
       quality_flag TEXT, FOREIGN KEY(duplicate_of_path) REFERENCES assets(path)
    );
    CREATE INDEX assets_by_kind ON assets(media_kind, purpose);
    CREATE INDEX assets_by_style ON assets(style_family, quality_flag);
    CREATE INDEX assets_by_sha ON assets(git_blob_sha);
    CREATE TABLE portraits (
       character_id TEXT PRIMARY KEY, name TEXT NOT NULL, is_playable INTEGER NOT NULL,
       expression_path TEXT NOT NULL, work_concept_path TEXT NOT NULL,
       frames INTEGER NOT NULL, status TEXT NOT NULL,
       FOREIGN KEY(expression_path) REFERENCES assets(path),
       FOREIGN KEY(work_concept_path) REFERENCES assets(path)
    );
    CREATE TABLE experiences (
       id TEXT PRIMARY KEY, asset_path TEXT NOT NULL, zone TEXT NOT NULL,
       verb TEXT NOT NULL, start_minute INTEGER NOT NULL, end_minute INTEGER NOT NULL,
       effect_hint TEXT NOT NULL, lines_json TEXT NOT NULL, placement TEXT NOT NULL,
       FOREIGN KEY(asset_path) REFERENCES assets(path)
    );
    """)
    # Insert in two phases so duplicate foreign keys can reference a later row.
    for row in assets["rows"]:
        path, sha, size, kind, stage, purpose, family, license_id, duplicate, flag = row
        stable_id = "yzasset-" + hashlib.sha1(path.encode("utf-8")).hexdigest()[:16]
        conn.execute("INSERT INTO assets VALUES(?,?,?,?,?,?,?,?,?,NULL,?)",
            (path, stable_id, sha, size, kind, stage, purpose, family, license_id, flag))
    for row in assets["rows"]:
        if row[8]:
            conn.execute("UPDATE assets SET duplicate_of_path=? WHERE path=?", (row[8], row[0]))
    for char in portraits["characters"]:
        expression = "public" + char["expressionSheet"]
        work = "public" + char["variant"]["workConcept"]
        conn.execute("INSERT INTO portraits VALUES(?,?,?,?,?,?,?)",
            (char["id"], char["name"], int(char["active"]), expression, work,
             char["frames"], char["styleReview"]))
    for event in experiences["events"]:
        conn.execute("INSERT INTO experiences VALUES(?,?,?,?,?,?,?,?,?)",
          (event["id"], event["assetPath"], event["zone"], event["verb"],
           event["timeWindow"][0], event["timeWindow"][1],
           event["effectHint"], json.dumps(event["lines"], ensure_ascii=False),
           event["placement"]))
    for k,v in [("schemaVersion","1"),("project","YZ Farm Life"),
                ("sourceIndex","game-assets/catalog/asset-database.json"),
                ("sourcePortraits","game-assets/catalog/npc-portrait-register.json"),
                ("sourceExperiences","game-assets/catalog/asset-experiences.json")]:
        conn.execute("INSERT INTO metadata VALUES(?,?)",(k,v))
    check = conn.execute("PRAGMA foreign_key_check").fetchall()
    if check: raise SystemExit(f"FK validation failed: {check[:3]}")
    conn.commit()
    actual = conn.execute("SELECT COUNT(*) FROM assets").fetchone()[0]
    if actual != assets["stats"]["fileCount"]: raise SystemExit("Asset export count mismatch")
    conn.close()
    temporary.replace(output)
    print(f"PASS: SQLite exported {actual} assets, {len(portraits['characters'])} portraits, {len(experiences['events'])} experience blueprints -> {output.relative_to(ROOT)}")

if __name__ == "__main__":
    main()
