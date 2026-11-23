import type { QuestBook, FollowUpBook } from "./personal-quests";

import cast from "../../../game-assets/catalog/cast.json";
/** YZ Farm Life tool registry. Entries marked planned are design data, not playable mechanics. */
export const TOOL_CATALOG = {
  hoe: {name:"Cangkul",category:"Bertani",function:"Mengolah petak tanah kosong untuk ditanami.",target:"Petak tanah",status:"active"},
  water: {name:"Gembor Penyiram",category:"Bertani",function:"Menyiram tanaman yang belum disiram hari ini.",target:"Tanaman",status:"active"},
  axe: {name:"Kapak",category:"Kehutanan",function:"Menebang pohon kecil dan memotong batang menjadi kayu.",target:"Pohon/kayu",status:"planned"},
  sickle: {name:"Sabit",category:"Bertani",function:"Memotong rumput dan gulma secara manual.",target:"Rumput",status:"planned"},
  scythe: {name:"Pemotong Rumput",category:"Bertani",function:"Membersihkan rumpun rumput pada beberapa petak.",target:"Area rumput",status:"planned"},
  shovel: {name:"Sekop",category:"Bertani",function:"Menggali tanah, kompos, dan mencari barang terpendam.",target:"Tanah",status:"planned"},
  spade: {name:"Sekop Tanam",category:"Bertani",function:"Membuat lubang untuk bibit pohon dan tanaman besar.",target:"Lahan pohon",status:"planned"},
  pruning_shears: {name:"Gunting Pangkas",category:"Bertani",function:"Memangkas ranting dan tanaman kebun.",target:"Tanaman",status:"planned"},
  fertilizer_spreader: {name:"Penebar Pupuk",category:"Bertani",function:"Mengaplikasikan pupuk pada bedengan.",target:"Tanah/tanaman",status:"planned"},
  seed_spreader: {name:"Penabur Benih",category:"Bertani",function:"Mempercepat penanaman pada beberapa petak.",target:"Petak siap tanam",status:"planned"},
  pesticide_sprayer: {name:"Alat Semprot",category:"Bertani",function:"Mengaplikasikan larutan perlindungan tanaman sesuai aturan game.",target:"Tanaman",status:"planned"},
  soil_meter: {name:"Pengukur Tanah",category:"Bertani",function:"Mengecek kelembapan dan kesuburan tanah.",target:"Tanah",status:"planned"},
  irrigation_wrench: {name:"Kunci Irigasi",category:"Bertani",function:"Memperbaiki katup dan pipa irigasi.",target:"Jaringan air",status:"planned"},
  watering_hose: {name:"Selang Air",category:"Bertani",function:"Menyiram banyak tanaman dari sumber air terhubung.",target:"Tanaman",status:"planned"},
  wheelbarrow: {name:"Gerobak Dorong",category:"Transportasi",function:"Mengangkut bahan, kompos, dan panen dalam jumlah besar.",target:"Barang angkut",status:"planned"},
  harvesting_basket: {name:"Keranjang Panen",category:"Bertani",function:"Menambah kapasitas atau kualitas pengumpulan panen.",target:"Hasil panen",status:"planned"},
  pickaxe: {name:"Beliung Tambang",category:"Pertambangan",function:"Memecahkan batu dan menambang bijih.",target:"Batuan",status:"planned"},
  mining_hammer: {name:"Palu Tambang",category:"Pertambangan",function:"Menghancurkan bongkahan mineral keras.",target:"Batu besar",status:"planned"},
  mining_drill: {name:"Bor Tambang",category:"Pertambangan",function:"Mengebor lapisan batu pada area khusus.",target:"Dinding tambang",status:"planned"},
  lantern: {name:"Lentera",category:"Eksplorasi",function:"Menerangi area gelap termasuk gua.",target:"Lingkungan",status:"planned"},
  flashlight: {name:"Senter",category:"Eksplorasi",function:"Memberi cahaya terarah di malam hari.",target:"Lingkungan",status:"planned"},
  compass: {name:"Kompas",category:"Eksplorasi",function:"Membantu orientasi ketika menjelajah.",target:"Peta",status:"planned"},
  metal_detector: {name:"Detektor Logam",category:"Eksplorasi",function:"Mendeteksi benda logam terkubur.",target:"Tanah",status:"planned"},
  fishing_rod: {name:"Joran Pancing",category:"Memancing",function:"Memancing ikan laut di keramba pesisir dengan satu pelet per lemparan.",target:"Keramba di bantaran",status:"active"},
  fishing_net: {name:"Jaring Ikan",category:"Memancing",function:"Menangkap ikan kecil atau umpan.",target:"Air",status:"planned"},
  crab_trap: {name:"Perangkap Kepiting",category:"Memancing",function:"Memasang perangkap dan mengambil hasil setelah waktu tertentu.",target:"Tepi air",status:"planned"},
  fish_bucket: {name:"Ember Ikan",category:"Memancing",function:"Menyimpan sementara ikan hidup hasil tangkapan.",target:"Hasil tangkap",status:"planned"},
  milking_pail: {name:"Ember Perah Sapi",category:"Peternakan",function:"Memerah susu sapi secara manual.",target:"Sapi siap perah",status:"planned"},
  milking_machine: {name:"Mesin Perah Sapi",category:"Peternakan",function:"Memerah susu lebih cepat pada peternakan maju.",target:"Sapi siap perah",status:"planned"},
  wool_shears: {name:"Gunting Wol",category:"Peternakan",function:"Mencukur bulu domba tanpa melukai hewan.",target:"Domba",status:"planned"},
  animal_brush: {name:"Sikat Hewan",category:"Peternakan",function:"Membersihkan hewan untuk meningkatkan kenyamanan.",target:"Hewan ternak",status:"planned"},
  feed_scoop: {name:"Sekop Pakan",category:"Peternakan",function:"Mengambil dan memberikan pakan ternak.",target:"Tempat makan",status:"planned"},
  pitchfork: {name:"Garpu Jerami",category:"Peternakan",function:"Mengangkat jerami, kompos, dan alas kandang.",target:"Kandang",status:"planned"},
  egg_basket: {name:"Keranjang Telur",category:"Peternakan",function:"Mengumpulkan telur dengan aman.",target:"Kandang ayam",status:"planned"},
  veterinary_kit: {name:"Kotak Perawatan Hewan",category:"Peternakan",function:"Memberikan perawatan ringan sesuai sistem kesehatan hewan.",target:"Hewan ternak",status:"planned"},
  carpenter_hammer: {name:"Palu Tukang",category:"Konstruksi",function:"Merakit atau memperbaiki furnitur dan bangunan.",target:"Bangunan",status:"planned"},
  handsaw: {name:"Gergaji Tangan",category:"Konstruksi",function:"Memotong kayu untuk membuat furnitur.",target:"Kayu",status:"planned"},
  paintbrush: {name:"Kuas Cat",category:"Konstruksi",function:"Mengubah warna atau dekorasi furnitur.",target:"Furnitur",status:"planned"},
  cooking_knife: {name:"Pisau Dapur",category:"Memasak",function:"Mengolah bahan makanan di meja dapur.",target:"Meja dapur",status:"planned"},
  cooking_pan: {name:"Wajan",category:"Memasak",function:"Memasak resep tumis atau goreng di kompor.",target:"Kompor",status:"planned"},
  camera: {name:"Kamera",category:"Eksplorasi",function:"Memotret tempat menarik untuk album dan cerita.",target:"Objek/landmark",status:"planned"},
  binoculars: {name:"Teropong",category:"Eksplorasi",function:"Mengamati burung, hewan, dan pemandangan dari jauh.",target:"Lingkungan",status:"planned"},
  bug_net: {name:"Jaring Serangga",category:"Eksplorasi",function:"Menangkap serangga untuk koleksi atau penelitian.",target:"Serangga",status:"planned"},
  climbing_rope: {name:"Tali Panjat",category:"Eksplorasi",function:"Mencapai lokasi curam melalui titik pendakian aman.",target:"Titik pendakian",status:"planned"}
} as const;
export type ToolId = keyof typeof TOOL_CATALOG;
export type ToolCategory = (typeof TOOL_CATALOG)[ToolId]["category"];
export const TOOL_IDS = Object.keys(TOOL_CATALOG) as ToolId[];
export function toolName(id:ToolId|null):string {return id ? TOOL_CATALOG[id].name : "Tangan kosong";}
export const ACTIVE_FARM_TOOL_IDS:readonly ToolId[]=["hoe","water"];


