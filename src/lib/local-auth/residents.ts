import { readFile } from "node:fs/promises";
import { z } from "zod";
import type { ResidentProfile } from "@/lib/game/resident-profile";

const residents = z.array(z.object({
  id: z.string().regex(/^(?:[ACNK]\d{2}|P0[12]|W\d{3})$/),
  name: z.string().min(1).max(120),
  occupation: z.string().min(1).max(120),
  portrait: z.string().regex(/^(?:P0[12]|N0[1-6]|K(?:0[1-9]|[12]\d|30)|R[0-9]{3}|phone-(?:A(?:0[1-9]|1[0-6])|C0[158])|work-[AC](?:0[1-9]|1[0-6]))$/),
})).max(500);

export async function readResidentRoster(): Promise<ResidentProfile[]> {
  const path = process.env.GAME_RESIDENT_ROSTER;
  if (!path) return [];
  try {
    const roster = residents.parse(JSON.parse(await readFile(path, "utf8")));
    const ids = new Set(roster.map(resident => resident.id));
    const names = new Set(roster.map(resident => resident.name.toLocaleLowerCase("id")));
    if (ids.size !== roster.length || names.size !== roster.length) {
      throw new Error("Roster IDs and names must be unique");
    }
    return roster;
  } catch {
    console.error("Private game roster could not be loaded.");
    return [];
  }
}
