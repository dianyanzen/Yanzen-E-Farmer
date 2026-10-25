import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Workspace from "@/components/farm/workspace";
export const dynamic = "force-dynamic";
export default async function Page() {
  const db = await createClient();
  const { data, error } = await db.auth.getUser();
  if (error || !data.user) redirect("/login");
  return <Workspace view="home" />;
}
