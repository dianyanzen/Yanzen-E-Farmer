import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { safeLoad } from "@/lib/game/model";
import { nextSaveRevision } from "@/lib/game/save-revision";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const noStore = { "Cache-Control": "private, no-store" };

export async function GET() {
  const db = await createClient();
  const { data: { user }, error: authError } = await db.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Sesi game tidak ditemukan." }, { status: 401, headers: noStore });
  }
  const { data, error } = await db.from("yz_game_saves").select("data, updated_at").eq("user_id", user.id).maybeSingle();
  if (error) {
    console.error("YZ game load error:", error.code);
    return NextResponse.json({ error: "Progres game tidak dapat dibaca." }, { status: 503, headers: noStore });
  }
  return NextResponse.json({ data: data?.data ?? null, updatedAt: data?.updated_at ?? null }, { headers: noStore });
}

export async function PUT(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin || origin !== new URL(request.url).origin) {
    return NextResponse.json({ error: "Permintaan tidak valid." }, { status: 403, headers: noStore });
  }
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
    return NextResponse.json({ error: "Konten harus JSON." }, { status: 415, headers: noStore });
  }
  const db = await createClient();
  const { data: { user }, error: authError } = await db.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Sesi game tidak ditemukan." }, { status: 401, headers: noStore });
  }
  const length = Number(request.headers.get("content-length") ?? 0);
  if (!Number.isFinite(length) || length > 140000) {
    return NextResponse.json({ error: "Ukuran save terlalu besar." }, { status: 413, headers: noStore });
  }
  let input: unknown;
  try {
    const body = await request.text();
    if (new TextEncoder().encode(body).byteLength > 140000) {
      return NextResponse.json({ error: "Ukuran save terlalu besar." }, { status: 413, headers: noStore });
    }
    input = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "Format JSON tidak valid." }, { status: 400, headers: noStore });
  }
  if (!input || typeof input !== "object" || !("data" in input) || !("expectedUpdatedAt" in input)) {
    return NextResponse.json({ error: "Data game kosong." }, { status: 400, headers: noStore });
  }
  const expectedUpdatedAt = input.expectedUpdatedAt;
  if (expectedUpdatedAt !== null && (
    typeof expectedUpdatedAt !== "string" ||
    expectedUpdatedAt.length > 64 ||
    !Number.isFinite(Date.parse(expectedUpdatedAt))
  )) {
    return NextResponse.json({ error: "Versi penyimpanan tidak valid." }, { status: 400, headers: noStore });
  }
  const game = safeLoad(input.data);
  if (!game) {
    return NextResponse.json({ error: "Versi save tidak dikenal. Save lama tidak ditimpa." }, { status: 400, headers: noStore });
  }
  if (new TextEncoder().encode(JSON.stringify(game)).byteLength > 131072) {
    return NextResponse.json({ error: "Save melampaui batas." }, { status: 413, headers: noStore });
  }
  // A new save is inserted once. Existing saves must match the version the
  // browser loaded; otherwise an old tab could revive progress after reset.
  const revision = nextSaveRevision(expectedUpdatedAt);
  const saveRow = { user_id: user.id, version: 1, data: game, updated_at: revision };
  const operation = expectedUpdatedAt === null
    ? db.from("yz_game_saves").insert(saveRow).select("updated_at").single()
    : db.from("yz_game_saves").update(saveRow)
        .eq("user_id", user.id).eq("updated_at", expectedUpdatedAt)
        .select("updated_at").maybeSingle();
  const { data, error } = await operation;
  if (error?.code === "23505") {
    return NextResponse.json({ error: "Progres permainan sudah berubah di perangkat lain. Muat ulang untuk melihat catatan terbaru." },
      { status: 409, headers: noStore });
  }
  if (error) {
    console.error("YZ game save error:", error.code);
    return NextResponse.json({ error: "Progres belum tersimpan. Coba lagi." }, { status: 503, headers: noStore });
  }
  if (!data) {
    return NextResponse.json({ error: "Progres permainan sudah berubah di perangkat lain. Muat ulang untuk melihat catatan terbaru." },
      { status: 409, headers: noStore });
  }
  return NextResponse.json({ updatedAt: data.updated_at }, { headers: noStore });
}
