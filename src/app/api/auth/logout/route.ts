import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin || origin !== new URL(request.url).origin) {
    return NextResponse.json({ error: "Permintaan tidak valid." }, { status: 403 });
  }
  const db = await createClient();
  const { error } = await db.auth.signOut();
  if (error) return NextResponse.json({ error: "Sesi gagal ditutup." }, { status: 503 });
  return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
}
