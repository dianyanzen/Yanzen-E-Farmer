/** Small, physical, inspectable route signs. No permanent floating labels. */
import type { OutdoorLocation } from "./model";

export type Signpost = {
  location: OutdoorLocation;
  x: number; y: number; symbol: string;
  title: string; message: string;
};

export const SIGNPOSTS: readonly Signpost[] = [
  {location:"field", x:23, y:9, symbol:"→",
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

export function drawSignposts(ctx: CanvasRenderingContext2D, location: OutdoorLocation) {
  ctx.save();
  ctx.font = "bold 10px monospace";
  ctx.textBaseline = "alphabetic";
  for (const sign of SIGNPOSTS) {
    if (sign.location !== location) continue;
    const x = sign.x * 20, y = sign.y * 20;
    // Board + post are actual world objects; full directions appear only on inspect.
    ctx.fillStyle="#593c29"; ctx.fillRect(x+8,y+10,4,10);
    ctx.fillStyle="#bd985e"; ctx.fillRect(x+1,y+1,18,12);
    ctx.fillStyle="#ebd2a0"; ctx.fillRect(x+3,y+3,14,8);
    ctx.strokeStyle="#5d4935"; ctx.lineWidth=1; ctx.strokeRect(x+1.5,y+1.5,17,11);
    ctx.fillStyle="#4b3828";ctx.fillText(sign.symbol,x+5,y+11);
  }
  ctx.restore();
}
