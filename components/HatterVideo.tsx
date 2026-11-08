'use client';

import { useEffect, useState } from 'react';

/**
 * Háttérvideó a főoldal tetején.
 *
 * MIÉRT KLIENSOLDALI EZ
 * Egy videó akkor is letöltődik, ha a CSS elrejti. Egy mobilnetes
 * vendégnek ez több megabájt, amiből semmit nem lát. Ezért a videót
 * egyáltalán nem tesszük az oldalra kis képernyőn — ott a poszterkép
 * marad, ami töredék akkora.
 *
 * Ugyanígy kimarad a videó annál, aki a rendszerében kikapcsolta a
 * mozgást (ez akadálymentességi beállítás, sokaknál szédülés miatt).
 *
 * A poszterkép a `.hero-media` háttereként mindig ott van, így a videó
 * betöltéséig és helyette is kép látszik — nem üres sötét folt.
 */

/** E fölött a szélesség fölött játsszuk le a videót. */
const KICSI_KEPERNYO = '(max-width: 820px)';
const MOZGAS_KI = '(prefers-reduced-motion: reduce)';

export default function HatterVideo() {
  const [mehet, setMehet] = useState(false);

  useEffect(() => {
    const kicsi = window.matchMedia(KICSI_KEPERNYO);
    const mozgasKi = window.matchMedia(MOZGAS_KI);

    const dontes = () => setMehet(!kicsi.matches && !mozgasKi.matches);
    dontes();

    // Ha a látogató elfordítja a telefont vagy átméretezi az ablakot.
    kicsi.addEventListener('change', dontes);
    mozgasKi.addEventListener('change', dontes);
    return () => {
      kicsi.removeEventListener('change', dontes);
      mozgasKi.removeEventListener('change', dontes);
    };
  }, []);

  if (!mehet) return null;

  return (
    <video
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      poster="/hero-poster.jpg"
    >
      <source src="/hero.webm" type="video/webm" />
      <source src="/hero.mp4" type="video/mp4" />
    </video>
  );
}
