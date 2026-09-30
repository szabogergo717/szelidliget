'use client';

import { useState, useTransition } from 'react';
import { statuszValt } from '@/app/admin/muveletek';
import { STATUSZ_NEV } from '@/lib/adminFormat';

/**
 * Státuszváltás.
 *
 * A lemondás és a „nem jelent meg" megerősítést kér: az előbbi
 * felszabadítja az időszakot, és ezt véletlenül nem szabad megtenni.
 */

const LEHETOSEGEK = ['fuggoben', 'elolegezve', 'kifizetve', 'lemondva', 'nem_jelent_meg'];

export default function StatuszValto({
  azonosito, jelenlegi,
}: {
  azonosito: string; jelenlegi: string;
}) {
  const [fut, indit] = useTransition();
  const [hiba, setHiba] = useState<string | null>(null);

  function valt(uj: string) {
    if (uj === jelenlegi) return;
    if (uj === 'lemondva' || uj === 'nem_jelent_meg') {
      const szoveg =
        uj === 'lemondva'
          ? 'Biztosan lemondod ezt a foglalást? Az időszak ezzel újra foglalhatóvá válik.'
          : 'Biztosan „nem jelent meg" állapotra állítod?';
      if (!window.confirm(szoveg)) return;
    }
    setHiba(null);
    indit(async () => {
      try {
        await statuszValt(azonosito, uj);
      } catch (e) {
        setHiba(e instanceof Error ? e.message : 'Nem sikerült módosítani.');
      }
    });
  }

  return (
    <div>
      <div className="muvelet-sor">
        {LEHETOSEGEK.map((s) => (
          <button
            key={s}
            type="button"
            className={`gomb${s === jelenlegi ? ' elsodleges' : ''}${s === 'lemondva' && s !== jelenlegi ? ' veszely' : ''}`}
            onClick={() => valt(s)}
            disabled={fut || s === jelenlegi}
          >
            {STATUSZ_NEV[s]}
          </button>
        ))}
      </div>
      {fut && <p className="halvany" style={{ marginTop: 10 }}>Mentés…</p>}
      {hiba && <div className="notice bad" style={{ marginTop: 10 }}>{hiba}</div>}
    </div>
  );
}
