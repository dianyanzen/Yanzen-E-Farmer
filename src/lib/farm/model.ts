export type Row = {
  id: string;
  organization_id?: string;
  name?: string;
  title?: string;
  kind?: string;
  amount?: number;
  quantity?: number;
  unit?: string;
  entry_date?: string;
  status?: string;
  details?: Record<string, unknown>;
  [key: string]: unknown;
};
export type Field = {
  key: string;
  label: string;
  type?: "number" | "date" | "textarea" | "select" | "checkbox";
  required?: boolean;
  options?: string[];
  source?: string;
  default?: string;
  min?: string;
  hint?: string;
};
const f = (
  key: string,
  label: string,
  extra: Omit<Field, "key" | "label"> = {},
): Field => ({ key, label, ...extra });
const number = (
  key: string,
  label: string,
  extra: Omit<Field, "key" | "label"> = {},
) => f(key, label, { type: "number", min: "0", ...extra });
export const money = (n: unknown) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(n || 0));
export const today = () =>
  new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Jakarta" }).format(
    new Date(),
  );
export const names: Record<string, string> = {
  expense: "Pengeluaran",
  income: "Pemasukan lain",
  capital: "Modal masuk",
  withdrawal: "Pengambilan pemilik",
  loan_in: "Pinjaman diterima",
  loan_out: "Pengembalian pokok pinjaman",
  transfer: "Transfer antarkas",
  opening: "Saldo awal",
  labor: "Pekerja kelompok",
  advance: "Kasbon / uang muka",
  settlement: "Pembayaran tagihan",
  advance_return: "Pengembalian uang muka",
  advance_apply: "Gunakan uang muka",
  harvest: "Panen",
  sale: "Penjualan",
  shipping: "Pengiriman",
  activity: "Kegiatan",
  condition: "Kondisi lapangan",
  stock_in: "Pembelian stok",
  stock_use: "Pemakaian stok",
  asset: "Pembelian aset",
  maintenance: "Perawatan aset",
  asset_use: "Pemakaian aset",
  lease: "Sewa lahan",
};
export const entityNames: Record<string, string> = {
  lands: "Lahan",
  blocks: "Bagian lahan",
  cycles: "Budidaya",
  accounts: "Kas / rekening",
  parties: "Pegawai, kelompok & mitra",
};
export const entities: Record<string, Field[]> = {
  lands: [
    f("name", "Nama lahan", { required: true }),
    f("location", "Lokasi / alamat"),
    number("original_area", "Luas", { required: true, min: "0.001" }),
    f("original_unit", "Satuan", {
      type: "select",
      options: ["ha", "m²", "tumbak", "lainnya"],
      default: "ha",
    }),
    number("conversion_m2", "m² per satuan", {
      required: true,
      min: "0.001",
      default: "10000",
      hint: "ha = 10000; m² = 1. Untuk tumbak atau satuan lokal, konfirmasi faktor setempat.",
    }),
    number("latitude", "Lintang", { min: "-90" }),
    number("longitude", "Bujur", { min: "-180" }),
    number("elevation_m", "Elevasi (m)", { min: "-500" }),
    f("notes", "Tanah, air, kemiringan, akses atau catatan", {
      type: "textarea",
    }),
  ],
  blocks: [
    f("land_id", "Lahan", { type: "select", source: "lands", required: true }),
    f("name", "Nama bagian", { required: true }),
    number("area_m2", "Luas bagian (m²)", { required: true, min: "0.001" }),
    f("active_from", "Mulai pembagian", { type: "date", required: true }),
  ],
  cycles: [
    f("block_id", "Bagian lahan", { type: "select", source: "blocks" }),
    f("name", "Nama budidaya", { required: true }),
    f("commodity", "Komoditas", {
      required: true,
      hint: "Misalnya timun, padi, buncis, ikan nila; boleh komoditas lain.",
    }),
    f("production_type", "Jenis usaha", {
      type: "select",
      options: ["seasonal", "perennial", "fish", "integrated"],
      default: "seasonal",
    }),
    f("variety", "Varietas / jenis"),
    f("start_date", "Mulai", { type: "date", required: true }),
    number("area_m2", "Luas penggunaan (m²)", { min: "0.001" }),
    f("shared", "Area digunakan bersama / tumpangsari", { type: "checkbox" }),
    f("notes", "Catatan", { type: "textarea" }),
  ],
  accounts: [f("name", "Nama kas / rekening", { required: true })],
  parties: [
    f("name", "Nama orang / kelompok / mitra", { required: true }),
    f("category", "Kategori", {
      type: "select",
      options: ["group", "employee", "buyer", "supplier"],
      default: "group",
    }),
    f("employment_status", "Status kerja", {
      hint: "Tetap, harian lepas, musiman — opsional",
    }),
    f("job_role", "Peran / pekerjaan"),
    f("notes", "Catatan", { type: "textarea" }),
  ],
};
const amount = number("amount", "Total (Rp)", { required: true, min: "0.01" });
const quantity = number("quantity", "Jumlah", { required: true, min: "0.001" });
const unit = f("unit", "Satuan", { required: true, default: "kg" });
const account = f("account_id", "Kas / rekening", {
  type: "select",
  source: "accounts",
  required: true,
});
const parent = (source: string, label: string, required = true) =>
  f("parent_id", label, { type: "select", source, required });
