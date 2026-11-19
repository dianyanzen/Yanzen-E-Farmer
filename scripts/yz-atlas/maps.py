"""Build orthogonal Tiled maps using the Kenney sheets distributed with the atlas."""
import heapq
import json
import math
import random
from PIL import Image

TILE = 16
THEMES = [
    ('kanal', ('air','ikan','halte')),
    ('kebun', ('kebun','buah','benih','persemaian','bunga','sayur','kompos','tanah','rempah')),
    ('pasar', ('pasar','timbang','dapur','dagangan','grosir','hajatan')),
    ('bengkel', ('bengkel','kirim','muatan','kemas','alas kaki','rajut')),
    ('pendopo', ('pendopo','serambi','pentas','sekolah','arsip','rak pinjam')),
]


class Tiles:
    def __init__(self, root):
        sheet = Image.open(root/'peta/ubin.png').convert('RGBA')
        self.tiles = [sheet.crop((i*16,0,i*16+16,16)) for i in range(17)]
        self.cache = {}
        self.sources = {k: Image.open(root/f'vendor/kenney-{v}/tilemap_packed.png').convert('RGBA')
                        for k,v in [('t','tiny-town'),('u','rpg-urban-pack')]}

    def get(self, sheet, index, ground=1):
        key=(sheet,index,ground)
        if key not in self.cache:
            src=self.sources[sheet]; cols=src.width//16
            x,y=index%cols*16,index//cols*16
            im=self.tiles[ground-1].copy()
            im.alpha_composite(src.crop((x,y,x+16,y+16)))
            self.tiles.append(im);self.cache[key]=len(self.tiles)
        return self.cache[key]

    def save(self, root):
        cols=32;rows=math.ceil(len(self.tiles)/cols)
        atlas=Image.new('RGBA',(cols*16,rows*16))
        for i,t in enumerate(self.tiles):atlas.paste(t,(i%cols*16,i//cols*16))
        atlas.save(root/'peta/ubin.png')
        p=root/'peta/ubin.tsj';meta=json.loads(p.read_text())
        meta.update(columns=cols,tilecount=len(self.tiles),imagewidth=atlas.width,imageheight=atlas.height)
        p.write_text(json.dumps(meta,indent=1))


def build_map(path, tiles):
    d=json.loads(path.read_text());w,h=d['width'],d['height']
    rng=random.Random(path.stem)
    props={p['name']:p['value'] for p in d['properties']}
    role=props.get('peran',props.get('lokasi_fiksi','')).lower()
    theme=next((t for t,words in THEMES if any(word in role for word in words)), 'plaza')
    layers={l['name']:l for l in d['layers']}
    points=[(int(o['x'])//16,int(o['y'])//16) for o in layers['Interaksi']['objects']]
    cells=[(x,y) for y in range(h) for x in range(w)]
    ground={p:tiles.get('t',rng.choices([0,1,2],[90,8,2])[0]) for p in cells}
    obstacle=set();water=set();structures=set()
    horizontal=rng.choice([True,False]); phase=rng.uniform(0,6)
    def axes(x,y):return (x,y,w,h) if horizontal else (y,x,h,w)
    avenue=rng.randrange(4,(h if horizontal else w)-4)
    junction=rng.randrange(5,(w if horizontal else h)-4)
    path_tile=tiles.get('u',109 if theme in ('pasar','pendopo','plaza') else 118)
    field_width=2+sum(path.stem.encode())%4
    market_floor=tiles.get('u',109)
    stone=tiles.get('u',118)
    asphalt=tiles.get('u',440)
    for p in cells:
        x,y=p;u,v,L,B=axes(x,y)
        bank=2+round(1.6*math.sin(u*.27+phase))
        if theme=='kanal' and bank<=v<=bank+2:
            water.add(p);ground[p]=tiles.get('u',rng.choice([28,32,33]));obstacle.add(p)
        elif theme=='kebun' and v<avenue-1 and (u//field_width)%2==0:
            ground[p]=13 if v%3 else 4
        elif theme=='bengkel' and abs(v-avenue)<=2:
            ground[p]=asphalt
        elif theme=='pasar' and v>avenue and 2<u<L-2:
            ground[p]=market_floor if u%5 else stone
        elif theme=='pendopo' and ((u-junction)/5)**2+((v-avenue)/4)**2<=1.5:
            ground[p]=stone
        elif (theme in ('pasar','plaza') and abs(u-junction)<5 and abs(v-avenue)<4):
            ground[p]=path_tile
        elif abs(v-avenue-round(1.7*math.sin(u*.22+phase)))<=int(theme=='bengkel') or u==junction:
            ground[p]=path_tile

    # Coherent multi-tile facades and recognisable outdoor furnishings.
    roofs=[48,52] if theme!='bengkel' else [48]
    for _ in range(36):
        if len(structures)>=rng.randint(25,52):break
        bw=rng.choice([3,4,5]);x=rng.randrange(1,w-bw);y=rng.randrange(1,h-3)
        box={(x+i,y+j) for i in range(bw) for j in range(2)}
        margin={(xx,yy) for xx in range(x-1,x+bw+1) for yy in range(y-1,y+3)}
        if margin.intersection(points) or margin & structures or box & water or any(ground[q]==path_tile for q in box):continue
        roof=rng.choice(roofs);wall=72 if roof==52 else 76;door=rng.randrange(1,bw-1)
        for i in range(bw):
            ground[x+i,y]=tiles.get('t',roof+(0 if i==0 else 2 if i==bw-1 else 1))
            ground[x+i,y+1]=tiles.get('t',wall+(2 if i==door else 1 if i==bw-1 else 0))
        structures.update(box);obstacle.update(box)
    props_by_theme={'kanal':[('t',57),('t',107),('t',16)],'kebun':[('t',16),('t',15),('t',29),('t',104)],
                    'pasar':[('u',249),('u',276),('u',277),('t',107)],'bengkel':[('u',422),('u',250),('u',273)],
                    'pendopo':[('u',381),('t',16),('t',83)],'plaza':[('u',381),('u',169),('u',276)]}
    available=[p for p in cells if p not in obstacle and p not in points and ground[p]!=path_tile]
    for p in rng.sample(available,min(len(available),rng.randint(18,45))):
        s,i=rng.choice(props_by_theme[theme]);ground[p]=tiles.get(s,i,ground[p]);obstacle.add(p)
    # Least-cost paths retain the old interaction coordinates and favour existing roads.
    def neighbors(p):
        x,y=p
        return [q for q in ((x+1,y),(x-1,y),(x,y+1),(x,y-1)) if q in ground]
    network={points[0]}
    for target in points[1:]:
        queue=[(0,target)];prev={target:None};dist={target:0}
        while queue:
            cost,p=heapq.heappop(queue)
            if cost!=dist[p]:continue
            if p in network:break
            for q in neighbors(p):
                step=160 if q in structures else 14 if q in obstacle else 1 if ground[q]==path_tile else 3
                if cost+step<dist.get(q,float('inf')):
                    dist[q]=cost+step;prev[q]=p;heapq.heappush(queue,(cost+step,q))
        while p is not None:
            network.add(p);obstacle.discard(p)
            ground[p]=4 if p in water else path_tile
            p=prev[p]
    layers['Lingkungan']['data']=[ground[p] for p in cells]
    layers['Tabrakan']['data']=[int(p in obstacle) for p in cells]
    path.write_text(json.dumps(d,ensure_ascii=False,separators=(',',':')))
    preview=Image.new('RGB',(w*16,h*16))
    for x,y in cells:preview.paste(tiles.tiles[ground[x,y]-1],(x*16,y*16))
    preview.save(path.with_suffix('.png'))
