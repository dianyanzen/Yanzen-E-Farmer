import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
export async function POST(request: Request) {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();
  if (error) return NextResponse.json({ error: 'Gagal keluar. Silakan coba lagi.' }, { status: 503 });
  return NextResponse.redirect(new URL('/login', request.url), 303);
}
