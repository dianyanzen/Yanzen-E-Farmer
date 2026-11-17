"""Export compact sheets for the in-game phone from a rebuilt atlas ZIP."""
import argparse
import io
import json
import math
import zipfile
from pathlib import Path
from PIL import Image


def export(archive, dest):
    dest.mkdir(exist_ok=True,parents=True)
    records=[]
    with zipfile.ZipFile(archive) as z:
        for folder,label,limit in [('peta','Kecamatan',10),('kelurahan','Kelurahan',12),('tanaman','Tanaman',49)]:
            paths=sorted(p for p in z.namelist() if p.startswith(folder+'/') and p.endswith('.png') and not p.endswith('/ubin.png'))
            for offset in range(0,len(paths),limit):
                group=paths[offset:offset+limit]
                sheet=None
                for i,path in enumerate(group):
                    im=Image.open(io.BytesIO(z.read(path))).convert('RGBA')
                    w,h=im.size;cols=4
                    if sheet is None:sheet=Image.new('RGBA',(cols*w,math.ceil(len(group)/cols)*h))
                    x=i%cols*w;y=i//cols*h;sheet.paste(im,(x,y))
                    name=Path(path).stem.removeprefix('kel-').removeprefix('kec-').replace('-',' ').title()
                    filename=f'{folder}-{offset}.webp'
                    records.append([label,name,filename,x,y,w,h])
                sheet.save(dest/filename,lossless=True,method=4)
    (dest/'index.html').write_text("""<!doctype html><html lang="id"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Atlas Bandung · YZ Life</title>
<style>*{box-sizing:border-box}body{margin:1rem auto;padding:0 1rem;max-width:44rem;background:#f6f2e7;color:#213e34;font:1rem system-ui}h1{font-family:Georgia}select{font:inherit;padding:.5rem;max-width:100%}canvas{display:block;width:100%;margin-top:1rem;image-rendering:pixelated}a{color:#255c49}</style>
<a href="/game">Kembali ke permainan</a><h1>Atlas Bandung</h1><label>Kategori <select id="category"></select></label> <label>Nama <select id="place"></select></label><canvas id="map" role="img"></canvas><p id="status" role="status"></p>
<script>
const entries=DATA;
const category=document.querySelector('#category'),place=document.querySelector('#place'),canvas=document.querySelector('canvas'),statusLine=document.querySelector('#status');
let token=0;
function show(){
 const [kind,name,src,x,y,w,h]=entries[Number(place.value)], request=++token, im=new Image();
 canvas.width=w;canvas.height=h;canvas.setAttribute('aria-label',kind+' '+name);
 statusLine.textContent='Memuat…';
 im.onload=()=>{if(request!==token)return;canvas.getContext('2d').drawImage(im,x,y,w,h,0,0,w,h);statusLine.textContent=kind==='Tanaman'?'Semai · muda · berkembang · siap panen':'Peta fiksi untuk cerita YZ Life.'};
 im.onerror=()=>{if(request===token)statusLine.textContent='Gambar gagal dimuat.'};im.src=src;
}
function list(){place.replaceChildren();entries.forEach(([kind,name],i)=>{if(kind===category.value)place.add(new Option(name,i))});show()}
for(const k of new Set(entries.map(e=>e[0])))category.add(new Option(k,k));
category.onchange=list;place.onchange=show;list();
const initial=new URLSearchParams(location.search).get('kecamatan');
if(initial){const opt=[...place.options].find(o=>o.text.toLowerCase().replaceAll(' ','')===initial.toLowerCase().replaceAll(' ',''));if(opt){place.value=opt.value;show()}}
</script></html>""".replace('=DATA;', '='+json.dumps(records,ensure_ascii=False)+';'))


if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('archive',type=Path);parser.add_argument('destination',type=Path)
    args=parser.parse_args();export(args.archive,args.destination)
