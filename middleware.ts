import { NextRequest, NextResponse } from 'next/server';
import { SUTI_NEV, tokenErvenyes } from '@/lib/adminAuth';

/**
 * Két dolgot intéz, minden kérés előtt:
 *
 *  1. Az /admin útvonalak védelme. Ez a réteg nem felejthető el egy új
 *     admin oldalon — ha az oldalakon egyenként ellenőriznénk,
 *     előbb-utóbb kimaradna egy, és azon kiszivárogna a vendégadat.
 *
 *  2. Az útvonal továbbadása a keretfájlnak, hogy a HTML a tényleges
 *     nyelvet jelölje (magyar oldal `hu`, angol oldal `en`). Ez a
 *     keresőknek számít: enélkül az angol oldalak is magyarként
 *     szerepelnének.
 */

/** A nyelv jelöléséhez: ezt olvassa ki a keretfájl. */
export const UTVONAL_FEJLEC = 'x-utvonal';

/** Az útvonalat minden válaszhoz hozzátesszük, hogy a keret tudja a nyelvet. */
function utvonallal(req: NextRequest) {
  const fejlecek = new Headers(req.headers);
  fejlecek.set(UTVONAL_FEJLEC, req.nextUrl.pathname);
  return NextResponse.next({ request: { headers: fejlecek } });
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Az admin felületen kívül nincs mit védeni: csak az útvonalat
  // adjuk tovább, hogy a HTML a helyes nyelvet jelölje.
  const vedett =
    pathname.startsWith('/admin') || pathname.startsWith('/api/admin');
  if (!vedett) return utvonallal(req);

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
  /**
   * Minden oldalra lefut — az admin védelme miatt, és azért, hogy a
   * HTML `lang` jelölése a tényleges nyelvet mutassa. A statikus
   * fájlokat (képek, betűtípusok, ikonok) kihagyjuk, azokon nincs
   * dolga és csak lassítana.
   */
  matcher: [
    '/((?!_next/static|_next/image|kepek/|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:png|jpg|jpeg|webp|svg|ico|mp4|webm|woff|woff2)$).*)',
  ],
};
