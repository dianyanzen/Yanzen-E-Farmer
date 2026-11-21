import {NextResponse} from "next/server";
import {readPrivateResidents} from "@/lib/game/private-residents";
export const dynamic="force-dynamic";
export const runtime="nodejs";
/** No roster contents or identities are ever returned by this endpoint. */
export async function GET(){
 const residents=await readPrivateResidents();
 const ready=residents.length===248;
 return NextResponse.json(
  {ready,count:ready?residents.length:0,source:"private-canonical-roster",version:"2026-11-22"},
  {status:ready?200:503,headers:{"Cache-Control":"private, no-store"}}
 );
}
