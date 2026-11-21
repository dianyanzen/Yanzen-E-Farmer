import { readResidentRoster } from "@/lib/local-auth/residents";
import { redirect } from "next/navigation";
import { getAuthenticatedUser, getCookieToken } from "@/lib/local-auth/auth";
import GameClient from "../game-client";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "YZ Farm Life — Phaser 4 Preview",
  description: "Uji migrasi renderer Phaser tanpa mengubah permainan production."
};

export default async function PhaserGamePage() {
  if (!await getAuthenticatedUser(await getCookieToken())) redirect("/login");
  return <GameClient engine="phaser" residents={await readResidentRoster()} />;
}
