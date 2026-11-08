'use client';

import { useState } from 'react';
import { kepek as csoportKepei, srcSet, legkisebb, legnagyobb } from '@/lib/galeria';
import { T, type Nyelv } from '@/lib/tartalom';

/**
 * Egy extra szolgáltatás képe a jelölőnégyzet és a leírás mellett.
 *
 * A kép az `eredeti/extrak/<slug>/` mappából jön — ugyanaz a slug,
 * ami az adatbázisban van (pl. `gourmet_reggeli`). Ha a mappa nincs
 * meg vagy üres, a komponens semmit nem jelenít meg, és a sor
 * ugyanúgy néz ki, mint eddig.
 *
 * Ha több kép is van a mappában, az elsőt mutatjuk kicsiben, és
 * kattintásra teljes méretben megnyílik — a sor magassága nem nő meg
 * attól, hogy sok fotó van hozzá.
 */
export default function ExtraKep({
  slug, nev, nyelv,
}: {
  slug: string; nev: string; nyelv: Nyelv;
}) {
  const lista = csoportKepei(`extrak/${slug}`);
  const [nagyitott, setNagyitott] = useState<number | null>(null);

  if (!lista.length) return null;
  const elso = lista[0];

  function nyit(e: React.MouseEvent) {
    // A kép a <label> belsejében van: kattintásra ne a jelölőnégyzet
    // kapcsoljon, hanem a nagyított nézet nyíljon meg.
    e.preventDefault();
    e.stopPropagation();
    setNagyitott(0);
  }

  const aktiv = nagyitott === null ? null : lista[nagyitott];

  return (
    <>
      <button type="button" className="extra-kep" onClick={nyit} aria-label={`${nev} — ${T.galeriaNagyitas[nyelv]}`}>
        <img
          src={legkisebb(elso)}
          srcSet={srcSet(elso)}
          sizes="96px"
          alt={elso.leiras || nev}
          width={elso.szelesseg}
          height={elso.magassag}
          loading="lazy"
          decoding="async"
        />
        {lista.length > 1 && <span className="extra-kep-db">{lista.length}</span>}
      </button>

      {aktiv && (
        <div
          className="nagyito"
          role="dialog"
          aria-modal="true"
          aria-label={nev}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setNagyitott(null);
          }}
        >
          <button
            type="button"
            className="nagyito-bezar"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setNagyitott(null);
            }}
            aria-label={T.galeriaBezar[nyelv]}
          >
            ×
          </button>

          {lista.length > 1 && (
            <button
              type="button"
              className="nagyito-lep bal"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setNagyitott((m) => ((m ?? 0) - 1 + lista.length) % lista.length);
              }}
              aria-label={T.galeriaElozo[nyelv]}
            >
              ‹
            </button>
          )}

          <figure
            className="nagyito-kep"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <img
              src={legnagyobb(aktiv)}
              srcSet={srcSet(aktiv)}
              sizes="100vw"
              alt={aktiv.leiras || nev}
              width={aktiv.szelesseg}
              height={aktiv.magassag}
            />
            <figcaption>
              <span>{nev}</span>
              {lista.length > 1 && (
                <span className="nagyito-szamlalo">
                  {(nagyitott ?? 0) + 1} / {lista.length}
                </span>
              )}
            </figcaption>
          </figure>

          {lista.length > 1 && (
            <button
              type="button"
              className="nagyito-lep jobb"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setNagyitott((m) => ((m ?? 0) + 1) % lista.length);
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
