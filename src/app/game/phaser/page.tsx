import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import GameClient from "../game-client";
import {loadGameResidents} from "@/lib/game/server-resident-data";

export const dynamic = "force-dynamic";
export const metadata = { title: "YZ Farm Life — Phaser" };

export default async function PhaserPage() {
  const db = await createClient();
  const { data: { user }, error } = await db.auth.getUser();
  if (error || !user) redirect("/login");
  const residents=await loadGameResidents();
  return <GameClient engine="phaser" residents={residents} />;
}
