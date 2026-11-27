import { NextRequest, NextResponse } from 'next/server';
import { foglaltNapokListaja, zartNapokListaja } from '@/lib/availability';

/**
 * Publikus naptár-adat. Kizárólag dátumokat ad vissza — vendégadatot,
 * árat vagy foglalási azonosítót soha.
 */

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  const haz = p.get('haz');
  const tol = p.get('tol');
  const ig = p.get('ig');

  if (!haz || !tol || !ig) {
    return NextResponse.json(
      { hiba: 'Kötelező paraméterek: haz, tol, ig.' },
      { status: 400 }
    );
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(tol) || !/^\d{4}-\d{2}-\d{2}$/.test(ig)) {
    return NextResponse.json({ hiba: 'A dátum formátuma: YYYY-MM-DD.' }, { status: 400 });
  }

  try {
    // A kettőt párhuzamosan kérdezzük — két külön kérdés ugyanarról
    // az időszakról, és nem függnek egymástól.
    const [napok, zartak] = await Promise.all([
      foglaltNapokListaja(haz, tol, ig),
      zartNapokListaja(haz, tol, ig),
    ]);

    return NextResponse.json(
      {
        haz,
        tol,
        ig,
        /** Minden nem elérhető éjszaka — foglalás és zárás együtt. */
        foglalt_napok: napok,
        /** Ebből amelyik ZÁRÁSBÓL ered. A naptár ezeket teljesen
         *  foglaltnak rajzolja, félnap nélkül. */
        zart_napok: zartak,
      },
      {
        // Rövid gyorsítótár: a naptár sokszor kérdez, de egy frissen
        // felvett zárásnak is hamar látszódnia kell.
        headers: { 'Cache-Control': 'public, max-age=30, s-maxage=30' },
      }
    );
  } catch (e) {
    console.error('[szabad-napok]', e);
    return NextResponse.json({ hiba: 'A naptár most nem érhető el.' }, { status: 500 });
  }
}
