import { createClient } from '@supabase/supabase-js';

/**
 * Két külön Supabase kliens, és ez szándékos.
 *
 * A böngészőbe kizárólag az anon kulcs kerülhet. Az RLS szabályok
 * miatt azzal csak a publikus adat (házak, árak, extrák) érhető el —
 * foglalás, vendégadat, fizetés nem.
 *
 * A service_role kulcs MEGKERÜLI az RLS-t. Ezért csak szerveroldalon
 * használható, és a fájl tetején lévő ellenőrzés gondoskodik róla,
 * hogy ha valaki véletlenül kliens-komponensbe importálja, az azonnal
 * kiderüljön — nem csendben, éles üzemben.
 */

/**
 * A Supabase felületén több cím is szerepel, és könnyű a rosszat
 * kimásolni. A kliensnek a projekt ALAP-URL-je kell:
 *
 *   jó:    https://abcdefgh.supabase.co
 *   rossz: https://abcdefgh.supabase.co/rest/v1/
 *
 * Ezért a záró perjelet és a /rest/v1 utótagot itt levágjuk — így egy
 * félremásolt cím nem okoz nehezen érthető hibát üzem közben.
 */
function normalizaltUrl(nyers: string): string {
  return nyers
    .trim()
    .replace(/\/+$/, '')          // záró perjelek
    .replace(/\/rest\/v\d+$/, '') // /rest/v1 vagy /rest/v2
    .replace(/\/+$/, '');
}

/**
 * A kulcsokat NEM a fájl betöltésekor ellenőrizzük, hanem akkor, amikor
 * tényleg kell egy kliens.
 *
 * Miért számít ez: a `next build` minden API-útvonalat betölt, hogy
 * összegyűjtse az adataikat. Ha a betöltés önmagában hibát dob, az
 * egész fordítás elhasal — akkor is, ha a futó rendszerben a kulcsok
 * rendben lennének. Így viszont a build mindig lefut, és a hiányzó
 * kulcs ott derül ki, ahol javítani is lehet: az első kérésnél,
 * beszédes hibaüzenettel.
 */
function alapUrl(): string {
  const nyers = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!nyers) {
    throw new Error(
      'Hiányzik a NEXT_PUBLIC_SUPABASE_URL. ' +
        'Vidd fel a Vercel "Environment Variables" beállításai közé ' +
        '(vagy helyi futtatásnál a .env.local fájlba).'
    );
  }
  return normalizaltUrl(nyers);
}

/**
 * Publikus adatokhoz (házak, árak, extrák). Az anon kulccsal csak azt
 * lehet elérni, amit az RLS szabályok nyilvánosnak jelölnek.
 *
 * Jelenleg a teljes adatlekérés szerveroldalon történik, ezért ezt a
 * függvényt semmi nem hívja — de megmarad, ha később a böngészőből is
 * kérdezni akarunk.
 */
export function supabaseNyilvanos() {
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!anonKey) {
    throw new Error('Hiányzik a NEXT_PUBLIC_SUPABASE_ANON_KEY környezeti változó.');
  }
  return createClient(alapUrl(), anonKey);
}

/**
 * Csak szerveroldalon (route handler, server action, cron).
 * Minden hívásnál új klienst adunk vissza, hogy ne maradjon
 * megosztott állapot a kérések között.
 */
export function supabaseAdmin() {
  if (typeof window !== 'undefined') {
    throw new Error(
      'A supabaseAdmin() csak szerveroldalon hívható. ' +
        'Ha ezt a hibát látod a böngészőben, egy kliens-komponens ' +
        'importálta — ez kiszivárogtatná a service_role kulcsot.'
    );
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    throw new Error('Hiányzik a SUPABASE_SERVICE_ROLE_KEY környezeti változó.');
  }

  return createClient(alapUrl(), serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
