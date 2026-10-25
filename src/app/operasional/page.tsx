import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Workspace from "@/components/farm/workspace";

export const dynamic = "force-dynamic";

/** New optional module. Does not replace /home or any existing navigation. */
export default async function OperationsModule() {
  const db = await createClient();
  const { data, error } = await db.auth.getUser();
  if (error || !data.user) redirect("/login");
  return <Workspace view="home" />;
}
