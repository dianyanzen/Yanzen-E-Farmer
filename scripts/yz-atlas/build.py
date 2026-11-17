"""python build.py SOURCE.zip OUTPUT.zip  (requires Pillow)."""
import argparse
import hashlib
import json
import sqlite3
import tempfile
import zipfile
from collections import deque
from html import escape
from pathlib import Path
from PIL import Image
from crops import sprite
from maps import Tiles, build_map


def validate_map(path):
    m=json.loads(path.read_text());w,h=m['width'],m['height']
    layers={l['name']:l for l in m['layers']}
    blocked=layers['Tabrakan']['data']
    pts=[(int(o['x'])//16,int(o['y'])//16) for o in layers['Interaksi']['objects']]
    seen=set();todo=deque([pts[0]])
    while todo:
        x,y=todo.popleft()
        if (x,y) in seen or not (0<=x<w and 0<=y<h) or blocked[y*w+x]:continue
        seen.add((x,y));todo.extend(((x+1,y),(x-1,y),(x,y+1),(x,y-1)))
    if not set(pts)<=seen:raise ValueError(f'Unreachable point: {path}')
    return tuple(blocked)


def gallery(root, categories):
    parts=['''<!doctype html><html lang="id"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Atlas YZ Farm Life</title>
<style>*{box-sizing:border-box}body{background:#f6f2e7;color:#183b32;font:16px system-ui;margin:auto;max-width:1300px;padding:1.5rem}h1,h2{font-family:Georgia}section{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,240px),1fr));gap:1rem}figure{margin:0;background:#fffaf0;border:1px solid #d8d2b9;padding:.6rem}img{width:100%;image-rendering:pixelated}figcaption{font-weight:600}a{color:#245a49}input{font:inherit;padding:.5rem;width:min(100%,32rem)}</style>
<h1>Atlas YZ Farm Life</h1><label>Cari tanaman atau wilayah<br><input type="search" id="search"></label>''']
    for heading,files in categories:
        parts.append(f'<h2>{heading}</h2><section>')
        for p in files:
            name=p.stem.removeprefix('kel-').removeprefix('kec-').replace('-',' ').title()
            src=p.relative_to(root).as_posix()
            parts.append(f'<figure><a href="{escape(src)}"><img loading="lazy" src="{escape(src)}" alt="{escape(name)}"></a><figcaption>{escape(name)}</figcaption></figure>')
        parts.append('</section>')
    parts.append("""<script>document.querySelector('input').oninput=e=>{const q=e.target.value.toLowerCase();for(const card of document.querySelectorAll('figure'))card.hidden=!card.textContent.toLowerCase().includes(q)}</script></html>""")
    (root/'Atlas.html').write_text('\n'.join(parts))
    for p in [root/'Mulai-di-sini.html',root/'Bandung-Selepas-Senja.html',root/'Katalog.html']:
        if p.exists():
            s=p.read_text()
            if 'href="Atlas.html"' not in s:p.write_text(s.replace('</h1>','</h1><p><a href="Atlas.html">Buka atlas tanaman dan wilayah</a></p>',1))


def build(root):
    plants=sorted((root/'tanaman').glob('*.png'))
    silhouettes=set()
    for p in plants:
        im=sprite(p.stem);im.save(p)
        silhouettes.add(im.crop((96,0,128,40)).getchannel('A').tobytes())
    if len(silhouettes)!=len(plants):raise ValueError('Duplicate mature silhouette')
    tiles=Tiles(root)
    districts=sorted((root/'peta').glob('*.tmj'));villages=sorted((root/'kelurahan').glob('*.tmj'))
    layouts=set()
    for p in districts+villages:
        build_map(p,tiles);layouts.add(validate_map(p))
    if len(layouts)!=len(districts)+len(villages):raise ValueError('Duplicate collision layout')
    tiles.save(root)
    gallery(root,[('Kecamatan',[p.with_suffix('.png') for p in districts]),('Kelurahan',[p.with_suffix('.png') for p in villages]),('Tanaman · empat tahap tumbuh',plants)])
    readme=root/'BACA-DULU.txt'
    readme.write_text('ATLAS TANAMAN DAN WILAYAH\nBuka Atlas.html untuk menelusuri peta fiksi dan empat tahap tanaman. Ubin kota berasal dari dua paket Kenney CC0 di vendor/.\n\n'+readme.read_text())
    db=sqlite3.connect(root/'YZ_Farm_Life_Aset.sqlite')
    for (name,) in db.execute('SELECT path FROM aset_berkas').fetchall():
        p=root/name
        if p.is_file() and p.suffix!='.sqlite':
            data=p.read_bytes()
            db.execute('UPDATE aset_berkas SET sha256=?,ukuran=? WHERE path=?',(hashlib.sha256(data).hexdigest(),len(data),name))
    data=(root/'Atlas.html').read_bytes()
    db.execute('INSERT OR REPLACE INTO aset_berkas(path,sha256,ukuran) VALUES(?,?,?)',('Atlas.html',hashlib.sha256(data).hexdigest(),len(data)))
    db.commit();db.close()
    print(f'{len(plants)} tanaman, {len(districts)} kecamatan, {len(villages)} kelurahan')


if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('source',type=Path);parser.add_argument('output',type=Path)
    args=parser.parse_args()
    with tempfile.TemporaryDirectory() as tmp:
        root=Path(tmp)
        with zipfile.ZipFile(args.source) as z:z.extractall(root)
        build(root)
        with zipfile.ZipFile(args.output,'w',zipfile.ZIP_DEFLATED,compresslevel=6) as z:
            for p in sorted(root.rglob('*')):
                if p.is_file():z.write(p,p.relative_to(root))
