'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { T, type Nyelv } from '@/lib/tartalom';
import { kepek as csoportKepei, srcSet, legnagyobb, type Kep } from '@/lib/galeria';

/**
 * Képnézegető — ugyanaz a komponens a nyitóképernyőn, a házaknál,
 * a szolgáltatásoknál és a környék programjainál.
 *
 * Amit tud:
 *  - magától lépked (alapból 5 másodpercenként), és megáll, ha az
 *    egérmutató rajta van vagy a látogató épp lapozott;
 *  - nyilakkal, pöttyökkel, billentyűzettel és ujjal húzva is lapozható;
 *  - csak akkor tölti le a következő képet, amikor szükség van rá.
 *
 * Ha a csoportban nincs kép, a komponens semmit nem jelenít meg —
 * az oldal ugyanúgy működik fotók nélkül is.
 */

type Props = {
  /** A kép-csoport kulcsa, pl. 'fuge' vagy 'kornyek/csonakazas'. */
  kulcs: string;
  nyelv: Nyelv;
  /** Hány másodpercenként lépjen magától. 0 = nem lép magától. */
  masodperc?: number;
  /** A képterület alakja, pl. '16 / 9'. A 'teljes' a szülő magasságát tölti ki. */
  alak?: string | 'teljes';
  /** Nyilak megjelenítése. */
  nyilak?: boolean;
  /** Pöttyök megjelenítése alul. */
  pottyok?: boolean;
  /** `sizes` a böngészőnek: mekkora helyet foglal a kép a képernyőn. */
  meretek?: string;
  /** A legelső kép azonnal töltődjön (csak a nyitóképernyőn érdemes). */
  elsobbseg?: boolean;
  /** Extra osztály a külső dobozra. */
  osztaly?: string;
};

export default function Diavetites({
  kulcs,
  nyelv,
  masodperc = 5,
  alak = '4 / 3',
  nyilak = true,
  pottyok = true,
  meretek = '100vw',
  elsobbseg = false,
  osztaly = '',
}: Props) {
  const lista: Kep[] = csoportKepei(kulcs);
  const db = lista.length;

  const [mutatott, setMutatott] = useState(0);
  const [all, setAll] = useState(false);

  const lep = useCallback(
    (irany: 1 | -1) => {
      setMutatott((m) => (m + irany + db) % db);
    },
    [db]
  );

  // Magától lépked. A `mutatott` a függőségek közt van, ezért minden
  // lapozás újraindítja az időzítőt — nem ugrik rögtön a kézi lapozás után.
  useEffect(() => {
    if (db < 2 || masodperc <= 0 || all) return;
    const id = setTimeout(() => lep(1), masodperc * 1000);
    return () => clearTimeout(id);
  }, [db, masodperc, all, mutatott, lep]);

  // Aki a rendszerében kikapcsolta a mozgást, annál nem váltogatunk magától.
  const [mozgasKi, setMozgasKi] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const frissit = () => setMozgasKi(mq.matches);
    frissit();
    mq.addEventListener('change', frissit);
    return () => mq.removeEventListener('change', frissit);
  }, []);
  useEffect(() => {
    if (mozgasKi) setAll(true);
  }, [mozgasKi]);

  // Ujjal húzás.
  const erintesX = useRef<number | null>(null);
  function erintesKezdet(e: React.TouchEvent) {
    erintesX.current = e.touches[0]?.clientX ?? null;
  }
  function erintesVeg(e: React.TouchEvent) {
    if (erintesX.current === null) return;
    const vege = e.changedTouches[0]?.clientX ?? erintesX.current;
    const tav = vege - erintesX.current;
    erintesX.current = null;
    if (Math.abs(tav) < 45) return; // rövid mozdulat: véletlen érintés
    lep(tav < 0 ? 1 : -1);
  }

  if (db === 0) return null;

  const teljes = alak === 'teljes';

  return (
    <div
      className={`dia${teljes ? ' dia-teljes' : ''}${osztaly ? ' ' + osztaly : ''}`}
      style={teljes ? undefined : { aspectRatio: alak }}
      onMouseEnter={() => setAll(true)}
      onMouseLeave={() => !mozgasKi && setAll(false)}
      onTouchStart={erintesKezdet}
      onTouchEnd={erintesVeg}
      role="group"
      aria-roledescription="carousel"
      aria-label={T.diaCimke[nyelv]}
    >
      {lista.map((kep, i) => (
        <img
          key={kep.nev}
          className={`dia-kep${i === mutatott ? ' latszik' : ''}`}
          src={legnagyobb(kep)}
          srcSet={srcSet(kep)}
          sizes={meretek}
          alt={kep.leiras || ''}
          width={kep.szelesseg}
          height={kep.magassag}
          /* Az első kép azonnal kell; a többi csak akkor, ha sorra kerül. */
          loading={i === 0 && elsobbseg ? 'eager' : 'lazy'}
          fetchPriority={i === 0 && elsobbseg ? 'high' : 'auto'}
          decoding="async"
          aria-hidden={i !== mutatott}
        />
      ))}

      {nyilak && db > 1 && (
        <>
          <button
            type="button"
            className="dia-nyil bal"
            onClick={() => lep(-1)}
            aria-label={T.galeriaElozo[nyelv]}
          >
            ‹
          </button>
          <button
            type="button"
            className="dia-nyil jobb"
            onClick={() => lep(1)}
            aria-label={T.galeriaKovetkezo[nyelv]}
          >
            ›
          </button>
        </>
      )}

      {pottyok && db > 1 && (
        <div className="dia-pottyok">
          {lista.map((kep, i) => (
            <button
              key={kep.nev}
              type="button"
              className={`dia-potty${i === mutatott ? ' aktiv' : ''}`}
              onClick={() => setMutatott(i)}
              aria-label={`${i + 1}. ${T.diaKep[nyelv]}`}
              aria-current={i === mutatott}
            />
          ))}
        </div>
      )}
    </div>
  );
}