export const entryFields: Record<string, Field[]> = {
  expense: [
    amount,
    f("d.category", "Kategori", {
      required: true,
      hint: "Pupuk, benih, konsumsi, bahan bakar, dan lainnya",
    }),
  ],
  income: [
    amount,
    account,
    f("d.category", "Sumber penerimaan", {
      required: true,
      hint: "Untuk pembayaran penjualan gunakan Pembayaran tagihan.",
    }),
  ],
  capital: [amount, account],
  withdrawal: [amount, account],
  loan_in: [amount, account],
  loan_out: [amount, account],
  opening: [amount, account],
  transfer: [
    amount,
    account,
    f("to_account_id", "Kas tujuan", {
      type: "select",
      source: "accounts",
      required: true,
    }),
  ],
  labor: [],
  advance: [
    amount,
    account,
    f("d.advance_type", "Jenis uang muka", {
      type: "select",
      options: ["wage", "employee_loan", "operational"],
      required: true,
    }),
  ],
  settlement: [parent("payable", "Tagihan"), amount, account],
  advance_return: [parent("advance", "Uang muka"), amount, account],
  advance_apply: [
    parent("cost", "Tagihan biaya"),
    f("advance_id", "Uang muka yang digunakan", {
      type: "select",
      source: "advance",
      required: true,
    }),
    amount,
  ],
  harvest: [
    quantity,
    unit,
    f("d.grade", "Grade / kualitas"),
    number("d.rejected", "Hasil afkir (satuan sama)"),
    f("d.note", "Catatan", { type: "textarea" }),
  ],
  sale: [
    parent("harvest", "Panen asal", false),
    quantity,
    unit,
    number("d.unit_price", "Harga per satuan (Rp)", { required: true }),
    number("d.discount", "Potongan total (Rp)", { default: "0" }),
    f("d.due_date", "Jatuh tempo", { type: "date" }),
  ],
  shipping: [
    parent("sale", "Penjualan terkait", false),
    amount,
    f("d.origin", "Asal"),
    f("d.destination", "Tujuan", { required: true }),
    quantity,
    unit,
    f("d.vehicle", "Kendaraan / pengemudi"),
    f("d.payer", "Penanggung ongkos", {
      type: "select",
      options: ["usaha", "pembeli"],
      default: "usaha",
    }),
  ],
  activity: [
    f("d.activity", "Kegiatan", { required: true }),
    f("d.note", "Bahan, dosis, air atau hasil pekerjaan", { type: "textarea" }),
  ],
  condition: [
    f("d.symptom", "Gejala / kondisi", { required: true }),
    f("d.note", "Tanah, cuaca, air, hama atau pengamatan", {
      type: "textarea",
    }),
    f("d.photo_url", "Tautan foto (https)"),
  ],
  stock_in: [
    quantity,
    unit,
    amount,
    f("d.category", "Jenis bahan", { required: true }),
  ],
  stock_use: [parent("stock_in", "Stok asal"), quantity, unit],
  asset: [
    amount,
    f("d.category", "Jenis aset", {
      type: "select",
      options: ["alat", "mesin", "kendaraan", "irigasi", "bangunan", "perikanan", "elektronik", "lainnya"],
      required: true,
      default: "alat",
    }),
    f("d.serial", "Nomor inventaris / nomor seri"),
    f("d.brand", "Merek / tipe"),
    f("d.location", "Lokasi penyimpanan"),
    f("d.condition", "Kondisi saat dicatat", {
      type: "select", options: ["baik", "perlu_perawatan", "rusak"], default: "baik",
    }),
    number("d.quantity", "Jumlah unit", { default: "1", min: "1" }),
    f("d.notes", "Catatan aset", { type: "textarea" }),
  ],
  asset_use: [
    parent("asset", "Aset yang dipakai"),
    f("d.operator", "Pemakai / penanggung jawab", { required: true }),
    number("d.hours", "Durasi pemakaian (jam)", { required: true, min: "0.01" }),
    f("d.purpose", "Digunakan untuk", { required: true }),
    f("d.location", "Lokasi pemakaian"),
    f("d.condition", "Kondisi setelah digunakan", { type: "select",
      options: ["baik", "perlu_perawatan", "rusak"], default: "baik" }),
    number("d.fuel_liter", "BBM terpakai (liter)", { min: "0" }),
    f("d.notes", "Catatan pemakaian", { type: "textarea" }),
  ],
  maintenance: [
    parent("asset", "Aset"),
    amount,
    f("d.note", "Pekerjaan perawatan", { type: "textarea" }),
  ],
  lease: [
    amount,
    f("d.start", "Mulai sewa", { type: "date", required: true }),
    f("d.end", "Selesai sewa", { type: "date", required: true }),
  ],
};
export const labels: Record<string, string> = {
  seasonal: "Tanaman semusim",
  perennial: "Tanaman tahunan",
  fish: "Budidaya ikan",
  integrated: "Usaha terpadu",
  group: "Kelompok pekerja",
  employee: "Pegawai",
  buyer: "Pembeli",
  supplier: "Pemasok",
  wage: "Uang muka upah",
  employee_loan: "Pinjaman pegawai",
  operational: "Dana belanja operasional",
  manager: "Pengurus",
  recorder: "Pencatat",
  finance: "Keuangan",
  reader: "Pembaca",
  owner: "Pemilik",
  alat: "Alat pertanian",
  mesin: "Mesin",
  kendaraan: "Kendaraan",
  irigasi: "Pompa & irigasi",
  bangunan: "Bangunan & fasilitas",
  perikanan: "Peralatan perikanan",
  elektronik: "Elektronik",
  lainnya: "Lainnya",
  baik: "Baik",
  perlu_perawatan: "Perlu perawatan",
  rusak: "Rusak",
};
export const costKinds = [
  "expense",
  "labor",
  "shipping",
  "maintenance",
  "lease",
];
export const cashKinds = [
  "income",
  "capital",
  "withdrawal",
  "loan_in",
  "loan_out",
  "opening",
  "transfer",
  "advance",
  "advance_return",
  "settlement",
];
