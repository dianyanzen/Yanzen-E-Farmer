import { connectsAt, drawConnectedEdges, sharedBorderProps } from "./connected-edges";
import { ROAD_PATHS, roadSegments, warungCoffee, fieldCanalBank, HOME, INGGIT_WARUNG, NURSERY_BENCH, SHED, riverBanks, RIVER_RICE_BEDS, WORLD, type OutdoorLocation } from "./model";
import { drawRouteClosures } from "./pasirluyu-master-map";
import { drawSignposts } from "./signposts";
import { QUEST_PROPS } from "./quest-props";

const kit = "tiles/farm-kit/";
const everyday = ["kandang-ayam","kanopi-pohon",
  "batang-pohon","semak","bunga-melati","rumput-tinggi","pot-daun","batu-kanal","jemuran","peti-kayu"] as const;
const landmarks = ["rumah-nani","rumah-warga","kios-sayur-buka","kios-sayur-tutup","peti-dagangan-sayur",
  "keranjang-buah","bangku-kayu","papan-pasar","pintu-air-kayu","jembatan-kayu","tangga-batu",
  "talud-batu","rumpun-tepian","pohon-pisang","rumpun-bambu","rumpun-bunga-liar"] as const;
const fieldDetails = ["tebing-batu","batu-kembar","ilalang-kanal","riak-kanal","tajuk-kebun","semak-rimbun",
  "daun-tropis","bunga-pinggir","titian-kayu","pagar-kandang","gerbang-kandang","tiang-kandang",
  "ayam-putih","anak-ayam","pot-berbunga","palung"] as const;
const yanzenExteriorFolder = "locations/yanzen/exterior/";
export const outdoorSources: Record<string,string> = {
  "yanzen-home-door": yanzenExteriorFolder + "home-front-door.png",
  "yanzen-home-west-window": yanzenExteriorFolder + "home-west-window.png",
  "yanzen-home-east-window": yanzenExteriorFolder + "home-east-window.png",
  "yanzen-home-facade": yanzenExteriorFolder + "home-facade.png",
  "yanzen-home-roof": yanzenExteriorFolder + "home-roof.png",
  "yanzen-shed-entry": yanzenExteriorFolder + "shed-entry-shadow.png",
  "yanzen-shed-facade": yanzenExteriorFolder + "shed-facade.png",
  "yanzen-shed-roof": yanzenExteriorFolder + "shed-roof.png",
  ...Object.fromEntries(["roof","facade","wall-shelf","coffee-jar","tea-jar","hanging-cloth","service-counter","north-bench","south-bench","coffee-table","enamel-kettle","sign","closed-sign","jasmine-pot","bamboo-basket","fern","river-stones","counter-apron"]
    .map(part => [`inggit-${part}`, `locations/inggit/sunda/${part}.png`])),
  ...Object.fromEntries((["ryan","widi"] as const).flatMap(owner => ["full","empty"].map(phase =>
    [`inggit-${owner}-coffee-${phase}`, `locations/inggit/warkop/${owner}-coffee-${phase}.png`]))),
  ...Object.fromEntries(QUEST_PROPS.map(p => [p.asset,"quests/"+p.asset+".svg"])),
  ...Object.fromEntries(["tajuk-terang","tajuk-teduh","rimbun-pakis-daun","rumpun-bunga-tepi-jalan","kelompok-pot","tong-dan-papan"].map(name => [name,kit+"kebun-luas/"+name+".png"])),
  ...Object.fromEntries(["nani","ryan","inggit","ayu","widi"].map(owner=>["atelier-"+owner,kit+"landmark/atelier-"+owner+".png"])),
  ...Object.fromEntries(["nani","ryan","inggit","ayu","widi"].map(owner=>["fasad-"+owner,kit+"landmark/fasad-"+owner+".png"])),
  "lapak-benih":kit+"landmark/lapak-benih.png",
  "lapak-pancing":kit+"landmark/lapak-pancing.png",
  "lapak-anyaman":kit+"landmark/lapak-anyaman.png",
  "bendung-dua-pintu-buka":kit+"landmark/bendung-dua-pintu-buka.png",
  "bendung-dua-pintu-tutup":kit+"landmark/bendung-dua-pintu-tutup.png",
  ...Object.fromEntries(["field","gang","pasar","sungai"].map(zone=>["night-"+zone,kit+"night/"+zone+".png"])),
  ground: "tiles/ground/ground-base.png",
  surfaces: kit + "permukaan-empat-lokasi.png",
  road: kit + "jalan-utama.png",
  fence: kit + "pagar.png",
  petak: kit + "petak.png",
  ...Object.fromEntries([0,1,2].flatMap(stage => ["","-alt"].map(variant =>
    ["cucumber-stage-"+stage+variant,kit+"kebun/cucumber-stage-"+stage+variant+"-runtime.png"]))),
  "cucumber-stage-3":kit+"kebun/cucumber-ripe.png",
  "cucumber-stage-3-alt":kit+"kebun/cucumber-ripe-alt.png",
  "plot-dry": kit+"kebun/petak-kering.svg",
  "plot-wet": kit+"kebun/petak-basah.svg",
  "faucet-closed":"locations/yanzen/v3/faucet-closed.svg",
  "faucet-open":"locations/yanzen/v3/faucet-open.svg",
  "garden-trellis": kit+"kebun/ajir-bambu-01-runtime.png",
  "garden-hoe": kit+"objek/cangkul.png",
  "garden-watering-can": kit+"objek/gembor.png",
  ...Object.fromEntries(everyday.map(name => [name, kit + "objek/" + name + ".png"])),
  ...Object.fromEntries(fieldDetails.map(name => [name, kit + "detail-kebun/" + name + ".png"])),
  ...Object.fromEntries(landmarks.map(name => [name, kit + "landmark/" + name + ".png"])),
};
type Point = readonly [number,number];
type Placement = { asset:string; x:number; y:number; scale?:number; closedAsset?:string; displayW?:number; displayH?:number; groundY?:number; visible?:boolean };
export type OutdoorImages = Partial<Record<string,CanvasImageSource>>;
const homeX = (HOME.door.x + .5) * WORLD.tile;
const shedX = (SHED.door.x + .5) * WORLD.tile;
const nurseryX = (NURSERY_BENCH.x + .5) * WORLD.tile;
const warungX = (INGGIT_WARUNG.x + .5) * WORLD.tile;
const warkop: Placement[] = [
  {asset:"inggit-facade",x:warungX-11,y:116,displayW:104,displayH:54,groundY:98},
  {asset:"inggit-wall-shelf",x:warungX-23,y:97,displayW:27,displayH:8,groundY:99},
  {asset:"inggit-coffee-jar",x:warungX-29,y:91,displayW:10,displayH:11,groundY:100},
  {asset:"inggit-tea-jar",x:warungX-18,y:91,displayW:10,displayH:11,groundY:100},
  {asset:"inggit-hanging-cloth",x:warungX+19,y:92,displayW:10,displayH:13,groundY:100},
  {asset:"inggit-roof",x:warungX-11,y:74,displayW:116,displayH:37,groundY:100},
  {asset:"inggit-sign",x:warungX-6,y:79,displayW:26,displayH:12,groundY:101},
  {asset:"inggit-service-counter",x:warungX-4,y:120,displayW:68,displayH:19,groundY:122},
  {asset:"inggit-enamel-kettle",x:warungX+15,y:105,displayW:13,displayH:15,groundY:122},
  {asset:"inggit-jasmine-pot",x:330,y:105,displayW:16,displayH:21},
  {asset:"inggit-bamboo-basket",x:330,y:119,displayW:15,displayH:13},
  {asset:"inggit-fern",x:311,y:144,displayW:18,displayH:15},
  {asset:"inggit-river-stones",x:319,y:183,displayW:19,displayH:10},
  ...([
    ["north-bench",INGGIT_WARUNG.northBench,34,15],
    ["coffee-table",INGGIT_WARUNG.table,29,24],
    ["south-bench",INGGIT_WARUNG.southBench,34,15],
  ] as const).map(([part,tile,displayW,displayH])=>({
    asset:`inggit-${part}`,x:(tile.x+.5)*WORLD.tile,y:(tile.y+1)*WORLD.tile-2,displayW,displayH,
  })),
];

