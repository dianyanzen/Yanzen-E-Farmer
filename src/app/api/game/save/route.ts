import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { safeLoad } from "@/lib/game/model";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const noStore = { "Cache-Control": "private, no-store" };
function failure(error: string, status: number) {
  return NextResponse.json({ error }, { status, headers: noStore });
}

export async function GET() {
  try {
    const db = await createClient();
    const { data: auth, error: authError } = await db.auth.getUser();
    if (authError || !auth.user) return failure("Silakan masuk terlebih dahulu.", 401);

    const { data, error } = await db.from("yz_game_saves")
      .select("data").eq("user_id", auth.user.id).maybeSingle();
    if (error) {
      console.error("Game cloud save read failed:", error.message);
      return failure("Database progres belum tersedia. Periksa migrasi game.", 503);
    }
    return NextResponse.json({ data: data?.data ?? null }, { headers: noStore });
  } catch (error) {
    console.error("Game cloud save load failed:", error);
    return failure("Progres permainan tidak dapat dimuat.", 503);
  }
}

export async function PUT(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin || origin !== new URL(request.url).origin)
    return failure("Permintaan lintas situs ditolak.", 403);
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json"))
    return failure("Content-Type harus application/json.", 415);

  try {
    const db = await createClient();
    const { data: auth, error: authError } = await db.auth.getUser();
    if (authError || !auth.user) return failure("Silakan masuk terlebih dahulu.", 401);
    const length = Number(request.headers.get("content-length") ?? "0");
    if (!Number.isFinite(length) || length < 0 || length > 140000)
      return failure("Data permainan terlalu besar.", 413);
    const raw = await request.text();
    if (Buffer.byteLength(raw, "utf8") > 140000)
      return failure("Data permainan terlalu besar.", 413);
    let payload: unknown;
    try { payload = JSON.parse(raw) as unknown; }
    catch { return failure("JSON tidak valid.", 400); }
    if (!payload || typeof payload !== "object" || !("data" in payload))
      return failure("Data progres tidak ditemukan.", 400);
    const state = safeLoad(payload.data);
    if (!state) return failure("Format progres tidak dikenali.", 400);
    if (Buffer.byteLength(JSON.stringify(state), "utf8") > 131072)
      return failure("Batas ukuran progres terlampaui.", 413);

    const { data, error } = await db.from("yz_game_saves").upsert({
      user_id: auth.user.id, version: 1, data: state,
      updated_at: new Date().toISOString()
    }, { onConflict: "user_id" }).select("updated_at").single();
    if (error) {
      console.error("Game cloud save write failed:", error.message);
      return failure("Progres gagal disimpan. Jangan tutup permainan.", 503);
    }
    return NextResponse.json({ updatedAt: data.updated_at }, { headers: noStore });
  } catch (error) {
    console.error("Game cloud save update failed:", error);
    return failure("Progres gagal disimpan. Jangan tutup permainan.", 503);
  }
}
