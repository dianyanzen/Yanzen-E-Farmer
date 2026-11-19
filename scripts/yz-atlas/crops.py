"""Four transparent, foot-aligned 32x40 frames per catalogue species."""
import random
from math import cos, sin, pi
from PIL import Image, ImageDraw

GROUPS = {
    'palm': 'kelapa aren sagu pinang salak kelapa-sawit pisang pepaya',
    'grain': 'padi sorgum jewawut hanjeli jagung tebu serai-dapur pandan-wangi suji',
    'vine': 'timun gambas-ular labu-air labu-siam buncis kapri kacang-panjang kacang-komak kacang-koro-pedang kecipir telang lada vanili markisa oyong pare cincau-hijau',
    'runner': 'semangka melon zukini blewah krai labu-kuning timun-suri stroberi ubi-jalar pegagan',
    'root': 'wortel parsnip bit lobak radis bengkuang bawang-merah bawang-putih',
    'herb': 'adas ketumbar peterseli seledri kenikir bayam-cabut kemangi mint tespong pohpohan selada-air kangkung-air kangkung-darat',
    'blade': 'bawang-daun bawang-prei kucai lokio nanas',
    'rosette': 'kubis kubis-brussel kohlrabi kembang-kol brokoli sawi-putih caisim pakcoy selada kailan kale swiss-chard',
    'rhizome': 'jahe kunyit bangle temulawak kencur temu-putih temu-hitam temu-kunci lempuyang lengkuas kapulaga kecombrang ganyong garut helikonia',
    'broad': 'talas suweg porang genjer gembili gadung singkong mangkokan',
    'flower': 'anggrek anthurium mawar aster anyelir bunga-matahari gerbera gladiol krisan lili melati sedap-malam',
    'shrub': 'tomat cabai cabai-gendot paprika terung terung-belanda okra leunca ciplukan kacang-bogor kacang-gude kacang-hijau kacang-merah kacang-tanah kacang-tunggak kedelai wijen kentang kopi teh katuk rasberi murbei',
    'cactus': 'buah-naga',
}
FAMILY = {name: family for family, names in GROUPS.items() for name in names.split()}
ACCENTS = {
    '#d64c42': 'tomat cabai stroberi apel delima leci rambutan rasberi radis',
    '#f0b74e': 'jagung mangga pisang belimbing labu-kuning bunga-matahari jeruk-keprok jeruk-siam',
    '#995187': 'terung terung-belanda jamblang anggrek bit ubi-jalar',
    '#ef9552': 'wortel pepaya jeruk-bali',
    '#efe5ba': 'kembang-kol bawang-putih lobak melati sedap-malam',
    '#84bc52': 'pare timun gambas-ular oyong labu-siam buncis kacang-panjang',
}
FRUIT = {name: color for color, names in ACCENTS.items() for name in names.split()}
GREENS = [('#244e3a','#40804a','#84b766'),('#285844','#509456','#a1c775'),('#32543a','#709548','#bfcb71'),('#245345','#418979','#88bb83')]