export type Direction = "up" | "down" | "left" | "right";
export type FarmTool = "hoe" | "seed" | "water" | "harvest";
export const FARM_TOOLS: readonly FarmTool[] = ["hoe","seed","water","harvest"];
/** Legacy commands seed/harvest remain for save-independent model tests. */
export const TOOL_LABELS: Record<FarmTool,string> = {hoe:"Cangkul",seed:"Tanam",water:"Gembor Penyiram",harvest:"Panen"};
export const BAG_CAPACITIES=[0,3,5,8,12] as const;
export const BAG_UPGRADE_COSTS=[0,0,120,400,1000] as const;
export const BAG_UNLOCK_LEVELS=[0,1,2,4,7] as const;
export type BagTier=1|2|3|4;
export function bagCapacity(tier:BagTier){return BAG_CAPACITIES[tier];}
export function equipFarmTool(state:GameState,tool:ToolId):GameState {
  return !state.carriedTools.includes(tool)||state.equippedTool===tool ? state : {...state,equippedTool:tool};
}
export function cycleFarmTool(tool:ToolId|null,direction:1|-1,available:readonly ToolId[]= ["hoe","water"]):ToolId|null {
  if(!available.length) return null;
  const index=available.indexOf(tool as ToolId);
  return available[index<0 ? (direction===1?0:available.length-1) :
    (index+available.length+direction)%available.length] ?? null;
}
export function canManageTools(s:GameState):boolean{
  const front=facing(s.player);
  return s.location==="shed"&&front.x===SHED.rack.x&&front.y===SHED.rack.y;
}
export function transferTool(s:GameState,tool:ToolId,direction:"store"|"take"):{state:GameState;message:string}{
  if(!canManageTools(s)) return {state:s,message:"Buka rak gudang dahulu untuk memindahkan alat."};
  if(!TOOL_IDS.includes(tool)) return {state:s,message:"Alat tidak dikenal."};
  if(direction==="store"){
    if(!s.carriedTools.includes(tool)) return {state:s,message:"Alat tidak berada dalam tas."};
    const carrying=s.carriedTools.filter(id=>id!==tool);
    return {state:{...s,carriedTools:carrying,storedTools:[...s.storedTools,tool],
      equippedTool:s.equippedTool===tool ? (carrying[0]??null) : s.equippedTool},
      message:toolName(tool)+" disimpan di gudang."};
  }
  if(!s.storedTools.includes(tool)) return {state:s,message:"Alat belum tersedia di gudang."};
  if(s.carriedTools.length>=bagCapacity(s.bagTier)) return {state:s,message:"Tas penuh. Simpan alat atau upgrade tas."};
  return {state:{...s,carriedTools:[...s.carriedTools,tool],storedTools:s.storedTools.filter(id=>id!==tool),
    equippedTool:s.equippedTool??tool},message:toolName(tool)+" dimasukkan ke tas."};
}
export function upgradeToolBag(s:GameState):{state:GameState;message:string}{
  if(!canManageTools(s))return {state:s,message:"Tas hanya dapat ditingkatkan melalui gudang."};
  if(s.bagTier===4)return {state:s,message:"Tas sudah maksimal."};
  const next=(s.bagTier+1) as BagTier,cost=BAG_UPGRADE_COSTS[next];
  if(playerLevel(s)<BAG_UNLOCK_LEVELS[next])return {state:s,message:"Perlu level pemain "+BAG_UNLOCK_LEVELS[next]+"."};
  if(s.coins<cost)return {state:s,message:"Perlu "+cost+" G untuk upgrade tas."};
  return {state:{...s,bagTier:next,coins:s.coins-cost},
    message:"Tas Lv. "+next+" terbuka: "+bagCapacity(next)+" slot."};
}
export type Plot = { x: number; y: number; stage: number; watered: boolean; harvests?:number };
export const CUCUMBER_MAX_HARVESTS=4;
export type PhotoChoice = "nani" | "warung";
export type StoryFlags = {
  orderAccepted: boolean; orderDone: boolean; canalClue: boolean; sarisStory: boolean;
  photoSeen: boolean; photoChoice: PhotoChoice | null; completedDay: number | null;
};
export type Dialogue = {
  title: string; lines: string[]; npcId?: NpcId; emotion?: Emotion; emotions?: Emotion[]; sleep?: boolean; choices?: { id: SocialChoice; label: string; minLevel?: number }[]; photo?: boolean; choosePhoto?: boolean; shop?: boolean;
};
export const QUEST_PROPS = [
  {id:"water-marks",owner:"A03",location:"sungai",x:8,y:7,asset:"quest-water-marks",label:"Periksa batu ukur air"},
  {id:"nani-pots",owner:"C01",location:"gang",x:10,y:9,asset:"quest-nani-pots",label:"Periksa pot milik Nani"},
  {id:"ayu-seeds",owner:"A04",location:"pasar",x:9,y:9,asset:"quest-ayu-seeds",label:"Periksa wadah semai Ayu"},
  {id:"widi-ledger",owner:"C07",location:"pasar",x:29,y:8,asset:"quest-widi-ledger",label:"Periksa buku tangkapan Widi"},
  {id:"inggit-orders",owner:"C08",location:"pasar",x:15,y:10,asset:"quest-inggit-orders",label:"Periksa keranjang pesanan Inggit"},
] as const;
export type QuestPropId = (typeof QUEST_PROPS)[number]["id"];
export type QuestProp = (typeof QUEST_PROPS)[number];
export const questPropAt = (location:string,x:number,y:number):QuestProp|undefined =>
  QUEST_PROPS.find(p=>p.location===location&&p.x===x&&p.y===y);

export type GameState = {
  nurseryChecked?: boolean;
  personalQuests?: QuestBook;
  followUpQuests?: FollowUpBook;
  fishing: FishingInventory; sluiceOpen?: boolean; version: 1; day: number; minutes: number; walkingSteps?: number;
  player: { x: number; y: number; dir: Direction };
  plots: Plot[]; seeds: number; harvested: number; coins: number;
  equippedTool: ToolId|null; carriedTools: ToolId[]; storedTools: ToolId[]; bagTier:BagTier;
  phoneRead: boolean; story: StoryFlags; location: GameLocation; bonds: Record<NpcId, Bond>; stats: LifeStats;
};

export const FISH_MARKET = {
  bandeng: {name:"Bandeng",price:32,frame:0},
  kakap_putih: {name:"Kakap putih",price:65,frame:1},
  belanak: {name:"Belanak",price:24,frame:2},
} as const;
export type FishId=keyof typeof FISH_MARKET;
export const FISH_IDS=Object.keys(FISH_MARKET) as FishId[];
export type FishingInventory={
  bait:number;fish:Record<FishId,number>;line:FishId|null;
  caught:number;sold:number;seedPacks:number;cropsSold:number;
};
export function newFishingInventory():FishingInventory{
  return {bait:0,fish:{bandeng:0,kakap_putih:0,belanak:0},line:null,caught:0,sold:0,seedPacks:0,cropsSold:0};
}
function loadFishing(raw:unknown):FishingInventory|null{
  if(raw===undefined)return newFishingInventory();
  if(!raw || typeof raw!=="object")return null;
  const f=raw as FishingInventory;
  const count=(x:unknown)=>typeof x==="number" && Number.isSafeInteger(x) && x>=0 && x<=99999999;
  if(!count(f.bait) || !count(f.caught) || !count(f.sold) || !count(f.seedPacks) || !count(f.cropsSold) ||
     !f.fish || !FISH_IDS.every(id=>count(f.fish[id])) || !(f.line===null || FISH_IDS.includes(f.line)))return null;
  return {bait:f.bait,caught:f.caught,sold:f.sold,seedPacks:f.seedPacks,cropsSold:f.cropsSold,line:f.line,
    fish:{bandeng:f.fish.bandeng,kakap_putih:f.fish.kakap_putih,belanak:f.fish.belanak}};
}
export type MarketMerchant="A04"|"C07";
export function isMarketMerchant(id:NpcId):id is MarketMerchant{return id==="A04"||id==="C07";}
function closingTime(id:NpcId){return id==="A04"?1020:id==="C07"?1050:id==="C08"?1140:1080;}
export function atMarketCounter(s:GameState,merchant:MarketMerchant){
  if(s.location!=="pasar" || s.minutes>=closingTime(merchant))return false;
  const shopkeeper=npcWhere(s,merchant),front=facing(s.player);
  return shopkeeper.location==="pasar" && front.x===shopkeeper.x && front.y===shopkeeper.y;
}
export type MarketItem="seeds"|"bait"|"cucumber"|FishId;
export function marketTrade(s:GameState,merchant:MarketMerchant,item:MarketItem){
  const fail=(message:string)=>({state:s,message});
  if(!atMarketCounter(s,merchant))return fail("Temui pedagangnya di lapak Pasar Warga saat buka.");
  const f=s.fishing;
  if(merchant==="A04" && item==="seeds"){
    const bought=buySeeds(s);
    if(!bought || bought.seeds>99999999 || f.seedPacks>=99999999)return fail("Pembelian belum dapat dilakukan.");
    return {state:{...bought,fishing:{...f,seedPacks:f.seedPacks+1}},message:"Lima bibit timun masuk kantong."};
  }
  if(merchant==="C07" && item==="bait"){
    if(s.coins<15 || f.bait>99999994)return fail("Lima pelet berharga 15 G.");
    return {state:{...s,coins:s.coins-15,fishing:{...f,bait:f.bait+5}},message:"Lima pelet pancing masuk kantong."};
  }
  if(merchant==="A04" && item==="cucumber"){
    const qty=sellableCucumbers(s);
    if(!qty || s.coins+qty*25>99999999 || f.cropsSold+qty>99999999)return fail("Tidak ada timun lepas yang dapat dibeli.");
    return {state:{...sellCucumbers(s),fishing:{...f,cropsSold:f.cropsSold+qty}},message:qty+" timun terjual seharga "+qty*25+" G."};
  }
  if(merchant==="C07" && FISH_IDS.includes(item as FishId)){
    const id=item as FishId,qty=f.fish[id],price=qty*FISH_MARKET[id].price;
    if(!qty || s.coins+price>99999999 || f.sold+qty>99999999)return fail("Belum ada ikan jenis ini untuk dijual.");
    return {state:{...s,coins:s.coins+price,fishing:{...f,fish:{...f.fish,[id]:0},sold:f.sold+qty}},message:qty+" "+FISH_MARKET[id].name+" terjual seharga "+price+" G."};
  }
  return fail("Barang ini dijual di lapak lain.");
}
export function fishingWaterAt(s:GameState,x:number,y:number):boolean{
  return s.location==="sungai" && y>=9 && y<=14 && x>=0 && x<WORLD.width && isRiverWaterTile(x,y);
}
export function castRod(s:GameState,roll:number):GameState{
  const at=facing(s.player);
  if(s.equippedTool!=="fishing_rod" || !s.carriedTools.includes("fishing_rod") || !fishingWaterAt(s,at.x,at.y) ||
     s.fishing.line || s.fishing.bait<=0 || !Number.isFinite(roll) || roll<0 || roll>=1)return s;
  const species:FishId=roll<.22?"kakap_putih":roll<.61?"bandeng":"belanak";
  return {...addMinutes(s,2),fishing:{...s.fishing,bait:s.fishing.bait-1,line:species}};
}
export function reelFish(s:GameState):GameState{
  const at=facing(s.player),id=s.fishing.line;
  if(!id || s.equippedTool!=="fishing_rod" || !fishingWaterAt(s,at.x,at.y) ||
    s.fishing.fish[id]>=99999999 || s.fishing.caught>=99999999)return s;
  return {...s,fishing:{...s.fishing,line:null,caught:s.fishing.caught+1,
    fish:{...s.fishing.fish,[id]:s.fishing.fish[id]+1}}};
}

export const WORLD = { width: 32, height: 16, tile: 20 } as const;
// The approach tile is shared by the door, its return point, and the resident's evening route.
export const RESIDENT_HOMES = [
  { location:"rumah-nani", owner:"C01", name:"Nani", x:8, y:8, doorX:160,
    object:"Album dan melati", note:"Nani menandai tiap foto dengan bulan mekarnya melati. Bunga yang dipres di halaman terakhir masih harum." },
  { location:"rumah-ryan", owner:"A03", name:"Ryan", x:20, y:8, doorX:403,
    object:"Buku ukur air", note:"Garis biru menandai air normal, garis merah menandai luapan. Ryan menyisakan kolom di sebelahnya untuk kesaksian warga hilir." },
  { location:"rumah-inggit", owner:"C08", name:"Inggit", x:4, y:14, doorX:90,
    object:"Dapur percobaan", note:"Di samping ulekan ada tiga botol acar. Inggit membandingkan rasa cuka setelah timun beristirahat satu, dua, dan tiga malam." },
  { location:"rumah-ayu", owner:"A04", name:"Ayu", x:15, y:14, doorX:310,
    object:"Laci benih", note:"Benih terbungkus dalam amplop kertas. Ayu menulis asal bedeng dan tanggal panen supaya benih dari tanaman sehat bisa ditelusuri." },
  { location:"rumah-widi", owner:"C07", name:"Widi", x:26, y:8, doorX:530,
    object:"Meja perbaikan joran", note:"Kotak pelampung dipisah menurut arus. Di bawah meja Widi menyimpan gulungan senar bekas untuk diperbaiki." },
] as const;
export type ResidentHomeLocation = typeof RESIDENT_HOMES[number]["location"];
export const VISIT_ANYTIME_LEVEL=4;
export function isResidentHome(location:string):location is ResidentHomeLocation {
  return RESIDENT_HOMES.some(home=>home.location===location);
}
export type GameLocation = ResidentHomeLocation|"field"|"home"|"shed"|"warung"|"gang"|"pasar"|"sungai";
export type OutdoorLocation = "field"|"gang"|"pasar"|"sungai";
export function isOutdoorLocation(location: GameLocation): location is OutdoorLocation {
  return location==="field" || location==="gang" || location==="pasar" || location==="sungai";
}
export const AREAS:Record<OutdoorLocation,{name:string;description:string;landmark:string}> = {
  field:{name:"Kebun Yanzen",description:"Rumah, gudang, petak timun, dan saluran irigasi",landmark:"Jalan kampung ke timur"},
  gang:{name:"Gang Pasirluyu",description:"Rumah tetangga, bangku warga, dan jalan utama",landmark:"Jalan menuju pasar dan sungai"},
  pasar:{name:"Pasar Warga",description:"Warung Inggit, kios sayur, dan lapak warga",landmark:"Kembali ke gang di selatan"},
  sungai:{name:"Bantaran Sungai",description:"Jembatan kecil, pintu air, dan kebun hilir",landmark:"Kembali ke gang di utara"}
};
export type Signpost = {
  location: OutdoorLocation;
  x: number; y: number; symbol: string;
  title: string; message: string;
};

