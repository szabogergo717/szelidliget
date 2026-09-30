'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { T, type Nyelv } from '@/lib/tartalom';
import Naptar from './Naptar';

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
  leiras?: string | null;
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

type FizetesiMod = 'kartya' | 'utalas';

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

  // Számlázási adatok. Alapból a vendég adataival egyeznek — a legtöbb
  // foglalásnál ez a helyzet, és így nem kell kétszer begépelni.
  const [szlaSajat, setSzlaSajat] = useState(true);
  const [szlaNev, setSzlaNev] = useState('');
  const [szlaCim, setSzlaCim] = useState('');
  const [szlaIrsz, setSzlaIrsz] = useState('');
  const [szlaVaros, setSzlaVaros] = useState('');
  const [szlaOrszag, setSzlaOrszag] = useState(
    nyelv === 'hu' ? 'Magyarország' : ''
  );
  const [szlaAdoszam, setSzlaAdoszam] = useState('');

  const [fizetesiMod, setFizetesiMod] = useState<FizetesiMod>('kartya');
  const [hirlevel, setHirlevel] = useState(false);
  const [kuldes, setKuldes] = useState(false);
  const [kuldesiHiba, setKuldesiHiba] = useState<string | null>(null);

  const haz = hazak.find((h) => h.slug === hazSlug) ?? hazak[0];

  useEffect(() => {
    if (haz && fo > haz.max_fo) setFo(haz.max_fo);
  }, [haz, fo]);

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
      if (sajatSorszam === keresSorszam.current) setAr(v.ok ? adat : null);
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
  // Telefon: kötelező, de nem kötjük formátumhoz — a külföldi számok
  // sokféle alakot vesznek fel, és egy túl szigorú ellenőrzés
  // valódi vendéget zárna ki.
  const telefonErvenyes = telefon.replace(/[^0-9]/g, '').length >= 7;

  // A cím mindig kell: számlát cím nélkül nem lehet kiállítani.
  // A név csak akkor külön, ha a vendég más nevet kér a számlára.
  const cimKesz =
    szlaIrsz.trim().length >= 4 &&
    szlaVaros.trim().length > 1 &&
    szlaCim.trim().length > 2 &&
    szlaOrszag.trim().length > 1;

  const szamlazasKesz = cimKesz && (szlaSajat || szlaNev.trim().length > 1);

  const adatokKeszek =
    nev.trim().length > 1 && emailErvenyes && telefonErvenyes && szamlazasKesz;

  const kuldheto = Boolean(ar?.foglalhato) && adatokKeszek && !kuldes && !tolt;

  // Van-e olyan kiválasztott extra, aminek az ára egyeztetés kérdése?
  const arKeresreValasztva = valasztottExtrak.some(
    (s) => extrak.find((e) => e.slug === s)?.ar === 0
  );

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
          extrak_slug: valasztottExtrak,
          fizetesi_mod: fizetesiMod,
          vendeg: {
            nev,
            email,
            telefon,
            nyelv,
            szla_nev: szlaSajat ? nev : szlaNev,
            szla_cim: szlaCim,
            szla_irsz: szlaIrsz,
            szla_varos: szlaVaros,
            szla_orszag: szlaOrszag,
            szla_adoszam: szlaAdoszam || null,
          },
          megjegyzes,
          hirlevel,
        }),
      });
      const adat = await v.json();

      if (v.ok && adat.fizetesi_url) {
        window.location.href = adat.fizetesi_url;
        return;
      }
      if (v.ok && adat.tovabb) {
        // Utalásos foglalás: nincs fizetőoldal, saját visszajelzés jön.
        window.location.href = adat.tovabb;
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
    if (ar.hibak.length) {
      // Ha a minimum éjszaka miatt bukik, elmondjuk a kivételt is:
      // egy kimaradó nap egy éjszakára is kiadható.
      const minHiba = ar.ejszakak === 1;
      return {
        szoveg: minHiba
          ? `${ar.hibak[0]} ${T.egyEjszakaTajekoztato[nyelv]}`
          : ar.hibak[0],
        stilus: 'warn',
      };
    }
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
            {fo === 1 && (
              <span className="mezo-sugo">{T.egyFoTajekoztato[nyelv]}</span>
            )}
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

        {/* A naptár ugyanazt a két dátumot állítja, mint a mezők fent —
            aki szívesebben gépel, annak a mezők maradnak. */}
        <Naptar
          hazSlug={hazSlug}
          erkezes={erkezes}
          tavozas={tavozas}
          nyelv={nyelv}
          minEjszaka={haz?.min_ejszaka ?? 1}
          onValaszt={(be, ki) => {
            setErkezes(be);
            setTavozas(ki);
          }}
        />

        {/* Hat éjszakától egyedi kedvezmény jár — szóljunk időben. */}
        {ar && ar.ejszakak >= 6 && (
          <div className="notice" style={{ marginTop: 4 }}>
            {T.hosszuFoglalasKedvezmeny[nyelv]}
          </div>
        )}

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
                    {x.leiras && <span className="extra-leiras">{x.leiras}</span>}
                  </span>
                </label>
                <span className="p">
                  {x.ar > 0 ? `+${ft(x.ar, nyelv)}` : T.arKeresre[nyelv]}
                </span>
              </div>
            ))}
            {arKeresreValasztva && (
              <p className="mezo-sugo" style={{ marginTop: 10 }}>
                {T.arKeresreMagyarazat[nyelv]}
              </p>
            )}
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
          <div className={`field${telefon && !telefonErvenyes ? ' hiba' : ''}`}>
            <label htmlFor="f-tel">{T.mezoTelefon[nyelv]}</label>
            <input
              id="f-tel" type="tel" value={telefon} autoComplete="tel"
              onChange={(e) => setTelefon(e.target.value)} required
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

        {/* ---------- Számlázási adatok ---------- */}
        <div className="extras-title" style={{ marginTop: 26 }}>
          {T.szamlazasCim[nyelv].toUpperCase()}
        </div>
        <p className="mezo-sugo" style={{ marginBottom: 10 }}>
          {T.szamlazasBevezeto[nyelv]}
        </p>
        <label className="valaszto-sor">
          <input
            type="checkbox" checked={szlaSajat}
            onChange={(e) => setSzlaSajat(e.target.checked)}
          />
          <span>{T.szamlazasSajat[nyelv]}</span>
        </label>

        {!szlaSajat && (
          <div className="row" style={{ marginTop: 16 }}>
            <div className="field">
              <label htmlFor="f-szla-nev">{T.mezoSzlaNev[nyelv]}</label>
              <input
                id="f-szla-nev" type="text" value={szlaNev}
                onChange={(e) => setSzlaNev(e.target.value)} required
              />
            </div>
            <div className="field">
              <label htmlFor="f-szla-ado">{T.mezoSzlaAdoszam[nyelv]}</label>
              <input
                id="f-szla-ado" type="text" value={szlaAdoszam}
                autoComplete="off"
                onChange={(e) => setSzlaAdoszam(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* A cím mindig látszik és mindig kötelező. */}
        <div className="row" style={{ marginTop: 16 }}>
          <div className="field keskeny">
            <label htmlFor="f-szla-irsz">{T.mezoSzlaIrsz[nyelv]}</label>
            <input
              id="f-szla-irsz" type="text" value={szlaIrsz}
              inputMode="numeric" autoComplete="postal-code"
              onChange={(e) => setSzlaIrsz(e.target.value)} required
            />
          </div>
          <div className="field">
            <label htmlFor="f-szla-varos">{T.mezoSzlaVaros[nyelv]}</label>
            <input
              id="f-szla-varos" type="text" value={szlaVaros}
              autoComplete="address-level2"
              onChange={(e) => setSzlaVaros(e.target.value)} required
            />
          </div>
        </div>
        <div className="row">
          <div className="field">
            <label htmlFor="f-szla-cim">{T.mezoSzlaCim[nyelv]}</label>
            <input
              id="f-szla-cim" type="text" value={szlaCim}
              autoComplete="street-address"
              onChange={(e) => setSzlaCim(e.target.value)} required
            />
          </div>
          <div className="field">
            <label htmlFor="f-szla-orszag">{T.mezoSzlaOrszag[nyelv]}</label>
            <input
              id="f-szla-orszag" type="text" value={szlaOrszag}
              autoComplete="country-name"
              onChange={(e) => setSzlaOrszag(e.target.value)} required
            />
          </div>
        </div>

        {/* ---------- Fizetési mód ---------- */}
        <div className="extras-title" style={{ marginTop: 26 }}>
          {T.fizetesCim[nyelv].toUpperCase()}
        </div>
        <div className="fizetes-valaszto">
          <label className={`fizetes-opcio${fizetesiMod === 'kartya' ? ' aktiv' : ''}`}>
            <input
              type="radio" name="fizmod" value="kartya"
              checked={fizetesiMod === 'kartya'}
              onChange={() => setFizetesiMod('kartya')}
            />
            <span>
              <strong>{T.fizetesKartya[nyelv]}</strong>
              <span className="fizetes-leiras">{T.fizetesKartyaLeiras[nyelv]}</span>
            </span>
          </label>
          <label className={`fizetes-opcio${fizetesiMod === 'utalas' ? ' aktiv' : ''}`}>
            <input
              type="radio" name="fizmod" value="utalas"
              checked={fizetesiMod === 'utalas'}
              onChange={() => setFizetesiMod('utalas')}
            />
            <span>
              <strong>{T.fizetesUtalas[nyelv]}</strong>
              <span className="fizetes-leiras">{T.fizetesUtalasLeiras[nyelv]}</span>
            </span>
          </label>
        </div>

        <label className="hirlevel">
          <input
            type="checkbox"
            checked={hirlevel}
            onChange={(e) => setHirlevel(e.target.checked)}
          />
          <span>
            {T.hirlevelCimke[nyelv]}
            <span className="hirlevel-magyarazat">{T.hirlevelMagyarazat[nyelv]}</span>
          </span>
        </label>

        {uzenet && (
          <div className={`notice ${uzenet.stilus}`} role="status" aria-live="polite">
            {uzenet.szoveg}
          </div>
        )}
        {kuldesiHiba && <div className="notice bad" role="alert">{kuldesiHiba}</div>}
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
          {kuldes
            ? T.gombFeldolgozas[nyelv]
            : fizetesiMod === 'utalas'
              ? T.gombUtalas[nyelv]
              : T.gombTovabb[nyelv]}
        </button>
      </aside>
    </form>
  );
}
