import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {readPrivateResidents} from "@/lib/game/private-residents";
import GameClient from "../game-client";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const metadata = { title: "YZ Farm Life — Phaser" };

export default async function PhaserPage() {
  const db = await createClient();
  const { data: { user }, error } = await db.auth.getUser();
  if (error || !user) redirect("/login");
  const residents=await readPrivateResidents();
  return <GameClient engine="phaser" residents={residents} />;
}
