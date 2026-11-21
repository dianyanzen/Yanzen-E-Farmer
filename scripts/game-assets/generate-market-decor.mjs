// Original YZ Farm Life market pixel art — generated deterministically, no external dependencies.
// Run: node scripts/game-assets/generate-market-decor.mjs
import {mkdirSync,writeFileSync} from "node:fs";
import {dirname,resolve} from "node:path";
import {fileURLToPath} from "node:url";
const items=["gerobak-sayur","kanopi-buah","meja-ikan","rak-bibit","peti-pasar","karung-pakan","lampu-pasar","timbangan","keranjang-ikan","pot-pasar"];
function marketPng(name){
 const dimensions={"gerobak-sayur":[82,56],"kanopi-buah":[88,66],"meja-ikan":[72,48],"rak-bibit":[61,55],"peti-pasar":[55,39],"karung-pakan":[51,43],"lampu-pasar":[25,72],"timbangan":[38,41],"keranjang-ikan":[49,37],"pot-pasar":[38,43]};
 const dim=dimensions[name];if(!dim)throw Error("Unknown asset "+name);
 const [w,h]=dim,pixels=new Uint8Array(w*h*4);
 const pal={outline:"#514336",deep:"#3d4a39",wood:"#926342",woodDark:"#6e4b33",woodLight:"#bd8758",cream:"#f5e3bb",leaf:"#6a9551",leafDark:"#416b45",leafBright:"#a8c66a",red:"#bf6550",red2:"#e59d6f",blue:"#5796a1",blueDark:"#3f6e7b",metal:"#829698",gold:"#d9ae61",tent:"#bc7356"};
 function color(hex){hex=hex.replace("#","");return [parseInt(hex.slice(0,2),16),parseInt(hex.slice(2,4),16),parseInt(hex.slice(4,6),16),255]}
 function rect(x,y,bw,bh,col){const c=color(col);for(let yy=Math.max(0,Math.round(y));yy<Math.min(h,Math.round(y+bh));yy++)for(let xx=Math.max(0,Math.round(x));xx<Math.min(w,Math.round(x+bw));xx++){let k=(yy*w+xx)*4;for(let z=0;z<4;z++)pixels[k+z]=c[z]}}
 function framed(x,y,bw,bh,fill,border=pal.outline,b=2){rect(x,y,bw,bh,border);rect(x+b,y+b,bw-b*2,bh-b*2,fill)}
 function dot(cx,cy,r,col){for(let yy=-r;yy<=r;yy++)for(let xx=-r;xx<=r;xx++)if(xx*xx+yy*yy<=r*r)rect(cx+xx,cy+yy,1,1,col)}
 function leaf(x,y,sz=3){rect(x-1,y,sz+2,3,pal.leafDark);rect(x,y-2,sz,sz,pal.leaf);rect(x+1,y-3,1,2,pal.leafBright)}
 function fruit(x,y,c){dot(x,y,5,pal.outline);dot(x,y,4,c);rect(x,y-6,2,3,pal.woodDark);leaf(x+1,y-5,2)}
 switch(name){
 case "gerobak-sayur":
  rect(7,28,70,6,pal.woodDark);framed(11,32,63,18,pal.woodLight);rect(13,33,58,3,pal.cream);
  framed(14,26,57,8,pal.wood);framed(21,18,25,11,pal.leafDark);framed(45,20,21,10,pal.red);
  for(const [x,y] of [[23,18],[32,20],[40,19],[50,18],[59,20]])fruit(x,y,x<46?pal.leafBright:pal.red2);
  rect(20,50,5,5,pal.woodDark);rect(62,50,5,5,pal.woodDark);dot(24,50,6,pal.outline);dot(24,50,3,pal.metal);dot(61,50,6,pal.outline);dot(61,50,3,pal.metal);break;
 case "kanopi-buah":
  rect(12,30,4,34,pal.woodDark);rect(72,30,4,34,pal.woodDark);
  rect(4,13,80,16,pal.outline);rect(7,15,74,11,pal.tent);
  for(let i=0;i<6;i++)rect(8+i*12,18,10,9,i%2?pal.cream:pal.red2);
  for(let x=8;x<=72;x+=12){dot(x+3,29,4,iColor(x))}
  framed(12,43,63,17,pal.wood);rect(15,46,57,3,pal.woodLight);
  for(const [x,y,c] of [[25,42,pal.red],[38,41,pal.gold],[50,42,pal.red2],[63,41,pal.leafBright]])fruit(x,y,c);break;
 case "meja-ikan":
  framed(3,27,66,15,pal.wood);rect(7,29,58,8,pal.blueDark);rect(6,37,61,4,pal.cream);rect(10,42,5,6,pal.woodDark);rect(58,42,5,6,pal.woodDark);
  for(const [x,y] of [[18,33],[37,33],[55,33]]){dot(x,y,5,pal.blueDark);rect(x-6,y-2,12,5,pal.metal);rect(x-6,y-1,8,2,pal.cream);rect(x+5,y-4,5,6,pal.blue);rect(x-3,y-1,1,1,pal.outline)}break;
 case "rak-bibit":
  rect(6,13,5,41,pal.woodDark);rect(50,13,5,41,pal.woodDark);
  for(const y of [19,36,51]){rect(7,y,47,4,pal.woodDark);rect(9,y,43,2,pal.woodLight)}
  for(const y of [9,27,42])for(const x of [12,25,38]){framed(x,y+6,10,8,pal.wood);leaf(x+3,y+5,4);leaf(x+6,y+3,3)}break;
 case "peti-pasar":
  for(const [x,y] of [[3,18],[22,8],[27,21]]){framed(x,y,28,18,pal.wood);rect(x+9,y+2,3,14,pal.woodDark);rect(x+3,y+6,22,2,pal.woodLight)}
  break;
 case "karung-pakan":
  for(const [x,y,c] of [[5,18,pal.cream],[21,10,pal.red2],[17,24,pal.cream]]){framed(x,y,26,21,c);rect(x+3,y+4,20,3,pal.gold);rect(x+8,y+9,10,4,pal.woodLight);rect(x+4,y,18,3,pal.woodDark)}break;
 case "lampu-pasar":
  rect(10,16,4,51,pal.woodDark);rect(8,64,8,5,pal.metal);rect(4,10,16,4,pal.woodDark);
  rect(7,13,11,13,pal.outline);rect(9,15,7,9,pal.gold);rect(11,16,3,5,pal.cream);
  rect(6,6,13,5,pal.woodLight);rect(9,2,7,4,pal.outline);rect(4,26,15,2,pal.woodDark);break;
 case "timbangan":
  framed(6,29,28,10,pal.wood);rect(18,12,4,17,pal.metal);rect(5,11,29,4,pal.outline);rect(11,6,16,6,pal.cream);
  rect(7,16,2,7,pal.metal);rect(31,16,2,7,pal.metal);framed(3,22,11,5,pal.blue);framed(25,22,11,5,pal.blue);
  rect(17,32,7,4,pal.gold);break;
 case "keranjang-ikan":
  framed(6,22,37,13,pal.woodLight);rect(10,25,29,4,pal.blueDark);for(let i=0;i<3;i++){rect(12+i*9,22,7,4,pal.metal);rect(17+i*9,23,3,3,pal.blue)}rect(6,20,37,3,pal.woodDark);break;
 case "pot-pasar":
  for(const [x,y,s] of [[7,22,8],[21,17,10]]){framed(x,y,s+8,15,pal.wood);rect(x+2,y+4,s+4,5,pal.woodLight);leaf(x+3,y-3,5);leaf(x+9,y-6,5);dot(x+10,y-8,3,pal.red2)}break;
 }
 function iColor(x){return (x/12)%2<1?pal.cream:pal.tent}
 const raw=[];for(let y=0;y<h;y++){raw.push(0);for(let x=0;x<w;x++){let p=(y*w+x)*4;raw.push(pixels[p],pixels[p+1],pixels[p+2],pixels[p+3])}}
 function be32(n){return [(n>>>24)&255,(n>>>16)&255,(n>>>8)&255,n&255]}
 function adler(a){let s1=1,s2=0;for(const b of a){s1=(s1+b)%65521;s2=(s2+s1)%65521}return ((s2<<16)|s1)>>>0}
 function deflate(a){let z=[0x78,0x01],i=0;while(i<a.length){let n=Math.min(65535,a.length-i),end=(i+n===a.length)?1:0;z.push(end,n&255,(n>>>8)&255,(~n)&255,((~n)>>>8)&255,...a.slice(i,i+n));i+=n}z.push(...be32(adler(a)));return z}
 function crc(a){let c=0xffffffff;for(const b of a){c^=b;for(let i=0;i<8;i++)c=(c&1)?(0xedb88320^(c>>>1)):(c>>>1)}return (c^0xffffffff)>>>0}
 function chunk(t,a){const word=[...t].map(c=>c.charCodeAt(0));let core=[...word,...a];return [...be32(a.length),...core,...be32(crc(core))]}
 let bytes=[137,80,78,71,13,10,26,10,...chunk("IHDR",[...be32(w),...be32(h),8,6,0,0,0]),...chunk("IDAT",deflate(raw)),...chunk("IEND",[])];
 const alphabet="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";let s="";
 for(let i=0;i<bytes.length;i+=3){let a=bytes[i],b=bytes[i+1],c=bytes[i+2];s+=alphabet[a>>>2]+alphabet[((a&3)<<4)|((b??0)>>>4)]+(i+1<bytes.length?alphabet[((b&15)<<2)|((c??0)>>>6)]:"=")+(i+2<bytes.length?alphabet[c&63]:"=")}
 return s;
}
const dir=resolve(dirname(fileURLToPath(import.meta.url)),"../../public/game/assets/tiles/farm-kit/market");
mkdirSync(dir,{recursive:true});
for(const item of items){writeFileSync(resolve(dir,item+".png"),Buffer.from(marketPng(item),"base64"));}
console.log("Generated "+items.length+" original market pixel-art assets.");