const props: Record<OutdoorLocation, Placement[]> = {
  field: [
    {asset:"tajuk-kebun",x:107,y:38},{asset:"tajuk-kebun",x:139,y:44},
    {asset:"tajuk-kebun",x:254,y:47,scale:.98},{asset:"tajuk-kebun",x:320,y:57,scale:.96},
    {asset:"tajuk-kebun",x:458,y:66},{asset:"semak-rimbun",x:280,y:89},
    // Inserts sit behind the transparent openings. Every layer sorts from
    // its building's threshold, even when the image ends at the eaves.
    {asset:"yanzen-home-door",x:homeX,y:95,displayW:19,displayH:30,groundY:96},
    {asset:"yanzen-home-west-window",x:homeX-31.5,y:81,displayW:16,displayH:15,groundY:96},
    {asset:"yanzen-home-east-window",x:homeX+31.5,y:81,displayW:16,displayH:15,groundY:96},
    {asset:"yanzen-home-facade",x:homeX,y:96,displayW:104,displayH:37,groundY:96},
    {asset:"yanzen-home-roof",x:homeX,y:64,displayW:112,displayH:28,groundY:96},
    {asset:"yanzen-shed-entry",x:shedX,y:94,displayW:26,displayH:27,groundY:95},
    {asset:"yanzen-shed-facade",x:shedX,y:95,displayW:68,displayH:34,groundY:95},
    {asset:"yanzen-shed-roof",x:shedX,y:67,displayW:80,displayH:26,groundY:95},
    ...warkop,{asset:"pot-berbunga",x:nurseryX,y:103},
    {asset:"pohon-pisang",x:288,y:100,scale:.67},{asset:"bunga-melati",x:306,y:101},
    {asset:"semak-rimbun",x:457,y:110},{asset:"bunga-pinggir",x:451,y:122},
    {asset:"daun-tropis",x:50,y:169,scale:.8},{asset:"bunga-pinggir",x:55,y:157,scale:.7},
    {asset:"bunga-pinggir",x:224,y:200,scale:.76},{asset:"semak-rimbun",x:299,y:185,scale:.79},
    {asset:"tajuk-kebun",x:473,y:173,scale:.85},{asset:"daun-tropis",x:448,y:187,scale:.76},
    {asset:"bunga-pinggir",x:416,y:199,scale:.9},{asset:"semak-rimbun",x:466,y:266,scale:.82},
    {asset:"kandang-ayam",x:410,y:301,scale:.75},{asset:"palung",x:444,y:279,scale:.79},
    {asset:"ayam-putih",x:383,y:295},{asset:"anak-ayam",x:435,y:298},
    {asset:"pot-berbunga",x:389,y:258,scale:.71},{asset:"bunga-pinggir",x:466,y:304},
    {asset:"pagar-kandang",x:382,y:313},{asset:"pagar-kandang",x:443,y:313},
    {asset:"gerbang-kandang",x:365,y:306},{asset:"tiang-kandang",x:459,y:301},
    {asset:"daun-tropis",x:54,y:317,scale:.88},{asset:"pohon-pisang",x:90,y:324,scale:.66},
    {asset:"semak-rimbun",x:132,y:317,scale:.89},{asset:"bunga-pinggir",x:202,y:320},
    {asset:"tajuk-kebun",x:283,y:324,scale:.85},{asset:"daun-tropis",x:335,y:323},
  ],
  gang: [
    {asset:"fasad-nani",x:160,y:155,scale:.96},{asset:"fasad-ryan",x:403,y:155,scale:.9},
    {asset:"jemuran",x:55,y:152},{asset:"bangku-kayu",x:114,y:152,scale:.8},
    {asset:"rumpun-bunga-liar",x:110,y:155,scale:.72},{asset:"pohon-pisang",x:312,y:124,scale:.7},
    {asset:"talud-batu",x:322,y:78,scale:.8},{asset:"bunga-melati",x:191,y:154,scale:.75},
    {asset:"semak",x:22,y:283},{asset:"rumpun-bunga-liar",x:438,y:301},
  ],
  pasar: [
    {asset:"lapak-benih",closedAsset:"kios-sayur-tutup",x:128,y:174},
    {asset:"peti-kayu",x:91,y:174,scale:.75},
    {asset:"papan-pasar",x:303,y:100},
    {asset:"rumpun-bunga-liar",x:68,y:278},{asset:"semak",x:425,y:285},
    {asset:"pohon-pisang",x:40,y:270,scale:.8},{asset:"rumpun-bunga-liar",x:129,y:305,scale:.82},
    {asset:"semak",x:183,y:311},{asset:"semak",x:294,y:312},{asset:"peti-kayu",x:440,y:238},
  ],
  sungai: [
    {asset:"bendung-dua-pintu-tutup",x:85,y:163},{asset:"tangga-batu",x:142,y:176,scale:.75},
    {asset:"rumpun-tepian",x:58,y:108},
    {asset:"rumpun-tepian",x:162,y:229},{asset:"rumpun-bambu",x:309,y:97},
    {asset:"talud-batu",x:354,y:145},{asset:"pohon-pisang",x:393,y:121},
    {asset:"rumpun-tepian",x:127,y:70,scale:.76},{asset:"rumpun-tepian",x:133,y:248,scale:.7},
    {asset:"batu-kanal",x:12,y:140},{asset:"rumput-tinggi",x:142,y:124},
    {asset:"rumpun-bunga-liar",x:387,y:285},{asset:"semak",x:470,y:294},
  ],
};
// Read silhouettes from back to front: an outer canopy, a low hedge, then
// the accessible yard. Gaps in both bands mark the same gate as the road.
for(const location of Object.keys(props) as OutdoorLocation[]){
  for(let x=4;x<654;x+=27){
    const northGate=location!=="field" && x>=202 && x<=277;
    if(connectsAt(location,"up") || northGate || (location==="sungai" && x<139) || (location==="field" && x<38))continue;
    const variant=(x-4)/27;
    props[location].push({asset:variant%3?"tajuk-kebun":"tajuk-terang",x,y:19+variant%3*5,scale:.74+variant%3*.07});
  }
  for(let x=8;x<650;x+=35){
    if(connectsAt(location,"down") || (location!=="field" && x>209 && x<269) || (location==="field" && (x<43 || (x>345 && x<403))) ||
      (location==="sungai" && x<145))continue;
    props[location].push({asset:"semak-rimbun",x,y:325+x%5,scale:.78},
      {asset:"bunga-pinggir",x:x-10,y:319,scale:.58});
  }
  for(let y=44;y<320;y+=24){
    if(y<190 || y>245){
      if(!connectsAt(location,"right"))props[location].push({asset:"semak-rimbun",x:642,y,scale:.65});
      if(!connectsAt(location,"left") && (location==="gang" || location==="pasar"))props[location].push({asset:"semak-rimbun",x:0,y,scale:.61});
    }
  }
}

