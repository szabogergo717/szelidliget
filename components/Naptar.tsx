'use client';

import { useEffect, useMemo, useState } from 'react';
import { T, type Nyelv } from '@/lib/tartalom';
import {
  napAllapot, erkezhet as erkezhetE, tavozhat as tavozhatE,
  type NapAllapot,
} from '@/lib/naptarLogika';

/**
 * Vizuális foglaltsági naptár.
 *
 * A szerver csak a FOGLALT ÉJSZAKÁK listáját adja vissza — vendégadatot,
 * árat vagy nevet soha. Egy „éjszaka" a dátumához tartozik: a 10-i éjszaka
 * azt jelenti, hogy 10-én este ott alszik valaki.
 *
 * Ebből következik a napok háromféle állapota:
 *
 *   • az éjszaka foglalt ÉS az előző éjszaka is  → a nap teljesen foglalt
 *   • az éjszaka foglalt, az előző nem           → érkezésnap: délelőtt
 *                                                   még szabad, este már nem
 *   • az éjszaka szabad, az előző foglalt        → távozásnap: délelőtt
 *                                                   még foglalt, délután szabad
 *
 * A két „fél" napra lehet foglalni: aki délelőtt elutazik, annak a helyére
 * délután be lehet költözni. Ezért érkezni és távozni is lehet ilyen napon.
 */

type Props = {
  hazSlug: string;
  erkezes: string;
  tavozas: string;
  nyelv: Nyelv;
  /** Ennyi éjszakánál rövidebbre nem lehet foglalni. */
  minEjszaka: number;
  onValaszt: (erkezes: string, tavozas: string) => void;
};

const NAP_MS = 86400000;

/** Dátum → 'YYYY-MM-DD'. Délben számolunk, hogy az óraátállítás ne csússzon. */
function ymd(d: Date): string {
  return (
    d.getFullYear() +
    '-' +
    String(d.getMonth() + 1).padStart(2, '0') +
    '-' +
    String(d.getDate()).padStart(2, '0')
  );
}

function nap(szoveg: string): Date {
  const [e, h, n] = szoveg.split('-').map(Number);
  return new Date(e, h - 1, n, 12, 0, 0);
}

function maYmd(): string {
  return ymd(new Date());
}

/** Hány éjszaka van két dátum között. */
function ejszakak(a: string, b: string): number {
  return Math.round((nap(b).getTime() - nap(a).getTime()) / NAP_MS);
}

