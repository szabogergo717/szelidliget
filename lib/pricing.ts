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
  /**
   * Hétvégi felár erre az időszakra. Ha null, a ház beállítása érvényes.
   * 0-t megadva kikapcsolható (pl. ünnepi áraknál, ahol a felár már
   * benne van az árban).
   */
  hetvegi_felar?: number | null;
};

export type Haz = {
  id: string;
  slug: string;
  nev: string;
  max_fo: number;
  alap_ar: number;
  min_ejszaka: number;
  /** Péntek és szombat éjszakára járó felár, forintban. 0 = nincs. */
  hetvegi_felar?: number;
};

export type Extra = {
  id: string;
  slug: string;
  ar: number;
  ejszakankent: boolean;
};

export type ExtraValasztas = { extra_id: string; mennyiseg: number };

export type ArTetel = {
  datum: string;
  /** A fizetendő ár erre az éjszakára — a hétvégi felárral együtt. */
  ar: number;
  /** Ebből mennyi a hétvégi felár. 0, ha hétköznapi éjszaka. */
  felar: number;
  megnevezes?: string;
  hetvege: boolean;
};

/**
 * Teljes tartózkodásra szóló fix ár (pl. „3 éj a 2 éj áráért").
 * Más, mint az `Arazas`: az egy éjszaka árát mondja meg, ez a teljes
 * szállásdíjat váltja ki.
 */
export type Akcio = {
  slug: string;
  /** Pontosan ennyi éjszakánál érvényes. */
  ejszakak: number;
  /** A teljes szállásdíj forintban. */
  teljes_ar: number;
  /** Mettől meddig lehet foglalni — az ÉRKEZÉS napja esik ebbe. */
  ervenyes_tol: string;
  ervenyes_ig: string;
  aktiv: boolean;
  /** Ha üres vagy hiányzik, minden házra érvényes. */
  haz_slugok?: string[];
  nev?: string;
};

