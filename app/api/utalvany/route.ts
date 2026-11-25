import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { fizetestIndit } from '@/lib/barion';
import { UTALVANY } from '@/lib/utalvany';

/**
 * Ajándékutalvány vásárlása.
 *
 * Nem foglalás: itt a vevő nem időpontot vesz, hanem egy kódot, amit
 * később ő vagy a megajándékozott vált be.
 *
 * ⚠ AZ ÁRAT ITT IS A SZERVER DÖNTI EL. A böngésző csak azt mondja meg,
 *   KI vásárol — hogy mennyibe kerül, az a `lib/utalvany.ts`-ben áll.
 *
 * A kód NEM itt születik meg, hanem a Barion visszahívásában, a
 * sikeres fizetés után. Enélkül egy elindított, de ki nem fizetett
 * vásárlás is érvényes kódot adna.
 */

export const dynamic = 'force-dynamic';

type Keres = {
  nev: string;
  email: string;
  telefon?: string;
  /** Ha ajándékba veszi: kinek. Csak tájékoztató adat. */
  ajandekozott?: string;
  uzenet?: string;
  aszf_elfogadva?: boolean;
};

export async function POST(req: NextRequest) {
  let k: Keres;
  try {
    k = (await req.json()) as Keres;
  } catch {
    return NextResponse.json({ hiba: 'Hibás kérés.' }, { status: 400 });
  }

  const nev = (k.nev ?? '').trim();
  const email = (k.email ?? '').toLowerCase().trim();

  if (!nev) {
    return NextResponse.json({ hiba: 'Add meg a neved.' }, { status: 400 });
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ hiba: 'Az e-mail cím nem érvényes.' }, { status: 400 });
  }
  if (k.aszf_elfogadva !== true) {
    return NextResponse.json(
      {
        hiba:
          'A vásárláshoz el kell fogadnod az Általános Szerződési Feltételeket ' +
          'és az Adatkezelési tájékoztatót.',
      },
      { status: 400 }
    );
  }

  const db = supabaseAdmin();

  // Azonosító: az „UTA-” előtagról ismeri fel a Barion visszahívása,
  // hogy ez utalványvásárlás és nem foglalás.
  const { count } = await db
    .from('utalvany_vasarlasok')
    .select('id', { count: 'exact', head: true });
  const azonosito = `UTA-${new Date().getFullYear()}-${String((count ?? 0) + 1).padStart(4, '0')}`;

  const { data: vasarlas, error } = await db
    .from('utalvany_vasarlasok')
    .insert({
      azonosito,
      nev,
      email,
      telefon: k.telefon?.trim() || null,
      osszeg: UTALVANY.ar,
      statusz: 'fuggoben',
      ajandekozott: k.ajandekozott?.trim() || null,
      uzenet: k.uzenet?.trim() || null,
    })
    .select('id, azonosito')
    .single();

  if (error || !vasarlas) {
    console.error('[utalvany] mentés:', error);
    return NextResponse.json({ hiba: 'Nem sikerült rögzíteni a vásárlást.' }, { status: 500 });
  }

  const alap = process.env.NEXT_PUBLIC_OLDAL_URL ?? 'https://www.szelidliget.hu';

  try {
    const fizetes = await fizetestIndit({
      orderRef: vasarlas.azonosito,
      total: UTALVANY.ar,
      customer: nev,
      customerEmail: email,
      nyelv: 'HU',
      visszaUrl: `${alap}/utalvany/siker?ref=${vasarlas.azonosito}`,
      visszahivasUrl: `${alap}/api/barion/visszahivas`,
    });

    await db
      .from('utalvany_vasarlasok')
      .update({ barion_id: fizetes.paymentId, modositva: new Date().toISOString() })
      .eq('id', vasarlas.id);

    return NextResponse.json({
      azonosito: vasarlas.azonosito,
      osszeg: UTALVANY.ar,
      fizetesi_url: fizetes.fizetesiUrl,
    });
  } catch (e) {
    console.error('[utalvany] Barion indítás:', e);
    return NextResponse.json(
      {
        hiba:
          'A vásárlás rögzült, de a fizetést nem sikerült elindítani. ' +
          `Kérjük, írj nekünk a(z) ${vasarlas.azonosito} azonosítóval.`,
      },
      { status: 502 }
    );
  }
}
