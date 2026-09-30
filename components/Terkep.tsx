'use client';

import { useState } from 'react';
import { T, CEG, type Nyelv } from '@/lib/tartalom';

/**
 * Google Maps beágyazás — kattintásra.
 *
 * MIÉRT NEM TÖLTŐDIK BE MAGÁTÓL? Mert a Google Maps sütiket helyez el,
 * és a látogató adata kikerül a Google-höz. Ehhez a GDPR előzetes
 * hozzájárulást kíván. Ha a térkép magától töltődne, az egész oldalra
 * kellene egy süti-elfogadó ablak — az pedig rontja az első benyomást.
 *
 * Így viszont csak az tölti be, aki tényleg meg akarja nézni, és a
 * kattintás maga a hozzájárulás. Ez bevett, elfogadott megoldás.
 *
 * Aki nem akar térképet: az „Útvonalterv" gomb a saját
 * térképalkalmazását nyitja meg, beágyazás nélkül.
 */
export default function Terkep({ nyelv }: { nyelv: Nyelv }) {
  const [betolt, setBetolt] = useState(false);

  const query = encodeURIComponent(CEG.terkepQuery);
  const beagyazUrl = `https://maps.google.com/maps?q=${query}&hl=${nyelv}&z=14&output=embed`;
  const utvonalUrl = `https://www.google.com/maps/dir/?api=1&destination=${query}`;

  return (
    <div className="terkep">
      {betolt ? (
        <iframe
          src={beagyazUrl}
          title={CEG.cim}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      ) : (
        <button type="button" className="terkep-elozetes" onClick={() => setBetolt(true)}>
          <svg viewBox="0 0 48 48" aria-hidden="true" className="terkep-ikon">
            <path d="M24 5c-6.6 0-12 5.4-12 12 0 9 12 26 12 26s12-17 12-26c0-6.6-5.4-12-12-12z" />
            <circle cx="24" cy="17" r="4.5" />
          </svg>
          <strong>{T.terkepMutat[nyelv]}</strong>
          <span>{T.terkepSuti[nyelv]}</span>
        </button>
      )}

      <div className="terkep-also">
        <span className="terkep-cim">{CEG.cim}</span>
        <a
          className="btn small ghost"
          href={utvonalUrl}
          target="_blank"
          rel="noreferrer"
        >
          {T.utvonalterv[nyelv]}
        </a>
      </div>
    </div>
  );
}
