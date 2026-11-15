import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Workspace from "@/components/farm/workspace";
import "../yz-motion.css";
export const dynamic = "force-dynamic";
export default async function Page() {
  const db = await createClient();
  const { data, error } = await db.auth.getUser();
  if (error || !data.user) redirect("/login");
  return <div className="yz-motion-home"><Workspace view="home" /></div>;
}
