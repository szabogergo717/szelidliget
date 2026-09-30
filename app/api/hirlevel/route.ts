import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * Hírlevél-feliratkozás a főoldali dobozból.
 *
 * A hozzájárulás idejét és forrását eltároljuk — ez a GDPR szerinti
 * bizonyíték arra, hogy a feliratkozás önkéntes volt.
 *
 * Aki korábban leiratkozott, majd újra feliratkozik, annak a meglévő
 * sora frissül — nem jön létre második.
 */

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  let email = '';
  let nyelv: 'hu' | 'en' = 'hu';
  let nev: string | null = null;

  try {
    const t = await req.json();
    email = typeof t.email === 'string' ? t.email.trim().toLowerCase() : '';
    nyelv = t.nyelv === 'en' ? 'en' : 'hu';
    nev = typeof t.nev === 'string' && t.nev.trim() ? t.nev.trim() : null;
  } catch {
    return NextResponse.json({ hiba: 'Hibás kérés.' }, { status: 400 });
  }

  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ hiba: 'Az e-mail cím formátuma hibás.' }, { status: 400 });
  }

  try {
    const db = supabaseAdmin();
    const { error } = await db.from('hirlevel_feliratkozok').upsert(
      {
        email,
        nev,
        nyelv,
        hozzajarult: true,
        hozzajarulas_ideje: new Date().toISOString(),
        forras: 'weboldal',
        leiratkozott: false,
        leiratkozas_ideje: null,
      },
      { onConflict: 'email' }
    );
    if (error) throw new Error(error.message);
  } catch (e) {
    console.error('[hirlevel]', e);
    return NextResponse.json(
      { hiba: 'Nem sikerült feliratkozni. Próbáld újra később.' },
      { status: 500 }
    );
  }

  return NextResponse.json({ rendben: true });
}
