'use client';

import { useState, useTransition } from 'react';
import { idoszakotZar, zaratTorol } from '@/app/admin/muveletek';

/**
 * Időszak lezárása: karbantartás, saját használat, vagy bármi, ami miatt
 * a ház nem adható ki. A lezárt napok a weboldal naptárában is foglaltnak
 * látszanak.
 */

export default function Zaras({
  hazak, blokkok,
}: {
  hazak: { slug: string; nev: string }[];
  blokkok: { id: string; kezdet: string; veg: string; indok: string | null; haz: string }[];
}) {
  const [nyitva, setNyitva] = useState(false);
  const [haz, setHaz] = useState(hazak[0]?.slug ?? '');
  const [kezdet, setKezdet] = useState('');
  const [veg, setVeg] = useState('');
  const [indok, setIndok] = useState('');
  const [hiba, setHiba] = useState<string | null>(null);
  const [fut, indit] = useTransition();

  function zar() {
    setHiba(null);
    indit(async () => {
      try {
        await idoszakotZar(haz, kezdet, veg, indok);
        setKezdet(''); setVeg(''); setIndok(''); setNyitva(false);
      } catch (e) {
        setHiba(e instanceof Error ? e.message : 'Nem sikerült lezárni.');
      }
    });
  }

  function torol(id: string) {
    if (!window.confirm('Biztosan feloldod ezt a zárást? A napok újra foglalhatók lesznek.')) return;
    indit(async () => {
      try { await zaratTorol(id); } catch { /* a lista frissül, a hiba látszani fog */ }
    });
  }

  return (
    <div className="doboz" style={{ marginTop: 26 }}>
      <h2>Lezárt időszakok</h2>

      {blokkok.length === 0 ? (
        <p className="halvany">Ebben a hónapban nincs lezárt időszak.</p>
      ) : (
        blokkok.map((b) => (
          <div className="par" key={b.id}>
            <span className="k">{b.haz}</span>
            <span className="v" style={{ flex: 1 }}>
              {b.kezdet} – {b.veg}
              {b.indok ? ` · ${b.indok}` : ''}
            </span>
            <button
              type="button" className="gomb" onClick={() => torol(b.id)}
              disabled={fut} style={{ padding: '4px 10px', fontSize: 13 }}
            >
              Feloldás
            </button>
          </div>
        ))
      )}

      {!nyitva ? (
        <div className="muvelet-sor">
          <button type="button" className="gomb" onClick={() => setNyitva(true)}>
            Időszak lezárása
          </button>
        </div>
      ) : (
        <div style={{ marginTop: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13 }}>
              <span className="halvany">FAHÁZ</span>
              <select value={haz} onChange={(e) => setHaz(e.target.value)} style={mezo}>
                {hazak.map((h) => (
                  <option key={h.slug} value={h.slug}>{h.nev}</option>
                ))}
              </select>
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13 }}>
              <span className="halvany">INDOK (nem kötelező)</span>
              <input
                type="text" value={indok} placeholder="pl. karbantartás"
                onChange={(e) => setIndok(e.target.value)} style={mezo}
              />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13 }}>
              <span className="halvany">ELSŐ ZÁRT NAP</span>
              <input type="date" value={kezdet} onChange={(e) => setKezdet(e.target.value)} style={mezo} />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13 }}>
              <span className="halvany">ELSŐ ÚJRA SZABAD NAP</span>
              <input type="date" value={veg} onChange={(e) => setVeg(e.target.value)} style={mezo} />
            </label>
          </div>
          <p className="halvany" style={{ marginTop: 10, fontSize: 13 }}>
            A záró dátum napja már újra foglalható — ugyanúgy, ahogy a
            távozás napján is kiadható a ház.
          </p>
          {hiba && <div className="notice bad" style={{ marginTop: 10 }}>{hiba}</div>}
          <div className="muvelet-sor">
            <button
              type="button" className="gomb elsodleges" onClick={zar}
              disabled={fut || !kezdet || !veg}
            >
              {fut ? 'Mentés…' : 'Lezárás'}
            </button>
            <button type="button" className="gomb" onClick={() => setNyitva(false)}>
              Mégse
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const mezo: React.CSSProperties = {
  padding: '9px 11px', border: '1px solid var(--line)', background: 'var(--cream)',
  fontFamily: 'inherit', fontSize: 14.5, color: 'var(--slate)',
};
