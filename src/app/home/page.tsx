import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import Workspace from "@/components/farm/workspace";
import "../yz-motion.css";
export const dynamic = "force-dynamic";
export default async function Page() {
  const db = await createClient();
  const { data, error } = await db.auth.getUser();
  if (error || !data.user) redirect("/login");
  return <div className="yz-motion-home">
    <div className="mx-auto max-w-6xl px-5 pt-3">
      <Link href="/game" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#bad4aa] bg-[#e6f2df] px-4 py-2 text-sm font-bold text-[#286144] hover:bg-[#d6e9d0]">
        <span aria-hidden="true">🎮</span> Coba YZ Farm Life <span className="rounded-md bg-white px-2 py-1 text-[10px] font-extrabold">PROTOTYPE</span>
      </Link>
    </div>
    <Workspace view="home" />
  </div>;
}
