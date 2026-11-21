import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = await createClient();
    const { data, error } = await db.auth.getUser();
    if (error || !data.user) {
      return NextResponse.json({ error: "Sesi masuk tidak ditemukan." },
        { status: 401, headers: { "Cache-Control": "private, no-store" } });
    }
    return NextResponse.json({ user: { id: data.user.id, email: data.user.email } },
      { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error("Game cloud session lookup failed:", error);
    return NextResponse.json({ error: "Sesi game tidak tersedia." },
      { status: 503, headers: { "Cache-Control": "private, no-store" } });
  }
}
