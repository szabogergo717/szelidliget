import { NextRequest, NextResponse } from 'next/server';
import { SUTI_NEV, tokenErvenyes } from '@/lib/adminAuth';

/**
 * Az /admin útvonalak védelme.
 *
 * Ez a réteg MINDEN kérés előtt lefut, tehát nem lehet elfelejteni
 * egy új admin oldalon. Ha az oldalakon egyenként ellenőriznénk,
 * előbb-utóbb kimaradna egy — és azon kiszivárogna a vendégadat.
 */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // A belépőoldal és a hozzá tartozó művelet nyitva marad, különben
  // nem lehetne belépni.
  if (pathname.startsWith('/admin/belepes') || pathname.startsWith('/api/admin/belepes')) {
    return NextResponse.next();
  }

  const token = req.cookies.get(SUTI_NEV)?.value;
  if (await tokenErvenyes(token)) {
    return NextResponse.next();
  }

  // API-hívásnál nincs értelme átirányítani — egyértelmű hibát adunk.
  if (pathname.startsWith('/api/')) {
    return NextResponse.json({ hiba: 'Nincs jogosultság.' }, { status: 401 });
  }

  const cel = new URL('/admin/belepes', req.url);
  cel.searchParams.set('tovabb', pathname);
  return NextResponse.redirect(cel);
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
