"""Bake the four stage-one actors into foot-aligned 24x32 animation cells."""
import json
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
ACTORS = ("A01", "A03", "C01", "C08", "A04", "C07")
CELL = (24, 32)
atlas = Image.new("RGBA", (CELL[0] * 3, CELL[1] * 4 * len(ACTORS)))
for index, actor in enumerate(ACTORS):
    pack = "gba-v2" if actor.startswith("A") else "gba-v2-c"
    folder = ROOT / "game-assets" / "characters" / pack
    manifest = json.loads((folder / "manifest.json").read_text())
    character = next(row for row in manifest["characters"] if row["id"] == actor)
    frames = character["frames"]
    # One scale per actor keeps pose changes from pumping in size.
    bounds = [frame["contentBounds"] for frame in frames]
    scale = min(22 / max(r-l+1 for l,t,r,b in bounds),
                30 / max(b-t+1 for l,t,r,b in bounds))
    with Image.open(folder / character["sheet"]) as source:
        for n, frame in enumerate(frames):
            x, y, _, _ = frame["rect"]
            l, t, r, b = frame["contentBounds"]
            piece = source.crop((x+l, y+t, x+r+1, y+b+1)).convert("RGBA")
            piece.putalpha(piece.getchannel("A").point(lambda a: 255 if a >= 128 else 0))
            sprite = piece.resize((round(piece.width*scale), round(piece.height*scale)),
                                  Image.Resampling.NEAREST)
            ox, oy = frame["originPixels"]
            left = (n % 3)*24 + 12 - round((ox-l)*scale)
            top = (index*4+n//3)*32 + 30 - round((oy-t)*scale)
            atlas.alpha_composite(sprite, (left, top))
atlas.save(ROOT / "public/game/assets/characters/stage1.png", optimize=True)
