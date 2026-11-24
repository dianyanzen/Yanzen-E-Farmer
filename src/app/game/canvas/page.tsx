import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import GameClient from "../game-client";
import {loadGameResidents} from "@/lib/game/server-resident-data";

export const dynamic = "force-dynamic";
export const metadata = { title: "YZ Farm Life — Canvas fallback" };

export default async function CanvasPage() {
  const db = await createClient();
  const { data: { user }, error } = await db.auth.getUser();
  if (error || !user) redirect("/login");
  const residents=await loadGameResidents();
  return <GameClient engine="canvas" residents={residents} />;
}