export const SIGNPOSTS: readonly Signpost[] = [
  {location:"field", x:WORLD.width-1, y:9, symbol:"→",
    title:"Plang Gang Pasirluyu",
    message:"Jalan di sebelah timur kebun menuju Gang Pasirluyu. Ikuti jalur tanah lalu berjalan ke kanan."},
  {location:"gang", x:10, y:4, symbol:"↑",
    title:"Plang Pasar Warga",
    message:"Jalur di utara gang membawa kamu ke Pasar Warga. Di sana ada lapak dan Warung Inggit."},
  {location:"pasar", x:10, y:4, symbol:"↓",
    title:"Plang Kembali ke Gang",
    message:"Ikuti jalan ke selatan untuk kembali ke Gang Pasirluyu, lalu pilih jalur menuju kebun atau sungai."},
  {location:"sungai", x:10, y:4, symbol:"↑",
    title:"Plang Gang Pasirluyu",
    message:"Jalan utama di utara bantaran sungai terhubung kembali ke Gang Pasirluyu."}
];

export function signpostAt(location: OutdoorLocation, x: number, y: number): Signpost | null {
  return SIGNPOSTS.find(s => s.location === location && s.x === x && s.y === y) ?? null;
}


/** Neighbouring outdoor scenes share a tile grid at their exits. */
export const PASIRLUYU_MASTER={
  width:WORLD.width*2,height:WORLD.height*3,chunkWidth:WORLD.width,chunkHeight:WORLD.height,tileSize:WORLD.tile
} as const;
export const PASIRLUYU_CHUNKS:Record<OutdoorLocation,{col:number;row:number;originX:number;originY:number}>={
  pasar:{col:1,row:0,originX:WORLD.width,originY:0},
  field:{col:0,row:1,originX:0,originY:WORLD.height},
  gang:{col:1,row:1,originX:WORLD.width,originY:WORLD.height},
  sungai:{col:1,row:2,originX:WORLD.width,originY:WORLD.height*2}
};
export function toWorldTile(location:OutdoorLocation,x:number,y:number){
  const c=PASIRLUYU_CHUNKS[location];return {x:c.originX+x,y:c.originY+y};
}
export const ROUTE_PORTALS=[
  {from:"field",direction:"right",start:10,end:11,to:"gang"},
  {from:"gang",direction:"left",start:10,end:11,to:"field"},
  {from:"gang",direction:"up",start:11,end:12,to:"pasar"},
  {from:"pasar",direction:"down",start:11,end:12,to:"gang"},
  {from:"gang",direction:"down",start:11,end:12,to:"sungai"},
  {from:"sungai",direction:"up",start:11,end:12,to:"gang"}
] as const;
export type RouteBarrier={
  id:string;location:OutdoorLocation;side:Direction;start:number;end:number;
  artwork:"jasmine_gate"|"fruit_cart"|"bamboo_bridge"|"goat_fence"|"festival";
  label:string;message:string;future:string;
};
export const ROUTE_BARRIERS:readonly RouteBarrier[]=[
  {id:"pasar_taman",location:"pasar",side:"up",start:11,end:12,artwork:"jasmine_gate",
    label:"Gerbang melati yang merambat",future:"Taman Kampung",
    message:"Sulur melati memenuhi gerbang taman. Nani ingin merawatnya sebelum jalur dibuka."},
  {id:"gang_timur",location:"gang",side:"right",start:10,end:11,artwork:"fruit_cart",
    label:"Gerobak buah Mang Ujang",future:"Gang Timur",
    message:"Gerobak penuh jeruk dan pisang sedang diparkir. Mang Ujang akan memindahkannya selepas pasar."},
  {id:"sungai_hilir",location:"sungai",side:"down",start:11,end:12,artwork:"bamboo_bridge",
    label:"Jembatan bambu yang diperbaiki",future:"Kebun Hilir",
    message:"Papan jembatan sedang diperbaiki. Ada pita peringatan dan bebek menunggu di tepi air."},
  {id:"field_selatan",location:"field",side:"down",start:18,end:19,artwork:"goat_fence",
    label:"Pagar kebun dan kambing tidur",future:"Kebun Selatan",
    message:"Dua kambing sedang tidur di depan pagar bambu. Pemilik kebun belum membuka jalan setapak."},
  {id:"pasar_timur",location:"pasar",side:"right",start:10,end:11,artwork:"festival",
    label:"Persiapan hiasan festival",future:"Lapangan Warga",
    message:"Umbul-umbul warna-warni baru dipasang. Jalan ke lapangan warga belum dibuka."}
];
export function edgeTile(direction:Direction,lane:number) {
  switch(direction){
    case "up":return {x:lane,y:0};
    case "down":return {x:lane,y:WORLD.height-1};
    case "left":return {x:0,y:lane};
    case "right":return {x:WORLD.width-1,y:lane};
  }
}
function onEdge(side:Direction,x:number,y:number,start:number,end:number) {
  const lane=side==="up"||side==="down"?x:y;
  const edge=edgeTile(side,lane);
  return lane>=start && lane<=end && edge.x===x && edge.y===y;
}
export function routeBarrierAt(location:OutdoorLocation,x:number,y:number):RouteBarrier|null{
  return ROUTE_BARRIERS.find(b=>b.location===location && onEdge(b.side,x,y,b.start,b.end))??null;
}
export function isMasterRoad(location:OutdoorLocation,x:number,y:number):boolean{
  if(location==="field")return (y>=10&&y<=11&&x>=17)||(y>=13&&x>=18&&x<=19);
  if(location==="gang")return (y>=10&&y<=11)||(x>=11&&x<=12);
  if(location==="pasar")return (x>=11&&x<=12)||(y>=10&&y<=11&&x>=17);
  return x>=11&&x<=12;
}
export function areaTitle(location:GameLocation):string {
  if(isResidentHome(location))return "Rumah "+RESIDENT_HOMES.find(h=>h.location===location)!.name;
  return location==="home"?"Rumah Yanzen":location==="shed"?"Gudang Peralatan":location==="warung"?"Warung Inggit":AREAS[location].name;
}
export function weatherForDay(day:number):"cerah"|"berawan"|"hujan"{
  const cycle=["cerah","cerah","berawan","cerah","hujan","cerah","berawan"] as const;
  return cycle[(day-1)%cycle.length]??"cerah";
}
export function timeGreeting(minutes:number):string{
  return minutes<660?"Selamat pagi":minutes<900?"Selamat siang":
    minutes<1080?"Selamat sore":"Selamat malam";
}
/** Adjacent chunks share the same world coordinates at their border tiles. */
export function mapExit(location:OutdoorLocation,x:number,y:number,dir:Direction):
  {location:OutdoorLocation;x:number;y:number;dir:Direction}|null {
  const p=ROUTE_PORTALS.find(p=>p.from===location && p.direction===dir && onEdge(dir,x,y,p.start,p.end));
  if(!p)return null;
  const opposite={left:"right",right:"left",up:"down",down:"up"} as const;
  const arrival=edgeTile(opposite[dir],dir==="left"||dir==="right"?y:x);
  return {location:p.to,...arrival,dir};
}
const placements = [
  { id: "A03", x: 13, y: 8, color: "#314961" },
  { id: "C01", x: 16, y: 11, color: "#cba7a0" },
  { id: "C08", x: 19, y: 7, color: "#bc7651" },
  { id: "A04", x: 6, y: 9, color: "#bd8d42" },
  { id: "C07", x: 27, y: 8, color: "#517f8a" },
] as const;