def sprite(name):
    rand = random.Random(name)
    family = FAMILY.get(name, 'tree')
    dark, mid, light = rand.choice(GREENS)
    accent = FRUIT.get(name, rand.choice([mid,light,'#b69860','#d2ae6a']))
    if family == 'flower' and name not in FRUIT:
        accent = rand.choice(['#ee94ad','#cd7fbe','#eee1c1','#e99d53'])
    # Reuse the mature branch pattern through growth so the plant keeps its habit.
    spread, height, lean = rand.uniform(.75,1.14), rand.uniform(.83,1.06), rand.uniform(-3,3)
    branches = [(side * rand.uniform(5.5,12), rand.uniform(-3,3)) for side in [-1,1]*4]
    out = Image.new('RGBA',(128,40))
    for stage, scale in enumerate([.18,.44,.76,1.0]):
        frame = Image.new('RGBA',(32,40)); d = ImageDraw.Draw(frame)
        def xy(x,y):
            return (round(15.5+(x*spread+lean*y/34)*scale),round(37-y*height*scale))
        def line(a,b,c,w=1):
            d.line([xy(*a),xy(*b)],fill=c,width=max(1,round(w*scale)))
        def oval(x,y,rx,ry,c):
            d.ellipse([xy(x-rx,y+ry),xy(x+rx,y-ry)],fill=c)
        def leaf(x,y,dx,dy,w):
            end=(x+dx,y+dy)
            d.polygon([xy(x,y),xy(x+dx*.45-w,y+dy*.65+w),xy(*end),xy(x+dx*.62+w,y+dy*.35-w)],fill=mid)
            line((x,y),end,light)
        if stage==0:
            line((0,0),(0,12),dark,2);leaf(0,7,-9,5,3);leaf(0,9,8,7,3)
        elif family=='tree':
            line((0,0),(0,21),'#76563c',4)
            for i,(dx,j) in enumerate(branches[:5]):
                y=14+i*2.6+j; bx=dx*(1-i*.12)
                line((0,9+i*2),(bx,y),'#76563c',2)
                oval(bx,y,5,5,dark);oval(bx-1,y+2,4,4,mid);oval(bx-2,y+3,2,1,light)
                if stage==3 and i%2==0:oval(bx,y-2,2,2,accent)
        elif family in ('vine','cactus'):
            for x in (-8,8): line((x,0),(x,28),'#997f55',2)
            for y in (12,25):line((-8,y),(8,y),'#a9946c')
            last=(0,0)
            for i,(dx,j) in enumerate(branches[:6]):
                y=5+4.5*i; elbow=(dx*.65,y);line(last,elbow,dark,4 if family=='cactus' else 2)
                if family=='vine':leaf(*elbow,dx*.55,4+j,3)
                if stage==3 and i in (2,3,5):oval(elbow[0],y-2,2,4,'#da7393' if family=='cactus' else accent)
                elif stage==2 and i==4:oval(*elbow,2,2,'#ead276')
                last=elbow
        elif family in ('palm','rhizome','broad'):
            crown=22 if family=='palm' else 4
            line((0,0),(0,crown),'#8d7548' if family=='palm' else dark,3)
            for i,(dx,j) in enumerate(branches[:6]):
                tip=crown+4+i*1.2+j if family=='palm' else 12+i*2.5+j
                bend=(dx*.68,(tip+crown)/2+4)
                line((0,crown),bend,mid,2);leaf(*bend,dx*.55,tip-bend[1],2 if family=='palm' else 4)
            if family=='palm' and stage==3:oval(2,crown-2,3,3,accent)
        elif family in ('grain','blade','root','rosette'):
            for i,(dx,j) in enumerate(branches):
                y=10+i*2.6+j; tip=dx*(1-i*.09)
                leaf(0,0,tip,y,4 if family=='rosette' else 1)
                if family=='grain' and stage>=2 and i>2:
                    for k in range(4):oval(tip+k*.6,y-k,1,1,'#dbb964' if stage==3 else light)
            if stage==3 and family in ('root','rosette'):
                oval(0,4,5,3,accent if family=='root' or name=='kembang-kol' else light)
            if name=='nanas' and stage==3:oval(0,15,4,6,'#dba552')
        elif family=='runner':
            for i,(dx,j) in enumerate(branches[:6]):
                x=dx*(.5+i*.09);y=3+i+j;line((0,1),(x,y),dark,2);leaf(x,y,dx*.35,6,2)
                if stage==3 and i in (2,5):oval(x,y,4,3,accent)
        else:
            line((0,0),(0,27),dark,2)
            for i,(dx,j) in enumerate(branches[:6]):
                y=5+i*3.7; top=y+4+j;line((0,y),(dx,top),dark,2);leaf(dx*.5,y+2,dx*.5,5,2)
                if stage>=2 and family=='flower' and i>2:
                    for a in range(5):oval(dx+2*cos(a*2*pi/5),top+2*sin(a*2*pi/5),2,2,accent)
                    oval(dx,top,1,1,'#ebc56b')
                elif stage==3 and family=='shrub' and i%2:
                    oval(dx,top-1,2,4 if name.startswith('cabai') else 2,accent)
        out.paste(frame,(stage*32,0))
    return out
