import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import GameClient from "../game-client";

export const dynamic = "force-dynamic";
export const metadata = { title: "YZ Farm Life — Canvas fallback" };

export default async function CanvasGamePage() {
  const db = await createClient();
  const { data, error } = await db.auth.getUser();
  if (error || !data.user) redirect("/login");
  return <GameClient engine="canvas" />;
}