export type Arajanlat = {
  ejszakak: number;
  naponta: ArTetel[];
  szallasdij: number;
  /** A szállásdíjból mennyi a hétvégi felár — hogy ki lehessen mutatni. */
  hetvegi_felar: number;
  /** Az érvényesült akció, ha volt ilyen. */
  akcio: { slug: string; nev?: string; megtakaritas: number } | null;
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
 * Hétvégi éjszaka-e. Egy éjszaka a KEZDŐ napjához tartozik: a péntekről
 * szombatra virradó éjszaka a péntek, a szombatról vasárnapra virradó
 * a szombat. Felár tehát a péntek és a szombat éjszakára jár.
 *
 * A vasárnapról hétfőre virradó éjszaka már hétköznapi.
 */
export function hetvegiEjszaka(datum: string): boolean {
  const nap = parseDatum(datum).getUTCDay(); // 0 = vasárnap … 6 = szombat
  return nap === 5 || nap === 6;
}

/**
 * Egy adott napra érvényes ár. Több átfedő szabály esetén a nagyobb
 * prioritású nyer — így a "Szilveszter" felülírhatja a "Főszezon"-t
 * anélkül, hogy a főszezont kettévágnánk.
 *
 * A visszaadott `ar` már tartalmazza a hétvégi felárat; a `felar` mezőből
 * látszik, mennyi volt belőle a felár.
 */
export function naptAr(
  datum: string,
  haz: Haz,
  arazasok: Arazas[]
): {
  ar: number;
  alapar: number;
  felar: number;
  hetvege: boolean;
  min_ejszaka: number;
  megnevezes?: string;
} {
  let nyertes: Arazas | null = null;

  for (const a of arazasok) {
    if (datum >= a.kezdet && datum <= a.veg) {
      if (!nyertes || a.prioritas > nyertes.prioritas) nyertes = a;
    }
  }

  const hetvege = hetvegiEjszaka(datum);

  // Az időszak saját felára felülírja a házét. A `null` azt jelenti:
  // "nincs külön szabály", ilyenkor a ház beállítása érvényes.
  const hazFelar = Math.max(0, Math.round(haz.hetvegi_felar ?? 0));
  const idoszakFelar =
    nyertes?.hetvegi_felar === null || nyertes?.hetvegi_felar === undefined
      ? null
      : Math.max(0, Math.round(nyertes.hetvegi_felar));
  const felarMerteke = idoszakFelar ?? hazFelar;
  const felar = hetvege ? felarMerteke : 0;

  const alapar = nyertes ? nyertes.ar : haz.alap_ar;

  return {
    ar: alapar + felar,
    alapar,
    felar,
    hetvege,
    min_ejszaka: nyertes ? (nyertes.min_ejszaka ?? haz.min_ejszaka) : haz.min_ejszaka,
    megnevezes: nyertes
      ? (nyertes as Arazas & { megnevezes?: string }).megnevezes
      : undefined,
  };
}

/**
 * Melyik akció érvényes erre a foglalásra.
 *
 * Feltételek, mind egyszerre:
 *  - az akció aktív,
 *  - az ÉRKEZÉS napja az érvényességi időszakba esik,
 *  - az éjszakák száma pontosan annyi, amennyire az akció szól,
 *  - a ház szerepel az akcióban (vagy az akció minden házra érvényes).
 *
 * Ha több akció illeszkedne, a vendégnek kedvezőbbet választjuk.
 * A lejárt akciók maguktól kiesnek — nem kell törölni őket.
 */
export function ervenyesAkcio(params: {
  akciok: Akcio[];
  hazSlug: string;
  erkezes: string;
  ejszakak: number;
  szallasdij: number;
}): Akcio | null {
  const { akciok, hazSlug, erkezes, ejszakak, szallasdij } = params;

  const illeszkedo = akciok.filter((a) => {
    if (!a.aktiv) return false;
    if (a.ejszakak !== ejszakak) return false;
    if (erkezes < a.ervenyes_tol || erkezes > a.ervenyes_ig) return false;
    if (a.haz_slugok?.length && !a.haz_slugok.includes(hazSlug)) return false;
    // Csak akkor ajánljuk fel, ha tényleg olcsóbb. Egy rosszul beírt
    // akció ne drágítsa meg a foglalást.
    return a.teljes_ar < szallasdij;
  });

  if (!illeszkedo.length) return null;
  return illeszkedo.reduce((a, b) => (b.teljes_ar < a.teljes_ar ? b : a));
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
  /** Teljes tartózkodásra szóló akciók. Üres lista = nincs akció. */
  akciok?: Akcio[];
}): Arajanlat {
  const { haz, erkezes, tavozas, arazasok, extrak, valasztott_extrak } = params;
  const akciok = params.akciok ?? [];

  const napok = tartozkodasNapjai(erkezes, tavozas);
  const ejszakak = napok.length;

  const naponta: ArTetel[] = [];
  let szallasdij = 0;
  let hetvegi_felar = 0;
  // A tartózkodás alatt előforduló legszigorúbb minimum érvényes.
  let min_ejszaka = haz.min_ejszaka;

  for (const nap of napok) {
    const { ar, felar, hetvege, min_ejszaka: mn, megnevezes } = naptAr(nap, haz, arazasok);
    naponta.push({ datum: nap, ar, felar, hetvege, megnevezes });
    szallasdij += ar;
    hetvegi_felar += felar;
    if (mn > min_ejszaka) min_ejszaka = mn;
  }

  /**
   * Akció: ha van rá érvényes ajánlat, a teljes szállásdíjat váltja ki.
   * A naponkénti bontás megmarad — abból látszik, miből jött az eredeti
   * ár —, de a fizetendő a fix összeg lesz.
   */
  const talalt = ervenyesAkcio({
    akciok, hazSlug: haz.slug, erkezes, ejszakak, szallasdij,
  });

  let akcio: Arajanlat['akcio'] = null;
  if (talalt) {
    akcio = {
      slug: talalt.slug,
      nev: talalt.nev,
      megtakaritas: szallasdij - talalt.teljes_ar,
    };
    szallasdij = talalt.teljes_ar;
    // Az akciós ár fix: a hétvégi felár benne van, nem jön rá külön.
    hetvegi_felar = 0;
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
    hetvegi_felar,
    akcio,
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
