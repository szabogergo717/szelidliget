/**
 * A naptár színezésének szabályai — tiszta függvényekben, hogy
 * tesztelni lehessen őket.
 *
 * A szerver a FOGLALT ÉJSZAKÁK listáját adja. Egy éjszaka a dátumához
 * tartozik: a '2026-10-10' azt jelenti, hogy 10-én este alszik ott valaki.
 * Egy 10–13-ig tartó foglalás tehát a 10., 11. és 12. éjszakát foglalja —
 * a 13. (a távozás napja) már szabad.
 */

export type NapAllapot = 'mult' | 'szabad' | 'foglalt' | 'erkezo' | 'tavozo';

/** 'YYYY-MM-DD' + n nap. Délben számol, hogy az óraátállítás ne csússzon. */
export function napPlusz(datum: string, n: number): string {
  const [ev, ho, nap] = datum.split('-').map(Number);
  const d = new Date(ev, ho - 1, nap, 12, 0, 0);
  d.setDate(d.getDate() + n);
  return (
    d.getFullYear() +
    '-' +
    String(d.getMonth() + 1).padStart(2, '0') +
    '-' +
    String(d.getDate()).padStart(2, '0')
  );
}

/**
 * Egy nap állapota.
 *
 *   foglalt → az éjszaka és az előző éjszaka is foglalt: egész nap foglalt
 *   erkezo  → csak az aznapi éjszaka foglalt: délelőtt szabad, délután nem
 *   tavozo  → csak az előző éjszaka volt foglalt: délelőtt foglalt, utána szabad
 *   szabad  → egyik éjszaka sem foglalt
 *
 * A FÉLNAPOK CSAK FOGLALÁSNÁL ÉRTELMESEK. Ott azért vannak, mert a
 * vendég délelőtt kijelentkezik, és délután már be lehet költözni —
 * az a nap tehát félig szabad.
 *
 * ZÁRÁSNÁL (ünnep, karbantartás, nyitás előtti időszak) ez nem így van:
 * olyankor senki nem érkezik és nem is távozik, a ház egész nap zárva.
 * Ezért a zárt napokat mindig TELJESEN foglaltnak rajzoljuk, és a
 * zárás utáni első nap teljesen szabad — nem „távozó".
 *
 * A `zartEjszakak` ezért külön halmaz: a szerver megmondja, mely
 * éjszakák zárásból, és nem foglalásból erednek.
 */
export function napAllapot(
  datum: string,
  ma: string,
  foglaltEjszakak: Set<string>,
  zartEjszakak: Set<string> = new Set()
): NapAllapot {
  if (datum < ma) return 'mult';

  // Zárt nap: nincs félnap, nincs mérlegelés.
  if (zartEjszakak.has(datum)) return 'foglalt';

  const elozo = napPlusz(datum, -1);
  const ej = foglaltEjszakak.has(datum);

  // Az előző éjszaka bármitől lehet foglalt — zárástól is. Ha az aznapi
  // éjszaka is foglalt, a nap egésze foglalt, akárhonnan jön.
  const elozoEj = foglaltEjszakak.has(elozo) || zartEjszakak.has(elozo);

  if (ej && elozoEj) return 'foglalt';
  if (ej) return 'erkezo';

  // Csak FOGLALÁS után van távozó félnap. Zárás után a nap teljesen
  // szabad: nincs kit kivárni.
  if (foglaltEjszakak.has(elozo) && !zartEjszakak.has(elozo)) return 'tavozo';

  return 'szabad';
}

/**
 * Érkezni akkor lehet, ha aznap éjszaka szabad a ház.
 * Távozásnapra tehát LEHET érkezni: aki délelőtt elutazik, annak a
 * helyére délután be lehet költözni.
 */
export function erkezhet(
  datum: string,
  ma: string,
  foglaltEjszakak: Set<string>
): boolean {
  return datum >= ma && !foglaltEjszakak.has(datum);
}

/**
 * Távozni akkor lehet, ha az érkezéstől a távozás előtti éjszakáig
 * minden éjszaka szabad. A távozás napjának éjszakája már nem számít —
 * érkezésnapra tehát LEHET távozni.
 */
export function tavozhat(
  erkezesDatum: string,
  datum: string,
  foglaltEjszakak: Set<string>
): boolean {
  if (datum <= erkezesDatum) return false;
  for (let x = erkezesDatum; x < datum; x = napPlusz(x, 1)) {
    if (foglaltEjszakak.has(x)) return false;
  }
  return true;
}