export const NPCS = placements.map(placement => {
  const profile = cast.characters.find(person => person.id === placement.id);
  if (!profile || profile.role !== "npc") throw new Error("Invalid NPC " + placement.id);
  return { ...placement, name: profile.name, role: profile.occupation };
});
export type NpcId = (typeof NPCS)[number]["id"];
export const NPC_SOULS:Record<NpcId,{
  home:string;work:string;desire:string;fear:string;habit:string;connection:string;
}> = {
  A04:{home:"Permukiman Nani",work:"Menjaga lapak benih",desire:"Setiap keluarga bisa menanam kembali benih sendiri",
    fear:"Benih lama tertukar dengan biji untuk masak",habit:"Menguji daya kecambah dengan kain basah sebelum membuka kios",connection:"Menitipkan contoh benih kepada Nani"},
  C07:{home:"Permukiman Nani",work:"Membeli ikan dan meracik pelet",desire:"Menjaga kualitas ikan dan membantu warga memancing dengan sabar",
    fear:"Pedagang membawa pulang keranjang kosong",habit:"Membasahi alas keranjang saat matahari mulai tinggi",connection:"Menukar catatan tinggi air dengan Ryan"},
  A03:{home:"Gang Pasirluyu",work:"Penjaga saluran air",desire:"Air kebun hulu dan hilir terbagi adil",
    fear:"Dituduh merugikan tetangga ketika pintu air rusak",habit:"Mengecek catatan tinggi air setiap siang",
    connection:"Menghormati Nani; kerap mengantar catatan ke warung Inggit"},
  C01:{home:"Gang Pasirluyu",work:"Perawat tanaman dan pengingat sejarah warga",
    desire:"Kisah masa lalu disimpan tanpa membuka luka keluarga",fear:"Foto keluarga dipakai tanpa izin",
    habit:"Merawat melati sebelum bertemu tetangga",connection:"Mempercayai Ryan menyimpan catatan pintu air"},
  C08:{home:"Pasirluyu",work:"Pemilik warung dan pedagang sayur",
    desire:"Warungnya menjadi tempat warga saling membantu",fear:"Bahan makanan terbuang dan dagangan tidak laku",
    habit:"Menyusun dagangan pagi, merapikan lapak sore",
    connection:"Menunggu panen Yanzen; memberi kabar tentang Ryan dan Nani"}
};
export type NpcPlacement = Omit<typeof NPCS[number], "x" | "y"> & OutdoorPoint & {activity:string; indoors?:boolean};
type OutdoorPoint = { location: OutdoorLocation; x: number; y: number };
const point = (location: OutdoorLocation, x: number, y: number): OutdoorPoint => ({ location, x, y });
const dailyStops = {
  A04: [point("pasar",6,9),point("pasar",6,9),point("gang",15,14)],
  C07: [point("pasar",27,8),point("pasar",27,8),point("gang",26,8)],
  A03: [point("field",13,8), point("sungai",8,8), point("gang",20,8)],
  C01: [point("field",16,11), point("gang",5,8), point("gang",8,8)],
  C08: [point("field",19,7), point("pasar",15,10), point("gang",4,14)],
} satisfies Record<NpcId, OutdoorPoint[]>;
const residentRoutes = new Map<string, OutdoorPoint[]>();
function residentRoute(from: OutdoorPoint, to: OutdoorPoint) {
  const key = (p: OutdoorPoint) => p.location + ":" + p.x + ":" + p.y;
  const origin = key(from), goal = key(to), id = origin + ">" + goal;
  const cached = residentRoutes.get(id);
  if (cached) return cached;
  const queue = [from];
  const previous = new Map<string, OutdoorPoint | null>([[origin, null]]);
  const directions = [["up",0,-1],["right",1,0],["down",0,1],["left",-1,0]] as const;
  for (let i = 0; i < queue.length; i++) {
    const current = queue[i], currentKey = key(current);
    if (currentKey === goal) {
      const route = [current];
      for (let last = previous.get(currentKey); last; last = previous.get(key(last))) route.push(last);
      route.reverse();
      residentRoutes.set(id, route);
      return route;
    }
    for (const [dir, dx, dy] of directions) {
      const next = mapExit(current.location,current.x,current.y,dir) ??
        point(current.location,current.x + dx,current.y + dy);
      if (previous.has(key(next)) || areaBlocked(next.location,next.x,next.y)) continue;
      previous.set(key(next),current);
      queue.push(next);
    }
  }
  return [from];
}
export function npcSchedule(s: Pick<GameState,"day"|"minutes">): NpcPlacement[] {
  return NPCS.map(npc => {
    const [morning, work, home] = dailyStops[npc.id];
    const close=closingTime(npc.id);
    const returning=s.minutes>=close;
    if(isMarketMerchant(npc.id) && !returning)return {...npc,...work,activity:npc.id==="A04"?"Menjaga lapak benih":"Melayani nelayan di lapak ikan"};
    const departed = s.minutes >= 720;
    if (!departed) return {...npc,...morning,activity:"Beraktivitas di kebun"};
    const start = returning ? close : 720;
    const route = returning ? residentRoute(work,home) : residentRoute(morning,work);
    const index = Math.min(route.length-1,Math.floor(s.minutes-start));
    const indoors = returning && index === route.length-1 && s.minutes > start + index;
    const activity = indoors ? "Beristirahat di rumah" : returning ? "Berjalan pulang" :
      index < route.length-1 ? "Berjalan ke tempat kerja" :
      npc.id === "A03" ? "Mengukur debit sungai" : npc.id === "C01" ?
        "Menyapa tetangga di depan rumah" : "Menjaga lapak pasar";
    return {...npc,...route[index],activity,indoors};
  });
}
export function npcHere(s:GameState):NpcPlacement[]{
  if(isResidentHome(s.location)){
    const home=RESIDENT_HOMES.find(h=>h.location===s.location)!;
    const owner=npcSchedule(s).find(n=>n.id===home.owner);
    return owner?.indoors ? [{...owner,x:13,y:9,activity:"Bersantai di rumah"}] : [];
  }
  if (s.location === "warung" && warungOpen(s)) {
    const inggit = npcWhere(s,"C08");
    return [{...inggit,x:10,y:7,activity:"Melayani pembeli"}];
  }
  return npcSchedule(s).filter(n=>n.location===s.location && !n.indoors);
}
export function npcWhere(s:GameState,id:NpcId):NpcPlacement{
  return npcSchedule(s).find(n=>n.id===id)!;
}
export function npcAmbient(s:GameState,id:NpcId):string{
  const bond=s.bonds[id],place=npcWhere(s,id),soul=NPC_SOULS[id];
  if(isMarketMerchant(id)){
    if(place.indoors)return "Hari ini lapaknya sudah tutup. Besok pagi kita bertemu lagi di pasar.";
    if(place.activity==="Berjalan pulang")return "Mari berjalan bersama sampai gang. Gerobaknya sudah kutitipkan pada penjaga pasar.";
    return id==="A04"?"Ambil satu timun, belah, lihat bijinya. Yang sudah tua keras di ujung kuku. Yang masih lunak enak dibuat acar.":"Punggung bandeng berkilat seperti sendok. Kalau masih sulit mengenalinya, lihat ekor yang bercabang itu.";
  }
  const yesterday=bond.lastTalkDay>0 && bond.lastTalkDay<s.day;
  if(bond.points>=300 && bond.lastChoice==="confide")
    return "Terima kasih sudah mendengarkan sesuatu yang sulit kuceritakan kepada orang lain.";
  if(yesterday && bond.lastChoice==="dismiss")
    return id==="A03"?"Kemarin kamu terburu-buru. Aku tetap mencatat air untuk kebunmu.":
      id==="C01"?"Kemarin kita belum sempat berbincang. Tidak apa, cerita tak harus buru-buru.":
      "Kemarin kamu sibuk. Kalau perlu duduk sebentar, warungku selalu terbuka.";
  if(yesterday && bond.lastChoice==="help")
    return id==="A03"?"Aku masih ingat tawaran bantuanmu. Pintu air terasa lebih mudah dijaga.":
      id==="C01"?"Bantuan kecilmu membuat tanaman melatiku lebih terawat.":
      "Terima kasih sudah membantu. Pagi ini aku menyiapkan sayur lebih banyak.";
  if(weatherForDay(s.day)==="hujan")
    return id==="A03"?"Air sungai naik setelah hujan. Aku harus memeriksa pintu air.":
      id==="C01"?"Saat hujan begini, melati perlu tempat yang tidak tergenang.":
      "Warung sepi saat hujan. Aku memasak sesuatu yang hangat untuk warga.";
  if(bond.points>=200 && bond.mood==="worried")
    return id==="A03"?"Catatan saluran itu belum lengkap. Nanti kalau sudah kupastikan, kuceritakan.":
      id==="C01"?"Ada bagian foto yang belum ingin kubuka. Terima kasih sudah menunggu.":
        "Aku sedang memikirkan harga bahan besok. Kalau sudah jelas, baru kubicarakan.";
  if(bond.points>=100 && bond.lastTalkDay===s.day)
    return id==="A03"?"Catatan hari ini sudah kita cocokkan. Besok kita lihat lagi.":
      id==="C01"?"Melatiku sudah kusiram. Kamu boleh mampir lagi besok.":
        "Masih ada yang harus kusiapkan untuk warung. Nanti kita sambung, ya.";
  if(s.minutes>=1080)return id==="A03"?"Sebentar lagi gelap. Aku mesti menyelesaikan catatan air sebelum pulang.":
    id==="C01"?"Sore ini bunga melatiku sudah menutup. Besok pagi kita lihat lagi.":
      "Warung hampir tutup. Aku mau merapikan panci dulu sebelum pulang.";
  const lines=[
    id==="A03"?"Kalau air hulu cukup, kebun hilir juga harus kebagian.":
      id==="C01"?"Melati yang ini belum berbunga. Besok pagi aku mau lihat daunnya lagi.":
        "Kalau pasar mulai sepi, para pedagang suka duduk sebentar di warungku.",
    id==="A03"?"Aku menyimpan buku kecil untuk mencatat perubahan aliran air.":
      id==="C01"?"Kadang aku ingat satu nama lama ketika menyiram tanaman.":
        "Aku tahu siapa suka acar manis dan siapa suka pedas.",
    id==="A03"?"Pintu air tua itu punya bekas goresan yang belum kupahami.":
      id==="C01"?"Beberapa foto sebaiknya dibuka hanya saat pemiliknya siap.":
        "Saat warung ramai, aku suka mendengar cerita warga satu per satu."
  ];
  return lines[(s.day-1)%lines.length];
}

