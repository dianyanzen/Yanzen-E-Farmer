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
  fishing_rod: {name:"Joran Pancing",category:"Memancing",function:"Memancing ikan di sungai atau kolam.",target:"Air",status:"planned"},
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
  camera: {name:"Kamera",category:"Eksplorasi",function:"Memotret tempat menarik untuk album dan quest.",target:"Objek/landmark",status:"planned"},
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
  title: string; lines: string[]; npcId?: NpcId; emotion?: Emotion; sleep?: boolean; choices?: { id: SocialChoice; label: string; minLevel?: number }[]; photo?: boolean; choosePhoto?: boolean; shop?: boolean;
};
export type GameState = {
  version: 1; day: number; minutes: number;
  player: { x: number; y: number; dir: Direction };
  plots: Plot[]; seeds: number; harvested: number; coins: number;
  equippedTool: ToolId|null; carriedTools: ToolId[]; storedTools: ToolId[]; bagTier:BagTier;
  phoneRead: boolean; story: StoryFlags; location: GameLocation; bonds: Record<NpcId, Bond>; stats: LifeStats;
};
export const WORLD = { width: 24, height: 16, tile: 20 } as const;
export type GameLocation = "field"|"home"|"shed"|"gang"|"pasar"|"sungai";
export type OutdoorLocation = "field"|"gang"|"pasar"|"sungai";
export const AREAS:Record<OutdoorLocation,{name:string;description:string;landmark:string}> = {
  field:{name:"Kebun Yanzen",description:"Rumah, gudang, petak timun, dan saluran irigasi",landmark:"Jalan kampung ke timur"},
  gang:{name:"Gang Pasirluyu",description:"Rumah tetangga, bangku warga, dan jalan utama",landmark:"Jalan menuju pasar dan sungai"},
  pasar:{name:"Pasar Warga",description:"Warung Inggit, kios sayur, dan lapak warga",landmark:"Kembali ke gang di selatan"},
  sungai:{name:"Bantaran Sungai",description:"Jembatan kecil, pintu air, dan kebun hilir",landmark:"Kembali ke gang di utara"}
};
export function areaTitle(location:GameLocation):string {
  return location==="home"?"Rumah Yanzen":location==="shed"?"Gudang Peralatan":AREAS[location].name;
}
export function weatherForDay(day:number):"cerah"|"berawan"|"hujan"{
  const cycle=["cerah","cerah","berawan","cerah","hujan","cerah","berawan"] as const;
  return cycle[(day-1)%cycle.length]??"cerah";
}
export function timeGreeting(minutes:number):string{
  return minutes<660?"Selamat pagi":minutes<900?"Selamat siang":
    minutes<1080?"Selamat sore":"Selamat malam";
}
/** Outdoor crossings occur ONLY on visible road/bridge connectors, never on arbitrary map edges. */
export function mapExit(location:OutdoorLocation,x:number,y:number,dir:Direction):
  {location:OutdoorLocation;x:number;y:number;dir:Direction}|null {
  if(location==="field" && dir==="right" && x>=22 && (y===10||y===11))
    return {location:"gang",x:1,y,dir};
  if(location==="gang" && dir==="left" && x<=1 && (y===10||y===11))
    return {location:"field",x:22,y,dir};
  if(location==="gang" && dir==="up" && y<=5 && (x===11||x===12))
    return {location:"pasar",x,y:14,dir};
  if(location==="pasar" && dir==="down" && y>=14 && (x===11||x===12))
    return {location:"gang",x,y:6,dir};
  if(location==="gang" && dir==="down" && y>=14 && (x===11||x===12))
    return {location:"sungai",x,y:5,dir};
  if(location==="sungai" && dir==="up" && y<=5 && (x===11||x===12))
    return {location:"gang",x,y:14,dir};
  return null;
}
const placements = [
  { id: "A03", x: 13, y: 8, color: "#314961" },
  { id: "C01", x: 16, y: 11, color: "#cba7a0" },
  { id: "C08", x: 19, y: 7, color: "#bc7651" },
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
export type NpcPlacement = typeof NPCS[number] & {location:OutdoorLocation;activity:string};
/** Fixed authored daily rhythms. Deterministic: same game day/time means same person and place. */
export function npcSchedule(s:Pick<GameState,"day"|"minutes">):NpcPlacement[]{
  const hour=s.minutes;
  return NPCS.map(npc=>{
    const slot=npc.id==="A03"?
      (hour<720?{location:"field",x:13,y:8,activity:"Memeriksa kebun timun"}:
       hour<1080?{location:"sungai",x:8,y:8,activity:"Mengukur debit sungai"}:
                 {location:"gang",x:11,y:10,activity:"Menulis laporan air"}):
    npc.id==="C01"?
      (hour<720?{location:"field",x:16,y:11,activity:"Merawat melati di dekat kebun"}:
       hour<1080?{location:"gang",x:6,y:10,activity:"Menyapa tetangga di depan rumah"}:
                 {location:"gang",x:7,y:11,activity:"Istirahat di bangku gang"}):
      (hour<720?{location:"field",x:19,y:7,activity:"Menawarkan sayuran di warung"}:
       hour<1140?{location:"pasar",x:15,y:10,activity:"Menjaga lapak pasar"}:
                 {location:"field",x:19,y:7,activity:"Menutup warung dan menghitung dagangan"});
    return {...npc,...slot} as NpcPlacement;
  });
}
export function npcHere(s:GameState):NpcPlacement[]{
  return npcSchedule(s).filter(n=>n.location===s.location);
}
export function npcWhere(s:GameState,id:NpcId):NpcPlacement{
  return npcSchedule(s).find(n=>n.id===id)!;
}
export function npcAmbient(s:GameState,id:NpcId):string{
  const bond=s.bonds[id],place=npcWhere(s,id),soul=NPC_SOULS[id];
  const afterHours=s.minutes>=1080;
  if(bond.points>=200&&bond.mood==="worried")
    return "Ada hal yang belum selesai kupikirkan. Aku senang kamu tidak mendesakku bercerita.";
  if(bond.points>=100&&bond.lastTalkDay===s.day)
    return "Terima kasih sudah mampir. Rasanya lebih mudah menghadapi hari setelah mengobrol.";
  if(afterHours)return `Aku masih memikirkan pekerjaanku: ${soul.desire.toLowerCase()}.`;
  return place.activity+". "+(id==="A03"?
    "Kalau air hulu cukup, kebun hilir juga harus kebagian.":
    id==="C01"?"Melati tumbuh perlahan; kisah orang juga perlu waktu.":
      "Warung bukan cuma tempat jual beli, tapi tempat warga saling mendengar.");
}
export const DEFAULT_STORY: StoryFlags = {
  orderAccepted: false, orderDone: false, canalClue: false, sarisStory: false,
  photoSeen: false, photoChoice: null, completedDay: null,
};
export function newGame(): GameState {
  return { version: 1, location: "field", bonds: newBonds(), stats: newStats(), day: 1, minutes: 6 * 60 + 20,
    player: { x: 12, y: 10, dir: "left" }, plots: [], seeds: 12,
    equippedTool:"hoe",carriedTools:["hoe","water"],storedTools:["axe","sickle","fishing_rod","pickaxe"],bagTier:1,
    harvested: 0, coins: 280, phoneRead: false, story: { ...DEFAULT_STORY } };
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
  else if(tilled&&!s.seeds)next="Bibit habis! Beli bibit dari YZ Phone → Pesan.";
  else if(tilled)next="Tanah siap tanam: hadapkan karakter ke petak dan tekan Aksi.";
  else if(watered)next="Tanaman sudah disiram. Tidur di kasur rumah untuk berganti hari dan menumbuhkannya.";
  else if(empty&&!s.carriedTools.includes("hoe"))next="Ambil cangkul dari gudang untuk membuka lahan.";
  else if(empty)next="Petak masih kosong: pilih Cangkul lalu tekan Aksi di depan petak.";
  else next="Seluruh petak sudah diproses. Lanjutkan aktivitas atau berganti hari.";
  return {ready,tilled,watered,needsWater,empty,next};
}
export function blocked(x: number, y: number): boolean {
  return x < 0 || y < 0 || x >= WORLD.width || y >= WORLD.height ||
    y <= 4 || (x <= 1 && y >= 9);
}
export function areaBlocked(location:GameLocation,x:number,y:number):boolean{
  if(location==="home"||location==="shed")return homeBlocked(x,y);
  if(location==="field")return blocked(x,y);
  if(x<1||x>22||y<5||y>14)return true;
  if(location==="gang"){
    // Two houses and a small garden; road connectors remain open.
    return (x>=3&&x<=8&&y>=5&&y<=8)||(x>=16&&x<=20&&y>=5&&y<=8);
  }
  if(location==="pasar"){
    // Only stall counters are solid; walking aisles remain open.
    return (x>=3&&x<=9&&y>=6&&y<=8)||(x>=15&&x<=20&&y>=6&&y<=8);
  }
  // Canal forms a physical natural border. Small bridge is a walkable connector.
  return x<=6&&y>=6&&y<=14;
}
export function facing(p: GameState["player"]) {
  return { x: p.x + (p.dir === "left" ? -1 : p.dir === "right" ? 1 : 0),
           y: p.y + (p.dir === "up" ? -1 : p.dir === "down" ? 1 : 0) };
}
export function movePlayer(s: GameState, dir: Direction): GameState {
  if(s.location!=="home"&&s.location!=="shed"){
    const crossing=mapExit(s.location,s.player.x,s.player.y,dir);
    if(crossing)return {...s,location:crossing.location,
      player:{x:crossing.x,y:crossing.y,dir},minutes:Math.min(1320,s.minutes+2)};
  }
  const at=facing({...s.player,dir});
  const occupied=npcSchedule(s).some(n=>n.location===s.location&&n.x===at.x&&n.y===at.y);
  if(areaBlocked(s.location,at.x,at.y)||occupied)
    return {...s,player:{...s.player,dir}};
  return {...s,player:{x:at.x,y:at.y,dir},
    minutes:s.location==="home"||s.location==="shed"?s.minutes:Math.min(1320,s.minutes+2)};
}
function addMinutes(s: GameState, amount = 15): GameState {
  return { ...s, stats: { ...s.stats, xp: Math.min(99999999,s.stats.xp + 5), actions: Math.min(99999999,s.stats.actions + 1) }, minutes: Math.min(22 * 60, s.minutes + amount) };
}
export function nextDay(s: GameState): GameState {
  if (!canSleep(s)) return s;
  return { ...s, stats: { ...s.stats, nights: Math.min(99999999,s.stats.nights + 1) }, day: s.day + 1, minutes: 6 * 60 + 20,
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
  if (npc === "A03") {
    if (!s.story.orderDone) return { state: s, title: "Ryan · Pinggir Kebun", lines: [
      "Ryan: Inggit sedang menunggu empat timun untuk acar. Selesaikan dulu pesananmu; setelah itu kita cocokkan tanda di pintu air."] };
    return { state: { ...s, story: { ...s.story, canalClue: true } }, title: "Ryan · Dua Garis di Pintu Air", lines:
      s.story.photoChoice ? ["Ryan: Catatanmu sudah kusimpan. Nama Cimincrang di foto itu akan jadi petunjuk perjalanan berikutnya. Untuk sekarang kita rawat kebun ini dahulu."] : [
        "Ryan: Di batu pintu air ada dua garis. Aku hanya pernah mencatat yang atas. Mengapa foto lama Nani menunjukkan keduanya?",
        "Ryan: Temui Nani di gang sebelah timur kebun. Biar beliau sendiri yang membuka lipatan fotonya."] };
  }
  if (npc === "C01") {
    if (!s.story.orderDone || !s.story.canalClue) return { state: s, title: "Nani · Gang Kampung", lines: [
      s.story.orderDone ? "Nani: Ryan ingin menunjukkan sesuatu di saluran. Dengarkan dulu catatannya, lalu mampir lagi kepadaku." :
        "Nani: Inggit menyisihkan satu meja hari ini. Empat timun kecil dari kebunmu akan berarti banyak baginya."] };
    if (s.story.photoChoice) return { state: s, title: "Nani · Foto yang Kini Punya Tempat", photo: true, lines: [
      s.story.photoChoice === "nani" ? "Nani: Foto aslinya aman di amplopku. Aku mulai menulis nama orang-orang di dalamnya. Bila kelak siap, kisahnya akan kuceritakan dengan suaraku sendiri." :
        "Nani: Salinannya sudah di warung. Ada yang mengenali lipatan bungkus benih pada gambar itu. Nama baru mulai muncul di belakangnya.",
      "Nani: Cimincrang. Itu nama yang tertulis di balik foto. Perjalanan ke sana belum dibuka; kamu boleh kembali berkebun kapan saja."] };
    return { state: { ...s, story: { ...s.story, sarisStory: true, photoSeen: true } },
      title: "Nani · Foto yang Dilipat ke Dalam", photo: true, choosePhoto: true, lines: [
        "Nani membuka foto pintu air. Ada dua garis pada batu, dan tulisan Cimincrang di belakangnya. Ia menahan lipatan itu dengan kedua tangan.",
        "Nani: Ibu pernah mengalihkan air ke kebun tetangga. Aku belum tahu bagaimana warga hilir mengingatnya. Boleh kita tentukan bersama tempat untuk foto ini?",
        "Keduanya menjaga kisah yang sama: foto asli bersama Nani, atau salinan di warung agar warga dapat menambahkan nama. Kamu boleh memutuskan nanti."] };
  }
  if (s.story.orderAccepted && !s.story.orderDone && s.harvested >= 4) return {
    state: { ...s, harvested: s.harvested - 4, coins: s.coins + 160,
      story: { ...s.story, orderDone: true } }, title: "Inggit · Empat Timun untuk Satu Meja", shop: true,
    lines: ["Inggit: Empat timun kecil, pas untuk acar. Yang besar kebanyakan air. Ini 160 G; terima kasih sudah mengantar.",
      "Inggit membalik piring kelima di meja. Di sampingnya ada cangkir retak dengan dua goresan.",
      "Inggit: Ryan juga menemukan garis seperti ini di pintu air. Kalau sempat, temui dia di timur kebun."] };
  return { state: s, title: "Inggit · Warung Pasar", shop: true, lines: [
    s.story.photoChoice === "warung" ? "Inggit: Salinan foto Nani sudah di meja warung. Warga boleh menambahkan nama di baliknya; foto asli tetap bersama Nani." :
    s.story.photoChoice === "nani" ? "Inggit: Foto asli tetap bersama Nani. Kalau beliau siap bercerita, meja ini selalu punya tempat untuknya." :
    s.story.orderDone ? "Inggit: Pesananmu sudah lunas. Ryan menunggu di pinggir kebun untuk membandingkan tanda pintu air." :
    s.story.orderAccepted ? "Inggit: Aku menunggu empat timun segar. Kalau sudah dipanen, antarkan ke sini, ya." :
    "Inggit: Hai, tetangga baru! Cek pesan di YZ Phone. Aku ada pesanan kecil untuk kebunmu.",
    s.seeds <= 2 && s.coins >= 40 ? "Inggit: Bibit hampir habis? Gunakan tombol Beli Bibit di menu percakapan HP." :
      "Inggit: Pasar paling ramai menjelang siang. Banyak cerita yang bisa kamu dengar di sini." ] };
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
  const { player, story } = value;
  if (!integer(value.day, 1, 100000) || !integer(value.minutes, 0, 1320) ||
      !integer(value.coins, 0, 99999999) || !integer(value.seeds, 0, 99999999) ||
      !integer(value.harvested, 0, 99999999) || typeof value.phoneRead !== "boolean" ||
      !integer(player.x, 0, WORLD.width - 1) || !integer(player.y, 5, WORLD.height - 1) ||
      !["up", "down", "left", "right"].includes(String(player.dir)) ||
      areaBlocked((value.location === undefined?"field":value.location) as GameLocation,player.x,player.y) || !Array.isArray(value.plots) || value.plots.length > 48) return null;
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
  if(value.location!==undefined && !["field","home","shed","gang","pasar","sungai"].includes(value.location as string))return null;
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
  return { version: 1, location: (value.location??"field") as GameLocation,
    equippedTool,carriedTools,storedTools,bagTier,bonds,stats,day:value.day,minutes:value.minutes,
    player: { x: player.x, y: player.y, dir: player.dir as Direction }, plots,
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
export function canSleep(s: GameState) {
  const front=facing(s.player);
  return s.location==="home" && front.x===HOME.bed.x && front.y===HOME.bed.y;
}
export function homeBlocked(x: number, y: number) {
  return x < 8 || x > 16 || y < 6 || y > 13 || (x <= 10 && y <= 7) || (x >= 15 && y <= 8) || (x === 12 && y === 7);
}
export function interactDoor(s: GameState): GameState {
  const at = facing(s.player);
  if(s.location==="field"&&at.x===HOME.door.x&&at.y===HOME.door.y)
    return {...s,location:"home",player:{...HOME.spawn,dir:"up"}};
  if(s.location==="field"&&at.x===SHED.door.x&&at.y===SHED.door.y)
    return {...s,location:"shed",player:{...SHED.spawn,dir:"up"}};
  if(s.location==="shed"&&((at.x===SHED.exit.x&&at.y===SHED.exit.y)||
    (s.player.x===SHED.exit.x&&s.player.y===SHED.exit.y)))
    return {...s,location:"field",player:{...SHED.door,y:SHED.door.y+1,dir:"down"}};
  if (s.location === "home" && ((at.x === HOME.exit.x && at.y === HOME.exit.y) ||
      (s.player.x === HOME.exit.x && s.player.y === HOME.exit.y)))
    return { ...s, location: "field", player: { ...HOME.door, y: HOME.door.y + 1, dir: "down" } };
  return s;
}
export type ActionContext =
  | {kind:"door"|"sleep"|"farm"|"plant"|"harvest"|"storage"|"travel"|"none"|"wait"|"need-tool";label:string}
  | {kind:"npc";label:string;npcId:NpcId}
  | {kind:"inspect";label:string;text:string};
/** One action key resolves the object in front before ever considering a farm tool. */
export function getActionContext(s:GameState):ActionContext {
  const front=facing(s.player);
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
      return {kind:"inspect",label:"Periksa lemari",text:"Lemari Yanzen. Fitur mengganti pakaian belum tersedia."};
    return {kind:"none",label:"Tidak ada objek"};
  }
  if(front.x===HOME.door.x && front.y===HOME.door.y && s.location==="field")return {kind:"door",label:"Masuk rumah"};
  if(front.x===SHED.door.x && front.y===SHED.door.y && s.location==="field")return {kind:"door",label:"Masuk gudang"};
  const npc=npcHere(s).find(n=>n.x===front.x&&n.y===front.y);
  if(npc) return {kind:"npc",label:"Bicara dengan "+npc.name,npcId:npc.id};
  if(s.location!=="field"){
    const exit=mapExit(s.location,s.player.x,s.player.y,s.player.dir);
    if(exit)return {kind:"travel",label:"Jalan ke "+areaTitle(exit.location)};
    if(s.location==="sungai"&&front.x<=7)return {kind:"inspect",
      label:"Periksa sungai",text:"Permukaan air mengalir ke hilir. Ryan mencatatnya setiap siang."};
    if(s.location==="pasar"&&front.y<=8)return {kind:"inspect",
      label:"Lihat lapak pasar",text:"Sayur dan rempah ditata rapi. Berbicaralah dengan pedagang yang hadir."};
    return {kind:"none",label:"Jelajahi "+areaTitle(s.location)};
  }
  const exit=mapExit("field",s.player.x,s.player.y,s.player.dir);
  if(exit)return {kind:"travel",label:"Jalan ke "+areaTitle(exit.location)};
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
  A03: {
    listen: { emotion: "happy", line: "Ryan: Kamu mau mendengar dulu. Aku suka itu. Saluran ini mengajarkan kita sabar sebelum bertindak." },
    help: { emotion: "surprised", line: "Ryan: Mau ikut memeriksa pintu air? Wah, terima kasih. Besok kubawakan catatanku agar kita bisa belajar bersama." },
    dismiss: { emotion: "annoyed", line: "Ryan: Baik, selesaikan urusanmu dulu. Lain kali katakan saja kalau kamu sedang terburu-buru." },
    confide: { emotion: "worried", line: "Ryan: Kadang aku takut airnya tidak cukup untuk kebun hilir. Rasanya lebih ringan setelah bisa bercerita kepadamu." }
  },
  C01: {
    listen: { emotion: "happy", line: "Nani: Duduk sebentar, Nak. Senang ada yang mau mendengar tanpa buru-buru meminta akhir ceritanya." },
    help: { emotion: "surprised", line: "Nani: Mau membantu merawat melati? Tangan tuaku akan sangat terbantu. Terima kasih sudah menawarkan." },
    dismiss: { emotion: "sad", line: "Nani: Oh... tidak apa-apa. Kuenya kusimpan dulu. Semoga lain kali ada waktu untuk bercerita." },
    confide: { emotion: "worried", line: "Nani: Ada kenangan yang masih sulit kuucapkan. Terima kasih sudah membiarkanku memilih kapan siap bercerita." }
  },
  C08: {
    listen: { emotion: "happy", line: "Inggit: Kamu ingin dengar cerita warung? Resep acar ini berawal dari timun kecil yang hampir tidak dipilih siapa-siapa!" },
    help: { emotion: "surprised", line: "Inggit: Serius mau membantu? Wah, pasar pagi bisa ramai sekali. Kehadiran tetangga seperti kamu bikin semangat." },
    dismiss: { emotion: "sad", line: "Inggit: Oh, sedang sibuk ya. Aku kembali menata dagangan dulu. Semoga harimu lancar." },
    confide: { emotion: "worried", line: "Inggit: Aku sering khawatir makanan tersisa. Kalau kamu mampir, rasanya warung ini punya teman." }
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
    lines: [reaction.line, fresh ? (delta >= 0 ? "Kedekatan +" + delta : "Kedekatan " + delta) + " · " + bondLabel(state.bonds[npc].points) : "Kalian sudah berbincang hari ini. Poin kedekatan berikutnya bisa diperoleh besok."] };
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
