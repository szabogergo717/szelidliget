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

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  throw new Error(
    'Hiányzik a NEXT_PUBLIC_SUPABASE_URL vagy a NEXT_PUBLIC_SUPABASE_ANON_KEY. ' +
      'Másold le a .env.example fájlt .env.local néven, és töltsd ki.'
  );
}

/** Böngészőben és szerveren is használható, publikus adatokhoz. */
export const supabase = createClient(url, anonKey);

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

  return createClient(url!, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