export const DEFAULT_STORY: StoryFlags = {
  orderAccepted: false, orderDone: false, canalClue: false, sarisStory: false,
  photoSeen: false, photoChoice: null, completedDay: null,
};
export function newGame(): GameState {
  return { version: 1, location: "field", bonds: newBonds(), stats: newStats(), day: 1, minutes: 6 * 60 + 20,
    player: { x: 12, y: 10, dir: "left" }, plots: [], seeds: 12,
    equippedTool:"hoe",carriedTools:["hoe","water"],storedTools:["axe","sickle","fishing_rod","pickaxe"],bagTier:1,
    harvested: 0, fishing:newFishingInventory(), coins: 280, phoneRead: false, story: { ...DEFAULT_STORY } };
}
export function isFarm(x: number, y: number): boolean {
  return x >= 3 && x <= 10 && y >= 8 && y <= 13;
}
/** The persisted plot array (not scenery art) is the source of farm truth. */
export const FARM_PLOT_COUNT=48;
export function farmOverview(s:GameState){
  const ready=s.plots.filter(p=>p.stage===3).length;
  const tilled=s.plots.filter(p=>p.stage===-1).length;
  const watered=s.plots.filter(p=>p.stage>=0&&p.stage<3&&p.watered).length;
  const needsWater=s.plots.filter(p=>p.stage>=0&&p.stage<3&&!p.watered).length;
  const empty=FARM_PLOT_COUNT-s.plots.length;
  let next:string;
  if(ready)next="Ada timun matang: hadap tanaman lalu tekan Aksi untuk panen.";
  else if(needsWater&&!s.carriedTools.includes("water"))next="Ambil gembor dari gudang agar tanaman bisa disiram.";
  else if(needsWater)next="Pilih Gembor Penyiram lalu siram tanaman yang belum basah.";
  else if(tilled&&!s.seeds)next="Bibit habis! Beli bibit dari Ayu di pasar → Pesan.";
  else if(tilled)next="Tanah siap tanam: hadapkan karakter ke petak dan tekan Aksi.";
  else if(watered)next="Tanaman sudah disiram. Tidur di kasur rumah untuk berganti hari dan menumbuhkannya.";
  else if(empty&&!s.carriedTools.includes("hoe"))next="Ambil cangkul dari gudang untuk membuka lahan.";
  else if(empty)next="Petak masih kosong: pilih Cangkul lalu tekan Aksi di depan petak.";
  else next="Seluruh petak sudah diproses. Lanjutkan aktivitas atau berganti hari.";
  return {ready,tilled,watered,needsWater,empty,next};
}
// Ground-level footprints include the wall or trunk; roof and foliage may overhang walkable ground.
type TileFootprint = readonly [left:number,top:number,right:number,bottom:number];
export const RIVER_RICE_BEDS = [
  [409,80,130,54],[413,227,91,54],[506,249,95,36],
] as const;
const outdoorFootprints: Record<OutdoorLocation,readonly TileFootprint[]> = {
  field:[
    [2,2,5,4],[8,2,10,4],[17,2,21,4], // house, shed and shop
    [12,4,12,4],[19,13,21,14], // banana trunk and coop
    [26,6,26,6],[29,6,29,6],[27,9,27,9],[30,9,30,9],
  ],
  gang:[[6,5,9,7],[18,5,21,7],[2,7,3,7],[5,7,5,7],[2,11,6,13],[13,11,17,13],[24,5,28,7],[29,7,30,7]],
  pasar:[[4,6,8,8],[16,6,20,8],[2,12,5,13],[21,7,28,7],[22,13,24,13],[29,13,30,13],[16,13,17,13]],
  sungai:[[17,7,19,7]],
};
export function blocked(x:number,y:number) {
  return areaBlocked("field",x,y);
}
// Pixel cross-sections of one channel. Tile collision and fishing sample the same
// banks that the renderer paints. The upper bend enters from the west.
const CHANNEL_SECTIONS = [
  [0,-165,-50],[23,-85,-5],[49,-18,68],[80,31,147],[109,53,176],
  [133,36,151],[148,29,140],[162,29,140],[191,46,154],[218,54,168],
  [242,47,150],[270,39,140],[293,45,122],[320,20,108],
] as const;
export function riverBanks(y:number):readonly [number,number] {
  let index=1;
  while(index<CHANNEL_SECTIONS.length-1 && y>CHANNEL_SECTIONS[index][0])index++;
  const [from,l0,r0]=CHANNEL_SECTIONS[index-1], [to,l1,r1]=CHANNEL_SECTIONS[index];
  const t=Math.max(0,Math.min(1,(y-from)/(to-from)));
  const blend=t*t*(3-2*t);
  return [Math.round(l0+(l1-l0)*blend),Math.round(r0+(r1-r0)*blend)];
}
export function isRiverWaterTile(x:number,y:number):boolean {
  if(x<0 || x>=WORLD.width || y<0 || y>=WORLD.height || y===13)return false;
  const [left,right]=riverBanks((y+.5)*WORLD.tile);
  const px=(x+.5)*WORLD.tile;
  return px>=left && px<right;
}
export function areaBlocked(location:GameLocation,x:number,y:number):boolean{
  if(location==="warung") return x<8 || x>16 || y<6 || y>13 ||
    (y===6 && x!==10) || (y===7 && x>=12);
  if(isResidentHome(location))return x<8 || x>16 || y<8 || y>13;
  if(!isOutdoorLocation(location))return homeBlocked(x,y);
  if(x<0||x>=WORLD.width||y<0||y>=WORLD.height)return true;
  if(location==="sungai" && isRiverWaterTile(x,y))return true;
  if(questPropAt(location,x,y))return true;
  if(x===0 || x===WORLD.width-1 || y===0 || y===WORLD.height-1){
    return !ROUTE_PORTALS.some(p=>p.from===location && onEdge(p.direction,x,y,p.start,p.end));
  }
  if(location==="sungai" && RIVER_RICE_BEDS.some(([left,top,w,h])=>{
    const px=(x+.5)*WORLD.tile, py=(y+.5)*WORLD.tile;
    return px>=left && px<left+w && py>=top && py<top+h;
  }))return true;
  if(location==="field" && x<=1 && (y<5||y>=9))return true;
  if(location==="field" && x===6 && y===5)return true;
  return !!signpostAt(location,x,y) || outdoorFootprints[location].some(
    ([left,top,right,bottom])=>x>=left && x<=right && y>=top && y<=bottom
  );
}
export function facing(p: GameState["player"]) {
  return { x: p.x + (p.dir === "left" ? -1 : p.dir === "right" ? 1 : 0),
           y: p.y + (p.dir === "up" ? -1 : p.dir === "down" ? 1 : 0) };
}
export function movePlayer(s: GameState, dir: Direction): GameState {
  const crossing=isOutdoorLocation(s.location)?mapExit(s.location,s.player.x,s.player.y,dir):null;
  const at=crossing??facing({...s.player,dir});
  const location=crossing?.location??s.location;
  const steps=(s.walkingSteps??0)+(isOutdoorLocation(s.location)?1:0);
  const minutes=Math.min(1320,s.minutes+Math.floor(steps/4));
  const occupied=(n:NpcPlacement)=>n.x===at.x && n.y===at.y;
  if(areaBlocked(location,at.x,at.y) || npcHere({...s,location}).some(occupied) ||
      (minutes!==s.minutes && npcHere({...s,location,minutes}).some(occupied))){
    return {...s,player:{...s.player,dir}};
  }
  return {...s,location,minutes,walkingSteps:steps%4,player:{x:at.x,y:at.y,dir}};
}
function addMinutes(s: GameState, amount = 3): GameState {
  return { ...s, stats: { ...s.stats, xp: Math.min(99999999,s.stats.xp + 5), actions: Math.min(99999999,s.stats.actions + 1) }, minutes: Math.min(22 * 60, s.minutes + amount) };
}
export function nextDay(s: GameState): GameState {
  if (!canSleep(s)) return s;
  return { ...s, stats: { ...s.stats, nights: Math.min(99999999,s.stats.nights + 1) }, day: s.day + 1, walkingSteps:0, minutes: 6 * 60 + 20,
    plots: s.plots.map(p => ({ ...p,
      stage: p.watered && p.stage >= 0 ? Math.min(3, p.stage + 1) : p.stage,
      watered: p.stage>=0 && p.stage<3 && weatherForDay(s.day+1)==="hujan" })) };
}
export function applyFarmTool(s: GameState, tool: FarmTool): { state: GameState; message: string } {
  if(s.location!=="field")return {state:s,message:"Alat tani hanya digunakan di kebun."};
  if((tool==="hoe"||tool==="water") && !s.carriedTools.includes(tool))
    return {state:s,message:"Alat harus dibawa dari gudang sebelum digunakan."};
  const at = facing(s.player);
  if (!isFarm(at.x, at.y)) return { state: s, message: "Arahkan karakter ke petak kebun lalu gunakan alat." };
  const index = s.plots.findIndex(p => p.x === at.x && p.y === at.y);
  const p = index === -1 ? null : s.plots[index];
  if (tool === "hoe") {
    if (p) return { state: s, message: "Petak ini sudah siap atau sudah ditanami." };
    return { state: addMinutes({ ...s, plots: [...s.plots, { ...at, stage: -1, watered: false }] }),
      message: "Tanah dicangkul. Sekarang tanam bibit timun!" };
  }
  if (tool === "seed") {
    if (!p || p.stage !== -1) return { state: s, message: "Cangkul petak kosong terlebih dahulu." };
    if (s.seeds < 1) return { state: s, message: "Bibit habis. Temui Inggit untuk membeli bibit." };
    return { state: addMinutes({ ...s, seeds: s.seeds - 1,
      plots: s.plots.map(q => q === p ? { ...q, stage: 0 } : q) }),
      message: "Bibit timun ditanam. Siram dan istirahat agar tumbuh." };
  }
  if (tool === "water") {
    if (!p || p.stage < 0) return { state: s, message: "Belum ada tanaman yang bisa disiram." };
    if (p.watered) return { state: s, message: "Tanaman sudah disiram hari ini." };
    return { state: addMinutes({ ...s,
      plots: s.plots.map(q => q === p ? { ...q, watered: true } : q) }),
      message: "Tanaman disiram! Pertumbuhan terjadi setelah tidur." };
  }
  if (!p || p.stage < 3) return { state: s, message: "Timun belum siap dipanen." };
  const cycles=(p.harvests??0)+1, exhausted=cycles>=CUCUMBER_MAX_HARVESTS;
  return { state:addMinutes({ ...s,
    stats:{...s.stats,harvests:Math.min(99999999,s.stats.harvests+1)},
    harvested:s.harvested+1,
    plots:exhausted?s.plots.filter(q=>q!==p):
      s.plots.map(q=>q===p?{...q,stage:1,watered:false,harvests:cycles}:q) }),
    message:exhausted
      ?"Panen berhasil! +1 timun. Tanaman sudah selesai masa produktifnya; petak bisa dicangkul lagi."
      :"Panen berhasil! +1 timun. Tanaman tetap hidup dan bisa dipanen lagi setelah dirawat." };
}
export function acceptOrder(s: GameState): GameState {
  return { ...s, phoneRead: true, story: { ...s.story, orderAccepted: true } };
}
function storyDialogue(s: GameState, npc: NpcId): { state: GameState } & Dialogue {
  if(npc==="A04")return {state:s,title:"Ayu · Benih dalam lipatan kertas",lines:[
    "Ayu menghitung biji di atas kertas minyak. Ada tiga lipatan kecil bertanda arang di meja.",
    "Nani yang mengajariku tanda itu. Satu garis untuk tanggal simpan, dua untuk benih yang sudah kucoba semai. Aku tak mau orang baru menunggu seminggu untuk benih yang kosong.",
    "Satu bungkus berisi lima bibit timun. Kalau hasilmu berlebih, bawa lagi ke sini. Timun yang sudah dijanjikan kepada Inggit kita sisihkan dahulu.",
    "Kadang aku menyelipkan catatan dari kebun asalnya. Orang suka menanyakan siapa penanam benih yang akhirnya tumbuh di pekarangan mereka."
  ]};
  if(npc==="C07")return {state:s,title:"Widi · Es di bawah keranjang",lines:[
    "Widi sedang memeriksa ujung senar. Kotak umpan terbuka di samping timbangan ikan.",
    "Ryan yang lebih hafal aliran sungai. Aku biasanya melihat pelampung dan arah arus sebelum memilih tempat untuk melempar.",
    "Ambil joran di gudang, lalu mampir untuk membeli umpan. Berdirilah dekat air dan lempar. Tunggu pelampung benar-benar turun sebelum menarik.",
    "Ada bandeng, belanak, dan kakap putih di lapak kiriman. Kalau nanti dapat ikan dari sungai, kita catat jenisnya juga."
  ]};
  if (npc === "A03") {
    if (!s.story.orderDone) return { state: s, title: "Ryan · Pinggir Kebun", lines: [
      "Inggit sedang menunggu empat timun untuk acar. Selesaikan dulu pesananmu; setelah itu kita cocokkan tanda di pintu air."] };
    return { state: { ...s, story: { ...s.story, canalClue: true } }, title: "Ryan · Dua Garis di Pintu Air", lines:
      s.story.photoChoice ? ["Catatanmu sudah kusimpan. Nama Cimincrang di foto itu akan jadi petunjuk perjalanan berikutnya. Untuk sekarang kita rawat kebun ini dahulu."] : [
        "Di batu pintu air ada dua garis. Aku hanya pernah mencatat yang atas. Mengapa foto lama Nani menunjukkan keduanya?",
        "Temui Nani di gang sebelah timur kebun. Biar beliau sendiri yang membuka lipatan fotonya."] };
  }
  if (npc === "C01") {
    if (!s.story.orderDone || !s.story.canalClue) return { state: s, title: "Nani · Gang Kampung", lines: [
      s.story.orderDone ? "Ryan ingin menunjukkan sesuatu di saluran. Dengarkan dulu catatannya, lalu mampir lagi kepadaku." :
        "Inggit menyisihkan satu meja hari ini. Empat timun kecil dari kebunmu akan berarti banyak baginya."] };
    if (s.story.photoChoice) return { state: s, title: "Nani · Foto yang Kini Punya Tempat", photo: true, lines: [
      s.story.photoChoice === "nani" ? "Foto aslinya aman di amplopku. Aku mulai menulis nama orang-orang di dalamnya. Bila kelak siap, kisahnya akan kuceritakan dengan suaraku sendiri." :
        "Salinannya sudah di warung. Ada yang mengenali lipatan bungkus benih pada gambar itu. Nama baru mulai muncul di belakangnya.",
      "Cimincrang. Itu nama yang tertulis di balik foto. Perjalanan ke sana belum dibuka; kamu boleh kembali berkebun kapan saja."] };
    return { state: { ...s, story: { ...s.story, sarisStory: true, photoSeen: true } },
      title: "Nani · Foto yang Dilipat ke Dalam", photo: true, choosePhoto: true, lines: [
        "Nani membuka foto pintu air. Ada dua garis pada batu, dan tulisan Cimincrang di belakangnya. Ia menahan lipatan itu dengan kedua tangan.",
        "Ibu pernah mengalihkan air ke kebun tetangga. Aku belum tahu bagaimana warga hilir mengingatnya. Boleh kita tentukan bersama tempat untuk foto ini?",
        "Keduanya menjaga kisah yang sama: foto asli bersama Nani, atau salinan di warung agar warga dapat menambahkan nama. Kamu boleh memutuskan nanti."] };
  }
  if (s.story.orderAccepted && !s.story.orderDone && s.harvested >= 4) return {
    state: { ...s, harvested: s.harvested - 4, coins: s.coins + 160,
      story: { ...s.story, orderDone: true } }, title: "Inggit · Empat Timun untuk Satu Meja", shop: true,
    lines: ["Empat timun kecil, pas untuk acar. Yang besar kebanyakan air. Ini 160 G; terima kasih sudah mengantar.",
      "Inggit membalik piring kelima di meja. Di sampingnya ada cangkir retak dengan dua goresan.",
      "Ryan juga menemukan garis seperti ini di pintu air. Kalau sempat, temui dia di timur kebun."] };
  return { state: s, title: "Inggit · Warung Pasar", shop: true, lines: [
    s.story.photoChoice === "warung" ? "Salinan foto Nani sudah di meja warung. Warga boleh menambahkan nama di baliknya; foto asli tetap bersama Nani." :
    s.story.photoChoice === "nani" ? "Foto asli tetap bersama Nani. Kalau beliau siap bercerita, meja ini selalu punya tempat untuknya." :
    s.story.orderDone ? "Pesananmu sudah lunas. Ryan menunggu di pinggir kebun untuk membandingkan tanda pintu air." :
    s.story.orderAccepted ? "Aku menunggu empat timun segar. Kalau sudah dipanen, antarkan ke sini, ya." :
    "Hai, tetangga baru! Cek pesan di YZ Phone. Aku ada pesanan kecil untuk kebunmu.",
    s.seeds <= 2 && s.coins >= 40 ? "Bibit hampir habis? Cari Ayu di depan kios sayur Pasar Warga." :
      "Pasar paling ramai menjelang siang. Banyak cerita yang bisa kamu dengar di sini." ] };
}
export function choosePhoto(s: GameState, choice: PhotoChoice): GameState {
  if (!s.story.orderDone || !s.story.canalClue || !s.story.photoSeen || s.story.photoChoice ||
      (choice !== "nani" && choice !== "warung")) return s;
  return { ...s, story: { ...s.story, photoChoice: choice, completedDay: s.day } };
}
export function sellableCucumbers(s: GameState): number {
  return Math.max(0, s.harvested - (s.story.orderAccepted && !s.story.orderDone ? 4 : 0));
}
export function sellCucumbers(s: GameState): GameState {
  const quantity = sellableCucumbers(s);
  return { ...s, harvested: s.harvested - quantity, coins: s.coins + quantity * 25 };
}
export function chapterJournal(s: GameState) {
  const stage = !s.story.orderAccepted ? 0 : !s.story.orderDone ? 1 : !s.story.canalClue ? 2 : !s.story.photoSeen ? 3 : !s.story.photoChoice ? 4 : 5;
  const objectives = ["Buka Pesan di YZ Phone dan terima pesanan Inggit.",
    `Tanam, siram, dan panen empat timun (${Math.min(4, s.harvested)}/4), lalu temui Inggit di warung timur laut.`,
    "Temui Ryan di pinggir timur kebun. Hadapkan Yanzen kepadanya lalu tekan Aksi.",
    "Temui Nani di gang timur kebun untuk melihat foto pintu air.",
    "Kembali kepada Nani saat siap menentukan tempat foto. Pilihan boleh ditunda.",
    "Bab 1 selesai. Rawat kebun, jual panen di warung, atau kunjungi kembali warga. Cimincrang belum dibuka."];
  return { stage, objective: objectives[stage], entries: [
    { title: "Empat timun untuk Inggit", done: s.story.orderDone },
    { title: "Dua garis bersama Ryan", done: s.story.canalClue },
    { title: "Foto lama Nani", done: s.story.photoSeen },
    { title: "Tempat untuk sebuah kenangan", done: s.story.photoChoice !== null },
  ] };
}
export function buySeeds(s: GameState): GameState | null {
  if (s.coins < 40) return null;
  return { ...s, coins: s.coins - 40, seeds: s.seeds + 5 };
}
export function safeLoad(value: unknown): GameState | null {
  const record = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && !Array.isArray(v);
  const integer = (v: unknown, min: number, max: number): v is number =>
    typeof v === "number" && Number.isInteger(v) && v >= min && v <= max;
  if (!record(value) || value.version !== 1 || !record(value.player) || !record(value.story)) return null;
  const personalQuests:QuestBook={};
  if(value.personalQuests!==undefined){
    if(!record(value.personalQuests))return null;
    for(const [id,q] of Object.entries(value.personalQuests)){
      const owner=NPCS.find(n=>n.id===id);
      if(!owner || !record(q) || !integer(q.phase,1,4) || !integer(q.day,1,100000) ||
        !integer(q.baseline,0,99999999) || typeof value.day!=="number" || q.day>value.day)return null;
      personalQuests[owner.id]={phase:q.phase as 1|2|3|4,day:q.day,baseline:q.baseline};
    }
  }
  const followUpQuests:FollowUpBook={};
  if(value.followUpQuests!==undefined){
    if(!record(value.followUpQuests))return null;
    for(const [id,q] of Object.entries(value.followUpQuests)){
      if(!NPCS.some(n=>n.id===id) || !record(q) || !integer(q.phase,1,3) ||
         !integer(q.day,1,100000) || !integer(q.baseline,0,99999999) ||
         typeof value.day!=="number" || q.day>value.day)return null;
      followUpQuests[id as NpcId]={phase:q.phase as 1|2|3,day:q.day,baseline:q.baseline};
    }
  }
  const { player, story } = value;
  const location=value.location??"field";
  if(!isResidentHome(String(location)) && !["field","home","shed","warung","gang","pasar","sungai"].includes(String(location)))return null;
  if (!integer(value.day, 1, 100000) || !integer(value.minutes, 0, 1320) ||
      !integer(value.coins, 0, 99999999) || !integer(value.seeds, 0, 99999999) ||
      !integer(value.harvested, 0, 99999999) || typeof value.phoneRead !== "boolean" ||
      !integer(player.x, 0, WORLD.width - 1) || !integer(player.y, (value.location==="home"||value.location==="shed")?5:0, WORLD.height - 1) ||
      !["up", "down", "left", "right"].includes(String(player.dir)) ||
      !Array.isArray(value.plots) || value.plots.length > 48) return null;
  let playerX=player.x, playerY=player.y;
  // Older saves can stand inside an updated footprint. Recover the nearest
  // traversable outdoor tile while leaving valid positions and all progress intact.
  if(areaBlocked(location as GameLocation,playerX,playerY)){
    if(!isOutdoorLocation(location as GameLocation))return null;
    let bestDistance=Infinity;
    for(let y=0;y<WORLD.height;y++)for(let x=0;x<WORLD.width;x++){
      const distance=Math.abs(player.x-x)+Math.abs(player.y-y);
      if(distance<bestDistance && !areaBlocked(location as OutdoorLocation,x,y)){
        playerX=x;playerY=y;bestDistance=distance;
      }
    }
  }
  for (const key of ["orderAccepted", "orderDone", "canalClue", "sarisStory"]) {
    if (typeof story[key] !== "boolean") return null;
  }
  // Additive v1 migration: old achievements and balances remain intact. Hearing
  // Nani's old greeting never silently counts as seeing or choosing the photo.
  if (story.photoSeen !== undefined && typeof story.photoSeen !== "boolean") return null;
  const photoSeen = story.photoSeen ?? false;
  const photoChoice = story.photoChoice === undefined ? null : story.photoChoice;
  const completedDay = story.completedDay === undefined ? null : story.completedDay;
  if (photoChoice !== null && photoChoice !== "nani" && photoChoice !== "warung") return null;
  if (completedDay !== null && !integer(completedDay, 1, value.day)) return null;
  if ((photoChoice === null) !== (completedDay === null) ||
      (photoSeen && (!story.orderDone || !story.canalClue)) || (photoChoice && !photoSeen)) return null;
  const hasInventory=value.carriedTools!==undefined||value.storedTools!==undefined||value.bagTier!==undefined;
  let carriedTools:ToolId[],storedTools:ToolId[],bagTier:BagTier,equippedTool:ToolId|null;
  if(hasInventory){
    if(!Array.isArray(value.carriedTools)||!Array.isArray(value.storedTools)||!integer(value.bagTier,1,4))return null;
    const owned=[...value.carriedTools,...value.storedTools];
    if(new Set(owned).size!==owned.length || owned.some(id=>typeof id!=="string"||!TOOL_IDS.includes(id as ToolId)) ||
       value.carriedTools.length>bagCapacity(value.bagTier as BagTier))return null;
    carriedTools=value.carriedTools as ToolId[];storedTools=value.storedTools as ToolId[];bagTier=value.bagTier as BagTier;
    if(value.equippedTool!==null&&value.equippedTool!==undefined&&!carriedTools.includes(value.equippedTool as ToolId))return null;
    equippedTool=value.equippedTool===undefined?(carriedTools[0]??null):value.equippedTool as ToolId|null;
  }else{
    if(value.equippedTool!==undefined&&value.equippedTool!==null&&
      ![...TOOL_IDS,"seed","harvest"].includes(value.equippedTool as string))return null;
    // Legacy seed/harvest are hand actions, not inventory items.
    equippedTool=value.equippedTool==="water"?"water":"hoe";
    carriedTools=["hoe","water"];storedTools=["axe","sickle","fishing_rod","pickaxe"];bagTier=1;
  }
  const bonds = newBonds(), stats = newStats();
  if (value.bonds !== undefined) {
    if (!record(value.bonds)) return null;
    for (const npc of NPCS) {
      const b = value.bonds[npc.id];
      if(b===undefined && isMarketMerchant(npc.id))continue;
      if (!record(b) || !integer(b.points,0,1000) || !integer(b.lastTalkDay,0,value.day) || !integer(b.talks,0,99999999) || !EMOTIONS.includes(b.mood as Emotion) ||
        (b.lastChoice!==undefined && b.lastChoice!==null && !["listen","help","dismiss","confide"].includes(b.lastChoice as string))) return null;
      bonds[npc.id] = { points:b.points,lastTalkDay:b.lastTalkDay,talks:b.talks,mood:b.mood as Emotion,lastChoice:(b.lastChoice??null) as SocialChoice|null };
    }
  }
  if (value.stats !== undefined) {
    if (!record(value.stats)) return null;
    for (const key of Object.keys(stats) as (keyof LifeStats)[]) {
      const v = value.stats[key];
      if (!integer(v,0,key === "stamina" ? 100 : 99999999)) return null;
      stats[key] = v;
    }
  }
  const plots: Plot[] = [];
  const coordinates = new Set<string>();
  for (const p of value.plots) {
    if (!record(p) || !integer(p.x, 3, 10) || !integer(p.y, 8, 13) ||
        !integer(p.stage, -1, 3) || typeof p.watered !== "boolean" ||
        (p.harvests!==undefined&&!integer(p.harvests,0,CUCUMBER_MAX_HARVESTS-1))) return null;
    const key = `${p.x},${p.y}`;
    if (coordinates.has(key)) return null;
    coordinates.add(key);
    plots.push({x:p.x,y:p.y,stage:p.stage,watered:p.watered,harvests:p.harvests??0});
  }
  const fishing=loadFishing(value.fishing);
  if(!fishing)return null;
  return { ...(value.nurseryChecked===true?{nurseryChecked:true}:{}), fishing, ...(Object.keys(personalQuests).length?{personalQuests}:{}), ...(Object.keys(followUpQuests).length?{followUpQuests}:{}), version: 1, ...(value.sluiceOpen===true ? {sluiceOpen:true} : {}), location: (value.location??"field") as GameLocation,
    equippedTool,carriedTools,storedTools,bagTier,bonds,stats,day:value.day,minutes:value.minutes,
    ...(integer(value.walkingSteps,1,3)?{walkingSteps:value.walkingSteps}:{}),
    player: { x: playerX as number, y: playerY as number, dir: player.dir as Direction }, plots,
    seeds: value.seeds, harvested: value.harvested, coins: value.coins, phoneRead: value.phoneRead,
    story: { orderAccepted: Boolean(story.orderAccepted || story.orderDone), orderDone: story.orderDone as boolean,
      canalClue: story.canalClue as boolean, sarisStory: story.sarisStory as boolean,
      photoSeen: photoSeen as boolean, photoChoice, completedDay: completedDay as number | null } };
}

