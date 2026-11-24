import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const internalMenus = new Set([
  'additional', 'anggaran', 'catat', 'catatan', 'dashboard', 'design-system',
  'home', 'keuangan', 'lahan', 'laporan', 'panen', 'pengaturan', 'pertanian', 'wawasan',
]);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isNavigation = request.method === 'GET' || request.method === 'HEAD';
  const isEntry = pathname === '/' || pathname === '/login';
  const isInternal = internalMenus.has(pathname.split('/')[1]);
  let response = NextResponse.next({ request });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    if (isInternal && isNavigation) {
      return NextResponse.redirect(new URL('/', request.url), {
        headers: { 'Cache-Control': 'private, no-store' },
      });
    }
    return response;
  }

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(values) {
        values.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        values.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  if (isNavigation && (isEntry || isInternal)) {
    const { data } = await supabase.auth.getUser();
    const landingForUser = process.env.NEXT_PUBLIC_YZ_GAME_PLAYTEST==='1' ? '/game' : '/home';
    const destination = data.user ? (isEntry ? landingForUser : null) : (isInternal ? '/' : null);
    if (destination) {
      const redirect = NextResponse.redirect(new URL(destination, request.url));
      for (const cookie of response.cookies.getAll()) redirect.cookies.set(cookie);
      response = redirect;
    }
    response.headers.set('Cache-Control', 'private, no-store');
  } else {
    await supabase.auth.getClaims();
  }
  return response;
}

export const config={matcher:['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)']};
