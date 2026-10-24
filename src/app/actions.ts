'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
const schema=z.object({
 musim_id:z.uuid(),
 kategori:z.string().trim().min(1).max(80),
 nama:z.string().trim().min(1).max(160),
 jumlah:z.coerce.number().positive().finite(),
 satuan:z.string().trim().min(1).max(40),
 harga_satuan:z.coerce.number().min(0).finite()
});
async function authenticated(){const db=await createClient();const {data,error}=await db.auth.getClaims();if(error||!data?.claims?.sub)redirect('/login');return db}
export async function addExpense(form:FormData){
 const db=await authenticated();
 const parsed=schema.safeParse(Object.fromEntries(form));
 if(!parsed.success)throw new Error('Data pengeluaran tidak valid');
 const {error}=await db.from('pengeluaran').insert(parsed.data);
 if(error)throw new Error('Gagal menyimpan pengeluaran');
 revalidatePath('/');
}
export async function deleteExpense(form:FormData){
 const db=await authenticated();const id=z.uuid().parse(form.get('id'));
 const {error}=await db.from('pengeluaran').delete().eq('id',id);
 if(error)throw new Error('Gagal menghapus pengeluaran');
 revalidatePath('/');
}

export async function addSeason(form:FormData){
 const db=await authenticated();
 const parsed=z.object({nama:z.string().trim().min(1).max(120),luas_tumbak:z.coerce.number().positive().finite()}).safeParse(Object.fromEntries(form));
 if(!parsed.success)throw new Error('Musim tanam tidak valid');
 const {error}=await db.from('musim_tanam').insert({...parsed.data,komoditas:'Timun'});
 if(error)throw new Error('Gagal membuat musim tanam');
 revalidatePath('/');
}
