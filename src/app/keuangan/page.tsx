import Image from "next/image";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { FarmActionLink, FarmPageTemplate } from "@/components/farm-template";
import ExpenseManager from "./expense-manager";

export const dynamic = "force-dynamic";

export default async function Keuangan() {
  const db = await createClient();
  const { data: auth, error: authError } = await db.auth.getClaims();
  if (authError || !auth?.claims?.sub) redirect("/login");

  const { data: projects, error: projectError } = await db.from("farm_projects")
    .select("id,name").order("created_at", { ascending: false });
  if (projectError) throw new Error("Tidak dapat memuat proyek");

  const { data: expenses, error: expenseError } = await db.from("expenses")
    .select("id,project_id,expense_date,description,amount,receipt_number,vendor,note,receipt_group,quantity,unit,unit_price")
    .order("expense_date", { ascending: false }).limit(200);
  if (expenseError) throw new Error("Tidak dapat memuat pengeluaran");

  return (
    <FarmPageTemplate
      title="Pengeluaran aktual"
      eyebrow="Yanzen E-Farmer / Keuangan"
      subtitle="Catat biaya yang benar-benar dibayar. Data ini terpisah dari rencana anggaran."
      backHref="/home"
      backLabel="Beranda"
    >
      <section className="farm-hero farmer-finance-hero">
        <div className="farmer-finance-hero-body">
          <span className="farmer-finance-hero-eyebrow">Fitur unggulan</span>
          <h2>Buat Bon / Struk Pengeluaran</h2>
          <p>Satu bon bisa memuat banyak barang, menghitung subtotal dan total otomatis,
            lalu dicetak atau disimpan sebagai PDF.</p>
          <FarmActionLink href="/keuangan/bon/baru" tone="secondary">+ Buat Bon Baru</FarmActionLink>
        </div>
        <Image src="/brand/bon-pengeluaran-premium.svg" alt="" aria-hidden="true"
          width={390} height={300} className="farmer-finance-hero-image" />
        <div aria-hidden="true" className="farm-hero-hill" />
        <div aria-hidden="true" className="farm-hero-hill farm-hero-hill-back" />
      </section>
      <ExpenseManager projects={projects ?? []} initialExpenses={expenses ?? []} />
    </FarmPageTemplate>
  );
}
