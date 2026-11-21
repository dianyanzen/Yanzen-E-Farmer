import { NextResponse } from "next/server";
import { deleteSession, getCookieToken, isSameOrigin, shouldSecureSessionCookie, SESSION_COOKIE } from "@/lib/local-auth/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Permintaan tidak valid." }, { status: 403 });

  try {
    await deleteSession(await getCookieToken());
    const response = NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
    response.cookies.set(SESSION_COOKIE, "", {
      httpOnly: true,
      secure: shouldSecureSessionCookie(request),
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });
    return response;
  } catch (error) {
    console.error("Local account logout failed:", error);
    return NextResponse.json({ error: "Keluar gagal karena layanan penyimpanan tidak tersedia." }, { status: 503 });
  }
}
