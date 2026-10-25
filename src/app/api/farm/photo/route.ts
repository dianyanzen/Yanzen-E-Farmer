import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
export async function POST(req: NextRequest) {
  const db = await createClient();
  const { data: auth } = await db.auth.getUser();
  if (!auth.user)
    return NextResponse.json({ error: "Silakan masuk" }, { status: 401 });
  try {
    const form = await req.formData();
    const org = z.uuid().parse(form.get("organization_id"));
    const file = form.get("photo");
    if (
      !(file instanceof File) ||
      file.size > 5 * 1024 * 1024 ||
      file.size === 0 ||
      !["image/jpeg", "image/png", "image/webp"].includes(file.type)
    )
      return NextResponse.json(
        { error: "Gunakan JPG, PNG atau WebP, maksimal 5 MB" },
        { status: 400 },
      );
    const ext =
      file.type === "image/jpeg"
        ? "jpg"
        : file.type === "image/png"
          ? "png"
          : "webp";
    const path = `${org}/${crypto.randomUUID()}.${ext}`;
    const { error } = await db.storage
      .from("farm-evidence")
      .upload(path, file, { contentType: file.type, upsert: false });
    if (error)
      return NextResponse.json(
        { error: "Foto gagal diunggah. Periksa akses dan koneksi." },
        { status: 400 },
      );
    return NextResponse.json({ path });
  } catch {
    return NextResponse.json(
      { error: "Foto atau usaha tidak valid" },
      { status: 400 },
    );
  }
}
export async function GET(req: NextRequest) {
  const db = await createClient();
  const { data: auth } = await db.auth.getUser();
  if (!auth.user)
    return NextResponse.json({ error: "Silakan masuk" }, { status: 401 });
  const path = req.nextUrl.searchParams.get("path") || "";
  if (!/^[a-f0-9-]{36}\/[a-f0-9-]{36}\.(jpg|png|webp)$/.test(path))
    return NextResponse.json({ error: "Foto tidak valid" }, { status: 400 });
  const { data, error } = await db.storage
    .from("farm-evidence")
    .createSignedUrl(path, 60);
  if (error)
    return NextResponse.json(
      { error: "Tidak dapat membuka foto" },
      { status: 403 },
    );
  return NextResponse.redirect(data.signedUrl);
}
