import { supabaseAdmin } from './supabase';
import { parseDatum, formatDatum } from './pricing';

/**
 * Foglaltság-ellenőrzés.
 *
 * FONTOS: ez a függvény NEM garantálja, hogy a foglalás létre tud jönni.
 * Két látogató egyszerre is lefuttathatja ugyanarra az időszakra, és
 * mindkettő szabadnak látja. A tényleges védelem az adatbázisban lévő
 * `nincs_tulfoglalas` constraint — ez a függvény csak arra való, hogy
 * a vendég szép hibaüzenetet kapjon a fizetés megkezdése ELŐTT.
 */

export type Idoszak = { kezdet: string; veg: string };

/** Két félig nyílt intervallum átfedése: [a1,a2) és [b1,b2) */
export function atfed(a1: string, a2: string, b1: string, b2: string): boolean {
  return a1 < b2 && b1 < a2;
}

/** A publikus naptárhoz: mely időszakok foglaltak. Vendégadatot nem ad vissza. */
export async function foglaltIdoszakok(
  hazSlug: string,
  tol: string,
  ig: string
): Promise<Idoszak[]> {
  const db = supabaseAdmin();
  const { data, error } = await db.rpc('foglalt_napok', {
    p_haz_slug: hazSlug,
    p_tol: tol,
    p_ig: ig,
  });
  if (error) throw new Error(`Foglaltság lekérdezése sikertelen: ${error.message}`);
  return (data ?? []) as Idoszak[];
}

/** Szabad-e a ház a megadott időszakra. */
export async function szabad(
  hazSlug: string,
  erkezes: string,
  tavozas: string
): Promise<boolean> {
  const foglalt = await foglaltIdoszakok(hazSlug, erkezes, tavozas);
  return !foglalt.some((f) => atfed(erkezes, tavozas, f.kezdet, f.veg));
}

/**
 * Naptárhoz: mely napokon nem lehet BEJELENTKEZNI.
 * Egy foglalás utolsó napja (a távozás napja) szabad, ezért azt
 * kihagyjuk — enélkül a naptár feleslegesen zárna le napokat.
 */
export async function foglaltNapokListaja(
  hazSlug: string,
  tol: string,
  ig: string
): Promise<string[]> {
  const idoszakok = await foglaltIdoszakok(hazSlug, tol, ig);
  const napok = new Set<string>();

  for (const i of idoszakok) {
    const d = parseDatum(i.kezdet);
    const veg = parseDatum(i.veg);
    while (d < veg) {
      napok.add(formatDatum(d));
      d.setUTCDate(d.getUTCDate() + 1);
    }
  }
  return [...napok].sort();
}


/**
 * A ZÁRÁSOKBÓL eredő éjszakák — külön a foglalásoktól.
 *
 * A naptárnak tudnia kell, melyik éjszaka miért nem elérhető. Egy
 * foglalás első és utolsó napja félig szabad (a vendég délelőtt
 * kijelentkezik), egy zárás napja viszont egészen zárva van.
 *
 * Ezt a `foglalt_napok` függvény nem tudja megmondani, mert ő a kettőt
 * összevonva adja vissza — ezért kérdezzük le külön a zárásokat.
 *
 * Hibánál ÜRES listát adunk vissza, nem dobunk kivételt: a naptár
 * ilyenkor a régi, óvatosabb rajzolásra esik vissza, de működik.
 */
export async function zartNapokListaja(
  hazSlug: string,
  tol: string,
  ig: string
): Promise<string[]> {
  const db = supabaseAdmin();

  const { data: haz } = await db
    .from('hazak')
    .select('id')
    .eq('slug', hazSlug)
    .maybeSingle();

  if (!haz) return [];

  // Átfedés a kért ablakkal: a zárás kezdete a vége ELŐTT van, és a
  // vége a kezdet UTÁN. Ugyanaz a félig nyílt logika, mint fent.
  const { data, error } = await db
    .from('blokkolt_idoszakok')
    .select('kezdet, veg')
    .eq('haz_id', haz.id)
    .lt('kezdet', ig)
    .gt('veg', tol);

  if (error) {
    console.error('[naptar] zárások lekérdezése:', error);
    return [];
  }

  const napok = new Set<string>();
  for (const i of (data ?? []) as Idoszak[]) {
    const d = parseDatum(i.kezdet);
    const veg = parseDatum(i.veg);
    while (d < veg) {
      napok.add(formatDatum(d));
      d.setUTCDate(d.getUTCDate() + 1);
    }
  }
  return [...napok].sort();
}
