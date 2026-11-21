import RosterUnavailable from "../roster-unavailable";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {readPrivateResidents} from "@/lib/game/private-residents";
import GameClient from "../game-client";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const metadata = { title: "YZ Farm Life — Canvas fallback" };

export default async function CanvasPage() {
  const db = await createClient();
  const { data: { user }, error } = await db.auth.getUser();
  if (error || !user) redirect("/login");
  const residents=await readPrivateResidents();
  if(residents.length!==248)return <RosterUnavailable/>;
  return <GameClient engine="canvas" residents={residents} />;
}
