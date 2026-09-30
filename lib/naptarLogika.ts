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
 */
export function napAllapot(
  datum: string,
  ma: string,
  foglaltEjszakak: Set<string>
): NapAllapot {
  if (datum < ma) return 'mult';
  const ej = foglaltEjszakak.has(datum);
  const elozoEj = foglaltEjszakak.has(napPlusz(datum, -1));
  if (ej && elozoEj) return 'foglalt';
  if (ej) return 'erkezo';
  if (elozoEj) return 'tavozo';
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
