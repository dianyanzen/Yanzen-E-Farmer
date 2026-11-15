export type Direction = "up" | "down" | "left" | "right";
export type FarmTool = "hoe" | "seed" | "water" | "harvest";
export type Plot = { x: number; y: number; stage: number; watered: boolean };
export type StoryFlags = { orderAccepted: boolean; orderDone: boolean; canalClue: boolean; sarisStory: boolean };
export type GameState = {
  version: 1; day: number; minutes: number;
  player: { x: number; y: number; dir: Direction };
  plots: Plot[]; seeds: number; harvested: number; coins: number;
  phoneRead: boolean; story: StoryFlags;
};
export const WORLD = { width: 24, height: 16, tile: 20 } as const;
export const NPCS = [
  { id: "raka", name: "Raka", asset: "A01", x: 13, y: 8, color: "#314961", role: "Pengamat lingkungan" },
  { id: "sari", name: "Bu Sari", asset: "C01", x: 16, y: 11, color: "#cba7a0", role: "Tetangga lama" },
  { id: "naya", name: "Naya", asset: "C08", x: 19, y: 7, color: "#bc7651", role: "Pemilik warung pasar" },
] as const;
export type NpcId = (typeof NPCS)[number]["id"];
export const DEFAULT_STORY: StoryFlags = {
  orderAccepted: false, orderDone: false, canalClue: false, sarisStory: false,
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
    if (s.seeds < 1) return { state: s, message: "Bibit habis. Temui Naya untuk membeli bibit." };
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
    harvested: s.harvested + 1, coins: s.coins + 25,
    plots: s.plots.filter(q => q !== p) }),
    message: "Panen berhasil! +1 timun, +25 G. Timun masuk persediaan." };
}
export function acceptOrder(s: GameState): GameState {
  return { ...s, phoneRead: true, story: { ...s.story, orderAccepted: true } };
}
export function meetNpc(s: GameState, npc: NpcId): { state: GameState; title: string; lines: string[] } {
  if (npc === "raka") return { state: { ...s, story: { ...s.story, canalClue: true } }, title: "Raka · Pinggir Kebun",
    lines: s.story.canalClue
      ? ["Raka: Saluran air yang lama masih tersambung ke sawah. Kita perlu mencari peta aslinya."]
      : ["Raka: Dulu kebun di sini jauh lebih luas. Kota berkembang, tapi saluran air tua masih menyimpan rahasia.",
         "Raka: Coba tanyakan kepada Bu Sari. Beliau pasti ingat apa yang terjadi dulu."] };
  if (npc === "sari") return { state: { ...s, story: { ...s.story, sarisStory: true } }, title: "Bu Sari · Gang Kampung",
    lines: s.story.canalClue
      ? ["Bu Sari: Jadi Raka menemukan saluran tua itu? Dahulu di sini ada jembatan kecil tempat warga berbagi hasil panen.",
         "Bu Sari: Aku menyimpan foto lama. Datanglah lagi setelah panen pertamamu."]
      : ["Bu Sari: Selamat datang, Nak. Dulu suara air sawah lebih ramai daripada kendaraan.",
         "Bu Sari: Kalau ingin tahu sejarah kampung, coba berbincang dengan Raka."] };
  if (s.story.orderAccepted && !s.story.orderDone && s.harvested >= 4) return {
    state: { ...s, harvested: s.harvested - 4, coins: s.coins + 160,
      story: { ...s.story, orderDone: true } }, title: "Naya · Pesanan Selesai",
    lines: ["Naya: Wah, kamu benar-benar membawa empat timun! Terima kasih!",
      "Naya: Ini 160 G untuk jerih payahmu. Besok aku ingin mengenalkanmu pada pengelola pasar."] };
  return { state: s, title: "Naya · Warung Pasar", lines: [
    s.story.orderDone ? "Naya: Sejak bekerja sama denganmu, warungku mulai ramai. Kita perlu membuat acara panen bersama!" :
    s.story.orderAccepted ? "Naya: Aku menunggu empat timun segar. Kalau sudah dipanen, antarkan ke sini, ya." :
    "Naya: Hai, tetangga baru! Cek pesan di YZ Phone. Aku ada pesanan kecil untuk kebunmu.",
    s.seeds <= 2 && s.coins >= 40 ? "Naya: Bibit hampir habis? Gunakan tombol Beli Bibit di menu percakapan HP." :
      "Naya: Pasar paling ramai menjelang siang. Banyak cerita yang bisa kamu dengar di sini." ] };
}
export function buySeeds(s: GameState): GameState | null {
  if (s.coins < 40) return null;
  return { ...s, coins: s.coins - 40, seeds: s.seeds + 5 };
}
export function safeLoad(value: unknown): GameState | null {
  if (!value || typeof value !== "object") return null;
  const o = value as Partial<GameState>;
  if (o.version !== 1 || !o.player || !Number.isInteger(o.player.x) ||
    !Number.isInteger(o.player.y) || !Number.isInteger(o.day) ||
    !Number.isFinite(o.coins) || !Array.isArray(o.plots) || !o.story) return null;
  if (o.day! < 1 || o.day! > 100000 || o.plots.length > 48 ||
    o.player.x < 0 || o.player.x >= 24 || o.player.y < 5 || o.player.y >= 16 ||
    o.coins! < 0 || o.coins! > 99999999) return null;
  if (o.plots.some(p => !isFarm(p.x,p.y) || !Number.isInteger(p.stage) ||
     p.stage < -1 || p.stage > 3 || typeof p.watered !== "boolean")) return null;
  return { ...newGame(), ...o, player: { ...newGame().player, ...o.player },
    story: { ...DEFAULT_STORY, ...o.story }, plots: o.plots };
}