export type Emotion = "neutral" | "happy" | "sad" | "worried" | "surprised" | "annoyed" | "shy" | "laughing";
export type SocialChoice = "listen" | "help" | "dismiss" | "confide";
export type Bond = { points: number; lastTalkDay: number; talks: number; mood: Emotion; lastChoice?: SocialChoice | null };
/** stamina is a deprecated v1-save field: ignored by gameplay, kept only for backward compatibility. */
export type LifeStats = { stamina: number; xp: number; actions: number; harvests: number; conversations: number; nights: number };
export const EMOTIONS: readonly Emotion[] = ["neutral", "happy", "sad", "worried", "surprised", "annoyed", "shy", "laughing"];
export const HOME = { door: { x: 3, y: 4 }, spawn: { x: 12, y: 12 }, exit: { x: 12, y: 13 }, bed: { x: 9, y: 7 } } as const;
export const SHED = { door:{x:9,y:4},spawn:{x:12,y:12},exit:{x:12,y:13},rack:{x:9,y:7} } as const;
export function newBonds(): Record<NpcId, Bond> {
  return Object.fromEntries(NPCS.map(n => [n.id, { points: 0, lastTalkDay: 0, talks: 0, mood: "neutral", lastChoice: null }])) as Record<NpcId, Bond>;
}
export function newStats(): LifeStats { return { stamina: 100, xp: 0, actions: 0, harvests: 0, conversations: 0, nights: 0 }; }
export function bondLevel(points: number) { return Math.min(10, Math.floor(points / 100)); }
export function bondLabel(points: number) { return ["Belum akrab", "Kenalan", "Mulai dekat", "Teman", "Teman baik", "Akrab", "Dipercaya", "Sahabat", "Sahabat dekat", "Seperti keluarga", "Ikatan istimewa"][bondLevel(points)]; }
export function playerLevel(s: GameState) { return Math.floor(Math.sqrt(s.stats.xp / 50)) + 1; }
// Bounds in world pixels, matching the day/evening interiors, facade and shed artwork.
const INTERACTION_HITBOXES = [
  { id: "home-door", location: "field", left: 65, top: 69, right: 92, bottom: 100 },
  { id: "shed-door", location: "field", left: 181, top: 70, right: 201, bottom: 100 },
  { id: "home-exit", location: "home", left: 240, top: 270, right: 280, bottom: 289 },
  { id: "shed-exit", location: "shed", left: 236, top: 270, right: 286, bottom: 289 },
  { id: "warung-pintu", location: "field", left: 379, top: 69, right: 395, bottom: 99 },
  ...RESIDENT_HOMES.flatMap(home=>[
    {id:home.location,location:"gang" as const,left:home.doorX-12,top:home.y*20-30,right:home.doorX+13,bottom:home.y*20-1},
    {id:"guest-exit",location:home.location,left:236,top:270,right:264,bottom:289},
    {id:"guest-keepsake",location:home.location,left:280,top:138,right:335,bottom:171},
  ]),
  { id: "lapak-pintu", location: "pasar", left: 345, top: 147, right: 414, bottom: 180 },
  { id: "warung-exit", location: "warung", left: 240, top: 270, right: 280, bottom: 290 },
  { id: "bed", location: "home", left: 175, top: 120, right: 227, bottom: 163 },
] as const;

