'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function Belepes() {
  const [jelszo, setJelszo] = useState('');
  const [hiba, setHiba] = useState<string | null>(null);
  const [kuldes, setKuldes] = useState(false);

  async function belep(e: React.FormEvent) {
    e.preventDefault();
    setKuldes(true);
    setHiba(null);
    try {
      const v = await fetch('/api/admin/belepes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jelszo }),
      });
      if (v.ok) {
        // A cél a címsorból jön; csak saját útvonalra engedünk tovább,
        // hogy ne lehessen idegen oldalra irányítani vele.
        const p = new URLSearchParams(window.location.search).get('tovabb');
        const cel = p && p.startsWith('/admin') ? p : '/admin';
        window.location.href = cel;
        return;
      }
      const adat = await v.json().catch(() => ({}));
      setHiba(adat.hiba ?? 'Nem sikerült belépni.');
    } catch {
      setHiba('Nem sikerült belépni.');
    } finally {
      setKuldes(false);
    }
  }

  return (
    <main className="admin-belepes">
      <form className="belepes-doboz" onSubmit={belep}>
        <Image
          src="/logo-transparent.png" alt="Szelid Liget"
          width={300} height={178} priority
          style={{ width: 200, height: 'auto', margin: '0 auto 26px' }}
        />
        <h1>Adminisztráció</h1>
        <div className="field" style={{ marginTop: 22 }}>
          <label htmlFor="j">JELSZÓ</label>
          <input
            id="j" type="password" value={jelszo} autoFocus
            autoComplete="current-password"
            onChange={(e) => setJelszo(e.target.value)}
          />
        </div>
        {hiba && <div className="notice bad" role="alert">{hiba}</div>}
        <button
          type="submit" className="btn"
          style={{ width: '100%', marginTop: 20 }}
          disabled={kuldes || jelszo.length === 0}
        >
          {kuldes ? 'Belépés…' : 'Belépés'}
        </button>
      </form>
    </main>
  );
}
