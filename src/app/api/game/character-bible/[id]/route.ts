import {NextResponse} from "next/server";
import {createClient} from "@/lib/supabase/server";
import {loadGameResidentData} from "@/lib/game/server-resident-data";

export const dynamic="force-dynamic";
const headers={"Cache-Control":"private, no-store, max-age=0"};
export async function GET(_request:Request,context:{params:Promise<{id:string}>}){
 const supabase=await createClient();
 const {data,error}=await supabase.auth.getUser();
 if(error||!data.user)return NextResponse.json({error:"Login diperlukan"},{status:401,headers});
 const {id}=await context.params;
 if(!/^(?:[ACNK]\d{2}|P0[12]|W\d{3})$/.test(id)||id==="A01")
  return NextResponse.json({error:"Profil tidak ditemukan"},{status:404,headers});
 const {residents,bibles}=await loadGameResidentData();
 if(!residents.some(person=>person.id===id)||!bibles[id])
  return NextResponse.json({error:"Profil tidak ditemukan"},{status:404,headers});
 return NextResponse.json({profile:bibles[id]},{headers});
}
