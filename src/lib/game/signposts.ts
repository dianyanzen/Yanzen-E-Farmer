/** Small, physical, inspectable route signs. No permanent floating labels. */
import { SIGNPOSTS, type OutdoorLocation } from "./model";

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
