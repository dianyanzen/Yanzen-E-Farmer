import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import GameClient from "./game-client";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "YZ Farm Life — Kampung Harmoni",
  description: "Prototype game pertanian pixel-art dan cerita Kampung Harmoni."
};

export default async function GamePage() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) redirect("/login");
  return <GameClient />;
}
