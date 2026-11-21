import {NextResponse} from "next/server";
import {createClient} from "@/lib/supabase/server";
import {readPrivateResidents} from "@/lib/game/private-residents";
import {readPrivateResidentBible} from "@/lib/game/private-resident-bibles";
export const runtime="nodejs";
export const dynamic="force-dynamic";
const headers={"Cache-Control":"private, no-store"};
export async function GET(_request:Request,ctx:{params:Promise<{id:string}>}){
 const db=await createClient();
 const {data:{user},error}=await db.auth.getUser();
 if(error||!user)return NextResponse.json({error:"Sesi game tidak tersedia."},{status:401,headers});
 const {id}=await ctx.params;
 if(!/^(?:[ACNK]\d{2}|P0[12]|W\d{3})$/.test(id))
  return NextResponse.json({error:"Warga tidak ditemukan."},{status:404,headers});
 const residents=await readPrivateResidents();
 const resident=residents.find(r=>r.id===id);
 if(!resident)return NextResponse.json({error:"Warga tidak ditemukan."},{status:404,headers});
 const profile=await readPrivateResidentBible(resident);
 if(!profile)return NextResponse.json({error:"Catatan ini belum tersedia."},{status:404,headers});
 return NextResponse.json({profile},{headers});
}