type InteractionHitbox = (typeof INTERACTION_HITBOXES)[number];

export function interactionHitboxAt(location: GameLocation, x: number, y: number) {
  return INTERACTION_HITBOXES.find(box => box.location === location &&
    x >= box.left && x < box.right && y >= box.top && y < box.bottom);
}

export function facesInteractionHitbox(player: GameState["player"], box: InteractionHitbox): boolean {
  const front = facing(player);
  const x = (front.x + .5) * WORLD.tile;
  const y = (front.y + .5) * WORLD.tile;
  // Allow a tile-aligned approach along the edge of artwork between tile centers.
  const vertical = player.dir === "up" || player.dir === "down";
  const horizontalMargin = vertical && (box.id === "bed" || box.id === "shed-exit") ? 6 : 0;
  return x >= box.left - horizontalMargin && x < box.right + horizontalMargin &&
    y >= box.top && y < box.bottom;
}

function isOnExit(player: GameState["player"], box: InteractionHitbox) {
  return (box.id === "guest-exit" || box.id === "home-exit" || box.id === "shed-exit" || box.id === "warung-exit") &&
    interactionHitboxAt(box.location, (player.x + .5) * WORLD.tile, (player.y + .5) * WORLD.tile) === box;
}

function facingInteraction(s: Pick<GameState, "location" | "player">) {
  return INTERACTION_HITBOXES.find(box => box.location === s.location &&
    (facesInteractionHitbox(s.player, box) || isOnExit(s.player, box)));
}

export function canSleep(s: GameState) {
  return facingInteraction(s)?.id === "bed";
}
export function homeBlocked(x: number, y: number) {
  return x < 8 || x > 16 || y < 6 || y > 13 || (x <= 10 && y <= 7) || (x >= 15 && y <= 8) || (x === 12 && y === 7);
}
function warungOpen(s: GameState) {
  const inggit = npcWhere(s,"C08");
  return inggit.location === "pasar" && !inggit.indoors && s.minutes < 1140;
}
function visitAllowed(s:GameState,owner:NpcId) {
  return bondLevel(s.bonds[owner].points)>=VISIT_ANYTIME_LEVEL ||
    (s.minutes>=7*60 && s.minutes<20*60+30 && npcWhere(s,owner).indoors);
}
export function interactDoor(s: GameState): GameState {
  const id=facingInteraction(s)?.id;
  if(id && isResidentHome(id)){
    const home=RESIDENT_HOMES.find(h=>h.location===id)!;
    return visitAllowed(s,home.owner) ? {...s,location:id,player:{...HOME.spawn,dir:"up"}} : s;
  }
  if(id==="guest-exit"){
    const home=RESIDENT_HOMES.find(h=>h.location===s.location)!;
    const waiting=npcHere({...s,location:"gang"});
    const clear=[0,1,-1].map(dx=>home.x+dx).find(x=>!areaBlocked("gang",x,home.y) &&
      !waiting.some(n=>n.x===x && n.y===home.y));
    if(clear!==undefined)return {...s,location:"gang",player:{x:clear,y:home.y,dir:"down"}};
    return s;
  }
  switch (id) {
    case "lapak-pintu":
      return warungOpen(s) ? {...s,location:"warung",player:{...HOME.spawn,dir:"up"}} : s;
    case "warung-exit":
      return {...s,location:"pasar",player:{x:20,y:9,dir:"down"}};
    case "home-door":
      return { ...s, location: "home", player: { ...HOME.spawn, dir: "up" } };
    case "shed-door":
      return { ...s, location: "shed", player: { ...SHED.spawn, dir: "up" } };
    case "home-exit":
      return { ...s, location: "field", player: { ...HOME.door, y: HOME.door.y + 1, dir: "down" } };
    case "shed-exit":
      return { ...s, location: "field", player: { ...SHED.door, y: SHED.door.y + 1, dir: "down" } };
    default:
      return s;
  }
}
export type ActionContext =
  | {kind:"nursery"|"fish"|"sluice"|"door"|"sleep"|"farm"|"plant"|"harvest"|"storage"|"travel"|"none"|"wait"|"need-tool";label:string}
  | {kind:"npc";label:string;npcId:NpcId}
  | {kind:"inspect";label:string;text:string}
  | {kind:"quest-prop";label:string;propId:QuestPropId};
