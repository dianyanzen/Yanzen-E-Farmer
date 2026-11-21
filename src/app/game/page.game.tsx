import { readResidentRoster } from "@/lib/local-auth/residents";
import { redirect } from "next/navigation";
import { getAuthenticatedUser, getCookieToken } from "@/lib/local-auth/auth";
import GameClient from "./game-client";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "YZ Farm Life",
  description: "Phaser sebagai renderer utama dengan Canvas sebagai fallback untuk YZ Farm Life."
};

export default async function GamePage() {
  if (!await getAuthenticatedUser(await getCookieToken())) redirect("/login");
  return <GameClient engine="phaser" residents={await readResidentRoster()} />;
}