const gardens:Record<OutdoorLocation,Point[]>={
  field:[[181,90],[240,91],[291,110],[470,119],[453,173],[226,180],[52,242],[314,306],[474,288],[530,148],[561,174],[599,290]],
  gang:[[51,127],[79,159],[20,190],[117,169],[200,99],[304,108],[344,125],[448,171],[381,273],[154,280],[93,275],[488,143],[562,155],[600,277]],
  pasar:[[44,135],[32,185],[58,252],[111,299],[314,105],[444,137],[465,165],[422,290],[485,110],[593,128],[601,281]],
  sungai:[[156,79],[161,104],[183,122],[292,102],[334,133],[411,150],[272,237],[158,217],[460,257],[594,128],[609,275]],
};
for(const location of Object.keys(gardens) as OutdoorLocation[]){
  gardens[location].forEach(([x,y],i)=>{
    props[location].push({asset:i%4===1?"daun-tropis":i%4===2?"batu-kembar":"semak-rimbun",x,y,scale:.60+i%3*.09},
      {asset:i%3?"bunga-pinggir":"rumput-tinggi",x:x+11,y:y+3,scale:.54},
      {asset:i%3?"rumput-tinggi":"bunga-melati",x:x-12,y:y+2,scale:.42});
  });
}
props.field.push(
  ...([[530,139],[590,139],[550,199],[610,199]] as Point[]).map(([x,y],i)=>({asset:i%2?"tajuk-terang":"tajuk-kebun",x,y,scale:.69})),
  {asset:"tong-dan-papan",x:210,y:97,scale:.57},
  {asset:"peti-kayu",x:501,y:156,scale:.68},{asset:"keranjang-buah",x:510,y:155,scale:.66}
);
props.field.push(
  // Keep the working path and planting tiles free from decorative tools and
  // trellises: carried tools and farm actions remain controlled by game state.
  // Basket, caping and butterfly remain in the catalog for repair; their PNGs
  // currently fail image decoding and must not be requested by the renderer.
);
props.gang.push(
  {asset:"pohon-pisang",x:69,y:87,scale:.81},{asset:"kelompok-pot",x:137,y:157,scale:.64},
  {asset:"pot-berbunga",x:429,y:159,scale:.8},{asset:"jemuran",x:584,y:130,scale:1.05},
  {asset:"bangku-kayu",x:582,y:156,scale:.8},{asset:"talud-batu",x:604,y:157,scale:1.03},
  {asset:"bunga-pinggir",x:483,y:158,scale:.62},{asset:"bunga-melati",x:566,y:157,scale:.78}
);
props.pasar.push(
  {asset:"keranjang-buah",x:70,y:176,scale:.74},{asset:"pot-berbunga",x:422,y:178,scale:.74},
  {asset:"lapak-pancing",x:550,y:159},
  {asset:"pohon-pisang",x:35,y:106,scale:.96},{asset:"papan-pasar",x:597,y:159,scale:.8}
);
props.sungai.push(
  {asset:"rumpun-bambu",x:329,y:118,scale:.93},{asset:"talud-batu",x:371,y:160},
  {asset:"ilalang-kanal",x:22,y:291},{asset:"rumpun-tepian",x:120,y:200,scale:.8},
  {asset:"tebing-batu",x:142,y:80},{asset:"rumpun-bambu",x:580,y:154},
  {asset:"rumput-tinggi",x:567,y:154,scale:.7}
);

