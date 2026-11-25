'use client';

import { useState } from 'react';
import { T, CEG, type Nyelv } from '@/lib/tartalom';
import { UTALVANY } from '@/lib/utalvany';
import BarionJelveny from './BarionJelveny';

/**
 * Ajándékutalvány vásárlása.
 *
 * Nem foglalás: itt a vevő nem időpontot vesz, hanem egy kódot. Az
 * időpontot később, a kód beváltásakor választja ki — ő, vagy az,
 * akinek ajándékozza.
 *
 * Az árat a szerver dönti el (lib/utalvany.ts); itt csak megmutatjuk.
 */

function ft(n: number, nyelv: Nyelv): string {
  return new Intl.NumberFormat(nyelv === 'en' ? 'en-GB' : 'hu-HU').format(n) + ' Ft';
}

export default function UtalvanyUrlap({ nyelv }: { nyelv: Nyelv }) {
  const [nev, setNev] = useState('');
  const [email, setEmail] = useState('');
  const [telefon, setTelefon] = useState('');
  const [ajandekozott, setAjandekozott] = useState('');
  const [uzenet, setUzenet] = useState('');
  const [aszf, setAszf] = useState(false);
  const [kuldes, setKuldes] = useState(false);
  const [hiba, setHiba] = useState<string | null>(null);

  const emailErvenyes = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
  const kuldheto = nev.trim().length > 1 && emailErvenyes && aszf && !kuldes;

  async function kuld(e: React.FormEvent) {
    e.preventDefault();
    if (!kuldheto) return;
    setKuldes(true);
    setHiba(null);

    try {
      const v = await fetch('/api/utalvany', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nev: nev.trim(),
          email: email.trim(),
          telefon: telefon.trim() || undefined,
          ajandekozott: ajandekozott.trim() || undefined,
          uzenet: uzenet.trim() || undefined,
          aszf_elfogadva: aszf,
        }),
      });
      const adat = await v.json();

      if (!v.ok) {
        setHiba(adat?.hiba ?? 'Nem sikerült elindítani a vásárlást.');
        setKuldes(false);
        return;
      }
      // Átirányítás a Barion fizetőoldalára.
      window.location.href = adat.fizetesi_url;
    } catch {
      setHiba('A kapcsolat megszakadt. Próbáld újra.');
      setKuldes(false);
    }
  }

  return (
    <form className="utalvany-urlap" onSubmit={kuld}>
      <div className="utalvany-kartya">
        <div className="utalvany-ar">{ft(UTALVANY.ar, nyelv)}</div>
        <ul className="utalvany-lista">
          <li>{UTALVANY.ejszakak} éjszaka szállás, {UTALVANY.fo} főnek</li>
          <li>Hétköznapi éjszakákra, a szabad helyek függvényében</li>
          <li>
            Pénteki és szombati éjszakára hétvégi felár jön rá,
            éjszakánként {ft(12000, nyelv)}
          </li>
          <li>2027. december 20-ig használható fel</li>
          <li>A kódot vásárlás után azonnal e-mailben küldjük</li>
          <li>Átadható: te is beválthatod, és oda is ajándékozhatod</li>
        </ul>
      </div>

      <div className="row">
        <div className="field">
          <label htmlFor="u-nev">{T.utalvanyNev[nyelv]}</label>
          <input
            id="u-nev" type="text" value={nev} autoComplete="name" required
            onChange={(e) => setNev(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="u-email">{T.utalvanyEmail[nyelv]}</label>
          <input
            id="u-email" type="email" value={email} autoComplete="email" required
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
      </div>

      <div className="row">
        <div className="field">
          <label htmlFor="u-tel">{T.utalvanyTelefon[nyelv]}</label>
          <input
            id="u-tel" type="tel" value={telefon} autoComplete="tel"
            onChange={(e) => setTelefon(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="u-kinek">{T.utalvanyAjandekozott[nyelv]}</label>
          <input
            id="u-kinek" type="text" value={ajandekozott}
            onChange={(e) => setAjandekozott(e.target.value)}
          />
        </div>
      </div>

      <div className="field">
        <label htmlFor="u-uzenet">{T.utalvanyUzenet[nyelv]}</label>
        <textarea
          id="u-uzenet" rows={3} value={uzenet}
          onChange={(e) => setUzenet(e.target.value)}
        />
      </div>

      <label className={`hirlevel aszf-sor${aszf ? '' : ' kell'}`}>
        <input
          type="checkbox" checked={aszf} required
          onChange={(e) => setAszf(e.target.checked)}
        />
        <span>
          {T.aszfElfogadas[nyelv]}
          <span className="aszf-linkek">
            <a href={nyelv === 'hu' ? '/aszf' : '/en/aszf'} target="_blank" rel="noopener">
              {T.aszfLink[nyelv]}
            </a>
            {' · '}
            <a
              href={nyelv === 'hu' ? '/adatvedelem' : '/en/adatvedelem'}
              target="_blank" rel="noopener"
            >
              {T.adatvedelemLink[nyelv]}
            </a>
          </span>
        </span>
      </label>

      {hiba && <div className="notice warn">{hiba}</div>}

      <button type="submit" className="btn" disabled={!kuldheto}>
        {kuldes ? '…' : `${T.utalvanyGomb[nyelv]} · ${ft(UTALVANY.ar, nyelv)}`}
      </button>

      <BarionJelveny nyelv={nyelv} helye="urlap" />

      <p className="utalvany-kapcsolat">
        Kérdés esetén hívj minket:{' '}
        <a href={`tel:${CEG.telefonHivas}`}>{CEG.telefon}</a>
      </p>
    </form>
  );
}
