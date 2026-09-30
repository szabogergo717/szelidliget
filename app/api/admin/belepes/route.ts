import { NextRequest, NextResponse } from 'next/server';
import {
  SUTI_NEV,
  SUTI_BEALLITAS,
  jelszoHelyes,
  tokenKeszit,
} from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

/**
 * Belépés és kilépés.
 *
 * Hibás jelszónál szándékosan várunk egy keveset. Ez lassítja a
 * gépi próbálkozást, és nem árulja el a válaszidőből, hogy melyik
 * ellenőrzésen bukott el.
 */

async function varj(ms: number) {
  await new Promise((r) => setTimeout(r, ms));
}

export async function POST(req: NextRequest) {
  let jelszo = '';
  try {
    const t = await req.json();
    jelszo = typeof t.jelszo === 'string' ? t.jelszo : '';
  } catch {
    return NextResponse.json({ hiba: 'Hibás kérés.' }, { status: 400 });
  }

  if (!jelszoHelyes(jelszo)) {
    await varj(800);
    return NextResponse.json({ hiba: 'Hibás jelszó.' }, { status: 401 });
  }

  let token: string;
  let lejar: Date;
  try {
    ({ token, lejar } = await tokenKeszit());
  } catch (e) {
    console.error('[admin/belepes]', e);
    return NextResponse.json(
      { hiba: 'A belépés nincs beállítva a szerveren.' },
      { status: 500 }
    );
  }

  const valasz = NextResponse.json({ rendben: true });
  valasz.cookies.set(SUTI_NEV, token, { ...SUTI_BEALLITAS, expires: lejar });
  return valasz;
}

/** Kilépés: a süti törlése. */
export async function DELETE() {
  const valasz = NextResponse.json({ rendben: true });
  valasz.cookies.set(SUTI_NEV, '', { ...SUTI_BEALLITAS, maxAge: 0 });
  return valasz;
}
