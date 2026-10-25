import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { entities, entryFields } from "@/lib/farm/model";
import { z } from "zod";
export const dynamic = "force-dynamic";
const tables: Record<string, string> = {
  lands: "farm_lands",
  blocks: "farm_blocks",
  cycles: "farm_cycles",
  accounts: "farm_accounts",
  parties: "farm_parties",
};
const uuid = z.uuid();
const fail = (message: string, status = 400) =>
  NextResponse.json({ error: message }, { status });
export async function GET(req: NextRequest) {
  const db = await createClient();
  const { data: auth, error } = await db.auth.getUser();
  if (error || !auth.user) return fail("Silakan masuk kembali", 401);
  const { data: orgs, error: oe } = await db
    .from("farm_organizations")
    .select("*")
    .order("created_at");
  if (oe)
    return fail("Modul operasional belum tersedia atau gagal dimuat", 503);
  const requested = req.nextUrl.searchParams.get("org");
  const org = orgs?.find((o) => o.id === requested) ?? orgs?.[0];
  if (!org)
    return NextResponse.json({ organizations: [], userId: auth.user.id });
  const from = req.nextUrl.searchParams.get("from") || "1900-01-01";
  const to = req.nextUrl.searchParams.get("to") || "9999-12-31";
  if (
    !z.iso.date().safeParse(from).success ||
    !z.iso.date().safeParse(to).success ||
    from > to
  )
    return fail("Rentang tanggal tidak valid");
  const all = async (table: string) => {
    const rows = [];
    for (let offset = 0; ; offset += 500) {
      const r = await db
        .from(table)
        .select("*")
        .eq("organization_id", org.id)
        .order("id")
        .range(offset, offset + 499);
      if (r.error) throw r.error;
      rows.push(...r.data);
      if (r.data.length < 500) break;
    }
    return rows;
  };
  try {
    const result = await Promise.all(
      Object.entries(tables).map(async ([key, table]) => [
        key,
        await all(table),
      ]),
    );
    const page = Math.max(
      0,
      Math.min(100000, Number(req.nextUrl.searchParams.get("page")) || 0),
    );
    let query = db
      .from("farm_entries")
      .select("*", { count: "exact" })
      .eq("organization_id", org.id)
      .gte("entry_date", from)
      .lte("entry_date", to)
      .order("entry_date", { ascending: false })
      .order("created_at", { ascending: false })
      .range(page * 50, page * 50 + 49);
    const kind = req.nextUrl.searchParams.get("kind");
    if (kind && entryFields[kind]) query = query.eq("kind", kind);
    const [entries, report, members, analysis] = await Promise.all([
      query,
      db.rpc("farm_report", { org: org.id, date_from: from, date_to: to }),
      db.from("farm_members").select("*").eq("organization_id", org.id),
      db.rpc("farm_analysis", { org: org.id, date_from: from, date_to: to }),
    ]);
    if (entries.error || report.error || members.error || analysis.error)
      throw entries.error || report.error || members.error;
    // Reference pickers are paginated independently, never inferred from the visible history page.
    const refs = await all("farm_entries");
    return NextResponse.json({
      organizations: orgs,
      organization: org,
      userId: auth.user.id,
      role:
        org.owner_id === auth.user.id
          ? "owner"
          : members.data?.find((m) => m.user_id === auth.user.id)?.role,
      ...Object.fromEntries(result),
      entries: entries.data,
      total: entries.count,
      page,
      report: report.data,
      analysis: analysis.data,
      references: refs.filter((r) => r.status === "posted"),
      members: members.data,
    });
  } catch {
    return fail(
      "Data gagal dimuat. Coba lagi; angka kosong tidak ditampilkan sebagai nol.",
      503,
    );
  }
}
export async function POST(req: NextRequest) {
  const db = await createClient();
  const { data: auth, error } = await db.auth.getUser();
  if (error || !auth.user) return fail("Silakan masuk kembali", 401);
  if (Number(req.headers.get("content-length") || 0) > 200000)
    return fail("Data terlalu besar", 413);
  try {
    const text = await req.text();
    if (text.length > 200000) return fail("Data terlalu besar", 413);
    const body = JSON.parse(text);
    const action = body.action;
    if (action === "organization") {
      const name = z.string().trim().min(1).max(160).parse(body.name);
      const r = await db.rpc("farm_create_organization", {
        org_name: name,
        request_id: uuid.parse(body.id),
      });
      if (r.error) return fail(r.error.message);
      return NextResponse.json({ id: r.data });
    }
    const org = uuid.parse(body.organization_id);
    if (action === "entity") {
      const type = String(body.entity);
      if (!entities[type]) return fail("Jenis data tidak dikenal");
      const values: Record<string, unknown> = { organization_id: org };
      for (const field of entities[type]) {
        const value = body.values?.[field.key];
        if (field.required && (value === undefined || value === ""))
          return fail(`${field.label} wajib diisi`);
        if (value === undefined || value === "") continue;
        if (field.type === "number") {
          values[field.key] = z.coerce.number().finite().parse(value);
        } else if (field.type === "checkbox")
          values[field.key] = value === true || value === "true";
        else {
          values[field.key] = z.string().max(3000).parse(value);
          if (field.options && !field.options.includes(String(value)))
            return fail("Pilihan tidak valid");
          if (field.source) uuid.parse(value);
          if (field.type === "date") z.iso.date().parse(value);
        }
      }
      if (body.id) values.id = uuid.parse(body.id);
      const r = await db.from(tables[type]).insert(values).select().single();
      if (r.error) return fail(r.error.message);
      return NextResponse.json(r.data);
    }
    if (action === "entries") {
      const rows = z
        .array(z.record(z.string(), z.unknown()))
        .min(1)
        .max(100)
        .parse(body.rows);
      for (const row of rows) {
        uuid.parse(row.id);
        if (row.organization_id !== org || !entryFields[String(row.kind)])
          return fail("Transaksi tidak valid");
        z.iso.date().parse(row.entry_date);
        z.string().trim().min(1).max(200).parse(row.title);
      }
      const r = await db.rpc("farm_save_entries", { rows });
      if (r.error) return fail(r.error.message);
      return NextResponse.json({ rows: r.data });
    }
    if (action === "void") {
      const reason = z.string().trim().min(3).max(500).parse(body.reason);
      const r = await db
        .from("farm_entries")
        .update({ status: "void", void_reason: reason })
        .eq("id", uuid.parse(body.id))
        .eq("organization_id", org)
        .select("id")
        .single();
      if (r.error) return fail(r.error.message);
      return NextResponse.json({ id: r.data.id });
    }
    if (action === "attach") {
      const r = await db
        .from("farm_cycles")
        .update({
          block_id: uuid.parse(body.block_id),
          start_date: z.iso.date().parse(body.start_date),
          area_m2: z.coerce.number().positive().finite().parse(body.area_m2),
          shared: body.shared === "true",
        })
        .eq("id", uuid.parse(body.id))
        .eq("organization_id", org)
        .is("block_id", null)
        .select("id")
        .single();
      if (r.error) return fail(r.error.message);
      return NextResponse.json(r.data);
    }
    if (action === "close_block") {
      const r = await db
        .from("farm_blocks")
        .update({ active_to: z.iso.date().parse(body.end_date) })
        .eq("id", uuid.parse(body.id))
        .eq("organization_id", org)
        .select("id")
        .single();
      if (r.error) return fail(r.error.message);
      return NextResponse.json(r.data);
    }
    if (action === "close_cycle") {
      const r = await db
        .from("farm_cycles")
        .update({
          status: "closed",
          end_date: z.iso.date().parse(body.end_date),
        })
        .eq("id", uuid.parse(body.id))
        .eq("organization_id", org)
        .select("id")
        .single();
      if (r.error) return fail(r.error.message);
      return NextResponse.json(r.data);
    }
    if (action === "rename_org") {
      const r = await db
        .from("farm_organizations")
        .update({ name: z.string().trim().min(1).max(160).parse(body.name) })
        .eq("id", org)
        .select("id")
        .single();
      if (r.error) return fail(r.error.message);
      return NextResponse.json(r.data);
    }
    if (action === "member") {
      const r = await db
        .from("farm_members")
        .upsert({
          organization_id: org,
          user_id: uuid.parse(body.user_id),
          role: z
            .enum(["manager", "recorder", "finance", "reader"])
            .parse(body.role),
        })
        .select()
        .single();
      if (r.error) return fail(r.error.message);
      return NextResponse.json(r.data);
    }
    if (action === "remove_member") {
      const r = await db
        .from("farm_members")
        .delete()
        .eq("organization_id", org)
        .eq("user_id", uuid.parse(body.user_id));
      if (r.error) return fail(r.error.message);
      return NextResponse.json({ ok: true });
    }
    return fail("Tindakan tidak dikenal");
  } catch (e) {
    return fail(
      e instanceof z.ZodError
        ? "Periksa format dan kelengkapan data"
        : "Gagal memproses. Periksa koneksi dan coba lagi.",
    );
  }
}
