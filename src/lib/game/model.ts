import cast from "../../../game-assets/catalog/cast.json";

export type Direction = "up" | "down" | "left" | "right";
export type FarmTool = "hoe" | "seed" | "water" | "harvest";
export type Plot = { x: number; y: number; stage: number; watered: boolean };
export type PhotoChoice = "nani" | "warung";
export type StoryFlags = {
  orderAccepted: boolean; orderDone: boolean; canalClue: boolean; sarisStory: boolean;
  photoSeen: boolean; photoChoice: PhotoChoice | null; completedDay: number | null;
};
export type Dialogue = {
  title: string; lines: string[]; photo?: boolean; choosePhoto?: boolean; shop?: boolean;
};
export type GameState = {
  version: 1; day: number; minutes: number;
  player: { x: number; y: number; dir: Direction };
  plots: Plot[]; seeds: number; harvested: number; coins: number;
  phoneRead: boolean; story: StoryFlags;
};
export const WORLD = { width: 24, height: 16, tile: 20 } as const;
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
export const DEFAULT_STORY: StoryFlags = {
  orderAccepted: false, orderDone: false, canalClue: false, sarisStory: false,
  photoSeen: false, photoChoice: null, completedDay: null,
};
export function newGame(): GameState {
  return { version: 1, day: 1, minutes: 6 * 60 + 20,
    player: { x: 12, y: 10, dir: "left" }, plots: [], seeds: 12,
    harvested: 0, coins: 280, phoneRead: false, story: { ...DEFAULT_STORY } };
}
export function isFarm(x: number, y: number): boolean {
  return x >= 3 && x <= 10 && y >= 8 && y <= 13;
}
export function blocked(x: number, y: number): boolean {
  return x < 0 || y < 0 || x >= WORLD.width || y >= WORLD.height ||
    y <= 4 || (x <= 1 && y >= 9) || NPCS.some(n => n.x === x && n.y === y);
}
export function facing(p: GameState["player"]) {
  return { x: p.x + (p.dir === "left" ? -1 : p.dir === "right" ? 1 : 0),
           y: p.y + (p.dir === "up" ? -1 : p.dir === "down" ? 1 : 0) };
}
export function movePlayer(s: GameState, dir: Direction): GameState {
  const candidate = facing({ ...s.player, dir });
  return { ...s, player: {
    x: blocked(candidate.x, candidate.y) ? s.player.x : candidate.x,
    y: blocked(candidate.x, candidate.y) ? s.player.y : candidate.y, dir
  }};
}
function addMinutes(s: GameState, amount = 15): GameState {
  return { ...s, minutes: Math.min(22 * 60, s.minutes + amount) };
}
export function nextDay(s: GameState): GameState {
  return { ...s, day: s.day + 1, minutes: 6 * 60 + 20,
    plots: s.plots.map(p => ({ ...p,
      stage: p.watered && p.stage >= 0 ? Math.min(3, p.stage + 1) : p.stage,
      watered: false })) };
}
export function applyFarmTool(s: GameState, tool: FarmTool): { state: GameState; message: string } {
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
  return { state: addMinutes({ ...s,
    harvested: s.harvested + 1,
    plots: s.plots.filter(q => q !== p) }),
    message: "Panen berhasil! +1 timun masuk persediaan. Antar pesanan atau jual di warung." };
}
export function acceptOrder(s: GameState): GameState {
  return { ...s, phoneRead: true, story: { ...s.story, orderAccepted: true } };
}
export function meetNpc(s: GameState, npc: NpcId): { state: GameState } & Dialogue {
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
      blocked(player.x, player.y) || !Array.isArray(value.plots) || value.plots.length > 48) return null;
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
  const plots: Plot[] = [];
  const coordinates = new Set<string>();
  for (const p of value.plots) {
    if (!record(p) || !integer(p.x, 3, 10) || !integer(p.y, 8, 13) ||
        !integer(p.stage, -1, 3) || typeof p.watered !== "boolean") return null;
    const key = `${p.x},${p.y}`;
    if (coordinates.has(key)) return null;
    coordinates.add(key);
    plots.push({ x: p.x, y: p.y, stage: p.stage, watered: p.watered });
  }
  return { version: 1, day: value.day, minutes: value.minutes,
    player: { x: player.x, y: player.y, dir: player.dir as Direction }, plots,
    seeds: value.seeds, harvested: value.harvested, coins: value.coins, phoneRead: value.phoneRead,
    story: { orderAccepted: Boolean(story.orderAccepted || story.orderDone), orderDone: story.orderDone as boolean,
      canalClue: story.canalClue as boolean, sarisStory: story.sarisStory as boolean,
      photoSeen: photoSeen as boolean, photoChoice, completedDay: completedDay as number | null } };
}
