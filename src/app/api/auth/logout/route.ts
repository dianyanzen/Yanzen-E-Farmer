import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin || origin !== new URL(request.url).origin) {
    return NextResponse.json({ error: "Permintaan lintas situs ditolak." }, { status: 403 });
  }
  try {
    const db = await createClient();
    const { error } = await db.auth.signOut();
    if (error) {
      console.error("Game cloud logout failed:", error.message);
      return NextResponse.json({ error: "Gagal keluar dari akun." }, { status: 503 });
    }
    return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Game cloud logout unavailable:", error);
    return NextResponse.json({ error: "Layanan keluar tidak tersedia." }, { status: 503 });
  }
}