// Place the shade trees and seating around quiet yards, away from the crossroads.
props.gang.push(
  {asset:"tajuk-teduh",x:52,y:293,scale:.92},{asset:"tajuk-terang",x:312,y:280,scale:.83},
  {asset:"rumpun-bunga-liar",x:76,y:293,scale:.85},{asset:"bangku-kayu",x:342,y:283,scale:.81},
  {asset:"kelompok-pot",x:358,y:285,scale:.52}
);
props.pasar.push(
  {asset:"lapak-anyaman",x:88,y:273},
  {asset:"tajuk-terang",x:37,y:88,scale:.84},{asset:"tajuk-teduh",x:475,y:111,scale:.93},
  {asset:"keranjang-buah",x:113,y:267,scale:.83},{asset:"peti-dagangan-sayur",x:76,y:274,scale:.8}
);

// Keep the lane clear in front of all three new homes in Nani's neighbourhood.
const newHomes = [[90,277,111],[310,277,118],[530,155,117]] as const;
props.gang=props.gang.filter(p=>!newHomes.some(([x,y,width])=>Math.abs(x-p.x)<width/2 && p.y>y-66 && p.y<y+23));
props.gang.push(
  {asset:"fasad-inggit",x:90,y:277,scale:.83},
  {asset:"fasad-ayu",x:310,y:277,scale:.83},
  {asset:"fasad-widi",x:530,y:155,scale:.91}
);
props.gang.push(
  {asset:"atelier-nani",x:123,y:154},{asset:"atelier-ryan",x:439,y:156},
  {asset:"atelier-inggit",x:58,y:278},{asset:"atelier-ayu",x:278,y:277},
  {asset:"atelier-widi",x:565,y:155}
);
props.pasar.push(
  {asset:"kios-sayur-buka",closedAsset:"kios-sayur-tutup",x:451,y:160,scale:.72},
  {asset:"lapak-anyaman",x:502,y:159,scale:.67},
  {asset:"peti-kayu",x:607,y:277,scale:.73},
  {asset:"peti-dagangan-sayur",x:593,y:275,scale:.82},
  {asset:"keranjang-buah",x:577,y:278,scale:.85},
  {asset:"lapak-anyaman",x:470,y:283,scale:.84},
  {asset:"peti-dagangan-sayur",x:448,y:284,scale:.76},
  {asset:"tong-dan-papan",x:497,y:281,scale:.77},
  {asset:"bangku-kayu",x:325,y:280,scale:.84},
  {asset:"kelompok-pot",x:348,y:280,scale:.62},
  {asset:"atelier-widi",x:579,y:160,scale:.8},
  {asset:"peti-dagangan-sayur",x:426,y:161,scale:.62},
  {asset:"keranjang-buah",x:473,y:161,scale:.58}
);
props.sungai.push(
  {asset:"kelompok-pot",x:22,y:183,scale:.49},{asset:"tong-dan-papan",x:20,y:235,scale:.55},
  {asset:"rumpun-tepian",x:39,y:284,scale:.64},{asset:"ilalang-kanal",x:35,y:300,scale:.55},
  {asset:"batu-kembar",x:43,y:104,scale:.65},{asset:"rumput-tinggi",x:15,y:125,scale:.54}
);
for(const location of Object.keys(props) as OutdoorLocation[])props[location].push(...sharedBorderProps(location));
// Quest-specific art is drawn only while its owner's request is active; see activeQuestProps().

