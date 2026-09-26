/**
 * Árszámítás.
 *
 * Alapelvek:
 *  - Minden összeg egész szám, forintban. Soha nem float: abból
 *    kerekítési hiba lesz, és a számlán 1 Ft eltérés is hiba.
 *  - Ez a modul tiszta függvényekből áll (nincs benne hálózat vagy
 *    adatbázis), hogy tesztelni lehessen. Az adatot a hívó adja át.
 *  - Az ÁRAT MINDIG A SZERVER SZÁMOLJA. A böngészőből érkező összeget
 *    soha nem fogadjuk el — csak a dátumot, házat, létszámot és extrákat.
 *    Ez a leggyakoribb sebezhetőség foglalási rendszereknél.
 */

export type Arazas = {
  kezdet: string; // 'YYYY-MM-DD'
  veg: string;
  ar: number;
  min_ejszaka: number | null;
  prioritas: number;
};

export type Haz = {
  id: string;
  slug: string;
  nev: string;
  max_fo: number;
  alap_ar: number;
  min_ejszaka: number;
};

export type Extra = {
  id: string;
  slug: string;
  ar: number;
  ejszakankent: boolean;
};

export type ExtraValasztas = { extra_id: string; mennyiseg: number };

export type ArTetel = { datum: string; ar: number; megnevezes?: string };

export type Arajanlat = {
  ejszakak: number;
  naponta: ArTetel[];
  szallasdij: number;
  extrak_dij: number;
  extra_tetelek: { extra_id: string; slug: string; mennyiseg: number; egysegar: number; osszeg: number }[];
  vegosszeg: number;
  min_ejszaka: number;
};

/** 'YYYY-MM-DD' -> Date, mindig UTC délben, hogy a nyári időszámítás
 *  átállása ne tolja el egy nappal a dátumot. */
export function parseDatum(s: string): Date {
  const [ev, ho, nap] = s.split('-').map(Number);
  if (!ev || !ho || !nap) throw new Error(`Érvénytelen dátum: ${s}`);
  return new Date(Date.UTC(ev, ho - 1, nap, 12, 0, 0));
}

