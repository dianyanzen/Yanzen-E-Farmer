import { NextResponse } from "next/server";
import { getAuthenticatedUser, getCookieToken } from "@/lib/local-auth/auth";

export const runtime = "nodejs";

export async function GET() {
  try {
    const user = await getAuthenticatedUser(await getCookieToken());
    if (!user) return NextResponse.json({ error: "Sesi masuk tidak ditemukan." }, { status: 401 });
    return NextResponse.json({ user }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error("Local session lookup failed:", error);
    return NextResponse.json({ error: "Autentikasi lokal tidak tersedia." }, { status: 503 });
  }
}
