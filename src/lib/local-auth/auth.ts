import { createHash, randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { z } from "zod";
import { getPool } from "./database";

export const SESSION_COOKIE = "yz_farm_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

const credentialsSchema = z.object({
  email: z.string().trim().email().max(254).transform(value => value.toLowerCase()),
  password: z.string().min(8).max(128),
});

export type Credentials = z.infer<typeof credentialsSchema>;
export type AuthUser = { id: string; email: string };

export function parseCredentials(input: unknown) {
  return credentialsSchema.safeParse(input);
}

export function hashSessionToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function deriveKey(password: string, salt: Buffer, keyLength: number): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scryptCallback(password, salt, keyLength, {
      N: 32768,
      r: 8,
      p: 1,
      maxmem: 64 * 1024 * 1024,
    }, (error, key) => {
      if (error) reject(error);
      else resolve(key);
    });
  });
}

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await deriveKey(password, salt, 64);
  return `scrypt$32768$8$1$${salt.toString("hex")}$${key.toString("hex")}`;
}

async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [algorithm, n, r, p, saltHex, keyHex] = stored.split("$");
  if (algorithm !== "scrypt" || n !== "32768" || r !== "8" || p !== "1" ||
      !saltHex || !keyHex || !/^[a-f0-9]{32}$/.test(saltHex) || !/^[a-f0-9]{128}$/.test(keyHex)) {
    return false;
  }

  const expected = Buffer.from(keyHex, "hex");
  const actual = await deriveKey(password, Buffer.from(saltHex, "hex"), expected.length);
  return timingSafeEqual(actual, expected);
}

export async function registerUser(credentials: Credentials): Promise<AuthUser> {
  const passwordHash = await hashPassword(credentials.password);
  const result = await getPool().query<AuthUser>(
    "INSERT INTO yz_game_users (email, password_hash) VALUES ($1, $2) RETURNING id, email",
    [credentials.email, passwordHash],
  );
  return result.rows[0]!;
}

export async function loginUser(credentials: Credentials): Promise<AuthUser | null> {
  const result = await getPool().query<AuthUser & { password_hash: string }>(
    "SELECT id, email, password_hash FROM yz_game_users WHERE email = $1",
    [credentials.email],
  );
  const user = result.rows[0];
  if (!user || !(await verifyPassword(credentials.password, user.password_hash))) return null;
  return { id: user.id, email: user.email };
}

export async function createSession(user: AuthUser): Promise<string> {
  const token = randomBytes(32).toString("base64url");
  const tokenHash = hashSessionToken(token);
  const pool = getPool();
  await pool.query("DELETE FROM yz_game_sessions WHERE expires_at <= now()");
  await pool.query(
    "INSERT INTO yz_game_sessions (user_id, token_hash, expires_at) VALUES ($1, $2, now() + interval '30 days')",
    [user.id, tokenHash],
  );
  return token;
}

export async function getAuthenticatedUser(token?: string): Promise<AuthUser | null> {
  if (!token) return null;
  const result = await getPool().query<AuthUser>(
    `SELECT u.id, u.email
       FROM yz_game_sessions s
       JOIN yz_game_users u ON u.id = s.user_id
      WHERE s.token_hash = $1 AND s.expires_at > now()`,
    [hashSessionToken(token)],
  );
  return result.rows[0] ?? null;
}

export async function getCookieToken(): Promise<string | undefined> {
  return (await cookies()).get(SESSION_COOKIE)?.value;
}

export async function deleteSession(token?: string): Promise<void> {
  if (!token) return;
  await getPool().query("DELETE FROM yz_game_sessions WHERE token_hash = $1", [hashSessionToken(token)]);
}

export function shouldSecureSessionCookie(request: Request): boolean {
  const lanOrigin = process.env.GAME_HTTP_LOGIN_ORIGIN;
  return process.env.NODE_ENV === "production" &&
    !(lanOrigin?.startsWith("http://") && request.headers.get("origin") === lanOrigin);
}

export function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  const requestUrl = new URL(request.url);
  const host = request.headers.get("x-forwarded-host") ?? requestUrl.host;
  const protocol = request.headers.get("x-forwarded-proto")?.split(",", 1)[0]?.trim() ?? requestUrl.protocol.slice(0, -1);
  if (!host || (protocol !== "http" && protocol !== "https")) return false;
  try {
    return new URL(origin).origin === new URL(`${protocol}://${host}`).origin;
  } catch {
    return false;
  }
}

export async function readJson(request: Request, maxBytes = 4096): Promise<unknown> {
  const length = Number(request.headers.get("content-length") ?? "0");
  if (length > maxBytes) throw new RangeError("Request body is too large.");
  const text = await request.text();
  if (Buffer.byteLength(text, "utf8") > maxBytes) throw new RangeError("Request body is too large.");
  return JSON.parse(text) as unknown;
}
