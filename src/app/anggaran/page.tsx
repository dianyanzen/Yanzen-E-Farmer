import { FarmProjectCard } from "@/components/farm-ui";
import { FarmActionLink, FarmPageTemplate } from "@/components/farm-template";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function Anggaran() {
  const db = await createClient();
  const { data: auth, error } = await db.auth.getClaims();
  if (error || !auth?.claims?.sub) redirect("/login");

  const { data: projects, error: pError } = await db.from("farm_projects")
    .select("id,name,crop,area_tumbak").order("created_at", { ascending: false });
  if (pError) throw new Error("Gagal memuat proyek");
  const { data: items, error: iError } = await db.from("budget_items")
    .select("project_id,quantity,unit_price");
  if (iError) throw new Error("Gagal memuat kebutuhan");

  const money = (n: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

  return (
    <FarmPageTemplate
      title="Manajemen Anggaran"
      eyebrow="Yanzen E-Farmer"
      subtitle="Semua proyek pertanian milikmu."
      backHref="/home"
      backLabel="Beranda"
      actions={<FarmActionLink href="/anggaran/baru" tone="primary">+ Buat Proyek</FarmActionLink>}
    >
      <div className="farmer-budget-grid">
        {projects?.length ? projects.map((p) => {
          const total = (items ?? []).filter((i) => i.project_id === p.id)
            .reduce((sum, item) => sum + Number(item.quantity) * Number(item.unit_price), 0);
          return <FarmProjectCard key={p.id} href={`/anggaran/${p.id}`}
            name={p.name} crop={p.crop} area={Number(p.area_tumbak)} total={money(total)} />;
        }) : (
          <div className="farm-empty farmer-budget-empty">
            <Image src="/brand/empty-project-photo.jpg" alt="Ilustrasi bibit tanaman timun"
              width={360} height={270} className="farmer-budget-empty-image" />
            <p>Belum ada proyek. Mulai dengan membuat proyek pertamamu.</p>
            <Link href="/anggaran/baru" className="farm-section-action">Buat proyek →</Link>
          </div>
        )}
      </div>
    </FarmPageTemplate>
  );
}
