import adat from './galeriaAdat.json';
import type { Nyelv } from './tartalom';

/**
 * A képek adatai.
 *
 * A `galeriaAdat.json` fájlt az `npm run kepek` parancs írja — kézzel
 * nem kell szerkeszteni. Minden csoportnak van egy kulcsa, ami az
 * `eredeti` mappán belüli mappanév (pl. `fuge`, `kornyek/csonakazas`).
 *
 * Amelyik csoportban nincs kép, az nem kerül bele a leíróba, és a
 * weboldal az adott helyen egyszerűen nem mutat képnézegetőt.
 */

export type KepValtozat = { szelesseg: number; fajl: string };

export type Kep = {
  nev: string;
  leiras: string;
  szelesseg: number;
  magassag: number;
  valtozatok: KepValtozat[];
};

export type Csoport = {
  kulcs: string;
  cim: Record<Nyelv, string>;
  galeriaban: boolean;
  kepek: Kep[];
};

type Leiro = { keszult: string; csoportok: Csoport[] };

const leiro = adat as Leiro;

const MIND: Csoport[] = (leiro.csoportok ?? []).filter((c) => c.kepek?.length > 0);

/** Gyors kereséshez: kulcs → csoport. */
const TERKEP = new Map(MIND.map((c) => [c.kulcs, c]));

/** A „Nézz körül" szakasz fülei. */
export const GALERIA_CSOPORTOK: Csoport[] = MIND.filter((c) => c.galeriaban);

export const VAN_GALERIA = GALERIA_CSOPORTOK.length > 0;

/** Egy csoport képei kulcs szerint. Üres tömb, ha nincs ilyen csoport. */
export function kepek(kulcs: string): Kep[] {
  return TERKEP.get(kulcs)?.kepek ?? [];
}

/** Van-e egyáltalán kép ezen a helyen. */
export function vanKep(kulcs: string): boolean {
  return (TERKEP.get(kulcs)?.kepek.length ?? 0) > 0;
}

/** Egy csoport első képe — ahol csak egy kép fér el. */
export function elsoKep(kulcs: string): Kep | null {
  return TERKEP.get(kulcs)?.kepek[0] ?? null;
}

/**
 * A `srcset` értéke: megmondja a böngészőnek, melyik méret mekkora
 * képernyőn való. A böngésző ebből magától a legkisebb elegendőt tölti le.
 */
export function srcSet(kep: Kep): string {
  return kep.valtozatok.map((v) => `${v.fajl} ${v.szelesseg}w`).join(', ');
}

/** A tartalék forrás a legnagyobb elérhető változat. */
export function legnagyobb(kep: Kep): string {
  return kep.valtozatok[kep.valtozatok.length - 1]?.fajl ?? '';
}

/** A legkisebb változat — bélyegképnek és előnézetnek. */
export function legkisebb(kep: Kep): string {
  return kep.valtozatok[0]?.fajl ?? '';
}