export function plotTextureFrame(x:number,y:number,watered:boolean,stage:number) {
  return (watered?12:0)+(stage===0?6:3)+((x+2*y)%3);
}

export function outdoorObjects(location:OutdoorLocation,minutes:number,sluiceOpen=false): Placement[] {
  const scenery = props[location].map(p => p.asset==="inggit-sign" &&
    (minutes<INGGIT_WARUNG.opensAt || minutes>=INGGIT_WARUNG.closesAt) ? {...p,asset:"inggit-closed-sign"} : p.asset==="bendung-dua-pintu-tutup" && sluiceOpen ? {...p,asset:"bendung-dua-pintu-buka"} : p.closedAsset && (minutes<720 || minutes>=1140) ?
    {...p,asset:p.closedAsset} : p);
  if(location!=="field")return scenery;
  const tableX = (INGGIT_WARUNG.table.x + .5) * WORLD.tile;
  const tableY = (INGGIT_WARUNG.table.y + 1) * WORLD.tile - 2;
  const cups = (["ryan","widi"] as const).map((owner,index): Placement => {
    const phase = warungCoffee(minutes,owner);
    return {
      asset:`inggit-${owner}-coffee-${phase==="full"?"full":"empty"}`,
      x:tableX+(index===0?-7:7),y:tableY-13,displayW:12,displayH:10,
      groundY:tableY,visible:phase!=="cleared",
    };
  });
  return [...scenery,...cups];
}

function tile(ctx:CanvasRenderingContext2D, image:CanvasImageSource|undefined, id:number, x:number,y:number, size=20) {
  if (image) ctx.drawImage(image,(id%8)*size,Math.floor(id/8)*size,size,size,x,y,size,size);
}
function trace(ctx:CanvasRenderingContext2D,points:readonly Point[]) {
  ctx.beginPath();
  ctx.moveTo(...points[0]);
  for (const {control,end} of roadSegments(points)) {
    if(control)ctx.quadraticCurveTo(...control,...end);
    else ctx.lineTo(...end);
  }
}
const groundCache = new WeakMap<OutdoorImages,Partial<Record<OutdoorLocation,HTMLCanvasElement>>>();
export function drawModularGround(ctx:CanvasRenderingContext2D,location:OutdoorLocation,art:OutdoorImages) {
  let maps=groundCache.get(art);
  if(!maps){maps={};groundCache.set(art,maps);}
  if(!maps[location]){
    const surface=document.createElement("canvas");
    surface.width=WORLD.width*WORLD.tile;
    surface.height=WORLD.height*WORLD.tile;
    const brush=surface.getContext("2d");
    if(!brush)return;
    paintTerrain(brush,location,art);
    maps[location]=surface;
  }
  ctx.drawImage(maps[location]!,0,0);
}

function randomFrom(seed:number){
  return ()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
}
function meadow(ctx:CanvasRenderingContext2D,location:OutdoorLocation){
  const random=randomFrom({field:17,gang:51,pasar:35,sungai:90}[location]);
  // Groups of tiny blades follow each wash, rather than a repeated tile stamp.
  for(let patch=0;patch<1550;patch++){
    const x=Math.floor(random()*640), y=Math.floor(random()*320);
    const shade=random()>.52;
    ctx.fillStyle=shade?"rgba(75,105,54,.13)":"rgba(217,203,117,.15)";
    ctx.beginPath();ctx.ellipse(x,y,3+random()*10,2+random()*4,0,0,Math.PI*2);ctx.fill();
    for(let blade=0;blade<3;blade++){
      const bx=x+Math.floor(random()*12)-5, by=y+Math.floor(random()*5)-2;
      ctx.fillStyle=shade?"#859954":"#b4bd69";ctx.fillRect(bx,by,2,1);ctx.fillRect(bx+2,by-1,1,1);
      if(blade===2){ctx.fillStyle="#c2c978";ctx.fillRect(bx+3,by-2,1,1);}
    }
  }
}