export default function Naptar({
  hazSlug, erkezes, tavozas, nyelv, minEjszaka, onValaszt,
}: Props) {
  // Melyik hónaptól mutatjuk a két hónapot. Mindig hónap elsejére állítva.
  const [elsoHonap, setElsoHonap] = useState<Date>(() => {
    const d = erkezes ? nap(erkezes) : new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1, 12, 0, 0);
  });

  const [foglalt, setFoglalt] = useState<Set<string>>(new Set());
  const [tolt, setTolt] = useState(false);
  const [hiba, setHiba] = useState(false);

  /** Félbehagyott választás: megvan az érkezés, a távozásra várunk. */
  const [fuggoErkezes, setFuggoErkezes] = useState<string | null>(null);
  const [lebego, setLebego] = useState<string | null>(null);

  const ma = maYmd();

  // A látható két hónap, plusz egy hónap ráhagyás mindkét irányba —
  // így lapozáskor általában nem kell újra kérdezni a szervert.
  const tol = useMemo(
    () => ymd(new Date(elsoHonap.getFullYear(), elsoHonap.getMonth() - 1, 1, 12)),
    [elsoHonap]
  );
  const ig = useMemo(
    () => ymd(new Date(elsoHonap.getFullYear(), elsoHonap.getMonth() + 4, 0, 12)),
    [elsoHonap]
  );

  useEffect(() => {
    if (!hazSlug) return;
    let ervenyes = true;
    setTolt(true);
    setHiba(false);

    fetch(`/api/szabad-napok?haz=${encodeURIComponent(hazSlug)}&tol=${tol}&ig=${ig}`)
      .then((v) => (v.ok ? v.json() : Promise.reject(new Error('hiba'))))
      .then((adat: { foglalt_napok?: string[] }) => {
        if (!ervenyes) return;
        setFoglalt(new Set(adat.foglalt_napok ?? []));
      })
      .catch(() => {
        // A naptár kiesése nem állítja meg a foglalást: az árlekérdezés
        // és az adatbázis továbbra is ellenőrzi a szabad időpontot.
        if (ervenyes) setHiba(true);
      })
      .finally(() => {
        if (ervenyes) setTolt(false);
      });

    return () => {
      ervenyes = false;
    };
  }, [hazSlug, tol, ig]);

  const allapot = (d: string): NapAllapot => napAllapot(d, ma, foglalt);
  const erkezhet = (d: string): boolean => erkezhetE(d, ma, foglalt);
  const tavozhat = (kezdet: string, d: string): boolean =>
    tavozhatE(kezdet, d, foglalt);

  function kattint(d: string) {
    // Első kattintás (vagy újrakezdés): ez lesz az érkezés.
    if (!fuggoErkezes) {
      if (!erkezhet(d)) return;
      setFuggoErkezes(d);
      setLebego(null);
      return;
    }
    // Második kattintás: ez a távozás — ha érvényes.
    if (tavozhat(fuggoErkezes, d)) {
      onValaszt(fuggoErkezes, d);
      setFuggoErkezes(null);
      setLebego(null);
      return;
    }
    // Érvénytelen második kattintás: új érkezésnek vesszük.
    if (erkezhet(d)) {
      setFuggoErkezes(d);
      setLebego(null);
    }
  }

  // Mit mutassunk kijelölve: a félbehagyott választást, vagy a kész időszakot.
  const kijeloltKezdet = fuggoErkezes ?? erkezes;
  const kijeloltVeg = fuggoErkezes
    ? (lebego && lebego > fuggoErkezes ? lebego : null)
    : tavozas;

  function kijeloles(d: string): '' | 'kezdet' | 'veg' | 'koztes' {
    if (!kijeloltKezdet) return '';
    if (d === kijeloltKezdet) return 'kezdet';
    if (!kijeloltVeg) return '';
    if (d === kijeloltVeg) return 'veg';
    if (d > kijeloltKezdet && d < kijeloltVeg) return 'koztes';
    return '';
  }

  const honapok = [0, 1].map((eltolas) => {
    const h = new Date(elsoHonap.getFullYear(), elsoHonap.getMonth() + eltolas, 1, 12);
    return h;
  });

  const napNevek =
    nyelv === 'hu'
      ? ['H', 'K', 'Sze', 'Cs', 'P', 'Szo', 'V']
      : ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

  const elozoLehet =
    ymd(elsoHonap) > ymd(new Date(new Date().getFullYear(), new Date().getMonth(), 1, 12));

  const fuggoEjszakak =
    fuggoErkezes && lebego && lebego > fuggoErkezes ? ejszakak(fuggoErkezes, lebego) : 0;

  return (
    <div className="naptar">
      <div className="naptar-fejlec">
        <button
          type="button"
          className="naptar-lep"
          onClick={() =>
            setElsoHonap(
              new Date(elsoHonap.getFullYear(), elsoHonap.getMonth() - 1, 1, 12)
            )
          }
          disabled={!elozoLehet}
          aria-label={T.naptarElozo[nyelv]}
        >
          ‹
        </button>
        <span className="naptar-allapot" aria-live="polite">
          {tolt
            ? T.naptarBetoltes[nyelv]
            : hiba
              ? T.naptarHiba[nyelv]
              : fuggoErkezes
                ? fuggoEjszakak > 0
                  ? `${T.naptarValasszTavozas[nyelv]} · ${fuggoEjszakak} ${T.ejszaka[nyelv]}`
                  : T.naptarValasszTavozas[nyelv]
                : T.naptarValasszErkezes[nyelv]}
        </span>
        <button
          type="button"
          className="naptar-lep"
          onClick={() =>
            setElsoHonap(
              new Date(elsoHonap.getFullYear(), elsoHonap.getMonth() + 1, 1, 12)
            )
          }
          aria-label={T.naptarKovetkezo[nyelv]}
        >
          ›
        </button>
      </div>

      <div className="naptar-honapok">
        {honapok.map((h) => {
          const ev = h.getFullYear();
          const ho = h.getMonth();
          const elsoNapIndex = (new Date(ev, ho, 1).getDay() + 6) % 7; // hétfő = 0
          const napokSzama = new Date(ev, ho + 1, 0).getDate();

          return (
            <div className="naptar-honap" key={`${ev}-${ho}`}>
              <div className="naptar-honapnev">
                {h.toLocaleDateString(nyelv === 'hu' ? 'hu-HU' : 'en-GB', {
                  year: 'numeric',
                  month: 'long',
                })}
              </div>
              <div className="naptar-racs">
                {napNevek.map((n) => (
                  <div className="naptar-napnev" key={n}>{n}</div>
                ))}
                {Array.from({ length: elsoNapIndex }, (_, i) => (
                  <div key={`ures-${i}`} />
                ))}
                {Array.from({ length: napokSzama }, (_, i) => {
                  const d = ymd(new Date(ev, ho, i + 1, 12));
                  const a = allapot(d);
                  const kij = kijeloles(d);
                  const kattinthato =
                    a !== 'mult' &&
                    (fuggoErkezes ? tavozhat(fuggoErkezes, d) || erkezhet(d) : erkezhet(d));

                  return (
                    <button
                      type="button"
                      key={d}
                      className={`naptar-nap ${a}${kij ? ` ${kij}` : ''}`}
                      disabled={!kattinthato}
                      onClick={() => kattint(d)}
                      onMouseEnter={() => fuggoErkezes && setLebego(d)}
                      onFocus={() => fuggoErkezes && setLebego(d)}
                      title={`${d} — ${
                        a === 'foglalt'
                          ? T.naptarFoglalt[nyelv]
                          : a === 'erkezo'
                            ? T.naptarDelutanFoglalt[nyelv]
                            : a === 'tavozo'
                              ? T.naptarDelelottFoglalt[nyelv]
                              : T.naptarSzabad[nyelv]
                      }`}
                    >
                      {i + 1}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="naptar-jelmagyarazat">
        <span><i className="jel szabad" />{T.naptarSzabad[nyelv]}</span>
        <span><i className="jel foglalt" />{T.naptarFoglalt[nyelv]}</span>
        <span><i className="jel felig" />{T.naptarFelnap[nyelv]}</span>
      </div>

      {minEjszaka > 1 && (
        <p className="naptar-sugo">
          {T.naptarMinEjszaka[nyelv].replace('{n}', String(minEjszaka))}
        </p>
      )}
    </div>
  );
}
