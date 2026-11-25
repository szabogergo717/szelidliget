import type { SupabaseClient } from '@supabase/supabase-js';
import type { Kupon } from './pricing';

/**
 * Kuponkódok — betöltés, beváltás, kiadás.
 *
 * ALAPELVEK
 *
 *  1. **A kódot soha nem a böngésző dönti el.** A kliens csak a beírt
 *     szöveget küldi; hogy létezik-e, érvényes-e és szabad-e, az
 *     kizárólag itt, szerveroldalon derül ki.
 *
 *  2. **A beváltás egyszeri, és egyetlen lépésben történik.** A
 *     „megnézem, szabad-e" és a „most lefoglalom" nem lehet két külön
 *     kérés: a kettő közé beférne egy másik vendég ugyanazzal a kóddal.
 *     Ezért a beváltás egy feltételes UPDATE, ami csak akkor talál
 *     sort, ha a kód még szabad volt.
 *
 *  3. **A kódokat nem lehet listázni.** A táblán RLS van, az anon
 *     kulcs nem fér hozzá. Így nem lehet végigpróbálni őket.
 */

/** Ahány karakterből áll egy blokk a kódban: SZL-XXXX-XXXX. */
const BLOKK = 4;

/*
 * A kódkészletben szándékosan NINCS 0, O, 1 és I, mert telefonban és
 * kézírásban összekeverik őket. Ezért ezeket nem is próbáljuk
 * „kijavítani" beíráskor: ha valaki O-t ír, az elgépelés, nem pedig
 * egy másik karakter — és nem a mi dolgunk kitalálni, melyiket akarta.
 */

/**
 * A beírt kód egységes alakra hozása.
 *
 * A vendég sokféleképpen írja be: kisbetűvel, szóközökkel, kötőjel
 * nélkül, néha az e-mailből másolva, láthatatlan karakterekkel. Mi
 * mindet ugyanarra hozzuk, mielőtt keresnénk.
 */
export function normalizalKod(nyers: string): string {
  const tiszta = (nyers || '')
    .toUpperCase()
    // Minden, ami nem betű vagy szám, kiesik — szóköz, kötőjel, pont,
    // és az e-mailből másolt láthatatlan karakterek is.
    .replace(/[^A-Z0-9]/g, '');

  // Visszatesszük a kötőjeleket: SZL + két négyes blokk.
  if (tiszta.startsWith('SZL') && tiszta.length === 3 + BLOKK * 2) {
    const a = tiszta.slice(3, 3 + BLOKK);
    const b = tiszta.slice(3 + BLOKK);
    return `SZL-${a}-${b}`;
  }
  return tiszta;
}

export type KuponSor = Kupon & {
  id: string;
  aktiv: boolean;
  felhasznalva: string | null;
};

/**
 * Egy SZABAD kupon betöltése kód alapján.
 *
 * `null`, ha nincs ilyen kód, ki van kapcsolva, vagy már beváltották.
 * Szándékosan nem mondjuk meg, melyik eset áll fenn: aki kódokat
 * próbálgat, abból ne tudjon meg semmit.
 */
export async function kuponBetoltese(
  db: SupabaseClient,
  kod: string
): Promise<KuponSor | null> {
  const normalt = normalizalKod(kod);
  if (!normalt) return null;

  const { data, error } = await db
    .from('kuponok')
    .select('id, kod, ejszakak, csomag_ar, kedvezmeny_ft, ervenyes_ig, aktiv, felhasznalva')
    .eq('kod', normalt)
    .is('felhasznalva', null)
    .eq('aktiv', true)
    .maybeSingle();

  if (error) {
    console.error('[kupon] betöltés:', error);
    return null;
  }
  return (data as KuponSor) ?? null;
}

/**
 * A kupon beváltása — ez a döntő lépés.
 *
 * A `is('felhasznalva', null)` feltétel miatt két egyszerre érkező
 * kérés közül csak az egyik talál sort; a másik üres eredményt kap,
 * és hibát jelez a vendégnek. Ez a védelem az ellen, hogy ugyanazt a
 * kódot kétszer lehessen felhasználni.
 *
 * `true`, ha sikerült lefoglalni.
 */
