import { NextResponse } from "next/server";
import {
  createSession,
  isSameOrigin,
  shouldSecureSessionCookie,
  parseCredentials,
  readJson,
  registerUser,
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
    return NextResponse.json({ error: "Gunakan email yang valid dan kata sandi minimal 8 karakter." }, { status: 400 });
  }

  try {
    const user = await registerUser(parsed.data);
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
    if (typeof error === "object" && error !== null && "code" in error && error.code === "23505") {
      return NextResponse.json({ error: "Email sudah terdaftar." }, { status: 409 });
    }
    console.error("Local account registration failed:", error);
    return NextResponse.json({ error: "Pendaftaran gagal karena layanan penyimpanan tidak tersedia." }, { status: 503 });
  }
}
