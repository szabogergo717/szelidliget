'use client';

import { useEffect } from 'react';

/**
 * Az admin felület hibaoldala.
 *
 * Ide akkor jutunk, ha egy lekérdezés elszállt — jellemzően azért, mert
 * az adatbázis épp nem érhető el, vagy hiányzik egy kulcs. Egy nyers
 * 500-as lap semmit nem mondana arról, mi a teendő, ezért itt konkrét
 * nyomokat adunk.
 */
export default function AdminHiba({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[admin] hiba:', error);
  }, [error]);

  return (
    <div className="doboz" style={{ maxWidth: 620, margin: '40px auto' }}>
      <h1 style={{ fontSize: 22, marginBottom: 12 }}>
        Az adatok most nem érhetők el
      </h1>
      <p style={{ color: 'var(--slate-soft)', lineHeight: 1.6, fontSize: 15 }}>
        A felület nem tudta lekérdezni az adatbázist. A foglalások nem
        vesztek el — csak a megjelenítés akadt meg.
      </p>

      <h2 style={{ marginTop: 22, fontSize: 16 }}>Mit érdemes megnézni</h2>
      <ol style={{ color: 'var(--slate-soft)', lineHeight: 1.7, fontSize: 14.5, paddingLeft: 20 }}>
        <li>
          Fut-e a Supabase projekt? (supabase.com → a projekted; az
          ingyenes projektek hosszabb tétlenség után szünetelnek)
        </li>
        <li>
          Megvan-e a Verceln mind a három Supabase-kulcs, és a
          <code> NEXT_PUBLIC_SUPABASE_URL</code> a projekt alap-címe-e
          (<code>/rest/v1/</code> nélkül)?
        </li>
        <li>
          Lefutott-e az adatbázison a <code>001_foglalas_sema.sql</code>?
        </li>
      </ol>

      <div className="muvelet-sor">
        <button type="button" className="gomb elsodleges" onClick={reset}>
          Újrapróbálom
        </button>
        <a className="gomb" href="/admin">Vissza a listához</a>
      </div>

      {error.digest && (
        <p className="halvany" style={{ marginTop: 16, fontSize: 12.5 }}>
          Hibaazonosító: {error.digest} — a Vercel <em>Logs</em> fülén
          ezzel kereshető meg a részletes üzenet.
        </p>
      )}
    </div>
  );
}
