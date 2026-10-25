import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { FarmPageTemplate } from "@/components/farm-template";
import Image from "next/image";
import NewReceiptForm from "./new-receipt-form";

export const dynamic = "force-dynamic";

export default async function NewBonPage() {
  const db = await createClient();
  const { data: auth, error: authError } = await db.auth.getClaims();
  if (authError || !auth?.claims?.sub) redirect("/login");

  const { data: projects, error: projectsError } = await db.from("farm_projects")
    .select("id,name").order("created_at", { ascending: false });
  if (projectsError) throw new Error("Gagal memuat proyek untuk bon");

  const { data: budget, error: budgetError } = await db.from("budget_items")
    .select("id,project_id,name,unit,unit_price").order("name");
  if (budgetError) throw new Error("Gagal memuat referensi anggaran");

  return (
    <FarmPageTemplate
      className="farmer-bon-page"
      eyebrow="Yanzen E-Farmer · Pencatatan biaya"
      title="Buat Bon Pengeluaran"
      subtitle="Satu bon untuk beberapa kebutuhan. Total dihitung otomatis dan tersimpan sebagai pengeluaran aktual."
      backHref="/keuangan"
      backLabel="Kembali ke Keuangan"
    >
      <section className="farmer-bon-guide">
        <div>
          <p className="farmer-workspace-eyebrow">Cara cepat membuat bon</p>
          <h2>Tiga langkah, satu struk tersimpan.</h2>
          <p>Pilih proyek dan tanggal · Tambahkan kebutuhan · Simpan untuk melihat dan mencetak bon.</p>
          <small>Pengeluaran aktual tidak mengubah anggaran rencana.</small>
        </div>
        <Image src="/brand/bon-pengeluaran-photo.jpg" alt="Ilustrasi bon pengeluaran digital"
          width={1100} height={825} className="farmer-bon-guide-image" />
      </section>
      <NewReceiptForm projects={projects ?? []} budgetItems={budget ?? []} />
    </FarmPageTemplate>
  );
}
