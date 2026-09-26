'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { T, type Nyelv } from '@/lib/tartalom';

/**
 * Foglalóűrlap.
 *
 * Alapelv: a böngésző SOHA nem számol árat. Minden változásnál megkérdezi
 * a szervert (/api/ar), és azt mutatja. Így kizárt, hogy a vendég mást
 * lásson, mint amit fizetni fog.
 */

export type HazAdat = {
  slug: string;
  nev: string;
  max_fo: number;
  alap_ar: number;
  min_ejszaka: number;
};

export type ExtraAdat = {
  slug: string;
  nev: string;
  ar: number;
  ejszakankent: boolean;
};

type Arvalasz = {
  ejszakak: number;
  szallasdij: number;
  extrak_dij: number;
  vegosszeg: number;
  min_ejszaka: number;
  hibak: string[];
  foglalt: boolean;
  foglalhato: boolean;
};

function ft(n: number, nyelv: Nyelv): string {
  return new Intl.NumberFormat(nyelv === 'en' ? 'en-GB' : 'hu-HU').format(n) + ' Ft';
}

function ymd(d: Date): string {
  return (
    d.getFullYear() +
    '-' +
    String(d.getMonth() + 1).padStart(2, '0') +
    '-' +
    String(d.getDate()).padStart(2, '0')
  );
}

