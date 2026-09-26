import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { arajanlat, foglalasHibai } from '@/lib/pricing';
import type { Haz, Arazas, Extra } from '@/lib/pricing';
import { szabad } from '@/lib/availability';

/**
 * Árelőnézet a foglalóűrlaphoz.
 *
 * Miért nem a böngésző számol? Mert akkor két különböző helyen lenne
 * árazási logika, és előbb-utóbb eltérnének. Így a vendég pontosan azt
 * az összeget látja, amit a foglalás API is ki fog számolni.
 *
 * Ez a végpont nem hoz létre semmit, csak számol.
 */

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  let k: {
    haz_slug?: string;
    erkezes?: string;
    tavozas?: string;
    fo?: number;
    extrak?: string[]; // slug-ok
  };

  try {
    k = await req.json();
  } catch {
    return NextResponse.json({ hiba: 'Hibás kérés.' }, { status: 400 });
  }

  if (!k.haz_slug || !k.erkezes || !k.tavozas) {
    return NextResponse.json(
      { hiba: 'Hiányzó adat: faház, érkezés vagy távozás.' },
      { status: 400 }
    );
  }

  const db = supabaseAdmin();

  const { data: haz } = await db
    .from('hazak')
    .select('id, slug, nev, max_fo, alap_ar, min_ejszaka')
    .eq('slug', k.haz_slug)
    .eq('aktiv', true)
    .maybeSingle();

  if (!haz) {
    return NextResponse.json({ hiba: 'Ismeretlen faház.' }, { status: 404 });
  }

  const { data: arazasok } = await db
    .from('arazas')
    .select('kezdet, veg, ar, min_ejszaka, prioritas, megnevezes')
    .eq('haz_id', haz.id);

  const { data: extrak } = await db
    .from('extrak')
    .select('id, slug, ar, ejszakankent')
    .eq('aktiv', true);

  // A kliens slug-okat küld (azok stabilak), mi id-re fordítjuk.
  const extrakLista = (extrak ?? []) as Extra[];
  const valasztott = (k.extrak ?? [])
    .map((slug: string) => extrakLista.find((e: Extra) => e.slug === slug))
    .filter((e): e is Extra => Boolean(e))
    .map((e: Extra) => ({ extra_id: e.id, mennyiseg: 1 }));

  const ajanlat = arajanlat({
    haz: haz as Haz,
    erkezes: k.erkezes,
    tavozas: k.tavozas,
    arazasok: (arazasok ?? []) as Arazas[],
    extrak: extrakLista,
    valasztott_extrak: valasztott,
  });

  const hibak = foglalasHibai({
    haz: haz as Haz,
    erkezes: k.erkezes,
    tavozas: k.tavozas,
    fo: k.fo ?? 1,
    ajanlat,
  });

  // A foglaltságot csak akkor nézzük, ha az adatok egyébként rendben
  // vannak — így egy elgépelt dátum nem terheli feleslegesen az adatbázist.
  let foglalt = false;
  if (hibak.length === 0) {
    try {
      foglalt = !(await szabad(haz.slug, k.erkezes, k.tavozas));
    } catch {
      // A naptár átmeneti hibája ne akadályozza az árak megmutatását.
      foglalt = false;
    }
  }

  return NextResponse.json({
    ejszakak: ajanlat.ejszakak,
    szallasdij: ajanlat.szallasdij,
    extrak_dij: ajanlat.extrak_dij,
    vegosszeg: ajanlat.vegosszeg,
    min_ejszaka: ajanlat.min_ejszaka,
    naponta: ajanlat.naponta,
    hibak,
    foglalt,
    foglalhato: hibak.length === 0 && !foglalt,
  });
}
