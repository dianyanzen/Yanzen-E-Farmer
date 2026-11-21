import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const db = await createClient();
  const { data: { user }, error } = await db.auth.getUser();
  if (error || !user) return NextResponse.json({ error: "Sesi masuk tidak ditemukan." }, {
    status: 401, headers: { "Cache-Control": "private, no-store" }
  });
  return NextResponse.json({ user: { id: user.id, email: user.email } }, {
    headers: { "Cache-Control": "private, no-store" }
  });
}
