'use client';

import { useState } from 'react';
import { T, type Nyelv } from '@/lib/tartalom';

/**
 * Hírlevél-feliratkozás a főoldalról.
 *
 * Aki ide beírja a címét, azzal a szándékkal teszi, hogy hírlevelet
 * kapjon — a hozzájárulás maga a feliratkozás. A rendszer eltárolja
 * az idejét és a forrását, ez a bizonyíték.
 */
export default function HirlevelDoboz({ nyelv }: { nyelv: Nyelv }) {
  const [email, setEmail] = useState('');
  const [allapot, setAllapot] = useState<'ures' | 'kuld' | 'siker' | 'hiba'>('ures');

  const ervenyes = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);

  async function feliratkozik(e: React.FormEvent) {
    e.preventDefault();
    if (!ervenyes || allapot === 'kuld') return;
    setAllapot('kuld');
    try {
      const v = await fetch('/api/hirlevel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, nyelv }),
      });
      setAllapot(v.ok ? 'siker' : 'hiba');
      if (v.ok) setEmail('');
    } catch {
      setAllapot('hiba');
    }
  }

  return (
    <div className="hirlevel-doboz">
      <div className="hirlevel-szoveg">
        <div className="label">{T.hirlevelSzekcioCimke[nyelv]}</div>
        <h2>{T.hirlevelSzekcioCim[nyelv]}</h2>
        <p>{T.hirlevelSzekcioLeiras[nyelv]}</p>
      </div>

      <form className="hirlevel-urlap" onSubmit={feliratkozik}>
        <label className="vizualisan-rejtve" htmlFor="hl-email">
          {T.hirlevelEmail[nyelv]}
        </label>
        <input
          id="hl-email"
          type="email"
          value={email}
          placeholder={T.hirlevelEmail[nyelv]}
          autoComplete="email"
          onChange={(e) => { setEmail(e.target.value); setAllapot('ures'); }}
        />
        <button type="submit" className="btn" disabled={!ervenyes || allapot === 'kuld'}>
          {allapot === 'kuld' ? T.hirlevelKuldes[nyelv] : T.hirlevelGomb[nyelv]}
        </button>

        {allapot === 'siker' && (
          <p className="hirlevel-visszajelzes ok" role="status">
            {T.hirlevelSiker[nyelv]}
          </p>
        )}
        {allapot === 'hiba' && (
          <p className="hirlevel-visszajelzes bad" role="alert">
            {T.hirlevelHiba[nyelv]}
          </p>
        )}
      </form>
    </div>
  );
}
