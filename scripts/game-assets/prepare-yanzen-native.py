#!/usr/bin/env python3
"""Deterministic export of six individually generated Yanzen farmhouse assets.

Optional prerequisite: Pillow >= 10. Runs offline, not required at Vercel build
time because exported WebPs are committed to public/game/assets.
Do not crop furniture from a combined atlas or rasterize additional props
on the floor base. Each PNG master has its own copyright/provenance record.
"""
from __future__ import annotations
from pathlib import Path
from PIL import Image
import hashlib
import json

ROOT=Path(__file__).resolve().parents[2]
MASTERS=ROOT/"game-assets/masters/yanzen-farmhouse-native-v1"
OUT=ROOT/"public/game/assets/farmhouse-native/v1"
ENTRIES=[
    ("room-base.png","room-base.webp",384),
    ("house-exterior.png","house-exterior.webp",448),
    ("bed-and-nightstand.png","bed.webp",320),
    ("chest.png","chest.webp",320),
    ("shelf.png","shelf.webp",320),
    ("workdesk.png","workdesk.webp",320),
]
OUT.mkdir(parents=True,exist_ok=True)
manifest={"schemaVersion":1,"artFamily":"yz-farmlife-warm-rustic-pixel-art",
          "tilePx":20,"source":"6 independent native 1254px ImageGen masters",
          "exports":[]}
for master_name,target_name,long_edge in ENTRIES:
    src=MASTERS/master_name
    if not src.is_file():raise FileNotFoundError(src)
    im=Image.open(src)
    if master_name!="room-base.png":
        im=im.convert("RGBA")
        alpha=im.getchannel("A")
        # Generated transparent PNGs contain subpixel traces as far as the
        # image border; mask the near-invisible haze before finding bounds.
        solid=alpha.point(lambda n:255 if n>16 else 0)
        bbox=solid.getbbox()
        if not bbox:raise ValueError(f"Asset fully transparent: {master_name}")
        left,top,right,bottom=bbox
        # Keep 10 source pixels of honest padding for outlines/antialiasing.
        bbox=(max(0,left-10),max(0,top-10),min(im.width,right+10),min(im.height,bottom+10))
        im=im.crop(bbox)
        rgba=im.getdata()
        im.putdata([(r,g,b,a if a>16 else 0) for (r,g,b,a) in rgba])
    else:
        im=im.convert("RGB")
        bbox=(0,0,im.width,im.height)
    w,h=im.size
    size=(round(w*long_edge/max(w,h)),round(h*long_edge/max(w,h)))
    im=im.resize(size,Image.Resampling.LANCZOS)
    dest=OUT/target_name
    im.save(dest,"WEBP",quality=92,method=6)
    manifest["exports"].append({
        "id":target_name.replace(".webp",""),
        "master":"game-assets/masters/yanzen-farmhouse-native-v1/"+master_name,
        "runtime":"/game/assets/farmhouse-native/v1/"+target_name,
        "masterSha256":hashlib.sha256(src.read_bytes()).hexdigest(),
        "cropRectSource":list(bbox),
        "exportSize":list(size),
        "aspectRatio":round(size[0]/size[1],5),
        "alpha":"yes" if im.mode=="RGBA" else "no",
        "runtimeBytes":dest.stat().st_size,
    })
    print(f"{target_name:22s} {size[0]:4d}x{size[1]:4d} {dest.stat().st_size:8d} bytes")
(OUT/"manifest.json").write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
print("Exported six independent sprites; no composite furniture slicing.")