function flagstones(ctx:CanvasRenderingContext2D){
  const random=randomFrom(87341);
  const palette=["#b9a788","#c4b294","#b3a28b","#c5b59d","#b8aa96","#b4ad98"];
  for(let y=110;y<315;y+=6){
    for(let x=30+Math.floor(random()*9);x<WORLD.width*WORLD.tile+14;){
      const w=8+Math.floor(random()*6), h=4+Math.floor(random()*2);
      ctx.fillStyle=palette[Math.floor(random()*palette.length)];
      ctx.fillRect(x+1,y,w-2,h+1);ctx.fillRect(x,y+1,w,h-1);
      ctx.fillStyle="#d1c3a7";ctx.fillRect(x+1,y,w-3,1);
      ctx.fillStyle="#988c79";ctx.fillRect(x+2,y+h,w-3,1);
      if(random()<.3){ctx.fillStyle="#ab9a7f";ctx.fillRect(x+2,y+2,2,1);}
      x+=w+1;
    }
  }
}

function layRiceBeds(ctx:CanvasRenderingContext2D){
  const random=randomFrom(971);
  // A narrow berm surrounds rows planted parallel to the irrigation ditch.
  for(const [x,y,width,height] of RIVER_RICE_BEDS){
    ctx.fillStyle="#8f9056";ctx.fillRect(x-3,y-2,width+6,height+6);
    ctx.fillStyle="#597e68";ctx.fillRect(x,y,width,height);
    ctx.fillStyle="#80af96";ctx.fillRect(x+1,y+2,width-2,height-4);
    for(let row=y+7;row<y+height-2;row+=7){
      for(let col=x+5;col<x+width-4;col+=6){
        const yy=row+Math.floor(random()*2);
        ctx.fillStyle="#9dc5a8";ctx.fillRect(col-2,yy+1,5,1);
        ctx.fillStyle="#557f3b";ctx.fillRect(col,yy-3,1,4);ctx.fillRect(col-1,yy-2,1,2);
        ctx.fillStyle="#bbce64";ctx.fillRect(col+1,yy-4,1,3);
      }
    }
  }
}

function paintRiver(ctx:CanvasRenderingContext2D,art:OutdoorImages) {
  const height=WORLD.height*WORLD.tile;
  const grain=randomFrom(228);
  const stones=art["tebing-batu"],reeds=art["ilalang-kanal"];
  // Each scanline shares its banks with movement, angling and the animated glints.
  for(let y=0;y<height;y++){
    const [l,r]=riverBanks(y);
    ctx.fillStyle="#8e936c";ctx.fillRect(l-3,y,r-l+6,1);
    ctx.fillStyle="#54978a";ctx.fillRect(l,y,r-l,1);
    ctx.fillStyle="#367c7c";ctx.fillRect(l+3,y,r-l-6,1);
    ctx.fillStyle="#2f6f76";ctx.fillRect(l+8,y,r-l-16,1);
    const cut=Math.round((r-l)*.28);
    ctx.fillStyle="#306c76";ctx.fillRect(l+cut,y,r-l-cut*2,1);
    for(let i=0;i<3;i++){
      const x=l+5+Math.floor(grain()*(r-l-17));
      ctx.fillStyle=i===1?"rgba(156,210,180,.36)":"rgba(31,99,113,.47)";
      ctx.fillRect(x,y,2+Math.floor(grain()*6),1);
    }
  }
  for(let y=37;y<height;y+=10){
    if((y>126 && y<171)||(y>245 && y<286))continue;
    const [l,r]=riverBanks(y);
    for(const x of [l,r]){
      if(x<0)continue;
      if(stones&&grain()>.3)ctx.drawImage(stones,x-6,y-5,13,9);
      if(reeds&&grain()>.66)ctx.drawImage(reeds,x-5,y-9,10,10);
    }
  }
  // The enclosed brine tanks keep the stocked marine fish apart from fresh river water.
  for(const [x,y,w,h] of [[67,198,38,20],[109,205,32,20]]){
    ctx.fillStyle="#4a6869";ctx.fillRect(x-2,y-2,w+4,h+4);
    ctx.fillStyle="#74ada6";ctx.fillRect(x,y,w,h);
    for(let yy=y+1;yy<y+h;yy+=4)for(let xx=x+(yy%3);xx<x+w-2;xx+=5){
      ctx.fillStyle="#56988e";ctx.fillRect(xx,yy,2,1);
    }
    ctx.fillStyle="#a27a4d";ctx.fillRect(x-2,y-2,w+4,2);ctx.fillRect(x-2,y+h,w+4,2);
    for(const xx of [x,x+w])for(const yy of [y,y+h]){
      ctx.fillStyle="#995d43";ctx.fillRect(xx-2,yy-1,5,4);
      ctx.fillStyle="#f1ba6a";ctx.fillRect(xx-1,yy-2,4,2);
    }
  }
  ctx.fillStyle="#875f41";ctx.fillRect(37,188,3,13);
  ctx.fillStyle="#e8cc95";ctx.fillRect(22,181,32,10);
  ctx.fillStyle="#694d3d";ctx.font="bold 6px monospace";ctx.fillText("PESISIR",25,188);
  ctx.fillStyle="#7d7154";ctx.fillRect(34,224,17,17);
  for(let x=35;x<51;x+=3){ctx.fillStyle="#b99160";ctx.fillRect(x,225,2,15);}
}

