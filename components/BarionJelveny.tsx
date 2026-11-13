'use client';

import { useState } from 'react';
import type { Nyelv } from '@/lib/tartalom';

/**
 * A Barion kötelező elfogadóhelyi jelvénye („card strip").
 *
 * A Barion elfogadóhelyi szabályzata előírja, hogy a fizetési módot és
 * az elfogadott kártyatípusokat fel kell tüntetni a weboldalon. Erre a
 * Barion saját, kész képét kell használni — a logót NEM szabad
 * újrarajzolni vagy átszínezni, mert védjegy.
 *
 * A kép a Barion hivatalos, SÖTÉT HÁTTÉRRE szánt változata: a Visa
 * felirat és az Apple Pay / Google Pay keret fehér. Világos (krém)
 * háttéren a Visa egyszerűen eltűnne. Ezért a jelvény MINDKÉT helyen
 * sötét alapon ül — a láblécben ez amúgy is a háttér, a foglalóűrlapon
 * pedig egy keskeny sötét sávot teszünk alá. Így a logókhoz nem kell
 * hozzányúlni, ami védjegy miatt egyébként sem volna szabad.
 *
 * A fájl: public/barion-card-strip.png (1133 × 215).
 *
 * Ha a fájl valamiért hiányzik, a komponens nem hagy törött képet:
 * átvált a szöveges változatra, ami ugyanazt az információt közli.
 */

const KEP = '/barion-card-strip.png';
/** A kép valódi aránya — ebből számol a böngésző helyet, és nem ugrik az oldal. */
const SZELES = 1133;
const MAGAS = 215;

const SZOVEG: Record<Nyelv, string> = {
  hu: 'Online fizetés: Barion · Mastercard · Visa · Apple Pay · Google Pay',
  en: 'Online payment: Barion · Mastercard · Visa · Apple Pay · Google Pay',
};

const ALT: Record<Nyelv, string> = {
  hu: 'Barion — elfogadott fizetési módok: Mastercard, Visa, Apple Pay, Google Pay',
  en: 'Barion — accepted payment methods: Mastercard, Visa, Apple Pay, Google Pay',
};

export default function BarionJelveny({
  nyelv,
  helye = 'lablec',
}: {
  nyelv: Nyelv;
  /** `lablec`: halvány háttéren, kisebben. `urlap`: a fizetés gomb mellett. */
  helye?: 'lablec' | 'urlap';
}) {
  const [hiba, setHiba] = useState(false);

  return (
    <div className={`barion barion-${helye}`}>
      {hiba ? (
        <span className="barion-szoveg">{SZOVEG[nyelv]}</span>
      ) : (
        /* Sima <img>: a next/image a hiányzó fájlra build hibát adna, és
           egy pár kilobájtos SVG-nél nincs mit optimalizálni. */
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={KEP}
          alt={ALT[nyelv]}
          width={SZELES}
          height={MAGAS}
          loading="lazy"
          onError={() => setHiba(true)}
        />
      )}
    </div>
  );
}
