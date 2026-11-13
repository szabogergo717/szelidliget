import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { arajanlat, foglalasHibai, foglalasAzonosito } from '@/lib/pricing';
import type { Haz, Arazas, Extra } from '@/lib/pricing';
import { szabad } from '@/lib/availability';
import { fizetestIndit } from '@/lib/barion';
import { utalasiEmail, adminErtesito } from '@/lib/email';
import { ASZF_VERZIO } from '@/lib/jogi';

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
  /** A weboldal ezt küldi: stabil, olvasható azonosítók. */
  extrak_slug?: string[];
  /** Régebbi hívók kedvéért továbbra is elfogadjuk a belső id-ket. */
  extrak?: { extra_id: string; mennyiseg: number }[];
  vendeg: {
    nev: string;
    email: string;
    telefon?: string;
    nyelv?: 'hu' | 'en';
    szla_nev?: string;
    szla_cim?: string;
    szla_irsz?: string;
    szla_varos?: string;
    szla_orszag?: string;
    szla_adoszam?: string;
  };
  megjegyzes?: string;
  /** Külön, önkéntes hozzájárulás marketing levelekhez. */
  hirlevel?: boolean;
  /** Az ÁSZF és az adatkezelési tájékoztató elfogadása — kötelező. */
  aszf_elfogadva?: boolean;
  /** 'kartya' = Barion, 'utalas' = banki átutalás. */
  fizetesi_mod?: 'kartya' | 'utalas';
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
  // A telefonszám 2026.09.27-től kötelező: érkezés napján ezen tudjuk
  // elérni a vendéget, ha bármi közbejön.
  if (!k.vendeg?.telefon || k.vendeg.telefon.replace(/[^0-9]/g, '').length < 7) {
    hianyzo.push('telefonszám');
  }
  // A számlázási cím 2026.09.30-tól kötelező: számlát cím nélkül
  // nem lehet kiállítani.
  if (!k.vendeg?.szla_irsz?.trim()) hianyzo.push('irányítószám');
  if (!k.vendeg?.szla_varos?.trim()) hianyzo.push('város');
  if (!k.vendeg?.szla_cim?.trim()) hianyzo.push('utca, házszám');
  if (hianyzo.length) {
    return NextResponse.json(
      { hiba: `Hiányzó adat: ${hianyzo.join(', ')}.` },
      { status: 400 }
    );
  }
  // Az ÁSZF elfogadása jogszabály szerint a vásárlás előfeltétele.
  // A böngészőben is ellenőrizzük, de az ott megkerülhető — a döntés itt születik.
  if (k.aszf_elfogadva !== true) {
    return NextResponse.json(
      {
        hiba:
          'A foglaláshoz el kell fogadnod az Általános Szerződési Feltételeket ' +
          'és az Adatkezelési tájékoztatót.',
      },
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
    .select('id, slug, nev, max_fo, alap_ar, min_ejszaka, hetvegi_felar')
    .eq('slug', k.haz_slug)
    .eq('aktiv', true)
    .maybeSingle();

  if (!haz) {
    return NextResponse.json({ hiba: 'Ismeretlen faház.' }, { status: 404 });
  }

  const { data: arazasok } = await db
    .from('arazas')
    .select('kezdet, veg, ar, min_ejszaka, prioritas, megnevezes, hetvegi_felar')
    .eq('haz_id', haz.id);

  const { data: extrak } = await db
    .from('extrak')
    .select('id, slug, ar, ejszakankent')
    .eq('aktiv', true);

  // A weboldal slug-okat küld; azokat itt fordítjuk belső azonosítóra.
  // Ismeretlen slug csendben kimarad — nem hibázunk miatta.
  const extrakLista = (extrak ?? []) as Extra[];
  const slugbolValasztott = (k.extrak_slug ?? [])
    .map((slug: string) => extrakLista.find((e: Extra) => e.slug === slug))
    .filter((e): e is Extra => Boolean(e))
    .map((e: Extra) => ({ extra_id: e.id, mennyiseg: 1 }));

  const valasztottExtrak =
    slugbolValasztott.length > 0 ? slugbolValasztott : k.extrak ?? [];

  // ---------- Ár újraszámítása szerveroldalon ----------
  const akciok = await akciokBetoltese(db);

  const ajanlat = arajanlat({
    haz: haz as Haz,
    erkezes: k.erkezes,
    tavozas: k.tavozas,
    arazasok: (arazasok ?? []) as Arazas[],
    extrak: extrakLista,
    valasztott_extrak: valasztottExtrak,
    akciok,
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

  const vendegNyelv = k.vendeg.nyelv === 'en' ? 'en' : 'hu';
  const fizetesiMod = k.fizetesi_mod === 'utalas' ? 'utalas' : 'kartya';

  // ---------- Vendég ----------
  const { data: vendeg, error: vendegHiba } = await db
    .from('vendegek')
    .insert({
      nev: k.vendeg.nev,
      email: k.vendeg.email.toLowerCase().trim(),
      telefon: k.vendeg.telefon,
      nyelv: k.vendeg.nyelv ?? 'hu',
      szla_nev: k.vendeg.szla_nev?.trim() || k.vendeg.nev,
      szla_cim: k.vendeg.szla_cim?.trim(),
      szla_irsz: k.vendeg.szla_irsz?.trim(),
      szla_varos: k.vendeg.szla_varos?.trim(),
      szla_orszag: k.vendeg.szla_orszag?.trim() || 'Magyarország',
      szla_adoszam: k.vendeg.szla_adoszam?.trim() || null,
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
      fizetesi_mod: fizetesiMod,
      // A szerződés bizonyítéka: mikor, melyik szöveget fogadták el.
      aszf_elfogadva: new Date().toISOString(),
      aszf_verzio: ASZF_VERZIO,
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

  // ---------- Hírlevél-feliratkozás ----------
  // Csak akkor, ha a vendég KIFEJEZETTEN bepipálta. A hozzájárulás
  // idejét is eltároljuk, mert vita esetén ez a bizonyíték.
  // Ha a mentés elhasal, a foglalás attól még létrejön — egy hírlevél
  // nem érhet annyit, hogy elbukjon miatta egy fizetés.
  if (k.hirlevel === true) {
    try {
      await db.from('hirlevel_feliratkozok').upsert(
        {
          email: k.vendeg.email.toLowerCase().trim(),
          nev: k.vendeg.nev,
          nyelv: vendegNyelv,
          hozzajarult: true,
          hozzajarulas_ideje: new Date().toISOString(),
          forras: 'foglalas',
          leiratkozott: false,
          leiratkozas_ideje: null,
        },
        { onConflict: 'email' }
      );
    } catch (e) {
      console.error('[foglalas] hírlevél-feliratkozás:', e);
    }
  }

  const alap = process.env.NEXT_PUBLIC_OLDAL_URL ?? 'https://www.szelidliget.hu';

  // ---------- Utalásos foglalás ----------
  // Nincs fizetőoldal: a foglalás „fuggoben” marad, és e-mailben
  // elküldjük az utalási adatokat. A státuszt akkor állítod
  // „kifizetve”-re az admin felületen, amikor a pénz megérkezett.
  if (fizetesiMod === 'utalas') {
    try {
      await utalasiEmail(foglalas.id);
    } catch (e) {
      // Ha az e-mail nem megy ki, a foglalás akkor is él — az admin
      // felületen látod, és kézzel is kiküldheted az adatokat.
      console.error('[foglalas] utalási e-mail:', e);
    }
    try {
      await adminErtesito(foglalas.id, 'uj_foglalas');
    } catch (e) {
      console.error('[foglalas] admin értesítő:', e);
    }

    return NextResponse.json({
      azonosito: foglalas.azonosito,
      vegosszeg: ajanlat.vegosszeg,
      tovabb: `${alap}/foglalas/utalas?ref=${foglalas.azonosito}&lang=${vendegNyelv}`,
    });
  }

  // ---------- Bankkártyás fizetés indítása ----------
  try {
    const fizetes = await fizetestIndit({
      orderRef: foglalas.azonosito,
      total: ajanlat.vegosszeg,
      customer: k.vendeg.nev,
      customerEmail: k.vendeg.email,
      nyelv: vendegNyelv.toUpperCase() as 'HU' | 'EN',
      /**
       * A Barion egyetlen visszatérési címet használ, akármi lett a
       * fizetés sorsa. A tényleges állapotot nem innen tudjuk meg,
       * hanem a visszahívásból — ez az oldal csak megmutatja a
       * vendégnek, hol tart a foglalása.
       */
      visszaUrl: `${alap}/foglalas/siker?ref=${foglalas.azonosito}&lang=${vendegNyelv}`,
      visszahivasUrl: `${alap}/api/barion/visszahivas`,
    });

    // A Barion fizetésazonosítóját eltesszük: ezzel tudjuk később
    // visszakérdezni az állapotot, és ez köti össze a két rendszert.
    try {
      await db.from('fizetesek').insert({
        foglalas_id: foglalas.id,
        osszeg: ajanlat.vegosszeg,
        statusz: 'varakozik',
        szolgaltato: 'barion',
        kulso_tranzakcio_id: fizetes.paymentId,
      });
    } catch (e) {
      // A naplózás hibája nem akadályozhatja meg a fizetést.
      console.error('[foglalas] fizetési kísérlet naplózása:', e);
    }

    return NextResponse.json({
      azonosito: foglalas.azonosito,
      vegosszeg: ajanlat.vegosszeg,
      fizetesi_url: fizetes.fizetesiUrl,
    });
  } catch (e) {
    console.error('[foglalas] Barion indítás:', e);
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

/**
 * Az érvényes akciók betöltése.
 *
 * A lejártakat már az adatbázis kiszűri, de a dátumot az árszámítás is
 * ellenőrzi — így egy elfelejtett sor sem tud régi árat adni.
 */
async function akciokBetoltese(db: ReturnType<typeof supabaseAdmin>) {
  const { data, error } = await db
    .from('akciok')
    .select('slug, ejszakak, teljes_ar, ervenyes_tol, ervenyes_ig, aktiv, ' +
            'akcio_hazak(hazak(slug)), akciok_forditas(nyelv, nev)')
    .eq('aktiv', true)
    .gte('ervenyes_ig', new Date().toISOString().slice(0, 10));

  if (error) {
    // Az akció hiánya nem állíthatja meg a foglalást: rendes áron megy.
    console.error('[akciok] betöltés:', error.message);
    return [];
  }

  type Sor = {
    slug: string; ejszakak: number; teljes_ar: number;
    ervenyes_tol: string; ervenyes_ig: string; aktiv: boolean;
    akcio_hazak: { hazak: { slug: string } | null }[] | null;
    akciok_forditas: { nyelv: string; nev: string }[] | null;
  };

  return ((data ?? []) as unknown as Sor[]).map((a) => ({
    slug: a.slug,
    ejszakak: a.ejszakak,
    teljes_ar: a.teljes_ar,
    ervenyes_tol: a.ervenyes_tol,
    ervenyes_ig: a.ervenyes_ig,
    aktiv: a.aktiv,
    haz_slugok: (a.akcio_hazak ?? [])
      .map((x) => x.hazak?.slug)
      .filter((x): x is string => Boolean(x)),
    nev: a.akciok_forditas?.find((f) => f.nyelv === 'hu')?.nev,
  }));
}
