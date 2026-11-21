import { readResidentRoster } from "@/lib/local-auth/residents";
import { redirect } from "next/navigation";
import { getAuthenticatedUser, getCookieToken } from "@/lib/local-auth/auth";
import GameClient from "../game-client";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "YZ Farm Life — Canvas Fallback",
  description: "Rute pembanding Canvas 2D untuk YZ Farm Life.",
};

export default async function CanvasGamePage() {
  if (!await getAuthenticatedUser(await getCookieToken())) redirect("/login");
  return <GameClient engine="canvas" residents={await readResidentRoster()} />;
}