function paintTerrain(ctx:CanvasRenderingContext2D,location:OutdoorLocation,art:OutdoorImages){
  ctx.imageSmoothingEnabled=false;
  ctx.fillStyle="#a4bc70";
  ctx.fillRect(0,0,WORLD.width*WORLD.tile,WORLD.height*WORLD.tile);
  for(let y=0;y<WORLD.height;y++) for(let x=0;x<WORLD.width;x++){
    const n=(x*53+y*73+x*y*17)%64;
    const grass=n%5===0 ? (n<16?16+n:112+n-16) : (n<16?n:64+n-16);
    tile(ctx,art.ground,grass,x*20,y*20);
  }
  meadow(ctx,location);
  ctx.lineCap="round";
  ctx.lineJoin="round";
  for (const [width,points] of ROAD_PATHS[location]) {
    trace(ctx,points);
    ctx.lineWidth=width+5;ctx.strokeStyle="#a6a167";ctx.stroke();
  }
  for (const [width,points] of ROAD_PATHS[location]) {
    trace(ctx,points);ctx.lineWidth=width+2;ctx.strokeStyle="#baa276";ctx.stroke();
  }
  const pattern=art.road ? ctx.createPattern(roadTexture(art.road),"repeat") : null;
  ctx.strokeStyle=pattern ?? "#dbc28c";
  for (const [width,points] of ROAD_PATHS[location]) {
    trace(ctx,points);
    ctx.lineWidth=width;ctx.stroke();
  }
  if(location==="pasar"){
    const right=WORLD.width*WORLD.tile;
    ctx.save();
    ctx.beginPath();ctx.rect(40,120,right-40,180);ctx.clip();
    ctx.fillStyle="#aa9982";ctx.fillRect(40,120,right-40,180);
    flagstones(ctx);
    ctx.restore();
  }
  if (location==="field") drawFieldCanal(ctx,art);
  if (location==="sungai"){
    layRiceBeds(ctx);
    paintRiver(ctx,art);
    const bridge=art["jembatan-kayu"];
    if(bridge) ctx.drawImage(bridge,24,245,132,49);
    else {ctx.fillStyle="#95724b";ctx.fillRect(30,260,123,20);}
  }
  if(location==="field"){
    ctx.fillStyle="#8d7545";ctx.beginPath();ctx.roundRect(55,155,169,130,6);ctx.fill();
    ctx.fillStyle="#a58253";ctx.beginPath();ctx.roundRect(57,157,165,126,4);ctx.fill();
    ctx.fillStyle="#b48b61";ctx.fillRect(60,160,160,120);
    for(let y=8;y<=13;y++) for(let x=3;x<=10;x++) {
      const n=(x*17+y*9)%64;
      tile(ctx,art.ground,n<16?32+n:160+n-16,x*20,y*20);
    }
    for(let x=0;x<WORLD.width;x++) {
      if(x!==18 && x!==19) tile(ctx,art.fence,10,x*20,300);
    }
  }
  if (location==="field") {
    const counterApron=art["inggit-counter-apron"];
    if(counterApron)ctx.drawImage(counterApron,warungX-12,119,24,17);
  }
  if (location==="field") {
    for (const x of [homeX,shedX]) {
      ctx.fillStyle="rgba(88,76,49,.27)";
      ctx.beginPath();ctx.ellipse(x,98,21,4,0,0,Math.PI*2);ctx.fill();
      for(let row=0;row<3;row++){
        const y=99+row*7, left=x-8+(row%2)*2;
        ctx.fillStyle="#948469";ctx.fillRect(left,y,15,6);
        ctx.fillStyle=row%2?"#b8ab90":"#c3b69a";ctx.fillRect(left+1,y,13,4);
        ctx.fillStyle="#d2c5a5";ctx.fillRect(left+1,y,8,1);
      }
    }
  }
  ctx.fillStyle="rgba(57,66,36,.17)";
  for(const prop of props[location]){
    const image=art[prop.asset];
    if(!image || !("naturalWidth" in image))continue;
    const width=image.naturalWidth*(prop.scale??1);
    if(width<30)continue;
    ctx.beginPath();ctx.ellipse(prop.x+2,prop.y-2,width*.36,Math.max(2,width*.055),0,0,Math.PI*2);ctx.fill();
  }
  if(location==="field"){
    // Low nursery bench between the farmhouse and the tool shed.
    ctx.fillStyle="#6b4b33";ctx.fillRect(nurseryX-13,106,3,12);ctx.fillRect(nurseryX+8,106,3,12);
    ctx.fillStyle="#976c43";ctx.fillRect(nurseryX-15,101,28,8);
    ctx.fillStyle="#d6a66c";ctx.fillRect(nurseryX-15,101,28,2);
    for(const x of [nurseryX-12,nurseryX-4,nurseryX+4]){
      ctx.fillStyle="#aa6440";ctx.fillRect(x,98,6,5);
      ctx.fillStyle="#5c793b";ctx.fillRect(x+2,94,2,5);
      ctx.fillStyle="#a6be60";ctx.fillRect(x,94,3,2);ctx.fillRect(x+3,92,3,3);
    }
  }
  drawConnectedEdges(ctx,location);
  drawRouteClosures(ctx,location);
  drawSignposts(ctx,location);
}

