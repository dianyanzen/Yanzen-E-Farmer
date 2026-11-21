import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import GameClient from "./game-client";
import publishedResidents from "@/lib/game/data/published-residents.json";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "YZ Farm Life — Pasirluyu, Kota Bandung",
  description: "Prototype game pertanian pixel-art dan cerita Pasirluyu, Kota Bandung."
};

export default async function GamePage() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) redirect("/login");
  return <GameClient engine="phaser" residents={publishedResidents} />;
}
