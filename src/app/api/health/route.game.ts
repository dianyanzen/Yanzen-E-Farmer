import { NextResponse } from "next/server";
import { getPool } from "@/lib/local-auth/database";

export const runtime = "nodejs";

export async function GET() {
  try {
    await getPool().query("SELECT 1");
    return NextResponse.json({ status: "ok", database: "ok" }, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("Game health check failed:", error);
    return NextResponse.json({ status: "unavailable", database: "unavailable" }, { status: 503 });
  }
}
