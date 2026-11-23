#!/usr/bin/env python3
"""ONE-TIME LEGACY MIGRATION for YZ Farm Life character sprites.

Reads existing copyrighted-by-project source sheets only as *migration inputs*.
Output is 192 independent PNG files; runtime never needs the source sheets.
The split is lossless, NOT a claim of fresh hand-authored/re-generated artwork.
Each migrated frame remains flagged for artist rework/scale QA.

Usage: python3 scripts/game-assets/migrate-atomic-characters.py
Requires Pillow. Idempotent, deterministic and fails on unexpected geometry.
"""
from __future__ import annotations
import hashlib
import json
from collections import Counter
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
ASSETS = ROOT / "public/game/assets"
DEST = ASSETS / "characters/atomic"
METRICS = ROOT / "src/lib/game/atomic-frame-metrics.json"
CATALOG = ROOT / "game-assets/catalog/atomic-characters.json"
DIRECTIONS = ("down", "left", "right", "up")
ACTORS = ("A01", "A03", "C01", "C08", "A04", "C07")
MODES = ("hoe", "seed", "water", "harvest")
FRAMES: list[dict] = []
NAMES: set[str] = set()

def source(path: str, cell_w: int, cell_h: int, columns: int, rows: int) -> Image.Image:
    file = ASSETS / path
    if not file.is_file():
        raise FileNotFoundError(f"Required original not found: {file}")
    im = Image.open(file).convert("RGBA")
    required = (cell_w * columns, cell_h * rows)
    if im.size != required:
        raise ValueError(f"{file}: got {im.size}, expected {required}")
    return im

def add(im: Image.Image, source_file: str, x: int, y: int, w: int, h: int,
        owner: str, motion: str, facing: str, frame: int,
        feet_y: int | None = None) -> None:
    # Legacy cell extraction only; never crop multiple objects for new art production.
    tile = im.crop((x, y, x+w, y+h))
    alpha = tile.getchannel("A").point(lambda a: 255 if a > 50 else 0)
    bounds = alpha.getbbox()
    if bounds is None:
        raise ValueError(f"Blank legacy frame: {owner}/{motion}/{facing}/{frame}")
    feet_y = min(h, max(0, feet_y if feet_y is not None else bounds[3]))
    rel = f"characters/atomic/{owner}/{motion}/{facing}/frame-{frame:03d}.png"
    if rel in NAMES:
        raise ValueError(f"Duplicate output: {rel}")
    NAMES.add(rel)
    output = ASSETS / rel
    output.parent.mkdir(parents=True, exist_ok=True)
    tile.save(output, format="PNG", optimize=True)
    payload = output.read_bytes()
    if not payload.startswith(b"\x89PNG\r\n\x1a\n"):
        raise ValueError(f"Invalid frame export: {rel}")
    frame_key = f"{owner}:{motion}:{facing}:{frame:03d}"
    FRAMES.append({
        "key": frame_key,
        "assetId": f"character-{owner}-{motion}-{facing}-{frame:03d}",
        "ownerId": owner,
        "action": motion,
        "direction": facing,
        "frameIndex": frame,
        "url": "/game/assets/"+rel,
        "width": w,
        "height": h,
        "alphaBounds": list(bounds),
        "footX": w//2,
        "footY": feet_y,
        "sha256": hashlib.sha256(payload).hexdigest(),
        "sourceFile": source_file,
        "sourceStatus": "legacy-frame-extraction-awaits-individual-art-review",
    })

def main() -> None:
    # Six actors x 4 directions x 3 frames = 72.
    path = "characters/stage1.png"
    sheet = source(path, 24, 32, 3, 24)
    for actor_index, actor in enumerate(ACTORS):
        for direction_index, direction in enumerate(DIRECTIONS):
            row = actor_index*4 + direction_index
            for frame in range(3):
                add(sheet,path,frame*24,row*32,24,32,actor,"idle",direction,frame)

    # Only A01/Yanzen has 6-frame walk and 6-frame run in all four directions = 48.
    path = "characters/yanzen-gaits.png"
    sheet = source(path, 32, 40, 6, 8)
    for motion_index, motion in enumerate(("walk","run")):
        for direction_index, direction in enumerate(DIRECTIONS):
            row = motion_index*4+direction_index
            for frame in range(6):
                add(sheet,path,frame*32,row*40,32,40,"A01",motion,direction,frame)

    # A01/Yanzen turn sheet is a full 8-angle orientation, not just 4 directions.
    path = "characters/yanzen-turns.png"
    sheet = source(path, 32, 40, 3, 8)
    for angle in range(8):
        for frame in range(3):
            add(sheet,path,frame*32,angle*40,32,40,"A01","turn",f"angle-{angle}",frame)

    # Four farming actions x 4 directions x 3 frames = 48.
    # The legacy 48x48 art includes tools; its body-only foot anchor is NOT
    # reliably recoverable from composite pixels. Start from legacy calibrated
    # body baseline 41 (= 48-7) and REQUIRE body-only manual QA before signoff.
    path = "tiles/actions.png"
    sheet = source(path, 48, 48, 3, 16)
    for motion_index, motion in enumerate(MODES):
        for direction_index, direction in enumerate(DIRECTIONS):
            row = motion_index*4 + direction_index
            for frame in range(3):
                add(sheet,path,frame*48,row*48,48,48,"A01",motion,direction,frame,feet_y=41)

    if len(FRAMES)!=192 or len(NAMES)!=192:
        raise AssertionError(f"Expected 192 independent files, got {len(FRAMES)}")
    # JSON is developer metadata; not a texture atlas or source rectangle table.
    metrics = {
        "schemaVersion": 1,
        "groundContactOffset":18,
        "referenceBodyHeightPx":30,
        "migrationStatus":"legacy-extraction-not-final-art-review",
        "frameCount":len(FRAMES),
        "frames": [
            {
                "key":f["key"],
                "url":f["url"],
                "width":f["width"],
                "height":f["height"],
                "alphaBounds":f["alphaBounds"],
                "footX":f["footX"],
                "footY":f["footY"]
            } for f in FRAMES
        ],
    }
    METRICS.parent.mkdir(parents=True, exist_ok=True)
    METRICS.write_text(json.dumps(metrics,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    CATALOG.parent.mkdir(parents=True, exist_ok=True)
    CATALOG.write_text(json.dumps({
        "schemaVersion":1,
        "scope":"character frames pilot; does not assert all game assets atomized",
        "generatedBy":"scripts/game-assets/migrate-atomic-characters.py",
        "frameCount":len(FRAMES),
        "warnings":[
            "Individual PNG files retain legacy visual appearance until each frame is redrawn and QA-approved.",
            "Action frames still contain a tool drawn with the character and require separate tool redesign.",
            "No source sheet may be loaded in the new character renderer.",
        ],
        "summary":dict(Counter(f["action"] for f in FRAMES)),
        "frames":FRAMES,
    },ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    print(f"Generated {len(FRAMES)} stand-alone frame PNGs.")
    print(f"Metrics: {METRICS.relative_to(ROOT)}")
    print(f"Manifest: {CATALOG.relative_to(ROOT)}")

if __name__=="__main__":
    main()
