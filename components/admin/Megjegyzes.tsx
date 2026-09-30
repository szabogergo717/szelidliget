'use client';

import { useState, useTransition } from 'react';
import { megjegyzestMent } from '@/app/admin/muveletek';

export default function Megjegyzes({
  azonosito, kezdeti,
}: {
  azonosito: string; kezdeti: string;
}) {
  const [szoveg, setSzoveg] = useState(kezdeti);
  const [fut, indit] = useTransition();
  const [allapot, setAllapot] = useState<string | null>(null);

  const valtozott = szoveg !== kezdeti;

  function ment() {
    setAllapot(null);
    indit(async () => {
      try {
        await megjegyzestMent(azonosito, szoveg);
        setAllapot('Mentve.');
      } catch (e) {
        setAllapot(e instanceof Error ? e.message : 'Nem sikerült menteni.');
      }
    });
  }

  return (
    <div>
      <textarea
        value={szoveg}
        onChange={(e) => setSzoveg(e.target.value)}
        rows={4}
        placeholder="Saját jegyzet a foglaláshoz — a vendég ezt nem látja."
        style={{
          width: '100%', padding: '11px 12px', border: '1px solid var(--line)',
          background: 'var(--cream)', fontFamily: 'inherit', fontSize: 14.5,
          color: 'var(--slate)', resize: 'vertical',
        }}
      />
      <div className="muvelet-sor">
        <button
          type="button" className="gomb" onClick={ment}
          disabled={fut || !valtozott}
        >
          {fut ? 'Mentés…' : 'Megjegyzés mentése'}
        </button>
        {allapot && <span className="halvany" style={{ alignSelf: 'center' }}>{allapot}</span>}
      </div>
    </div>
  );
}
