import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  egyFoglalas, foglalasTetelei, fizetesek, emailek,
} from '@/lib/adminAdat';
import {
  ft, datum, idopont, ejszakak, STATUSZ_NEV, FORRAS_NEV,
} from '@/lib/adminFormat';
import StatuszValto from '@/components/admin/StatuszValto';
import Megjegyzes from '@/components/admin/Megjegyzes';

export const dynamic = 'force-dynamic';

const EMAIL_NEV: Record<string, string> = {
  visszaigazolas: 'Visszaigazolás',
  erkezes_elott: 'Érkezés előtti tájékoztató',
  lemondas: 'Lemondás',
};

export default async function FoglalasReszlet({
  params,
}: {
  params: Promise<{ azonosito: string }>;
}) {
  const { azonosito } = await params;
  const f = await egyFoglalas(azonosito);
  if (!f) notFound();

  const [tetelek, fiz, mailek] = await Promise.all([
    foglalasTetelei(f.id),
    fizetesek(f.id),
    emailek(f.id),
  ]);

  const ej = ejszakak(f.erkezes, f.tavozas);

  return (
    <>
      <Link href="/admin" className="vissza">← Vissza a listához</Link>

      <div className="reszlet-fej" style={{ marginTop: 14 }}>
        <div>
          <h1>{f.azonosito}</h1>
          <p className="alcim" style={{ marginBottom: 0 }}>
            {f.haz_nev} · {datum(f.erkezes)} – {datum(f.tavozas)} · {ej} éjszaka · {f.fo} fő
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span className={`cimke ${f.statusz}`}>
            {STATUSZ_NEV[f.statusz] ?? f.statusz}
          </span>
          <span className={`cimke ${f.forras}`}>
            {FORRAS_NEV[f.forras] ?? f.forras}
          </span>
        </div>
      </div>

      <div className="reszlet-racs">
        <div>
          <div className="doboz">
            <h2>Vendég</h2>
            <div className="par">
              <span className="k">Név</span>
              <span className="v">{f.vendeg_nev ?? '—'}</span>
            </div>
            <div className="par">
              <span className="k">E-mail</span>
              <span className="v">
                {f.vendeg_email
                  ? <a href={`mailto:${f.vendeg_email}`}>{f.vendeg_email}</a>
                  : '—'}
              </span>
            </div>
            <div className="par">
              <span className="k">Telefon</span>
              <span className="v">
                {f.vendeg_telefon
                  ? <a href={`tel:${f.vendeg_telefon}`}>{f.vendeg_telefon}</a>
                  : '—'}
              </span>
            </div>
            <div className="par">
              <span className="k">Nyelv</span>
              <span className="v">{f.vendeg_nyelv === 'en' ? 'Angol' : 'Magyar'}</span>
            </div>
            <div className="par">
              <span className="k">Foglalás ideje</span>
              <span className="v">{idopont(f.letrehozva)}</span>
            </div>
          </div>

          {/* A számla kiállításához kell — ezért külön dobozban,
              hogy egyben ki lehessen másolni. */}
          <div className="doboz">
            <h2>Számlázási adatok</h2>
            <div className="par">
              <span className="k">Név</span>
              <span className="v">{f.szla_nev ?? f.vendeg_nev ?? '—'}</span>
            </div>
            <div className="par">
              <span className="k">Cím</span>
              <span className="v">
                {f.szla_irsz || f.szla_varos || f.szla_cim ? (
                  <>
                    {[f.szla_irsz, f.szla_varos].filter(Boolean).join(' ')}
                    {f.szla_cim ? <><br />{f.szla_cim}</> : null}
                    {f.szla_orszag ? <><br />{f.szla_orszag}</> : null}
                  </>
                ) : (
                  <span className="halvany">
                    Nincs megadva — a foglalás a cím kötelezővé tétele előtt készült.
                  </span>
                )}
              </span>
            </div>
            <div className="par">
              <span className="k">Adószám</span>
              <span className="v">{f.szla_adoszam ?? '—'}</span>
            </div>
          </div>

          <div className="doboz">
            <h2>Fizetési kísérletek</h2>
            {fiz.length === 0 ? (
              <p className="halvany">Még nincs rögzített fizetési kísérlet.</p>
            ) : (
              fiz.map((p, i) => (
                <div className="par" key={i}>
                  <span className="k">{idopont(p.letrehozva)}</span>
                  <span className="v">
                    {ft(p.osszeg)} · {p.statusz}
                    {p.szolgaltato ? ` · ${p.szolgaltato}` : ''}
                    {p.kulso_tranzakcio_id && (
                      <><br /><span className="halvany">
                        Tranzakció: {p.kulso_tranzakcio_id}
                      </span></>
                    )}
                  </span>
                </div>
              ))
            )}
          </div>

          <div className="doboz">
            <h2>Kiküldött e-mailek</h2>
            {mailek.length === 0 ? (
              <p className="halvany">
                Még nem ment ki e-mail ehhez a foglaláshoz.
              </p>
            ) : (
              mailek.map((m, i) => (
                <div className="par" key={i}>
                  <span className="k">{idopont(m.kuldve)}</span>
                  <span className="v">
                    {EMAIL_NEV[m.tipus] ?? m.tipus} → {m.cimzett}
                    {' '}({m.nyelv.toUpperCase()})
                    {!m.sikeres && (
                      <><br /><span style={{ color: 'var(--piros)' }}>
                        Sikertelen{m.hiba ? `: ${m.hiba}` : ''}
                      </span></>
                    )}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div>
          <div className="doboz">
            <h2>Összeg</h2>
            <div className="osszeg-sor">
              <span>Szállásdíj ({ej} éj)</span>
              <span>{ft(f.szallasdij)}</span>
            </div>
            {tetelek.map((t, i) => (
              <div className="osszeg-sor" key={i}>
                <span className="halvany">
                  {t.nev}{t.mennyiseg > 1 ? ` × ${t.mennyiseg}` : ''}
                </span>
                <span className="halvany">{ft(t.egysegar * t.mennyiseg)}</span>
              </div>
            ))}
            {tetelek.length === 0 && f.extrak_dij > 0 && (
              <div className="osszeg-sor">
                <span>Extrák</span>
                <span>{ft(f.extrak_dij)}</span>
              </div>
            )}
            <div className="osszeg-sor fo">
              <span>Végösszeg</span>
              <span>{ft(f.vegosszeg)}</span>
            </div>
          </div>

          <div className="doboz">
            <h2>Státusz módosítása</h2>
            <StatuszValto azonosito={f.azonosito} jelenlegi={f.statusz} />
            <p className="halvany" style={{ marginTop: 14, fontSize: 13 }}>
              A lemondás felszabadítja az időszakot, és a naptárban újra
              foglalhatóvá teszi. Pénzt nem térít vissza — azt a SimplePay
              felületén kell elindítani.
            </p>
          </div>

          <div className="doboz">
            <h2>Belső megjegyzés</h2>
            <Megjegyzes azonosito={f.azonosito} kezdeti={f.megjegyzes ?? ''} />
          </div>
        </div>
      </div>
    </>
  );
}
