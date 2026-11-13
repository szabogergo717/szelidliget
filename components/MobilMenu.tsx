'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { T, CEG, type Nyelv } from '@/lib/tartalom';

/**
 * Mobil menü — a telefonon ez az EGYETLEN módja a navigációnak.
 *
 * A vízszintes menüsor 900 pixel alatt nem fér ki, ezért ott eltűnik.
 * Addig nem volt helyette semmi: a telefonos látogató nem tudott
 * eljutni a foglalásig, csak ha végigtekerte az egész oldalt.
 *
 * Miért kliens komponens: a nyitás-zárás állapotot a böngészőben kell
 * tartani. A fiók (`<nav>`) tartalma viszont a HTML-ben is benne van,
 * így a Google is látja a linkeket — csak CSS rejti el, amíg zárva van.
 *
 * Billentyűzet és képernyőolvasó: a gomb `aria-expanded`-et visel, az
 * Escape zár, és nyitott menü mellett a lap háttere nem tekerhető.
 *
 * MIÉRT PORTÁL
 * A fejléc `backdrop-filter`-t használ. Egy ilyen elem a böngészőben
 * „befogó blokká" válik: a benne lévő `position: fixed` elemek NEM a
 * képernyőhöz, hanem a fejléchez igazodnak — a fiók beszorult volna a
 * fejléc magasságába. Ezért a fiókot és a fátylat a `<body>` végére
 * tesszük át, a gomb viszont a fejlécben marad.
 */

type Elem = { horgony: string; cimke: string };

export default function MobilMenu({
  nyelv,
  vanGaleria,
}: {
  nyelv: Nyelv;
  vanGaleria: boolean;
}) {
  const [nyitva, setNyitva] = useState(false);
  // A portál csak a böngészőben létezik; szerveroldali rendereléskor
  // nincs `document`. Ezért a kirakást az első kirajzolás után kapcsoljuk be.
  const [beallt, setBeallt] = useState(false);
  useEffect(() => setBeallt(true), []);

  // Escape zárja. A figyelőt csak nyitott állapotban tesszük fel.
  useEffect(() => {
    if (!nyitva) return;

    function billentyu(e: KeyboardEvent) {
      if (e.key === 'Escape') setNyitva(false);
    }
    document.addEventListener('keydown', billentyu);

    // Amíg a fiók nyitva, a lap alatta ne tekeredjen.
    const elozo = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', billentyu);
      document.body.style.overflow = elozo;
    };
  }, [nyitva]);

  const elemek: Elem[] = [
    { horgony: '#hazak', cimke: T.menuHazak[nyelv] },
    ...(vanGaleria ? [{ horgony: '#kepek', cimke: T.menuKepek[nyelv] }] : []),
    { horgony: '#szolgaltatasok', cimke: T.menuSzolgaltatasok[nyelv] },
    { horgony: '#foglalas', cimke: T.menuFoglalas[nyelv] },
    { horgony: '#kornyek', cimke: T.menuKornyek[nyelv] },
    { horgony: '#rolunk', cimke: T.menuRolunk[nyelv] },
    { horgony: '#kapcsolat', cimke: T.menuKapcsolat[nyelv] },
  ];

  return (
    <>
      <button
        type="button"
        className={`menu-gomb${nyitva ? ' nyitva' : ''}`}
        aria-expanded={nyitva}
        aria-controls="mobil-menu"
        aria-label={nyitva ? T.menuBezar[nyelv] : T.menuNyit[nyelv]}
        onClick={() => setNyitva((v) => !v)}
      >
        {/* Három vonal; nyitott állapotban X-szé fordul. */}
        <span aria-hidden="true" />
        <span aria-hidden="true" />
        <span aria-hidden="true" />
      </button>

      {beallt && createPortal(
        <>
      {/* A háttér elnyeli a kattintást, így a menü mellé koppintva zár. */}
      <div
        className={`menu-fatyol${nyitva ? ' nyitva' : ''}`}
        onClick={() => setNyitva(false)}
        aria-hidden="true"
      />

      <nav
        id="mobil-menu"
        className={`mobil-menu${nyitva ? ' nyitva' : ''}`}
        aria-label={T.menuCimke[nyelv]}
      >
        {/* Záró X a fiókon BELÜL. A fejlécbeli hamburger gomb a fiók alá
            kerül (a fejléc saját rétegbe zárja), ezért kell ide is egy. */}
        <button
          type="button"
          className="menu-zar"
          onClick={() => setNyitva(false)}
          aria-label={T.menuBezar[nyelv]}
        >
          <span aria-hidden="true" />
          <span aria-hidden="true" />
        </button>

        <ul>
          {elemek.map((e) => (
            <li key={e.horgony}>
              {/* A horgonyra kattintva zárjuk is a fiókot. */}
              <Link href={e.horgony} onClick={() => setNyitva(false)}>
                {e.cimke}
              </Link>
            </li>
          ))}
        </ul>

        <Link href="#foglalas" className="btn" onClick={() => setNyitva(false)}>
          {T.gombFoglalas[nyelv]}
        </Link>

        {/* Telefonon a hívás a legrövidebb út hozzánk — legyen kézre eső. */}
        <a className="menu-telefon" href={`tel:${CEG.telefonHivas}`}>
          {CEG.telefon}
        </a>

        <div className="menu-nyelv">
          <Link href="/" className={nyelv === 'hu' ? 'active' : ''} hrefLang="hu">
            Magyar
          </Link>
          <Link href="/en" className={nyelv === 'en' ? 'active' : ''} hrefLang="en">
            English
          </Link>
        </div>
      </nav>
        </>,
        document.body
      )}
    </>
  );
}