/** One action key resolves the object in front before ever considering a farm tool. */
export function getActionContext(s:GameState):ActionContext {
  const front=facing(s.player);
  if(s.location==="field" && front.x===6 && front.y===5)return {kind:"nursery",label:"Periksa meja semai"};
  if(s.location==="shed"){
    if(interactDoor(s)!==s)return {kind:"door",label:"Keluar gudang"};
    if(canManageTools(s))return {kind:"storage",label:"Buka gudang peralatan"};
    return {kind:"none",label:"Tidak ada objek"};
  }
  if(s.location==="home"){
    if(interactDoor(s)!==s) return {kind:"door",label:"Keluar rumah"};
    if(canSleep(s)) return {kind:"sleep",label:"Tidur di kasur"};
    if(front.x===12 && front.y===7) return {kind:"inspect",label:"Periksa meja",
      text:"Meja kerja Yanzen. Catatan kebun dan tugasmu ada di YZ Phone."};
    if(front.x>=15 && front.x<=16 && front.y>=6 && front.y<=8)
      return {kind:"inspect",label:"Periksa lemari",text:"Pakaian kebunmu tersusun di lemari. Belum ada yang perlu diganti sekarang."};
    return {kind:"none",label:"Tidak ada objek"};
  }
  if (s.location === "field") {
    const door = facingInteraction(s)?.id;
    if (door === "home-door") return {kind:"door",label:"Masuk rumah"};
    if (door === "shed-door") return {kind:"door",label:"Masuk gudang"};
  }
  if (s.location === "warung" && interactDoor(s) !== s) return {kind:"door",label:"Keluar warung"};
  if (s.location === "pasar" && interactDoor(s) !== s) return {kind:"door",label:"Masuk Warung Inggit"};
  const privateDoor = facingInteraction(s)?.id;
  if(privateDoor && isResidentHome(privateDoor)){
    const home=RESIDENT_HOMES.find(h=>h.location===privateDoor)!;
    if(visitAllowed(s,home.owner))return {kind:"door",label:"Bertamu ke rumah "+home.name};
    const reason=npcWhere(s,home.owner).indoors ? "Pemilik sudah beristirahat." : "Pemilik sedang di luar.";
    return {kind:"inspect",label:areaTitle(privateDoor),text:areaTitle(privateDoor)+" terkunci. "+reason+
      " Biasanya rumah ini menerima tamu sampai pukul 20.30. Jika kalian sudah sangat akrab, mungkin ada kunci cadangan untukmu."};
  }
  if(privateDoor==="guest-exit")return {kind:"door",label:"Keluar ke gang"};
  if(privateDoor==="guest-keepsake" && isResidentHome(s.location)){
    const home=RESIDENT_HOMES.find(h=>h.location===s.location)!;
    return {kind:"inspect",label:home.object,text:home.note};
  }
  if(privateDoor==="warung-pintu" || privateDoor==="lapak-pintu")
    return {kind:"inspect",label:"Warung Inggit",text:"Pintu warung terkunci. Coba datang saat Inggit sudah membuka lapak."};
  const npc=npcHere(s).find(n=>n.x===front.x&&n.y===front.y);
  if(npc) return {kind:"npc",label:"Bicara dengan "+npc.name,npcId:npc.id};
  if (!isOutdoorLocation(s.location)) return {kind:"none",label:"Tidak ada objek"};
  const questProp = questPropAt(s.location,front.x,front.y);
  if(questProp)return {kind:"quest-prop",label:questProp.label,propId:questProp.id};
  const sign = signpostAt(s.location, front.x, front.y);
  if(sign) return {kind:"inspect",label:sign.title,text:sign.message};
  if(s.location!=="field"){
    const exit=mapExit(s.location,s.player.x,s.player.y,s.player.dir);
    if(exit)return {kind:"travel",label:"Jalan ke "+areaTitle(exit.location)};
    const closed=routeBarrierAt(s.location,front.x,front.y);
    if(closed)return {kind:"inspect",label:closed.label,text:closed.message};
    if(s.equippedTool==="fishing_rod" && fishingWaterAt(s,front.x,front.y))return {kind:"fish",
      label:s.fishing.line?"Tarik joran":s.fishing.bait?"Lempar pancing":"Periksa umpan"};
    if(s.location==="sungai" && front.x===6 && front.y===7)return {kind:"sluice",label:s.sluiceOpen?"Tutup pintu air":"Buka pintu air"};
    if(s.location==="sungai"&&front.x<=7)return {kind:"inspect",
      label:"Periksa sungai",text:"Permukaan air mengalir ke hilir. Ryan mencatatnya setiap siang."};
    if(s.location==="pasar"&&front.y<=8)return {kind:"inspect",
      label:"Lihat lapak pasar",text:"Sayur dan rempah ditata rapi. Berbicaralah dengan pedagang yang hadir."};
    return {kind:"none",label:"Jelajahi "+areaTitle(s.location)};
  }
  const exit=mapExit("field",s.player.x,s.player.y,s.player.dir);
  if(exit)return {kind:"travel",label:"Jalan ke "+areaTitle(exit.location)};
  const fieldBarrier=routeBarrierAt("field",front.x,front.y);
  if(fieldBarrier)return {kind:"inspect",label:fieldBarrier.label,text:fieldBarrier.message};
  if(isFarm(front.x,front.y)){
    const plot=s.plots.find(p=>p.x===front.x&&p.y===front.y);
    if(plot?.stage===3)return {kind:"harvest",label:"Panen dengan tangan"};
    if(plot?.stage===-1)return {kind:"plant",label:"Tanam bibit dengan tangan"};
    if(plot && plot.stage>=0){
      if(plot.watered)return {kind:"wait",label:"Sudah disiram · Tunggu hari berikutnya"};
      return s.equippedTool==="water"&&s.carriedTools.includes("water")?
        {kind:"farm",label:"Siram dengan gembor"}:{kind:"need-tool",label:"Perlu Gembor Penyiram"};
    }
    return s.equippedTool==="hoe"&&s.carriedTools.includes("hoe")?
      {kind:"farm",label:"Cangkul petak kosong"}:{kind:"need-tool",label:"Perlu Cangkul"};
  }
  if(front.x<=1 && front.y>=9) return {kind:"inspect",label:"Periksa saluran air",
    text:"Air mengalir ke arah hilir. Ryan mungkin mengetahui cerita saluran ini."};
  return {kind:"none",label:"Tidak ada objek"};
}

const reactions: Record<NpcId, Record<SocialChoice, { emotion: Emotion; line: string }>> = {
  A04:{
    listen:{emotion:"happy",line:"Coba dengar biji kering di kertas ini. Yang dua ini bunyinya beda, kan? Aku mau cek apa keduanya masih bisa tumbuh."},
    help:{emotion:"surprised",line:"Boleh bantu catat tanggal semainya? Kertas di lapak suka terbang kalau angin masuk dari gang."},
    dismiss:{emotion:"sad",line:"Baik. Kertas ini kusimpan dulu. Nanti kalau senggang, kita lanjut."},
    confide:{emotion:"shy",line:"Pernah satu kotak benihku sama sekali tak tumbuh. Sejak itu aku mencoba sedikit di kain basah sebelum menjualnya."}
  },
  C07:{
    listen:{emotion:"happy",line:"Kalau pelampung bergerak pelan, belum tentu ada ikan. Tunggu ujungnya turun, baru tarik."},
    help:{emotion:"surprised",line:"Kalau lewat jembatan, bisa lihat simpul jaring yang paling bawah? Aku takut ada yang terlepas."},
    dismiss:{emotion:"neutral",line:"Mangga. Nanti kita sambung di pasar. Es di keranjang ini juga tinggal sedikit."},
    confide:{emotion:"worried",line:"Kalau ikan telat sampai, pelanggan yang menunggu harus pulang dengan tangan kosong. Aku selalu memikirkan itu."}
  },
  A03:{
    listen:{emotion:"happy",line:"Lihat bekas basah di batu sebelah kiri. Kemarin garisnya lebih rendah. Biar kuambil buku catatanku."},
    help:{emotion:"surprised",line:"Mau ikut memeriksa pintu air? Besok pagi bawa sepatu yang tahan lumpur. Jalannya masih licin."},
    dismiss:{emotion:"annoyed",line:"Selesaikan urusanmu dulu. Aku masih harus mengukur saluran sebelum pulang."},
    confide:{emotion:"worried",line:"Kalau air tak sampai ke hilir, orang pertama yang dicari biasanya aku. Padahal kadang pintunya sudah terbuka."}
  },
  C01:{
    listen:{emotion:"happy",line:"Duduk dulu, Nak. Melati yang ini baru berbunga tadi pagi. Harumnya paling kuat sebelum siang."},
    help:{emotion:"surprised",line:"Boleh bantu pindahkan dua pot itu ke tempat teduh? Daunnya mulai layu sejak kemarin."},
    dismiss:{emotion:"sad",line:"Tak apa. Kuenya kusimpan di wadah dulu. Kalau mampir lagi, kita makan bersama."},
    confide:{emotion:"worried",line:"Ada nama yang belum sanggup kutulis di belakang foto itu. Mungkin nanti, kalau aku sudah siap."}
  },
  C08:{
    listen:{emotion:"happy",line:"Acar ini mulanya dari timun yang kecil-kecil. Kalau dipotong tipis, bumbunya meresap sampai tengah."},
    help:{emotion:"surprised",line:"Boleh bantu angkat keranjang ini ke meja? Sebentar lagi orang pasar datang untuk makan siang."},
    dismiss:{emotion:"sad",line:"Ya sudah, pergilah dulu. Aku masih harus membereskan panci sebelum pasar ramai."},
    confide:{emotion:"worried",line:"Yang paling kutakutkan bukan meja kosong. Kalau masakan tak habis, besok aku harus memikirkan bahan yang terbuang."}
  }
};
export function chooseSocial(s: GameState, npc: NpcId, choice: SocialChoice): { state: GameState } & Dialogue {
  const bond = s.bonds[npc];
  if (!NPCS.some(n => n.id === npc) || !["listen", "help", "dismiss", "confide"].includes(choice) ||
      (choice === "confide" && bondLevel(bond.points) < 2)) return { state: s, title: "Percakapan", lines: ["Kita perlu lebih mengenal satu sama lain dahulu."] };
  const fresh = bond.lastTalkDay !== s.day;
  const delta = fresh ? (choice === "dismiss" ? -8 : choice === "help" ? 20 : choice === "confide" ? 18 : 12) : 0;
  const reaction = reactions[npc][choice];
  const state: GameState = { ...s, bonds: { ...s.bonds, [npc]: { points: Math.max(0, Math.min(1000, bond.points + delta)),
    lastTalkDay: s.day, talks: Math.min(99999999, bond.talks + 1), mood: reaction.emotion, lastChoice: choice } },
    stats: { ...s.stats, xp: Math.min(99999999,s.stats.xp + (fresh ? 8 : 0)), conversations: Math.min(99999999,s.stats.conversations + 1) } };
  return { state, npcId: npc, emotion: reaction.emotion, title: NPCS.find(n => n.id === npc)!.name + " · Jawabanmu",
    lines: [reaction.line] };
}
export function meetNpc(s: GameState, npc: NpcId): { state: GameState } & Dialogue {
  const result = storyDialogue(s, npc);
  return { ...result,
    lines:[...result.lines,npcAmbient(s,npc)],
    npcId: npc, emotion: npc === "C01" && result.photo ? "worried" : s.bonds[npc].mood,
    choices: [
      { id: "listen", label: "Aku ingin mendengar ceritamu." },
      { id: "help", label: "Ada yang bisa kubantu?" },
      { id: "dismiss", label: "Aku sedang sibuk, lain kali saja." },
      { id: "confide", label: "Apa yang sedang kamu pikirkan?", minLevel: 2 }
    ] };
}
