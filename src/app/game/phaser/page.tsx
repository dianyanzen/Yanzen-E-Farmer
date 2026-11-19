import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import GameClient from "../game-client";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "YZ Farm Life — Phaser 4 Preview",
  description: "Uji migrasi renderer Phaser tanpa mengubah permainan production."
};

export default async function PhaserGamePage() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) redirect("/login");
  return <GameClient engine="phaser" />;
}
