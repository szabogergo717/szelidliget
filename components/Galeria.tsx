'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { T, type Nyelv } from '@/lib/tartalom';
import {
  GALERIA_CSOPORTOK as CSOPORTOK, srcSet, legnagyobb, legkisebb,
  type Kep, type Csoport,
} from '@/lib/galeria';

/**
 * Képgaléria.
 *
 * Rácsban mutatja a fotókat; egy képre kattintva teljes képernyős
 * nézet nyílik, ahol jobbra-balra lehet lapozni — nyílgombbal, a
 * billentyűzet nyilaival, és telefonon ujjal húzva is.
 *
 * A képek lustán töltődnek (`loading="lazy"`): a böngésző csak azt
 * tölti le, ami tényleg a képernyőre kerül. A megadott szélesség és
 * magasság miatt az oldal nem ugrál betöltés közben.
 */

export default function Galeria({ nyelv }: { nyelv: Nyelv }) {
  const [aktivCsoport, setAktivCsoport] = useState(0);
  const [nagyitott, setNagyitott] = useState<number | null>(null);

  const csoport = CSOPORTOK[aktivCsoport];
  const kepek = csoport?.kepek ?? [];

  const bezar = useCallback(() => setNagyitott(null), []);

  const lep = useCallback(
    (irany: 1 | -1) => {
      setNagyitott((mostani) => {
        if (mostani === null) return null;
        // Körbeér: az utolsó után újra az első jön.
        return (mostani + irany + kepek.length) % kepek.length;
      });
    },
    [kepek.length]
  );

  // Billentyűzet: nyilak a lapozáshoz, Esc a bezáráshoz.
  useEffect(() => {
    if (nagyitott === null) return;
    function billentyu(e: KeyboardEvent) {
      if (e.key === 'Escape') bezar();
      else if (e.key === 'ArrowRight') lep(1);
      else if (e.key === 'ArrowLeft') lep(-1);
    }
    window.addEventListener('keydown', billentyu);
    return () => window.removeEventListener('keydown', billentyu);
  }, [nagyitott, bezar, lep]);

  // Amíg a nagyítás nyitva van, a háttér ne görögjön.
  useEffect(() => {
    if (nagyitott === null) return;
    const eredeti = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = eredeti;
    };
  }, [nagyitott]);

  // Ujjal húzás telefonon.
  const erintesX = useRef<number | null>(null);
  function erintesKezdet(e: React.TouchEvent) {
    erintesX.current = e.touches[0]?.clientX ?? null;
  }
  function erintesVeg(e: React.TouchEvent) {
    if (erintesX.current === null) return;
    const vege = e.changedTouches[0]?.clientX ?? erintesX.current;
    const tav = vege - erintesX.current;
    erintesX.current = null;
    // 45 képpontnál rövidebb mozdulat véletlen érintés is lehet.
    if (Math.abs(tav) < 45) return;
    lep(tav < 0 ? 1 : -1);
  }

  if (!csoport) return null;

  const aktivKep: Kep | null = nagyitott === null ? null : kepek[nagyitott] ?? null;

  return (
    <>
      {CSOPORTOK.length > 1 && (
        <div className="galeria-fulek" role="tablist">
          {CSOPORTOK.map((c: Csoport, i: number) => (
            <button
              key={c.kulcs}
              type="button"
              role="tab"
              aria-selected={i === aktivCsoport}
              className={`galeria-ful${i === aktivCsoport ? ' aktiv' : ''}`}
              onClick={() => {
                setAktivCsoport(i);
                setNagyitott(null);
              }}
            >
              {c.cim[nyelv]}
            </button>
          ))}
        </div>
      )}

      <div className="galeria-racs">
        {kepek.map((kep: Kep, i: number) => (
          <button
            key={kep.nev}
            type="button"
            className="galeria-kocka"
            onClick={() => setNagyitott(i)}
            aria-label={`${T.galeriaNagyitas[nyelv]}: ${kep.leiras || kep.nev}`}
          >
            <img
              src={legkisebb(kep) || legnagyobb(kep)}
              srcSet={srcSet(kep)}
              sizes="(max-width: 600px) 46vw, (max-width: 1000px) 30vw, 300px"
              alt={kep.leiras || ''}
              width={kep.szelesseg}
              height={kep.magassag}
              loading="lazy"
              decoding="async"
            />
          </button>
        ))}
      </div>

      {aktivKep && (
        <div
          className="nagyito"
          role="dialog"
          aria-modal="true"
          aria-label={T.galeriaNagyitas[nyelv]}
          onClick={bezar}
          onTouchStart={erintesKezdet}
          onTouchEnd={erintesVeg}
        >
          <button
            type="button"
            className="nagyito-bezar"
            onClick={bezar}
            aria-label={T.galeriaBezar[nyelv]}
          >
            ×
          </button>

          {kepek.length > 1 && (
            <button
              type="button"
              className="nagyito-lep bal"
              onClick={(e) => {
                e.stopPropagation();
                lep(-1);
              }}
              aria-label={T.galeriaElozo[nyelv]}
            >
              ‹
            </button>
          )}

          {/* A képre kattintás ne zárja be — csak a körülötte lévő felület. */}
          <figure className="nagyito-kep" onClick={(e) => e.stopPropagation()}>
            <img
              src={legnagyobb(aktivKep)}
              srcSet={srcSet(aktivKep)}
              sizes="100vw"
              alt={aktivKep.leiras || ''}
              width={aktivKep.szelesseg}
              height={aktivKep.magassag}
            />
            <figcaption>
              {aktivKep.leiras && <span>{aktivKep.leiras}</span>}
              <span className="nagyito-szamlalo">
                {(nagyitott ?? 0) + 1} / {kepek.length}
              </span>
            </figcaption>
          </figure>

          {kepek.length > 1 && (
            <button
              type="button"
              className="nagyito-lep jobb"
              onClick={(e) => {
                e.stopPropagation();
                lep(1);
              }}
              aria-label={T.galeriaKovetkezo[nyelv]}
            >
              ›
            </button>
          )}
        </div>
      )}
    </>
  );
}