function drawFieldCanal(ctx:CanvasRenderingContext2D, art:OutdoorImages) {
  ctx.save();
  ctx.beginPath();
  for(let y=0;y<320;y++)ctx.rect(0,y,fieldCanalBank(y),1);
  ctx.clip();
  const current=randomFrom(818);
  for(let y=0;y<320;y++){
    const bank=fieldCanalBank(y);
    for(let x=0;x<bank;x++){
      const depth=Math.min(1,(bank-x)/27);
      const light=2*Math.sin(y*.14+x*.24)+1.5*Math.sin(y*.27-x*.16);
      ctx.fillStyle="rgb("+Math.round(76-37*depth+light)+","+Math.round(136-36*depth+light)+","+Math.round(125-14*depth+light)+")";
      ctx.fillRect(x,y,1,1);
    }
  }
  for(let i=0;i<190;i++){
    const y=Math.floor(current()*320),x=Math.floor(current()*fieldCanalBank(y));
    ctx.fillStyle=i%4?"rgba(184,216,190,.19)":"rgba(34,81,84,.3)";
    ctx.fillRect(x,y,2+Math.floor(current()*5),1);
  }
  for(const y of [36,82,102,174,217,259,298]){
    const x=fieldCanalBank(y)-5;
    for(const [dx,dy] of [[0,0],[-4,2],[1,4]]){
      ctx.fillStyle="#567c52";ctx.fillRect(x+dx,y+dy,4,2);
      ctx.fillStyle="#a0b468";ctx.fillRect(x+dx,y+dy,2,1);
    }
    if(art["ilalang-kanal"])ctx.drawImage(art["ilalang-kanal"],x,y-9,12,14);
  }
  const ripple=art["riak-kanal"];
  if(ripple)for(const y of [29,67,115,161,205,243,284,314])ctx.drawImage(ripple,4,y,15,7);
  ctx.restore();
  for(let y=0;y<320;y++){
    const x=fieldCanalBank(y);
    ctx.fillStyle="#63897b";ctx.fillRect(x-1,y,2,1);
    ctx.fillStyle="#8a915f";ctx.fillRect(x+1,y,2,1);
  }
  for(let y=12;y<320;y+=17){
    const x=fieldCanalBank(y);
    const rock=art[y%2?"batu-kembar":"tebing-batu"];
    if(rock)ctx.drawImage(rock,x-5,y-4,10,7);
    const reeds=art["ilalang-kanal"];
    if(reeds && y%3===0)ctx.drawImage(reeds,x+1,y-8,8,10);
  }
}

/** Saluran dan keran digambar terpisah agar keadaan buka/tutup segera terlihat. */
export function drawIrrigationChannel(ctx:CanvasRenderingContext2D,open:boolean,faucet?:CanvasImageSource){
  ctx.save();ctx.lineJoin="round";ctx.lineCap="round";
  ctx.beginPath();ctx.moveTo(32,155);ctx.lineTo(55,155);ctx.lineTo(55,276);
  ctx.strokeStyle="#66583d";ctx.lineWidth=7;ctx.stroke();
  ctx.strokeStyle=open?"#6db9bd":"#9b8058";ctx.lineWidth=4;ctx.stroke();
  if(open){ctx.strokeStyle="#afe4da";ctx.lineWidth=1;ctx.setLineDash([3,6]);ctx.stroke();ctx.setLineDash([]);}
  ctx.fillStyle="#b18a5d";ctx.fillRect(50,155,10,9);
  ctx.fillStyle="#d2ac77";ctx.fillRect(51,156,8,2);ctx.fillRect(51,160,8,2);
  if(faucet)ctx.drawImage(faucet,40,152,20,20);
  else {ctx.fillStyle="#c4b89c";ctx.fillRect(46,157,3,8);ctx.fillRect(46,157,7,3);ctx.fillStyle=open?"#55b4bc":"#aa5139";ctx.fillRect(44,154,7,2);}
  ctx.restore();
}

const roadPatterns = new WeakMap<object,HTMLCanvasElement>();
function roadTexture(image:CanvasImageSource) {
  const cached=roadPatterns.get(image);
  if(cached)return cached;
  const canvas=document.createElement("canvas");
  canvas.width=96;canvas.height=96;
  const context=canvas.getContext("2d")!;
  context.imageSmoothingEnabled=false;
  for(let y=0;y<96;y+=32)for(let x=0;x<96;x+=32)context.drawImage(image,7*40+4,40+4,32,32,x,y,32,32);
  const rand=randomFrom(6204);
  for(let i=0;i<350;i++){
    const x=Math.floor(rand()*96),y=Math.floor(rand()*96),size=1+Math.floor(rand()*3);
    context.fillStyle=i%3?"rgba(147,107,65,.23)":"rgba(238,215,163,.55)";context.fillRect(x,y,size,1);
    if(size===3){context.fillStyle="#dfc798";context.fillRect(x,y-1,2,1);}
  }
  roadPatterns.set(image,canvas);
  return canvas;
}
