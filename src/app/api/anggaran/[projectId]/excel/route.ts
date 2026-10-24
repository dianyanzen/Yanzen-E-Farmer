import {createClient} from '@/lib/supabase/server';
import {buildBudgetXlsx} from '@/lib/xlsx-export';
export const dynamic='force-dynamic';
export const runtime='nodejs';

export async function GET(_request:Request,{params}:{params:Promise<{projectId:string}>}){
 const {projectId}=await params;
 if(!/^[0-9a-fA-F-]{36}$/.test(projectId))return new Response('ID proyek tidak valid',{status:400});
 const db=await createClient();
 const {data:auth,error:authError}=await db.auth.getClaims();
 if(authError||!auth?.claims?.sub)return new Response('Silakan login terlebih dahulu',{status:401});
 const {data:project,error:pError}=await db.from('farm_projects').select('id,name,crop,area_tumbak').eq('id',projectId).maybeSingle();
 if(pError)return new Response('Gagal membaca proyek',{status:500});
 if(!project)return new Response('Proyek tidak ditemukan',{status:404});
 const {data:items,error:iError}=await db.from('budget_items')
  .select('name,category,quantity,unit,unit_price').eq('project_id',projectId).order('created_at',{ascending:true});
 if(iError)return new Response('Gagal membaca rincian anggaran',{status:500});
 if((items??[]).length>=1000)return new Response('Data melebihi batas ekspor; hubungi administrator',{status:413});
 const rows=(items??[]).map(x=>({
  name:String(x.name),category:String(x.category),quantity:Number(x.quantity),unit:String(x.unit),unit_price:Number(x.unit_price)
 }));
 if(rows.some(x=>!Number.isFinite(x.quantity)||!Number.isFinite(x.unit_price)))return new Response('Data anggaran tidak valid',{status:422});
 const workbook=buildBudgetXlsx({
  name:project.name,crop:project.crop,area_tumbak:Number(project.area_tumbak)
 },rows);
 const fileName=encodeURIComponent('Anggaran - '+project.name+'.xlsx');
 return new Response(new Uint8Array(workbook),{
  headers:{
   'Content-Type':'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
   'Content-Disposition':'attachment; filename="Anggaran-Yanzen-E-Farmer.xlsx"; filename*=UTF-8\'\''+fileName,
   'Cache-Control':'private, no-store',
   'X-Content-Type-Options':'nosniff'
  }
 });
}