export async function kuponLefoglalasa(
  db: SupabaseClient,
  kod: string
): Promise<boolean> {
  const normalt = normalizalKod(kod);

  const { data, error } = await db
    .from('kuponok')
    .update({ felhasznalva: new Date().toISOString() })
    .eq('kod', normalt)
    .is('felhasznalva', null)
    .eq('aktiv', true)
    .select('id');

  if (error) {
    console.error('[kupon] lefoglalás:', error);
    return false;
  }
  return (data?.length ?? 0) > 0;
}

/**
 * A foglalás hozzákötése a beváltott kuponhoz.
 *
 * Külön lépés, mert a foglalás azonosítója csak a mentés UTÁN
 * születik meg. Ha ez elbukik, a kupon attól még beváltott marad —
 * ez a biztonságos irány.
 */
export async function kuponFoglalashozKotese(
  db: SupabaseClient,
  kod: string,
  foglalasId: string
): Promise<void> {
  const { error } = await db
    .from('kuponok')
    .update({ foglalas_id: foglalasId })
    .eq('kod', normalizalKod(kod));
  if (error) console.error('[kupon] foglaláshoz kötés:', error);
}

/**
 * A lefoglalás visszavonása.
 *
 * Akkor hívjuk, ha a kupon már le volt foglalva, de a foglalás mentése
 * mégis elbukott — például mert közben valaki lefoglalta az időpontot.
 * Enélkül a vendég kódja elveszne egy olyan foglalás miatt, ami létre
 * sem jött.
 */
export async function kuponFelszabaditasa(
  db: SupabaseClient,
  kod: string
): Promise<void> {
  const { error } = await db
    .from('kuponok')
    .update({ felhasznalva: null, foglalas_id: null })
    .eq('kod', normalizalKod(kod))
    .is('foglalas_id', null);
  if (error) console.error('[kupon] felszabadítás:', error);
}

/**
 * Új kuponkód kiadása.
 *
 * A kódot az adatbázis generálja (`kupon_kod_general()`), és a `kod`
 * oszlopon egyedi index van. Ha két kérés véletlenül ugyanazt a kódot
 * kapná, a második beszúrás elbukik — ezért próbálkozunk újra.
 * A készlet 32^8 ≈ 1 billió kód, úgyhogy ez gyakorlatilag sosem fordul elő.
 */
export async function kuponKiadasa(
  db: SupabaseClient,
  adat: {
    ejszakak: number;
    csomag_ar: number;
    ervenyes_ig: string;
    vasarlas_id?: string;
    kiadva_nev?: string;
    kiadva_email?: string;
    megjegyzes?: string;
  }
): Promise<string> {
  for (let proba = 0; proba < 5; proba++) {
    const { data: kodSor, error: kodHiba } = await db.rpc('kupon_kod_general');
    if (kodHiba || !kodSor) {
      throw new Error(`Kódgenerálás sikertelen: ${kodHiba?.message ?? 'üres válasz'}`);
    }
    const kod = String(kodSor);

    const { error } = await db.from('kuponok').insert({
      kod,
      ejszakak: adat.ejszakak,
      csomag_ar: adat.csomag_ar,
      ervenyes_ig: adat.ervenyes_ig,
      vasarlas_id: adat.vasarlas_id ?? null,
      kiadva_nev: adat.kiadva_nev ?? null,
      kiadva_email: adat.kiadva_email ?? null,
      megjegyzes: adat.megjegyzes ?? null,
    });

    if (!error) return kod;
    // '23505' = egyedi ütközés. Minden más hiba valódi hiba.
    if (error.code !== '23505') {
      throw new Error(`Kupon mentése: ${error.message}`);
    }
  }
  throw new Error('Nem sikerült egyedi kuponkódot generálni öt próbálkozásból.');
}