export default function FoglaloUrlap({
  hazak,
  extrak,
  nyelv,
  kezdoHaz,
}: {
  hazak: HazAdat[];
  extrak: ExtraAdat[];
  nyelv: Nyelv;
  kezdoHaz?: string;
}) {
  const ma = new Date();
  const alapBe = new Date(ma); alapBe.setDate(alapBe.getDate() + 14);
  const alapKi = new Date(ma); alapKi.setDate(alapKi.getDate() + 16);

  const [hazSlug, setHazSlug] = useState(kezdoHaz ?? hazak[0]?.slug ?? '');
  const [erkezes, setErkezes] = useState(ymd(alapBe));
  const [tavozas, setTavozas] = useState(ymd(alapKi));
  const [fo, setFo] = useState(2);
  const [valasztottExtrak, setValasztottExtrak] = useState<string[]>([]);

  const [ar, setAr] = useState<Arvalasz | null>(null);
  const [tolt, setTolt] = useState(false);

  const [nev, setNev] = useState('');
  const [email, setEmail] = useState('');
  const [telefon, setTelefon] = useState('');
  const [megjegyzes, setMegjegyzes] = useState('');
  const [kuldes, setKuldes] = useState(false);
  const [kuldesiHiba, setKuldesiHiba] = useState<string | null>(null);

  const haz = hazak.find((h) => h.slug === hazSlug) ?? hazak[0];

  // A ház váltásakor a létszám ne maradjon a kapacitás fölött.
  useEffect(() => {
    if (haz && fo > haz.max_fo) setFo(haz.max_fo);
  }, [haz, fo]);

  // Az árlekérdezéseket késleltetjük, hogy a dátum gépelése közben
  // ne induljon tíz kérés. A kérés sorszáma megakadályozza, hogy egy
  // korábbi, lassabb válasz felülírjon egy frissebbet.
  const keresSorszam = useRef(0);

  const arLekerdez = useCallback(async () => {
    if (!hazSlug || !erkezes || !tavozas) return;
    const sajatSorszam = ++keresSorszam.current;
    setTolt(true);
    try {
      const v = await fetch('/api/ar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          haz_slug: hazSlug,
          erkezes,
          tavozas,
          fo,
          extrak: valasztottExtrak,
        }),
      });
      const adat = await v.json();
      if (sajatSorszam === keresSorszam.current) {
        setAr(v.ok ? adat : null);
      }
    } catch {
      if (sajatSorszam === keresSorszam.current) setAr(null);
    } finally {
      if (sajatSorszam === keresSorszam.current) setTolt(false);
    }
  }, [hazSlug, erkezes, tavozas, fo, valasztottExtrak]);

  useEffect(() => {
    const id = setTimeout(arLekerdez, 300);
    return () => clearTimeout(id);
  }, [arLekerdez]);

  function extraValt(slug: string) {
    setValasztottExtrak((elozo) =>
      elozo.includes(slug) ? elozo.filter((s) => s !== slug) : [...elozo, slug]
    );
  }

  const emailErvenyes = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
  const adatokKeszek = nev.trim().length > 1 && emailErvenyes;
  const kuldheto = Boolean(ar?.foglalhato) && adatokKeszek && !kuldes && !tolt;

  async function foglal(e: React.FormEvent) {
    e.preventDefault();
    if (!kuldheto) return;
    setKuldes(true);
    setKuldesiHiba(null);

    try {
      const v = await fetch('/api/foglalas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          haz_slug: hazSlug,
          erkezes,
          tavozas,
          fo,
          extrak: [], // a szerver a slug-ok alapján számol, lásd lent
          extrak_slug: valasztottExtrak,
          vendeg: { nev, email, telefon, nyelv },
          megjegyzes,
        }),
      });
      const adat = await v.json();

      if (v.ok && adat.fizetesi_url) {
        // Átadjuk a vendéget a SimplePay fizetőoldalának.
        window.location.href = adat.fizetesi_url;
        return;
      }
      setKuldesiHiba(adat.hiba ?? T.hibaAltalanos[nyelv]);
    } catch {
      setKuldesiHiba(T.hibaAltalanos[nyelv]);
    } finally {
      setKuldes(false);
    }
  }

  const uzenet = (() => {
    if (tolt && !ar) return { szoveg: T.allapotBetoltes[nyelv], stilus: '' };
    if (!ar) return null;
    if (ar.hibak.length) return { szoveg: ar.hibak[0], stilus: 'warn' };
    if (ar.foglalt) return { szoveg: T.allapotFoglalt[nyelv], stilus: 'bad' };
    return { szoveg: T.allapotSzabad[nyelv], stilus: 'ok' };
  })();

  return (
    <form className="panel" onSubmit={foglal}>
      <div className="panel-main">
        <div className="row">
          <div className="field">
            <label htmlFor="f-haz">{T.mezoHaz[nyelv]}</label>
            <select id="f-haz" value={hazSlug} onChange={(e) => setHazSlug(e.target.value)}>
              {hazak.map((h) => (
                <option key={h.slug} value={h.slug}>
                  {h.nev} — {ft(h.alap_ar, nyelv)}
                  {nyelv === 'hu' ? '/éj' : '/night'}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="f-fo">{T.mezoVendegek[nyelv]}</label>
            <select id="f-fo" value={fo} onChange={(e) => setFo(Number(e.target.value))}>
              {Array.from({ length: haz?.max_fo ?? 2 }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="row">
          <div className="field">
            <label htmlFor="f-be">{T.mezoErkezes[nyelv]}</label>
            <input
              id="f-be" type="date" value={erkezes} min={ymd(ma)}
              onChange={(e) => setErkezes(e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="f-ki">{T.mezoTavozas[nyelv]}</label>
            <input
              id="f-ki" type="date" value={tavozas} min={erkezes}
              onChange={(e) => setTavozas(e.target.value)}
            />
          </div>
        </div>

        {extrak.length > 0 && (
          <>
            <div className="extras-title">{T.extrakCim[nyelv]}</div>
            {extrak.map((x) => (
              <div className="extra" key={x.slug}>
                <label>
                  <input
                    type="checkbox"
                    checked={valasztottExtrak.includes(x.slug)}
                    onChange={() => extraValt(x.slug)}
                  />
                  <span>
                    {x.nev}
                    {x.ejszakankent ? ` (${T.ejszakankent[nyelv]})` : ''}
                  </span>
                </label>
                <span className="p">+{ft(x.ar, nyelv)}</span>
              </div>
            ))}
          </>
        )}

        <div className="extras-title" style={{ marginTop: 30 }}>
          {T.adataidCim[nyelv].toUpperCase()}
        </div>
        <div className="row">
          <div className="field">
            <label htmlFor="f-nev">{T.mezoNev[nyelv]}</label>
            <input
              id="f-nev" type="text" value={nev} autoComplete="name"
              onChange={(e) => setNev(e.target.value)} required
            />
          </div>
          <div className={`field${email && !emailErvenyes ? ' hiba' : ''}`}>
            <label htmlFor="f-email">{T.mezoEmail[nyelv]}</label>
            <input
              id="f-email" type="email" value={email} autoComplete="email"
              onChange={(e) => setEmail(e.target.value)} required
            />
          </div>
        </div>
        <div className="row">
          <div className="field">
            <label htmlFor="f-tel">{T.mezoTelefon[nyelv]}</label>
            <input
              id="f-tel" type="tel" value={telefon} autoComplete="tel"
              onChange={(e) => setTelefon(e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="f-megj">{T.mezoMegjegyzes[nyelv]}</label>
            <textarea
              id="f-megj" value={megjegyzes}
              onChange={(e) => setMegjegyzes(e.target.value)}
            />
          </div>
        </div>

        {uzenet && (
          <div className={`notice ${uzenet.stilus}`} role="status" aria-live="polite">
            {uzenet.szoveg}
          </div>
        )}
        {kuldesiHiba && (
          <div className="notice bad" role="alert">{kuldesiHiba}</div>
        )}
      </div>

      <aside className="panel-side">
        <h3>{T.osszesito[nyelv]}</h3>
        <div className="sum">
          <span>{T.osszEjszakak[nyelv]}</span>
          <span>{ar?.ejszakak ?? 0}</span>
        </div>
        <div className="sum">
          <span>{T.osszSzallas[nyelv]}</span>
          <span>{ft(ar?.szallasdij ?? 0, nyelv)}</span>
        </div>
        <div className="sum">
          <span>{T.osszExtrak[nyelv]}</span>
          <span>{ft(ar?.extrak_dij ?? 0, nyelv)}</span>
        </div>
        <div className="sum total">
          <span>{T.osszFizetendo[nyelv]}</span>
          <span>{ft(ar?.vegosszeg ?? 0, nyelv)}</span>
        </div>

        <p className="side-note">{T.fizetesiTajekoztato[nyelv]}</p>

        <button
          type="submit"
          className="btn water"
          style={{ width: '100%', marginTop: 20 }}
          disabled={!kuldheto}
        >
          {kuldes ? T.gombFeldolgozas[nyelv] : T.gombTovabb[nyelv]}
        </button>
      </aside>
    </form>
  );
}
