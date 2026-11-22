import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { newGame } from "@/lib/game/model";
import { nextSaveRevision } from "@/lib/game/save-revision";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const noStore = { "Cache-Control": "private, no-store" };

/** Reset only the authenticated player's save, never auth, roster or other accounts.
 * Only invoked after the player confirms the destructive action in YZ Phone.
 */
export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin || origin !== new URL(request.url).origin) {
    return NextResponse.json({ error: "Permintaan tidak valid." }, { status: 403, headers: noStore });
  }

  const db = await createClient();
  const { data: { user }, error: authError } = await db.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Sesi permainan tidak ditemukan." }, { status: 401, headers: noStore });
  }

  // The save is the sole private progress record. Replace it with the canonical
  // first-day state, including NPC relationships, missions, choices and rewards.
  const { data: previous, error: readError } = await db.from("yz_game_saves")
    .select("updated_at").eq("user_id", user.id).maybeSingle();
  if (readError) {
    console.error("YZ game reset read error:", readError.code);
    return NextResponse.json({ error: "Catatan permainan belum bisa direset." }, { status: 503, headers: noStore });
  }

  const initial = newGame();
  const { data, error } = await db.from("yz_game_saves").upsert(
    { user_id: user.id, version: 1, data: initial, updated_at: nextSaveRevision(previous?.updated_at ?? null) },
    { onConflict: "user_id" }
  ).select("updated_at").single();
  if (error) {
    console.error("YZ game reset error:", error.code);
    return NextResponse.json({ error: "Reset gagal. Progres lama tidak diubah." }, { status: 503, headers: noStore });
  }

  return NextResponse.json({ reset: true, updatedAt: data.updated_at }, { headers: noStore });
}
