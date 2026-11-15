import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return response;

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

  const { pathname } = request.nextUrl;
  const isEntry = pathname === '/' || pathname === '/login';
  if (isEntry && (request.method === 'GET' || request.method === 'HEAD')) {
    const { data } = await supabase.auth.getUser();
    if (data.user) {
      const redirect = NextResponse.redirect(new URL('/home', request.url));
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
