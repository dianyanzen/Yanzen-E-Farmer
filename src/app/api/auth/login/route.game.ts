import { NextResponse } from "next/server";
import {
  createSession,
  isSameOrigin,
  shouldSecureSessionCookie,
  loginUser,
  parseCredentials,
  readJson,
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
} from "@/lib/local-auth/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Permintaan tidak valid." }, { status: 403 });

  let input: unknown;
  try {
    input = await readJson(request);
  } catch (error) {
    const message = error instanceof RangeError ? error.message : "Format permintaan tidak valid.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const parsed = parseCredentials(input);
  if (!parsed.success) {
    return NextResponse.json({ error: "Email atau kata sandi tidak valid." }, { status: 400 });
  }

  try {
    const user = await loginUser(parsed.data);
    if (!user) return NextResponse.json({ error: "Email atau kata sandi salah." }, { status: 401 });

    const token = await createSession(user);
    const response = NextResponse.json({ user }, { headers: { "Cache-Control": "no-store" } });
    response.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: shouldSecureSessionCookie(request),
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE_SECONDS,
    });
    return response;
  } catch (error) {
    console.error("Local account login failed:", error);
    return NextResponse.json({ error: "Masuk gagal karena layanan penyimpanan tidak tersedia." }, { status: 503 });
  }
}
