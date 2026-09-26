import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { arajanlat, foglalasHibai, foglalasAzonosito } from '@/lib/pricing';
import type { Haz, Arazas, Extra } from '@/lib/pricing';
import { szabad } from '@/lib/availability';
import { fizetestIndit } from '@/lib/simplepay';

/**
 * Foglalás létrehozása és fizetés indítása.
 *
 * ⚠ ALAPSZABÁLY: a böngészőtől CSAK azt fogadjuk el, amit nem tud
 *   meghamisítani — dátum, ház, létszám, extrák, vendégadat. Az árat
 *   mindig itt, a szerveren számoljuk újra. Ha a kliens küldött összeget,
 *   azt figyelmen kívül hagyjuk.
 */

export const dynamic = 'force-dynamic';

type Keres = {
  haz_slug: string;
  erkezes: string;
  tavozas: string;
  fo: number;
  extrak?: { extra_id: string; mennyiseg: number }[];
  vendeg: {
    nev: string;
    email: string;
    telefon?: string;
    nyelv?: 'hu' | 'en';
    szla_nev?: string;
    szla_cim?: string;
    szla_adoszam?: string;
  };
  megjegyzes?: string;
};

export async function POST(req: NextRequest) {
  let k: Keres;
  try {
    k = (await req.json()) as Keres;
  } catch {
    return NextResponse.json({ hiba: 'Hibás kérés.' }, { status: 400 });
  }

  // ---------- Bemenet ellenőrzése ----------
  const hianyzo: string[] = [];
  if (!k.haz_slug) hianyzo.push('faház');
  if (!k.erkezes) hianyzo.push('érkezés');
  if (!k.tavozas) hianyzo.push('távozás');
  if (!k.vendeg?.email) hianyzo.push('e-mail cím');
  if (!k.vendeg?.nev) hianyzo.push('név');
  if (hianyzo.length) {
    return NextResponse.json(
      { hiba: `Hiányzó adat: ${hianyzo.join(', ')}.` },
      { status: 400 }
    );
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(k.vendeg.email)) {
    return NextResponse.json({ hiba: 'Az e-mail cím formátuma hibás.' }, { status: 400 });
  }

  const db = supabaseAdmin();

  // ---------- Ház, árak, extrák betöltése ----------
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

  // ---------- Ár újraszámítása szerveroldalon ----------
  const ajanlat = arajanlat({
    haz: haz as Haz,
    erkezes: k.erkezes,
    tavozas: k.tavozas,
    arazasok: (arazasok ?? []) as Arazas[],
    extrak: (extrak ?? []) as Extra[],
    valasztott_extrak: k.extrak ?? [],
  });

  const hibak = foglalasHibai({
    haz: haz as Haz,
    erkezes: k.erkezes,
    tavozas: k.tavozas,
    fo: k.fo,
    ajanlat,
  });
  if (hibak.length) {
    return NextResponse.json({ hiba: hibak[0], hibak }, { status: 400 });
  }

  // ---------- Szabad-e még? ----------
  // Ez csak udvariassági ellenőrzés: a valódi védelem az adatbázis
  // constraintje, amit lejjebb kapunk el.
  if (!(await szabad(haz.slug, k.erkezes, k.tavozas))) {
    return NextResponse.json(
      { hiba: 'A választott időszak időközben elkelt. Próbálj másik dátumot.' },
      { status: 409 }
    );
  }

  // ---------- Vendég ----------
  const { data: vendeg, error: vendegHiba } = await db
    .from('vendegek')
    .insert({
      nev: k.vendeg.nev,
      email: k.vendeg.email.toLowerCase().trim(),
      telefon: k.vendeg.telefon,
      nyelv: k.vendeg.nyelv ?? 'hu',
      szla_nev: k.vendeg.szla_nev,
      szla_cim: k.vendeg.szla_cim,
      szla_adoszam: k.vendeg.szla_adoszam,
    })
    .select('id')
    .single();

  if (vendegHiba || !vendeg) {
    console.error('[foglalas] vendég mentése:', vendegHiba);
    return NextResponse.json({ hiba: 'Nem sikerült menteni az adatokat.' }, { status: 500 });
  }

  // ---------- Foglalás ----------
  const { count } = await db
    .from('foglalasok')
    .select('id', { count: 'exact', head: true });
  const azonosito = foglalasAzonosito((count ?? 0) + 1);

  const { data: foglalas, error: foglalasHiba } = await db
    .from('foglalasok')
    .insert({
      azonosito,
      haz_id: haz.id,
      vendeg_id: vendeg.id,
      erkezes: k.erkezes,
      tavozas: k.tavozas,
      fo: k.fo,
      statusz: 'fuggoben',
      forras: 'sajat',
      szallasdij: ajanlat.szallasdij,
      extrak_dij: ajanlat.extrak_dij,
      vegosszeg: ajanlat.vegosszeg,
      // Teljes összeg fizetendő foglaláskor (így döntöttünk).
      elolegoosszeg: ajanlat.vegosszeg,
      megjegyzes: k.megjegyzes,
    })
    .select('id, azonosito')
    .single();

  if (foglalasHiba || !foglalas) {
    // A '23P01' az exclusion constraint kódja: valaki megelőzött minket
    // a két ellenőrzés között. Ez a rendszer helyes működése, nem hiba.
    if (foglalasHiba?.code === '23P01') {
      await db.from('vendegek').delete().eq('id', vendeg.id);
      return NextResponse.json(
        { hiba: 'A választott időszakot az imént lefoglalták. Válassz másik dátumot.' },
        { status: 409 }
      );
    }
    console.error('[foglalas] mentés:', foglalasHiba);
    return NextResponse.json({ hiba: 'Nem sikerült rögzíteni a foglalást.' }, { status: 500 });
  }

  // ---------- Extrák rögzítése ----------
  if (ajanlat.extra_tetelek.length) {
    await db.from('foglalas_extrak').insert(
      ajanlat.extra_tetelek.map((t) => ({
        foglalas_id: foglalas.id,
        extra_id: t.extra_id,
        mennyiseg: t.mennyiseg,
        egysegar: t.egysegar,
      }))
    );
  }

  // ---------- Fizetés indítása ----------
  const alap = process.env.NEXT_PUBLIC_OLDAL_URL ?? 'https://www.szelidliget.hu';
  try {
    const fizetes = await fizetestIndit({
      orderRef: foglalas.azonosito,
      total: ajanlat.vegosszeg,
      customer: k.vendeg.nev,
      customerEmail: k.vendeg.email,
      nyelv: (k.vendeg.nyelv ?? 'hu').toUpperCase() as 'HU' | 'EN',
      sikeresUrl: `${alap}/foglalas/siker?ref=${foglalas.azonosito}`,
      sikertelenUrl: `${alap}/foglalas/hiba?ref=${foglalas.azonosito}`,
      megszakitottUrl: `${alap}/foglalas/megszakitva?ref=${foglalas.azonosito}`,
      idouSzUrl: `${alap}/foglalas/lejart?ref=${foglalas.azonosito}`,
      ipnUrl: `${alap}/api/simplepay/ipn`,
    });

    return NextResponse.json({
      azonosito: foglalas.azonosito,
      vegosszeg: ajanlat.vegosszeg,
      fizetesi_url: fizetes.paymentUrl,
    });
  } catch (e) {
    console.error('[foglalas] SimplePay indítás:', e);
    // A foglalás létrejött, de fizetni nem tud. Függőben hagyjuk —
    // egy takarító feladat a lejárt függő foglalásokat felszabadítja.
    return NextResponse.json(
      {
        hiba:
          'A foglalás rögzült, de a fizetést nem sikerült elindítani. ' +
          `Kérjük, írj nekünk a(z) ${foglalas.azonosito} azonosítóval.`,
        azonosito: foglalas.azonosito,
      },
      { status: 502 }
    );
  }
}
