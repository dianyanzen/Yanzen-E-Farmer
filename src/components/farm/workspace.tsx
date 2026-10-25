"use client";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import Link from "next/link";
import Image from "next/image";
import { FarmPageTemplate, FarmActionLink } from "@/components/farm-template";
import {
  entities,
  entityNames,
  entryFields,
  names,
  labels,
  money,
  today,
  type Field,
  type Row,
} from "@/lib/farm/model";
type Snapshot = {
  organizations: Row[];
  organization?: Row;
  userId: string;
  role?: string;
  lands: Row[];
  blocks: Row[];
  cycles: Row[];
  accounts: Row[];
  parties: Row[];
  entries: Row[];
  references: Row[];
  members: Row[];
  total: number;
  page: number;
  analysis: { cycles: Row[]; inventory: Row[]; labor: Row[]; daily: Row[] };
  report: {
    cash: Row[];
    cash_in: number;
    cash_out: number;
    by_kind: Row[];
    harvests: Row[];
    outstanding: Row[];
  };
};
type Labor = {
  job: string;
  people: number;
  units: number;
  basis: string;
  rate: number;
  overtime_people: number;
  overtime_hours: number;
  overtime_rate: number;
};
const blankLabor = (): Labor => ({
  job: "",
  people: 1,
  units: 1,
  basis: "hari",
  rate: 0,
  overtime_people: 0,
  overtime_hours: 0,
  overtime_rate: 0,
});
const button = "farm-button farm-button-primary";
const secondary = "farm-button farm-button-secondary";
const cashPermission = ["owner", "manager", "finance"];
export default function Workspace({ view }: { view: string }) {
  const [data, setData] = useState<Snapshot | null>(null);
  const [org, setOrg] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [kindFilter, setKindFilter] = useState("");
  const [page, setPage] = useState(0);
  const [revision, setRevision] = useState(0);
  const [mode, setMode] = useState("");
  const [values, setValues] = useState<Record<string, string>>({});
  const [lines, setLines] = useState<Labor[]>([blankLabor()]);
  const [busy, setBusy] = useState(false);
  const [payNow, setPayNow] = useState(false);
  const [payAccount, setPayAccount] = useState("");
  const [paidAmount, setPaidAmount] = useState("");
  const dialogRef = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (mode) dialogRef.current?.showModal();
  }, [mode]);
  const requestId = useRef("");
  const paymentId = useRef("");
  const busyRef = useRef(false);
  const [draftAvailable, setDraftAvailable] = useState(false);
  useEffect(() => {
    const abort = new AbortController();
    setLoading(true);
    setError("");
    const q = new URLSearchParams({ org, page: String(page) });
    if (from) q.set("from", from);
    if (to) q.set("to", to);
    if (kindFilter) q.set("kind", kindFilter);
    fetch("/api/farm?" + q, { signal: abort.signal })
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error);
        setData(d);
      })
      .catch((e) => {
        if (e.name !== "AbortError") setError(e.message);
      })
      .finally(() => {
        if (!abort.signal.aborted) setLoading(false);
      });
    return () => abort.abort();
  }, [org, from, to, kindFilter, page, revision]);
  const draftKey = data?.organization
    ? `farmer:v2:draft:${data.userId}:${data.organization.id}`
    : "";
  useEffect(() => {
    if (draftKey) {
      try {
        setDraftAvailable(!!localStorage.getItem(draftKey));
      } catch {
        setDraftAvailable(false);
      }
    }
  }, [draftKey]);
  const refresh = () => setRevision((n) => n + 1);
  const change = (key: string, value: string) =>
    setValues((v) => ({ ...v, [key]: value }));
  const open = useCallback((next: string, preset: Record<string, string> = {}) => {
    requestId.current = crypto.randomUUID();
    paymentId.current = crypto.randomUUID();
    setMode(next);
    setValues({
      entry_date: today(),
      start_date: today(),
      active_from: today(),
      ...preset,
    });
    setLines([blankLabor()]);
    setPayNow(false);
    setPaidAmount("");
    setPayAccount("");
    setError("");
    setNotice("");
  }, []);
  const actionOpened = useRef(false);
  useEffect(() => {
    if (loading || !data?.organization || actionOpened.current) return;
    const params = new URLSearchParams(window.location.search);
    const requested = params.get("action");
    if (!requested) return;
    actionOpened.current = true;
    const allowed = (requested.startsWith("entry:") && !!entryFields[requested.slice(6)])
      || (requested.startsWith("entity:") && !!entities[requested.slice(7)]);
    if (!allowed) return;
    if (data.role === "reader") {
      setError("Akun pembaca tidak memiliki izin mencatat.");
      return;
    }
    const preset: Record<string, string> = {};
    for (const key of ["parent_id", "cycle_id", "party_id", "title"]) {
      const value = params.get(key);
      if (value && value.length <= 180 && (key === "title" || /^[0-9a-f-]{36}$/i.test(value))) {
        preset[key] = value;
      }
    }
    if (requested === "entity:cycles") {
      const kind = params.get("production_type");
      if (kind && ["seasonal", "perennial", "fish", "integrated"].includes(kind)) preset.production_type = kind;
    }
    const invalidAssetParent = requested === "entry:asset_use" && !!preset.parent_id &&
       !data.references.some(r => r.id === preset.parent_id && r.kind === "asset" && r.status === "posted");
    if (invalidAssetParent) delete preset.parent_id;
    open(requested, preset);
    if (invalidAssetParent) setError("Aset tidak ditemukan. Pilih aset dari daftar.");
  }, [data, loading, open]);
  const post = useCallback(async (body: Record<string, unknown>) => {
    const r = await fetch("/api/farm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const result = await r.json();
    if (!r.ok) throw new Error(result.error);
    return result;
  }, []);
  function keepDraft() {
    if (!draftKey) return;
    try {
      localStorage.setItem(
        draftKey,
        JSON.stringify({
          version: 1,
          mode,
          values,
          lines,
          payNow,
          payAccount,
          paidAmount,
          id: requestId.current,
          paymentId: paymentId.current,
        }),
      );
      setDraftAvailable(true);
      setNotice("Draf disimpan di perangkat ini. Belum menjadi catatan usaha.");
    } catch {
      setError("Perangkat tidak dapat menyimpan draf.");
    }
  }
  function restoreDraft() {
    try {
      const d = JSON.parse(localStorage.getItem(draftKey) || "null");
      if (d?.version !== 1) throw new Error();
      setMode(d.mode);
      setValues(d.values);
      setLines(d.lines);
      setPayNow(d.payNow);
      setPayAccount(d.payAccount);
      setPaidAmount(d.paidAmount);
      requestId.current = d.id;
      paymentId.current = d.paymentId;
      setNotice("Draf dipulihkan. Periksa lalu simpan saat terhubung.");
    } catch {
      setError("Draf tidak dapat dibaca.");
    }
  }
  function options(source: string): Row[] {
    if (!data) return [];
    if (source in entities) return data[source as keyof Snapshot] as Row[];
    const refs = data.references ?? [];
    const outstanding = new Map(
      (data.report?.outstanding ?? []).map((r) => [r.id, r]),
    );
    if (source === "payable" || source === "cost")
      return refs.filter(
        (r) =>
          outstanding.has(r.id) &&
          [
            "expense",
            "labor",
            "shipping",
            "sale",
            "stock_in",
            "asset",
            "maintenance",
            "lease",
          ].includes(r.kind || "") &&
          (source !== "cost" || r.kind !== "sale"),
      );
    if (source === "advance")
      return refs.filter((r) => r.kind === "advance" && outstanding.has(r.id));
    return refs.filter((r) => r.kind === source);
  }
  function selectReference(key: string, id: string) {
    change(key, id);
    if (key === "original_unit")
      change("conversion_m2", id === "ha" ? "10000" : id === "m²" ? "1" : "");
    if (key === "parent_id") {
      const r = data?.references.find((r) => r.id === id);
      if (r) {
        setValues((v) => ({
          ...v,
          parent_id: id,
          cycle_id: String(r.cycle_id || ""),
          party_id: String(r.party_id || ""),
          ...(r.unit ? { unit: r.unit } : {}),
        }));
      }
    }
  }
  function field(field: Field) {
    const value = values[field.key] ?? field.default ?? "";
    return (
      <label key={field.key} className="farm-label">
        {field.label}
        {field.required ? " *" : ""}
        {field.type === "select" ? (
          <select
            className="farm-input mt-2"
            required={field.required}
            value={value}
            onChange={(e) => selectReference(field.key, e.target.value)}
          >
            <option value="">Pilih…</option>
            {field.source
              ? options(field.source).map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name || r.title}
                    {r.amount !== undefined ? " · " + money(r.amount) : ""}
                  </option>
                ))
              : field.options?.map((o) => (
                  <option key={o} value={o}>
                    {labels[o] || o}
                  </option>
                ))}
          </select>
        ) : field.type === "textarea" ? (
          <textarea
            className="farm-input mt-2"
            maxLength={3000}
            value={value}
            onChange={(e) => change(field.key, e.target.value)}
          />
        ) : field.type === "checkbox" ? (
          <input
            className="ml-3"
            type="checkbox"
            checked={value === "true"}
            onChange={(e) => change(field.key, String(e.target.checked))}
          />
        ) : (
          <input
            className="farm-input mt-2"
            type={field.type || "text"}
            required={field.required}
            min={field.min}
            step={field.type === "number" ? "any" : undefined}
            maxLength={field.type === "number" ? undefined : 3000}
            value={value}
            onChange={(e) => {
              change(field.key, e.target.value);
              if (field.key === "original_unit")
                change(
                  "conversion_m2",
                  e.target.value === "ha"
                    ? "10000"
                    : e.target.value === "m²"
                      ? "1"
                      : "",
                );
            }}
          />
        )}
        {field.hint && (
          <span className="mt-1 block text-xs font-normal farm-muted">
            {field.hint}
          </span>
        )}
      </label>
    );
  }
  const laborTotal = lines.reduce(
    (s, l) =>
      s +
      l.people * l.units * l.rate +
      l.overtime_people * l.overtime_hours * l.overtime_rate,
    0,
  );
  const entryKind = mode.startsWith("entry:") ? mode.slice(6) : "";
  const formFields =
    mode === "attach"
      ? entities.cycles.filter((f) =>
          ["block_id", "start_date", "area_m2", "shared"].includes(f.key),
        )
      : mode.startsWith("entity:")
        ? entities[mode.slice(7)] || []
        : entryFields[entryKind] || [];
  const entryAmount =
    entryKind === "labor"
      ? laborTotal
      : entryKind === "sale"
        ? Number(values.quantity || 0) * Number(values["d.unit_price"] || 0) -
          Number(values["d.discount"] || 0)
        : Number(values.amount || 0);
  const billKinds = [
    "expense",
    "labor",
    "shipping",
    "sale",
    "stock_in",
    "asset",
    "maintenance",
    "lease",
  ];
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    setError("");
    try {
      if (mode === "organization") {
        const result = await post({
          action: "organization",
          id: requestId.current,
          name: values.name,
        });
        setOrg(result.id);
      } else if (mode === "attach")
        await post({
          action: "attach",
          organization_id: data?.organization?.id,
          ...values,
        });
      else if (mode === "member")
        await post({
          action: "member",
          organization_id: data?.organization?.id,
          user_id: values.user_id,
          role: values.role,
        });
      else if (mode === "rename")
        await post({
          action: "rename_org",
          organization_id: data?.organization?.id,
          name: values.name,
        });
      else if (mode.startsWith("entity:")) {
        const actual = { ...values };
        for (const f of formFields)
          if (actual[f.key] === undefined && f.default !== undefined)
            actual[f.key] = f.default;
        await post({
          action: "entity",
          entity: mode.slice(7),
          id: requestId.current,
          organization_id: data?.organization?.id,
          values: actual,
        });
      } else {
        const row: Record<string, unknown> = {
          id: requestId.current,
          organization_id: data?.organization?.id,
          kind: entryKind,
          entry_date: values.entry_date,
          title: values.title,
          details: {},
        };
        const actual = { ...values };
        for (const f of formFields)
          if (actual[f.key] === undefined && f.default !== undefined)
            actual[f.key] = f.default;
        const details: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(actual)) {
          if (k.startsWith("d.")) details[k.slice(2)] = v;
          else if (
            [
              "cycle_id",
              "party_id",
              "account_id",
              "to_account_id",
              "parent_id",
              "advance_id",
              "unit",
              "quantity",
              "amount",
            ].includes(k) &&
            v !== ""
          )
            row[k] = v;
        }
        if (entryKind === "labor") details.lines = lines;
        row.details = details;
        const rows = [row];
        if (payNow && billKinds.includes(entryKind)) {
          if (!payAccount) throw new Error("Pilih kas pembayaran");
          const amount = Number(paidAmount || entryAmount);
          if (!Number.isFinite(amount) || amount <= 0 || amount > entryAmount)
            throw new Error(
              "Pembayaran harus lebih dari nol dan tidak melebihi tagihan",
            );
          rows.push({
            id: paymentId.current,
            organization_id: data?.organization?.id,
            kind: "settlement",
            entry_date: values.entry_date,
            title: "Pembayaran " + values.title,
            parent_id: requestId.current,
            account_id: payAccount,
            amount,
          });
        }
        await post({
          action: "entries",
          organization_id: data?.organization?.id,
          rows,
        });
      }
      if (draftKey) {
        localStorage.removeItem(draftKey);
        setDraftAvailable(false);
      }
      setMode("");
      setNotice("Tersimpan.");
      refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal menyimpan");
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }
  async function voidEntry(row: Row) {
    const reason = prompt(
      "Alasan pembatalan (minimal 3 karakter). Riwayat tetap disimpan.",
    );
    if (!reason) return;
    try {
      await post({
        action: "void",
        organization_id: data?.organization?.id,
        id: row.id,
        reason,
      });
      refresh();
    } catch (e) {
      setError((e as Error).message);
    }
  }
  async function closeCycle(row: Row) {
    const end = prompt(
      "Tanggal selesai (YYYY-MM-DD). Tidak dapat dibuka ulang.",
      today(),
    );
    if (!end) return;
    try {
      await post({
        action: "close_cycle",
        organization_id: data?.organization?.id,
        id: row.id,
        end_date: end,
      });
      refresh();
    } catch (e) {
      setError((e as Error).message);
    }
  }
  const title: Record<string, string> = {
    home: "Usaha hari ini",
    lahan: "Lahan & budidaya",
    catatan: "Catatan usaha",
    catat: "Mau mencatat apa?",
    laporan: "Laporan usaha",
    pengaturan: "Usaha & anggota",
  };
  const canWrite = data?.role && data.role !== "reader";
  return (
    <FarmPageTemplate title={title[view]}
      actions={<>
        <FarmActionLink href="/anggaran" tone="secondary">Anggaran</FarmActionLink>
        <FarmActionLink href="/pengaturan" tone="secondary">Usaha</FarmActionLink>
        <FarmActionLink href="/additional" tone="secondary">Additional</FarmActionLink>
        {view !== "catat" && <FarmActionLink href="/catat" className="farm-desktop-action">+ Catat</FarmActionLink>}
      </>}
    >
      {view === "home" && (
        <section className="farm-bon-promo">
          <div className="farm-bon-layout">
            <div className="farm-bon-copy">
              <span className="farmer-ui-tag">FITUR UNGGULAN · BON / STRUK</span>
              <h2 className="farm-bon-title">Buat bon belanja hari ini.</h2>
              <p className="farmer-ui-description">Catat beberapa barang dalam satu bon. Total dihitung otomatis.</p>
              <div className="farm-bon-actions">
                <Link href="/keuangan/bon/baru" className="farm-button farm-button-primary">+ Buat Bon</Link>
                <Link href="/keuangan" className="farm-button farm-button-secondary">Riwayat Bon</Link>
              </div>
            </div>
            <div className="farm-bon-art" aria-hidden="true">
              <Image src="/brand/bon-pengeluaran-photo.jpg" alt="" width={480} height={270} className="farm-bon-image"/>
            </div>
          </div>
        </section>
      )}
      {data?.organizations?.length ? (
        <label className="farm-label mb-5 block">
          Usaha aktif
          <select
            className="farm-input mt-2"
            value={data.organization?.id || ""}
            onChange={(e) => {
              setOrg(e.target.value);
              setMode("");
              setPage(0);
            }}
          >
            {data.organizations.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </select>
        </label>
      ) : null}
      {error && (
        <div role="alert" className="farm-notice farm-notice-error my-4">
          {error}
          <button onClick={refresh} className="ml-3 underline">
            Coba lagi
          </button>
        </div>
      )}
      {notice && (
        <p role="status" className="farm-notice my-4">
          {notice}
        </p>
      )}
      {loading ? (
        <p role="status" className="farm-card p-6">
          Memuat data usaha…
        </p>
      ) : !data ? null : !data.organization ? (
        <section className="farm-card p-6">
          <h2 className="text-xl font-bold">Mulai dari nama usahamu</h2>
          <p className="my-3">
            Lahan dan rincian lainnya bisa ditambahkan kemudian.
          </p>
          <button onClick={() => open("organization")} className={button}>
            Buat usaha
          </button>
        </section>
      ) : (
        <>
          {draftAvailable && (
            <div className="farm-notice mb-5">
              <span>Ada draf di perangkat ini.</span>
              <button className="ml-3 underline" onClick={restoreDraft}>
                Pulihkan draf
              </button>
              <button
                className="ml-3 underline"
                onClick={() => {
                  localStorage.removeItem(draftKey);
                  setDraftAvailable(false);
                }}
              >
                Hapus draf
              </button>
            </div>
          )}
          {view === "home" && (
            <>
              <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                {[
                  [
                    "Saldo kas tercatat",
                    money(
                      data.report.cash.reduce(
                        (s, a) => s + Number(a.balance),
                        0,
                      ),
                    ),
                  ],
                  [
                    "Budidaya aktif",
                    data.cycles.filter((c) => c.status === "active").length,
                  ],
                  ["Lahan", data.lands.length],
                  [
                    "Tagihan belum selesai",
                    data.report.outstanding.filter((r) => r.kind !== "advance")
                      .length,
                  ],
                ].map(([l, v]) => (
                  <div key={l} className="farm-kpi">
                    <p className="farm-kpi-label">{l}</p>
                    <p className="farm-kpi-value">{v}</p>
                  </div>
                ))}
              </section>
              <p className="mt-3 text-sm farm-muted">
                Saldo hanya berdasarkan catatan kas baru. Isi saldo awal;
                anggaran lama tidak otomatis menjadi uang keluar.
              </p>
              <section className="my-6 grid gap-3 sm:grid-cols-3">
                {[
                  ["lahan", "Kelola lahan", "Bagi area dan mulai budidaya"],
                  [
                    "catat",
                    "Catat hari ini",
                    "Uang, pekerja, kegiatan dan panen",
                  ],
                  [
                    "laporan",
                    "Lihat laporan",
                    "Kas, kewajiban dan hasil usaha",
                  ],
                ].map(([href, name, desc]) => (
                  <Link href={"/" + href} key={href} className="farm-card p-5">
                    <h2 className="font-bold text-lg">{name}</h2>
                    <p className="mt-2 text-sm">{desc}</p>
                  </Link>
                ))}
              </section>
              <section className="farm-card mt-4 overflow-hidden">
                 <div className="grid items-center gap-3 p-5 sm:grid-cols-[1fr_auto]">
                   <div>
                     <span className="text-xs font-extrabold uppercase tracking-[.12em] text-[#387c55]">Additional · Semua kebutuhan usaha</span>
                     <h2 className="mt-2 text-xl font-extrabold">Modul lanjutan tanpa meramaikan menu utama</h2>
                     <p className="mt-2 text-sm farm-muted">Aset, pemakaian peralatan, stok, tenaga kerja, kasbon, panen, penjualan, perikanan, dan lainnya.</p>
                   </div>
                   <Link href="/additional" className="farm-button farm-button-primary">Jelajahi Additional →</Link>
                 </div>
               </section>
              <Insights data={data} />
              <EntryList
                rows={data.entries.slice(0, 5)}
                data={data}
                onVoid={voidEntry}
                onOpen={open}
                canWrite={!!canWrite}
              />
            </>
          )}
          {view === "catat" && (
            <>
              <p className="mb-5 farm-muted">
                Pilih kejadian. Pekerja harian cukup dicatat per kelompok.
              </p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {[
                  "expense",
                  "income",
                  "labor",
                  "advance",
                  "harvest",
                  "sale",
                  "shipping",
                  "activity",
                  "condition",
                  "settlement",
                  "advance_apply",
                  "advance_return",
                ].map((k) => (
                  <button
                    disabled={
                      !canWrite ||
                      ([
                        "advance",
                        "settlement",
                        "advance_apply",
                        "advance_return",
                      ].includes(k) &&
                        !cashPermission.includes(data.role || ""))
                    }
                    key={k}
                    className="farm-card p-5 text-left font-bold disabled:opacity-40"
                    onClick={() => open("entry:" + k)}
                  >
                    {names[k]}
                  </button>
                ))}
              </div>
              <details className="farm-card mt-5 p-5">
                <summary className="cursor-pointer font-bold">
                  Modal, stok, aset, dan lainnya
                </summary>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {[
                    "capital",
                    "withdrawal",
                    "loan_in",
                    "loan_out",
                    "opening",
                    "transfer",
                    "stock_in",
                    "stock_use",
                    "asset",
                    "asset_use",
                    "maintenance",
                    "lease",
                  ].map((k) => (
                    <button
                      key={k}
                      disabled={!canWrite}
                      className={secondary}
                      onClick={() => open("entry:" + k)}
                    >
                      {names[k]}
                    </button>
                  ))}
                </div>
              </details>
              <p className="mt-5 text-sm">
                Butuh bon beberapa item?{" "}
                <Link href="/keuangan/bon/baru" className="underline">
                  Buat bon / struk
                </Link>
                . Catatan lama tetap terpisah dari buku kas baru.
              </p>
            </>
          )}
          {view === "lahan" && (
            <>
              {(["lands", "blocks", "cycles"] as const).map((type) => (
                <section key={type} className="farm-card mb-5 p-5">
                  <div className="flex justify-between items-center gap-3">
                    <h2 className="font-bold text-xl">{entityNames[type]}</h2>
                    {canWrite && (
                      <button
                        onClick={() => open("entity:" + type)}
                        className={secondary}
                      >
                        + {type === "cycles" ? "Mulai budidaya" : "Tambah"}
                      </button>
                    )}
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {data[type].map((row) => (
                      <article
                        key={row.id}
                        className="rounded-xl border border-[#dfe6d8] p-4"
                      >
                        <h3 className="font-bold">{row.name}</h3>
                        <p className="mt-1 text-sm">
                          {type === "lands"
                            ? `${row.original_area} ${row.original_unit} · ${row.location || "Lokasi belum diisi"}`
                            : type === "blocks"
                              ? `${row.area_m2} m² · ${data.lands.find((l) => l.id === row.land_id)?.name}`
                              : `${row.commodity} · ${row.status === "closed" ? "Selesai" : "Aktif"} · ${row.start_date || "Tanggal belum diisi"}`}
                        </p>
                        {row.notes ? (
                          <p className="mt-2 text-xs farm-muted">
                            {String(row.notes)}
                          </p>
                        ) : null}
                        {type === "lands" &&
                          row.latitude !== null &&
                          row.longitude !== null && (
                            <a
                              target="_blank"
                              rel="noreferrer"
                              className="mt-2 inline-block underline text-sm"
                              href={`https://www.openstreetmap.org/?mlat=${row.latitude}&mlon=${row.longitude}#map=16/${row.latitude}/${row.longitude}`}
                            >
                              Lihat lokasi peta
                            </a>
                          )}
                        {type === "blocks" &&
                          !row.active_to &&
                          cashPermission.includes(data.role || "") && (
                            <button
                              className={secondary + " mt-3"}
                              onClick={async () => {
                                const date = prompt(
                                  "Akhiri pembagian pada tanggal (YYYY-MM-DD). Selesaikan budidaya dahulu.",
                                  today(),
                                );
                                if (!date) return;
                                try {
                                  await post({
                                    action: "close_block",
                                    organization_id: data.organization?.id,
                                    id: row.id,
                                    end_date: date,
                                  });
                                  refresh();
                                } catch (e) {
                                  setError((e as Error).message);
                                }
                              }}
                            >
                              Akhiri pembagian
                            </button>
                          )}
                        {type === "blocks" && row.active_to ? (
                          <p className="text-xs mt-2">
                            Berlaku sampai {String(row.active_to)}
                          </p>
                        ) : null}
                        {type === "cycles" && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            <button
                              className={secondary}
                              onClick={() =>
                                open("entry:activity", { cycle_id: row.id })
                              }
                            >
                              Catat kegiatan
                            </button>
                            {!row.block_id &&
                            row.legacy_project_id &&
                            cashPermission.includes(data.role || "") ? (
                              <button
                                className={secondary}
                                onClick={() => open("attach", { id: row.id })}
                              >
                                Hubungkan lahan
                              </button>
                            ) : null}
                            {row.legacy_project_id ? (
                              <Link
                                className={secondary}
                                href={"/anggaran/" + row.legacy_project_id}
                              >
                                Anggaran lama
                              </Link>
                            ) : null}
                            {row.status === "active" &&
                              cashPermission.includes(data.role || "") && (
                                <button
                                  className={secondary}
                                  onClick={() => closeCycle(row)}
                                >
                                  Selesai budidaya
                                </button>
                              )}
                          </div>
                        )}
                      </article>
                    ))}
                  </div>
                  {!data[type].length && (
                    <p className="mt-4 text-sm">
                      Belum ada data. Tambahkan saat diperlukan.
                    </p>
                  )}
                </section>
              ))}
              <Insights data={data} />
            </>
          )}
          {(view === "catatan" || view === "laporan") && (
            <section className="farm-card mb-5 p-4 grid gap-3 sm:grid-cols-3">
              <label className="farm-label">
                Dari
                <input
                  className="farm-input"
                  type="date"
                  value={from}
                  onChange={(e) => {
                    setFrom(e.target.value);
                    setPage(0);
                  }}
                />
              </label>
              <label className="farm-label">
                Sampai
                <input
                  className="farm-input"
                  type="date"
                  value={to}
                  onChange={(e) => {
                    setTo(e.target.value);
                    setPage(0);
                  }}
                />
              </label>
              {view === "catatan" && (
                <label className="farm-label">
                  Jenis
                  <select
                    className="farm-input"
                    value={kindFilter}
                    onChange={(e) => {
                      setKindFilter(e.target.value);
                      setPage(0);
                    }}
                  >
                    <option value="">Semua</option>
                    {Object.entries(names).map(([k, n]) => (
                      <option key={k} value={k}>
                        {n}
                      </option>
                    ))}
                  </select>
                </label>
              )}
            </section>
          )}
          {view === "catatan" && (
            <>
              <EntryList
                rows={data.entries}
                data={data}
                onVoid={voidEntry}
                onOpen={open}
                canWrite={!!canWrite}
              />
              <div className="my-5 flex items-center justify-between gap-3">
                <button
                  disabled={page === 0}
                  className={secondary}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Sebelumnya
                </button>
                <span className="text-sm">
                  {data.total} catatan · halaman {page + 1}
                </span>
                <button
                  disabled={(page + 1) * 50 >= data.total}
                  className={secondary}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Berikutnya
                </button>
              </div>
              <Link href="/keuangan" className="underline">
                Lihat pengeluaran & bon lama
              </Link>
            </>
          )}
          {view === "laporan" && <Reports data={data} onOpen={open} />}
          {view === "pengaturan" && (
            <>
              <section className="farm-card mb-5 p-5">
                <h2 className="font-bold text-xl">{data.organization.name}</h2>
                <p className="mt-2 text-sm">Peran: {labels[data.role || ""]}</p>
                <div className="mt-4 flex gap-3">
                  <button
                    onClick={() => open("organization")}
                    className={secondary}
                  >
                    Usaha baru
                  </button>
                  {data.role === "owner" && (
                    <button
                      onClick={() =>
                        open("rename", {
                          name: String(data.organization?.name),
                        })
                      }
                      className={secondary}
                    >
                      Ubah nama
                    </button>
                  )}
                </div>
                <p className="mt-5 text-xs break-all">
                  ID akun untuk ditambahkan oleh pemilik: {data.userId}
                </p>
                {data.role === "owner" && (
                  <>
                    <button
                      onClick={() => open("member")}
                      className={secondary + " mt-3"}
                    >
                      Tambah / ubah anggota
                    </button>
                    <p className="mt-2 text-xs">
                      Anggota mendaftar dengan akun sendiri, lalu memberikan ID
                      akun di halaman ini.
                    </p>
                    {data.members.map((m) => (
                      <div
                        key={String(m.user_id)}
                        className="mt-3 flex flex-wrap justify-between gap-2 text-sm"
                      >
                        <span>
                          {String(m.user_id)} · {labels[String(m.role)]}
                        </span>
                        <button
                          className="underline"
                          onClick={async () => {
                            if (!confirm("Cabut akses anggota ini?")) return;
                            try {
                              await post({
                                action: "remove_member",
                                organization_id: data.organization?.id,
                                user_id: m.user_id,
                              });
                              refresh();
                            } catch (e) {
                              setError((e as Error).message);
                            }
                          }}
                        >
                          Cabut akses
                        </button>
                      </div>
                    ))}
                  </>
                )}
              </section>
              {(["accounts", "parties"] as const).map((type) => (
                <section className="farm-card mb-5 p-5" key={type}>
                  <div className="flex justify-between">
                    <h2 className="font-bold text-xl">{entityNames[type]}</h2>
                    {canWrite && (
                      <button
                        onClick={() => open("entity:" + type)}
                        className={secondary}
                      >
                        + Tambah
                      </button>
                    )}
                  </div>
                  {data[type].map((r) => (
                    <p key={r.id} className="mt-3">
                      {r.name}
                      {r.category ? " · " + labels[String(r.category)] : ""}
                    </p>
                  ))}
                </section>
              ))}
            </>
          )}
        </>
      )}
      {mode && (
        <dialog
          ref={dialogRef}
          onCancel={(e) => {
            e.preventDefault();
            if (confirm("Tutup formulir?")) setMode("");
          }}
          className="fixed inset-0 m-auto max-h-[95dvh] w-[min(95vw,680px)] overflow-y-auto rounded-2xl bg-transparent p-0 backdrop:bg-black/40"
        >
          <section
            aria-labelledby="entry-heading"
            className="mx-auto my-4 max-w-2xl rounded-2xl bg-[#f7f8f1] p-5 shadow-xl"
          >
            <div className="flex items-center justify-between gap-4">
              <h2 id="entry-heading" className="text-xl font-bold">
                {mode === "organization"
                  ? "Buat usaha"
                  : mode === "member"
                    ? "Tambah anggota"
                    : mode === "rename"
                      ? "Ubah nama usaha"
                      : mode === "attach"
                        ? "Hubungkan budidaya lama"
                        : entryKind
                          ? names[entryKind]
                          : entityNames[mode.slice(7)]}
              </h2>
              <button
                disabled={busy}
                className={secondary}
                onClick={() => {
                  if (
                    confirm(
                      "Tutup formulir? Simpan draf terlebih dahulu bila ingin melanjutkan nanti.",
                    )
                  )
                    setMode("");
                }}
              >
                Tutup
              </button>
            </div>
            <form onSubmit={submit} className="mt-5 grid gap-4">
              <fieldset disabled={busy} className="grid gap-4">
                {["organization", "rename"].includes(mode) &&
                  field({ key: "name", label: "Nama usaha", required: true })}
                {mode === "member" && (
                  <>
                    {field({
                      key: "user_id",
                      label: "ID akun anggota",
                      required: true,
                    })}
                    {field({
                      key: "role",
                      label: "Peran",
                      type: "select",
                      required: true,
                      options: ["manager", "recorder", "finance", "reader"],
                    })}
                  </>
                )}
                {entryKind && (
                  <>
                    {field({
                      key: "entry_date",
                      label: "Tanggal",
                      type: "date",
                      required: true,
                    })}
                    {field({
                      key: "title",
                      label: "Keterangan singkat",
                      required: true,
                    })}
                    {field({
                      key: "cycle_id",
                      label: "Untuk budidaya (opsional)",
                      type: "select",
                      source: "cycles",
                    })}
                    {field({
                      key: "party_id",
                      label:
                        entryKind === "advance"
                          ? "Penerima uang muka"
                          : "Orang / kelompok / mitra (opsional)",
                      type: "select",
                      source: "parties",
                      required: entryKind === "advance",
                    })}
                  </>
                )}
                {formFields.map(field)}
                {entryKind && (
                  <details>
                    <summary className="cursor-pointer font-bold text-sm">
                      Tambah foto bukti / kondisi
                    </summary>
                    <label className="farm-label mt-3 block">
                      Foto JPG, PNG, WebP (maks. 5 MB)
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="farm-input mt-2"
                        onChange={async (e) => {
                          const photo = e.target.files?.[0];
                          if (!photo) return;
                          setBusy(true);
                          try {
                            const form = new FormData();
                            form.append(
                              "organization_id",
                              String(data?.organization?.id),
                            );
                            form.append("photo", photo);
                            const r = await fetch("/api/farm/photo", {
                              method: "POST",
                              body: form,
                            });
                            const result = await r.json();
                            if (!r.ok) throw new Error(result.error);
                            change("d.photo_path", result.path);
                            setNotice(
                              "Foto diunggah. Simpan catatan untuk menautkannya.",
                            );
                          } catch (e) {
                            setError((e as Error).message);
                          } finally {
                            setBusy(false);
                          }
                        }}
                      />
                    </label>
                    {values["d.photo_path"] && (
                      <p className="text-xs mt-2">Foto siap ditautkan.</p>
                    )}
                  </details>
                )}

                {entryKind === "labor" && (
                  <>
                    <p className="text-sm">
                      Cukup jumlah orang dan tarif. Nama individu tidak wajib.
                    </p>
                    {lines.map((l, i) => (
                      <section
                        key={i}
                        className="rounded-xl border border-[#dfe6d8] bg-white p-4"
                      >
                        <div className="flex justify-between mb-3">
                          <h3 className="font-bold">Pekerjaan {i + 1}</h3>
                          {lines.length > 1 && (
                            <button
                              type="button"
                              className="underline text-sm"
                              onClick={() =>
                                setLines((old) => old.filter((_, j) => j !== i))
                              }
                            >
                              Hapus
                            </button>
                          )}
                        </div>
                        <label className="farm-label">
                          Pekerjaan
                          <input
                            className="farm-input"
                            required
                            placeholder="Macul, manggul, memetik…"
                            value={l.job}
                            onChange={(e) =>
                              setLines((old) =>
                                old.map((x, j) =>
                                  j === i ? { ...x, job: e.target.value } : x,
                                ),
                              )
                            }
                          />
                        </label>
                        <div className="mt-3 grid grid-cols-2 gap-3">
                          {(
                            [
                              ["people", "Jumlah orang"],
                              ["units", "Jumlah hari/jam/unit"],
                              ["rate", "Tarif per orang per unit"],
                            ] as const
                          ).map(([key, label]) => (
                            <label key={key} className="farm-label">
                              {label}
                              <input
                                className="farm-input"
                                type="number"
                                required
                                min={key === "rate" ? 0 : 1}
                                step={key === "people" ? 1 : "any"}
                                value={l[key]}
                                onChange={(e) =>
                                  setLines((old) =>
                                    old.map((x, j) =>
                                      j === i
                                        ? {
                                            ...x,
                                            [key]: Number(e.target.value),
                                          }
                                        : x,
                                    ),
                                  )
                                }
                              />
                            </label>
                          ))}
                          <label className="farm-label">
                            Dasar upah
                            <select
                              className="farm-input"
                              value={l.basis}
                              onChange={(e) =>
                                setLines((old) =>
                                  old.map((x, j) =>
                                    j === i
                                      ? { ...x, basis: e.target.value }
                                      : x,
                                  ),
                                )
                              }
                            >
                              {["hari", "jam", "borongan", "kg"].map((b) => (
                                <option key={b}>{b}</option>
                              ))}
                            </select>
                          </label>
                        </div>
                        <details className="mt-4">
                          <summary className="cursor-pointer font-bold text-sm">
                            + Tambahan lembur
                          </summary>
                          <div className="grid gap-3 mt-3 sm:grid-cols-3">
                            {(
                              [
                                ["overtime_people", "Orang lembur"],
                                ["overtime_hours", "Jam per orang"],
                                ["overtime_rate", "Rp/orang/jam"],
                              ] as const
                            ).map(([key, label]) => (
                              <label key={key} className="farm-label">
                                {label}
                                <input
                                  className="farm-input"
                                  type="number"
                                  min="0"
                                  max={
                                    key === "overtime_people"
                                      ? l.people
                                      : undefined
                                  }
                                  step={key === "overtime_people" ? 1 : "any"}
                                  value={l[key]}
                                  onChange={(e) =>
                                    setLines((old) =>
                                      old.map((x, j) =>
                                        j === i
                                          ? {
                                              ...x,
                                              [key]: Number(e.target.value),
                                            }
                                          : x,
                                      ),
                                    )
                                  }
                                />
                              </label>
                            ))}
                          </div>
                        </details>
                      </section>
                    ))}
                    <button
                      type="button"
                      disabled={lines.length >= 50}
                      className={secondary}
                      onClick={() => setLines((old) => [...old, blankLabor()])}
                    >
                      + Tambah pekerjaan
                    </button>
                    <p className="farm-kpi p-4 font-bold">
                      Total biaya pekerja: {money(laborTotal)}
                    </p>
                  </>
                )}
                {entryKind === "sale" && (
                  <p className="farm-kpi p-4 font-bold">
                    Nilai penjualan: {money(entryAmount)}
                  </p>
                )}
                {billKinds.includes(entryKind) &&
                  cashPermission.includes(data?.role || "") && (
                    <section className="farm-card p-4">
                      <label className="font-bold">
                        <input
                          type="checkbox"
                          checked={payNow}
                          onChange={(e) => setPayNow(e.target.checked)}
                        />{" "}
                        {entryKind === "sale"
                          ? "Pembayaran sudah diterima"
                          : "Bayar sekarang"}
                      </label>
                      {payNow && (
                        <div className="mt-3 grid gap-3">
                          <label className="farm-label">
                            Kas / rekening
                            <select
                              className="farm-input"
                              required
                              value={payAccount}
                              onChange={(e) => setPayAccount(e.target.value)}
                            >
                              <option value="">Pilih…</option>
                              {data?.accounts?.map((a) => (
                                <option key={a.id} value={a.id}>
                                  {a.name}
                                </option>
                              ))}
                            </select>
                          </label>
                          <label className="farm-label">
                            Jumlah dibayar (kosong = lunas)
                            <input
                              className="farm-input"
                              type="number"
                              min="0.01"
                              max={entryAmount}
                              step="0.01"
                              value={paidAmount}
                              onChange={(e) => setPaidAmount(e.target.value)}
                            />
                          </label>
                        </div>
                      )}
                      <p className="text-xs mt-2">
                        Jika belum dibayar, catatan menjadi tagihan. Kasbon
                        digunakan lewat “Gunakan uang muka”, lalu bayar sisanya.
                      </p>
                    </section>
                  )}
              </fieldset>
              {error && (
                <p role="alert" className="farm-notice farm-notice-error">
                  {error}
                </p>
              )}
              {notice && (
                <p role="status" className="farm-notice">
                  {notice}
                </p>
              )}
              <div className="flex gap-3">
                <button
                  disabled={busy}
                  type="submit"
                  className={button + " flex-1"}
                >
                  {busy ? "Menyimpan…" : "Simpan"}
                </button>
                {data?.organization && (
                  <button
                    type="button"
                    disabled={busy}
                    className={secondary}
                    onClick={keepDraft}
                  >
                    Simpan draf
                  </button>
                )}
              </div>
            </form>
          </section>
        </dialog>
      )}
    </FarmPageTemplate>
  );
}
function EntryList({
  rows,
  data,
  onVoid,
  onOpen,
  canWrite,
}: {
  rows: Row[];
  data: Snapshot;
  onVoid: (r: Row) => void;
  onOpen: (mode: string, preset?: Record<string, string>) => void;
  canWrite: boolean;
}) {
  return (
    <section className="grid gap-3">
      {rows.map((row) => (
        <article
          key={row.id}
          className={
            "farm-card p-4 " + (row.status === "void" ? "opacity-60" : "")
          }
        >
          <div className="flex justify-between gap-3">
            <div>
              <p className="text-xs farm-muted">
                {row.entry_date} · {names[row.kind || ""]}
              </p>
              <h3 className="font-bold mt-1">{row.title}</h3>
              <p className="text-xs mt-1">
                {data.cycles.find((c) => c.id === row.cycle_id)?.name ||
                  "Umum usaha"}
              </p>
            </div>
            <strong>
              {Number(row.amount) > 0
                ? money(row.amount)
                : row.quantity
                  ? `${row.quantity} ${row.unit}`
                  : ""}
            </strong>
          </div>
          {typeof row.details?.photo_path === "string" && (
            <a
              className="underline text-sm mt-2 inline-block"
              href={
                "/api/farm/photo?path=" +
                encodeURIComponent(row.details.photo_path)
              }
              target="_blank"
              rel="noreferrer"
            >
              Lihat foto
            </a>
          )}
          {row.kind === "labor" && (
            <p className="text-xs mt-2">
              {String(row.details?.assignments)} penugasan · lembur{" "}
              {money(row.details?.overtime)}
            </p>
          )}
          {row.status === "void" ? (
            <p className="mt-2 text-sm">
              Dibatalkan: {String(row.void_reason)}
            </p>
          ) : (
            canWrite && (
              <div className="mt-3 flex flex-wrap gap-3 text-sm">
                {row.kind === "harvest" && (
                  <button
                    className="underline"
                    onClick={() =>
                      onOpen("entry:sale", {
                        parent_id: row.id,
                        cycle_id: String(row.cycle_id || ""),
                        quantity: String(row.quantity || ""),
                        unit: row.unit || "kg",
                      })
                    }
                  >
                    Jual hasil panen
                  </button>
                )}
                {row.kind === "labor" && (
                  <button
                    className="underline"
                    onClick={() =>
                      onOpen("entry:labor", {
                        title: row.title || "",
                        cycle_id: String(row.cycle_id || ""),
                      })
                    }
                  >
                    Catat pekerjaan berikutnya
                  </button>
                )}
                {cashPermission.includes(data.role || "") && (
                  <button
                    className="underline text-red-800"
                    onClick={() => onVoid(row)}
                  >
                    Batalkan
                  </button>
                )}
              </div>
            )
          )}
        </article>
      ))}
      {!rows.length && (
        <p className="farm-card p-6">Belum ada catatan pada pilihan ini.</p>
      )}
    </section>
  );
}
function Reports({
  data,
  onOpen,
}: {
  data: Snapshot;
  onOpen: (mode: string, preset?: Record<string, string>) => void;
}) {
  const r = data.report;
  return (
    <>
      <section className="farm-card p-5 mb-5">
        <h2 className="font-bold text-xl">Biaya dan hasil per budidaya</h2>
        <p className="text-xs mt-2">
          Selisih operasional sementara; belum termasuk penyusutan aset, alokasi
          umum, dan biaya yang belum dicatat. Bukan laba final.
        </p>
        {data.analysis?.cycles.map((c) => (
          <article key={c.id} className="border-t mt-4 pt-3">
            <h3 className="font-bold">{c.name}</h3>
            <p className="text-sm mt-2">
              Penjualan {money(c.sales)} · Biaya {money(c.costs)} · Selisih{" "}
              {money(Number(c.sales) - Number(c.costs))}
            </p>
            <p className="text-sm mt-2">
              Panen tercatat kg: {String(c.harvest_kg)} · Biaya/kg:{" "}
              {Number(c.harvest_kg) > 0
                ? money(Number(c.costs) / Number(c.harvest_kg))
                : "Belum tersedia"}
            </p>
          </article>
        ))}
      </section>
      <div className="grid grid-cols-2 gap-3">
        <div className="farm-kpi">
          <p>Kas masuk periode</p>
          <strong>{money(r.cash_in)}</strong>
        </div>
        <div className="farm-kpi">
          <p>Kas keluar periode</p>
          <strong>{money(r.cash_out)}</strong>
        </div>
      </div>
      <p className="my-3 text-xs">
        Transfer internal dikecualikan dari arus masuk/keluar. Modal dan
        pinjaman termasuk arus kas, bukan omzet.
      </p>
      <section className="farm-card p-5 mb-5">
        <h2 className="text-xl font-bold">
          Saldo per kas sampai tanggal akhir
        </h2>
        {r.cash.map((a) => (
          <div key={a.id} className="flex justify-between mt-3">
            <span>{a.name}</span>
            <strong>{money(a.balance)}</strong>
          </div>
        ))}
      </section>
      <section className="farm-card p-5 mb-5">
        <h2 className="text-xl font-bold">Ringkasan catatan periode</h2>
        {r.by_kind.map((x) => (
          <div key={x.kind} className="flex justify-between mt-3">
            <span>
              {names[x.kind || ""]} ({String(x.count)})
            </span>
            <strong>{money(x.amount)}</strong>
          </div>
        ))}
        <p className="text-xs mt-4">
          Kategori tidak dijumlahkan menjadi laba: pembelian stok, aset,
          pembayaran, dan uang muka memiliki perlakuan berbeda.
        </p>
      </section>
      <section className="farm-card p-5 mb-5">
        <h2 className="text-xl font-bold">Panen per budidaya dan satuan</h2>
        {r.harvests.map((h, i) => (
          <p className="mt-3" key={i}>
            {data.cycles.find((c) => c.id === h.cycle_id)?.name ||
              "Belum ditautkan"}
            :{" "}
            <strong>
              {h.quantity} {h.unit}
            </strong>
          </p>
        ))}
      </section>
      <section className="farm-card p-5 mb-5">
        <h2 className="font-bold text-xl">Tenaga kerja per pekerjaan</h2>
        {data.analysis?.labor.map((l, i) => (
          <p key={i} className="mt-3 text-sm">
            {String(l.job)} · {String(l.assignments)} penugasan ·{" "}
            {money(l.base)} + lembur {money(l.overtime)}
          </p>
        ))}
      </section>
      <section className="farm-card p-5 mb-5">
        <h2 className="font-bold text-xl">Stok tersisa</h2>
        {data.analysis?.inventory.map((s) => (
          <p key={s.id} className="mt-3">
            {s.title}: {String(s.remaining)} {s.unit}
          </p>
        ))}
      </section>
      <section className="farm-card p-5 mb-5">
        <h2 className="font-bold text-xl">Arus kas harian</h2>
        {data.analysis?.daily.map((d, i) => (
          <p key={i} className="mt-3 text-sm">
            {String(d.entry_date)} · Masuk {money(d.incoming)} · Keluar{" "}
            {money(d.outgoing)}
          </p>
        ))}
      </section>
      <section className="farm-card p-5">
        <h2 className="text-xl font-bold">Piutang, kewajiban & uang muka</h2>
        <p className="mt-2 text-xs">
          Saldo sampai tanggal akhir, termasuk tagihan dari periode sebelumnya.
        </p>
        {r.outstanding.map((x) => (
          <div key={x.id} className="border-t mt-4 pt-3">
            <p className="text-xs">
              {names[x.kind || ""]} · {String(x.entry_date)}
            </p>
            <div className="flex justify-between">
              <strong>{String(x.title)}</strong>
              <strong>{money(x.remaining)}</strong>
            </div>
            {cashPermission.includes(data.role || "") && (
              <button
                className="underline mt-2 text-sm"
                onClick={() =>
                  onOpen(
                    "entry:" +
                      (x.kind === "advance" ? "advance_return" : "settlement"),
                    {
                      parent_id: x.id,
                      party_id: String(x.party_id || ""),
                      amount: String(x.remaining),
                      title: "Pembayaran " + x.title,
                    },
                  )
                }
              >
                {x.kind === "advance"
                  ? "Catat pengembalian"
                  : "Catat pembayaran"}
              </button>
            )}
          </div>
        ))}
        {!r.outstanding.length && (
          <p className="mt-3">Tidak ada saldo tagihan tercatat.</p>
        )}
      </section>
    </>
  );
}
function Insights({ data }: { data: Snapshot }) {
  const messages: string[] = [];
  if (!data.lands.length)
    messages.push(
      "Lahan belum dicatat. Tambahkan luas dan lokasi agar hasil dapat dibandingkan per area.",
    );
  const unpaid = data.report.outstanding.filter((r) => r.kind === "sale");
  if (unpaid.length)
    messages.push(
      `${unpaid.length} penjualan masih memiliki piutang. Periksa penerimaan pembayaran.`,
    );
  if (data.cycles.some((c) => !c.block_id))
    messages.push(
      "Ada budidaya tanpa bagian lahan. Laporan produktivitas per luas belum lengkap.",
    );
  if (data.report.cash.some((a) => Number(a.balance) < 0))
    messages.push(
      "Ada saldo kas negatif. Periksa saldo awal dan penerimaan yang belum dicatat.",
    );
  return (
    <section className="farm-card p-5 mb-5">
      <h2 className="font-bold text-xl">Yang perlu diperiksa</h2>
      {messages.length ? (
        messages.map((m) => (
          <p key={m} className="mt-3 text-sm">
            {m}
          </p>
        ))
      ) : (
        <p className="mt-3 text-sm">
          Belum ada pengingat dari aturan pencatatan saat ini.
        </p>
      )}
      <details className="mt-4">
        <summary className="cursor-pointer text-sm font-bold">
          Kebutuhan data komoditas
        </summary>
        {data.cycles
          .filter((c) => c.status === "active")
          .map((c) => (
            <p key={c.id} className="mt-3 text-sm">
              <strong>{String(c.commodity)}:</strong>{" "}
              {c.production_type === "fish"
                ? "Catat jumlah tebar, pakan, kondisi air, kematian dan panen."
                : c.production_type === "perennial"
                  ? "Catat umur dan populasi tanaman produktif, pemeliharaan serta hasil per periode."
                  : "Catat tanggal tanam, bahan yang digunakan, kondisi tanaman dan setiap panen."}
            </p>
          ))}
        <p className="mt-3 text-xs">
          Ini panduan kelengkapan catatan, bukan diagnosis atau rekomendasi
          dosis. Kesesuaian komoditas belum dinilai tanpa data lokasi dan
          referensi agronomi.
        </p>
      </details>
    </section>
  );
}
