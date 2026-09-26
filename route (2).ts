import { NextRequest, NextResponse } from 'next/server';
import { foglaltNapokListaja } from '@/lib/availability';

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
    const napok = await foglaltNapokListaja(haz, tol, ig);
    return NextResponse.json(
      { haz, tol, ig, foglalt_napok: napok },
      { headers: { 'Cache-Control': 'public, max-age=60, s-maxage=60' } }
    );
  } catch (e) {
    console.error('[szabad-napok]', e);
    return NextResponse.json({ hiba: 'A naptár most nem érhető el.' }, { status: 500 });
  }
}
