import { NextResponse } from "next/server";
export const runtime = "nodejs";
export async function GET() {
  return NextResponse.json({ status: "ok", game: "yz-farm-life", renderer: "phaser", saveBackend: "supabase" }, {
    headers: { "Cache-Control": "no-store" }
  });
}
