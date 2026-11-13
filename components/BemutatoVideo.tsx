'use client';

import { useEffect, useRef, useState } from 'react';
import { T, type Nyelv } from '@/lib/tartalom';

/**
 * Bemutató videó az oldal legtetején, a nyitóképernyő FÖLÖTT.
 *
 * A FELVÉTEL ÁLLÓ (telefonnal készült, 9:16). Ez telefonon ideális:
 * kitölti a képernyőt. Asztali gépen viszont egy álló videó két csúnya
 * fekete sávot hagy maga mellett. Ezért ott a videót középre tesszük,
 * a két oldalára pedig ugyanannak a felvételnek az elmosott,
 * felnagyított poszterképe kerül — így a sáv nem fekete lyuk, hanem a
 * videó folytatásának látszik. (Ezt hívják „elmosott hátterű"
 * megoldásnak; a második videópéldány helyett képet használunk, mert
 * az nem dupla sávszélesség és nem dupla dekódolás.)
 *
 * AUTOMATIKUS INDULÁS
 * A böngészők CSAK hang nélkül engedik az automatikus lejátszást —
 * ez minden böngészőben így van, nem lehet megkerülni. Ezért a videó
 * némán indul, és egy gomb kapcsolja be a hangot, ha a látogató kéri.
 * A `playsInline` nélkül az iPhone átvenné a lejátszást teljes
 * képernyőre, ezért az is kötelező.
 *
 * SÁVSZÉLESSÉG
 * A videó `preload="metadata"`: a böngésző először csak a fejlécét
 * kéri le, a képkockákat akkor, amikor a lejátszás indul. Ha a
 * látogató a rendszerében kikapcsolta a mozgást (akadálymentességi
 * beállítás, sokaknál szédülés miatt), nem indítjuk el magától —
 * ilyenkor a poszterkép látszik és egy indítógomb.
 */

export default function BemutatoVideo({ nyelv }: { nyelv: Nyelv }) {
  const video = useRef<HTMLVideoElement>(null);
  const [hang, setHang] = useState(false);
  const [all, setAll] = useState(false);

  useEffect(() => {
    const v = video.current;
    if (!v) return;

    const mozgasKi = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (mozgasKi) {
      setAll(true);
      return;
    }

    // A `play()` ígéretet ad vissza, ami el is bukhat (pl. energiatakarékos
    // mód). Ilyenkor nem hibát jelzünk, hanem kirakjuk az indítógombot.
    v.play().catch(() => setAll(true));
  }, []);

  function hangValt() {
    const v = video.current;
    if (!v) return;
    v.muted = hang; // ha most van hang, elnémítjuk, és fordítva
    setHang(!hang);
  }

  function inditas() {
    const v = video.current;
    if (!v) return;
    v.play().then(() => setAll(false)).catch(() => undefined);
  }

  return (
    <section className="bemutato" aria-label={T.videoCimke[nyelv]}>
      {/* Az elmosott háttér csak dísz, a képernyőolvasónak nem kell. */}
      <div className="bemutato-hatter" aria-hidden="true" />

      <div className="bemutato-kerek">
        <video
          ref={video}
          className="bemutato-video"
          muted
          loop
          playsInline
          preload="metadata"
          poster="/bemutato-poster.png"
          /* A natív kezelőfelület elvonná a figyelmet; helyette két
             saját gomb van alatta. */
          controls={false}
        >
          <source src="/bemutato.webm" type="video/webm" />
          <source src="/bemutato.mp4" type="video/mp4" />
        </video>

        <div className="bemutato-gombok">
          {all && (
            <button type="button" className="bemutato-gomb" onClick={inditas}>
              {T.videoIndit[nyelv]}
            </button>
          )}
          <button
            type="button"
            className="bemutato-gomb"
            onClick={hangValt}
            aria-pressed={hang}
          >
            {hang ? T.videoHangKi[nyelv] : T.videoHangBe[nyelv]}
          </button>
        </div>
      </div>
    </section>
  );
}
