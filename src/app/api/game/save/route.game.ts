import { NextResponse } from "next/server";
import { getAuthenticatedUser, getCookieToken, isSameOrigin, readJson } from "@/lib/local-auth/auth";
import { getPool } from "@/lib/local-auth/database";
import { safeLoad } from "@/lib/game/model";

export const runtime = "nodejs";

export async function GET() {
  try {
    const user = await getAuthenticatedUser(await getCookieToken());
    if (!user) return NextResponse.json({ error: "Sesi masuk tidak ditemukan." }, { status: 401 });
    const result = await getPool().query<{ data: unknown }>(
      "SELECT data FROM yz_game_saves WHERE user_id = $1",
      [user.id],
    );
    return NextResponse.json({ data: result.rows[0]?.data ?? null }, {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (error) {
    console.error("Game save load failed:", error);
    return NextResponse.json({ error: "Progres game tidak dapat dimuat dari PostgreSQL." }, { status: 503 });
  }
}

export async function PUT(request: Request) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Permintaan tidak valid." }, { status: 403 });

  try {
    const user = await getAuthenticatedUser(await getCookieToken());
    if (!user) return NextResponse.json({ error: "Sesi masuk tidak ditemukan." }, { status: 401 });

    let input: unknown;
    try {
      input = await readJson(request, 140000);
    } catch (error) {
      const message = error instanceof RangeError ? error.message : "Format permintaan tidak valid.";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    if (!input || typeof input !== "object" || !("data" in input)) {
      return NextResponse.json({ error: "Data progres tidak ditemukan." }, { status: 400 });
    }

    const game = safeLoad(input.data);
    if (!game) return NextResponse.json({ error: "Format progres game tidak dikenali." }, { status: 400 });

    const result = await getPool().query<{ updated_at: string }>(
      `INSERT INTO yz_game_saves (user_id, version, data, updated_at)
       VALUES ($1, 1, $2::jsonb, now())
       ON CONFLICT (user_id)
       DO UPDATE SET version = 1, data = EXCLUDED.data, updated_at = now()
       RETURNING updated_at`,
      [user.id, JSON.stringify(game)],
    );
    return NextResponse.json({ updatedAt: result.rows[0]!.updated_at }, {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (error) {
    console.error("Game save write failed:", error);
    return NextResponse.json({ error: "Progres game gagal disimpan ke PostgreSQL." }, { status: 503 });
  }
}
