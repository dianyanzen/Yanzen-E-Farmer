import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import GameClient from "./game-client";
import {loadGameResidents} from "@/lib/game/server-resident-data";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "YZ Farm Life — Pasirluyu, Kota Bandung",
  description: "Prototype game pertanian pixel-art dan cerita Pasirluyu, Kota Bandung."
};

export default async function GamePage() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) redirect("/login");
  const residents=await loadGameResidents();
  return <GameClient engine="phaser" residents={residents} />;
}
