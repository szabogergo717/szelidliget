import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { kuponBetoltese, normalizalKod } from '@/lib/kupon';
import { kuponHibaja, ejszakakSzama } from '@/lib/pricing';

/**
 * Kuponkód ellenőrzése — a foglalás LEADÁSA ELŐTT.
 *
 * Ez csak előnézet: megmondja a vendégnek, hogy a beírt kód érvényes-e,
 * és mit ad. NEM foglalja le a kódot — a beváltás a foglalás mentésekor
 * történik, egyetlen lépésben (lásd lib/kupon.ts).
 *
 * Ezért lehet, hogy itt még érvényes, a foglalásnál viszont már nem:
 * ha közben valaki más beváltotta. Ez így helyes — a sorrend számít,
 * nem az, hogy ki nézte meg előbb.
 *
 * MIT NEM ÁRULUNK EL
 * Ha a kód nem létezik, nem mondjuk meg, hogy „nincs ilyen" vagy hogy
 * „már beváltották" — mindkettőre ugyanazt válaszoljuk. Aki kódokat
 * próbálgat, abból ne tudjon meg semmit.
 */

export const dynamic = 'force-dynamic';

type Keres = {
  kod: string;
  /** Opcionális: ha megvan a foglalás kerete, pontosabban válaszolunk. */
  haz_slug?: string;
  erkezes?: string;
  tavozas?: string;
};

export async function POST(req: NextRequest) {
  let k: Keres;
  try {
    k = (await req.json()) as Keres;
  } catch {
    return NextResponse.json({ hiba: 'Hibás kérés.' }, { status: 400 });
  }

  const kod = normalizalKod(k.kod ?? '');
  if (!kod) {
    return NextResponse.json({ ervenyes: false, uzenet: 'Írd be a kuponkódot.' });
  }

  const db = supabaseAdmin();
  const kupon = await kuponBetoltese(db, kod);

  if (!kupon) {
    return NextResponse.json({
      ervenyes: false,
      uzenet: 'Ez a kuponkód nem érvényes, vagy már beváltották.',
    });
  }

  // Dátumok nélkül csak annyit mondunk, hogy a kód él.
  if (!k.erkezes || !k.tavozas) {
    return NextResponse.json({
      ervenyes: true,
      kod: kupon.kod,
      ejszakak: kupon.ejszakak,
      csomag_ar: kupon.csomag_ar,
      kedvezmeny_ft: kupon.kedvezmeny_ft,
      ervenyes_ig: kupon.ervenyes_ig,
      uzenet: leiras(kupon),
    });
  }

  const ejszakak = ejszakakSzama(k.erkezes, k.tavozas);

  /**
   * Az „olcsóbb-e" kérdéshez tudnunk kellene a pontos szállásdíjat.
   * Azt az /api/ar számolja ki; itt beérjük annyival, hogy a lejáratot
   * és az éjszakaszámot ellenőrizzük. A végső szót úgyis a foglalás
   * mentése mondja ki, szerveroldalon.
   */
  const hiba = kuponHibaja({
    kupon,
    erkezes: k.erkezes,
    ejszakak,
    // Nagy szám: a „nem kedvezőbb" ágat itt nem vizsgáljuk.
    alapSzallasdij: Number.MAX_SAFE_INTEGER,
  });

  if (hiba) {
    const uzenetek: Record<string, string> = {
      lejart: 'A kuponkód az érkezés napjára már lejárt.',
      ejszakak: `Ez a kód pontosan ${kupon.ejszakak} éjszakás foglalásra váltható be.`,
      nem_kedvezobb: 'Erre a foglalásra a kód nem ad kedvezményt.',
    };
    return NextResponse.json({
      ervenyes: false,
      uzenet: uzenetek[hiba] ?? 'A kuponkód nem váltható be.',
    });
  }

  return NextResponse.json({
    ervenyes: true,
    kod: kupon.kod,
    ejszakak: kupon.ejszakak,
    csomag_ar: kupon.csomag_ar,
    kedvezmeny_ft: kupon.kedvezmeny_ft,
    ervenyes_ig: kupon.ervenyes_ig,
    uzenet: leiras(kupon),
  });
}

function leiras(k: {
  ejszakak?: number | null;
  csomag_ar?: number | null;
  kedvezmeny_ft?: number | null;
}): string {
  const ft = (n: number) => new Intl.NumberFormat('hu-HU').format(n) + ' Ft';
  if (k.csomag_ar != null) {
    return `Érvényes kód: ${k.ejszakak} éjszaka ${ft(k.csomag_ar)} szállásdíjért. ` +
      'A hétvégi felár és az extrák ezen felül fizetendők.';
  }
  if (k.kedvezmeny_ft != null) {
    return `Érvényes kód: ${ft(k.kedvezmeny_ft)} kedvezmény.`;
  }
  return 'Érvényes kód.';
}