export function formatDatum(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Az érkezés és a távozás közti éjszakák száma. */
export function ejszakakSzama(erkezes: string, tavozas: string): number {
  const be = parseDatum(erkezes).getTime();
  const ki = parseDatum(tavozas).getTime();
  return Math.round((ki - be) / 86_400_000);
}

/**
 * A tartózkodás napjai. A távozás napja NEM tartozik bele — aznap
 * a vendég elutazik, és a ház már kiadható másnak. Ez ugyanaz a
 * logika, mint az adatbázisban a '[)' intervallum.
 */
export function tartozkodasNapjai(erkezes: string, tavozas: string): string[] {
  const n = ejszakakSzama(erkezes, tavozas);
  if (n <= 0) return [];
  const napok: string[] = [];
  const d = parseDatum(erkezes);
  for (let i = 0; i < n; i++) {
    napok.push(formatDatum(d));
    d.setUTCDate(d.getUTCDate() + 1);
  }
  return napok;
}

/**
 * Egy adott napra érvényes ár. Több átfedő szabály esetén a nagyobb
 * prioritású nyer — így a "Szilveszter" felülírhatja a "Főszezon"-t
 * anélkül, hogy a főszezont kettévágnánk.
 */
export function naptAr(
  datum: string,
  haz: Haz,
  arazasok: Arazas[]
): { ar: number; min_ejszaka: number; megnevezes?: string } {
  let nyertes: Arazas | null = null;

  for (const a of arazasok) {
    if (datum >= a.kezdet && datum <= a.veg) {
      if (!nyertes || a.prioritas > nyertes.prioritas) nyertes = a;
    }
  }

  if (!nyertes) {
    return { ar: haz.alap_ar, min_ejszaka: haz.min_ejszaka };
  }
  return {
    ar: nyertes.ar,
    min_ejszaka: nyertes.min_ejszaka ?? haz.min_ejszaka,
    megnevezes: (nyertes as Arazas & { megnevezes?: string }).megnevezes,
  };
}

/**
 * Teljes árajánlat. Ezt hívja a foglalás API és az ár-előnézet is,
 * hogy a vendég pontosan azt az összeget lássa, amit fizetni fog.
 */
export function arajanlat(params: {
  haz: Haz;
  erkezes: string;
  tavozas: string;
  arazasok: Arazas[];
  extrak: Extra[];
  valasztott_extrak: ExtraValasztas[];
}): Arajanlat {
  const { haz, erkezes, tavozas, arazasok, extrak, valasztott_extrak } = params;

  const napok = tartozkodasNapjai(erkezes, tavozas);
  const ejszakak = napok.length;

  const naponta: ArTetel[] = [];
  let szallasdij = 0;
  // A tartózkodás alatt előforduló legszigorúbb minimum érvényes.
  let min_ejszaka = haz.min_ejszaka;

  for (const nap of napok) {
    const { ar, min_ejszaka: mn, megnevezes } = naptAr(nap, haz, arazasok);
    naponta.push({ datum: nap, ar, megnevezes });
    szallasdij += ar;
    if (mn > min_ejszaka) min_ejszaka = mn;
  }

  const extraMap = new Map(extrak.map((e) => [e.id, e]));
  const extra_tetelek: Arajanlat['extra_tetelek'] = [];
  let extrak_dij = 0;

  for (const v of valasztott_extrak) {
    const e = extraMap.get(v.extra_id);
    if (!e) continue; // ismeretlen extrát csendben eldobunk, nem hibázunk
    const mennyiseg = Math.max(1, Math.floor(v.mennyiseg));
    const szorzo = e.ejszakankent ? ejszakak : 1;
    const osszeg = e.ar * mennyiseg * szorzo;
    extra_tetelek.push({
      extra_id: e.id,
      slug: e.slug,
      mennyiseg,
      egysegar: e.ar,
      osszeg,
    });
    extrak_dij += osszeg;
  }

  return {
    ejszakak,
    naponta,
    szallasdij,
    extrak_dij,
    extra_tetelek,
    vegosszeg: szallasdij + extrak_dij,
    min_ejszaka,
  };
}

/** Foglalás előtti ellenőrzések. Hibalistát ad vissza, nem dob kivételt,
 *  hogy a felületen egyszerre lehessen megmutatni az összes problémát. */
export function foglalasHibai(params: {
  haz: Haz;
  erkezes: string;
  tavozas: string;
  fo: number;
  ajanlat: Arajanlat;
  ma?: string;
}): string[] {
  const { haz, erkezes, tavozas, fo, ajanlat } = params;
  const ma = params.ma ?? formatDatum(new Date());
  const hibak: string[] = [];

  if (ajanlat.ejszakak <= 0) {
    hibak.push('A távozás dátuma legyen későbbi, mint az érkezésé.');
  }
  if (erkezes < ma) {
    hibak.push('Az érkezés dátuma nem lehet a múltban.');
  }
  if (ajanlat.ejszakak > 0 && ajanlat.ejszakak < ajanlat.min_ejszaka) {
    hibak.push(
      `A választott időszakban a minimum foglalás ${ajanlat.min_ejszaka} éjszaka.`
    );
  }
  if (fo < 1) {
    hibak.push('Adj meg legalább egy vendéget.');
  }
  if (fo > haz.max_fo) {
    hibak.push(`A(z) ${haz.nev} legfeljebb ${haz.max_fo} főt fogad.`);
  }
  if (ajanlat.ejszakak > 60) {
    hibak.push('60 éjszakánál hosszabb foglalást kérjük e-mailben egyeztetni.');
  }

  return hibak;
}

/** Foglalási azonosító: 'SZL-2026-0147'. A vendég ezt látja és
 *  ezt mondja be telefonon, ezért rövid és felolvasható. */
export function foglalasAzonosito(sorszam: number, ev = new Date().getFullYear()): string {
  return `SZL-${ev}-${String(sorszam).padStart(4, '0')}`;
}
