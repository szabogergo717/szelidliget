import Link from 'next/link';
import { foglalasok, attekintes, type Szuro } from '@/lib/adminAdat';
import {
  ft, datumRovid, ejszakak, STATUSZ_NEV, FORRAS_NEV,
} from '@/lib/adminFormat';

export const dynamic = 'force-dynamic';

const SZUROK: { kulcs: Szuro; nev: string }[] = [
  { kulcs: 'kozelgo', nev: 'Közelgő' },
  { kulcs: 'fuggoben', nev: 'Függőben' },
  { kulcs: 'lemondva', nev: 'Lemondott' },
  { kulcs: 'mind', nev: 'Összes' },
];

export default async function AdminFooldal({
  searchParams,
}: {
  searchParams: Promise<{ szuro?: string; q?: string }>;
}) {
  const p = await searchParams;
  const szuro = (SZUROK.find((s) => s.kulcs === p.szuro)?.kulcs ?? 'kozelgo') as Szuro;
  const kereses = p.q ?? '';

  const [sorok, szamok] = await Promise.all([
    foglalasok(szuro, kereses),
    attekintes(),
  ]);

  return (
    <>
      <h1>Foglalások</h1>
      <p className="alcim">
        {sorok.length} találat
        {kereses ? ` a(z) „${kereses}" keresésre` : ''}
      </p>

      <div className="kartyak">
        <div className="kartya">
          <div className="ertek">{szamok.kozelgo}</div>
          <div className="cimke">KÖZELGŐ FOGLALÁS</div>
        </div>
        <div className={`kartya${szamok.fuggoben > 0 ? ' kiemelt' : ''}`}>
          <div className="ertek">{szamok.fuggoben}</div>
          <div className="cimke">FIZETÉSRE VÁR</div>
        </div>
        <div className={`kartya${szamok.erkezikMa > 0 ? ' kiemelt' : ''}`}>
          <div className="ertek">{szamok.erkezikMa}</div>
          <div className="cimke">MA ÉRKEZIK</div>
        </div>
        <div className="kartya">
          <div className="ertek">{ft(szamok.eviBevetel)}</div>
          <div className="cimke">IDEI BEVÉTEL (KIFIZETVE)</div>
        </div>
      </div>

      <div className="eszkozsor">
        <div className="szurok">
          {SZUROK.map((s) => (
            <Link
              key={s.kulcs}
              href={`/admin?szuro=${s.kulcs}${kereses ? `&q=${encodeURIComponent(kereses)}` : ''}`}
              className={szuro === s.kulcs ? 'aktiv' : ''}
            >
              {s.nev}
            </Link>
          ))}
        </div>
        <form className="kereso" action="/admin" method="get">
          <input type="hidden" name="szuro" value={szuro} />
          <input
            type="search" name="q" defaultValue={kereses}
            placeholder="Név, e-mail, telefon vagy azonosító"
            aria-label="Keresés a foglalások között"
          />
          <button type="submit">Keresés</button>
        </form>
      </div>

      <div className="tabla-keret">
        {sorok.length === 0 ? (
          <div className="ures">
            Nincs megjeleníthető foglalás ebben a nézetben.
          </div>
        ) : (
          <table className="lista">
            <thead>
              <tr>
                <th>AZONOSÍTÓ</th>
                <th>HÁZ</th>
                <th>IDŐSZAK</th>
                <th>VENDÉG</th>
                <th>ELÉRHETŐSÉG</th>
                <th className="szam">ÖSSZEG</th>
                <th>STÁTUSZ</th>
                <th>FORRÁS</th>
              </tr>
            </thead>
            <tbody>
              {sorok.map((s) => (
                <tr key={s.id}>
                  <td>
                    <Link className="azon" href={`/admin/foglalas/${s.azonosito}`}>
                      {s.azonosito}
                    </Link>
                  </td>
                  <td>{s.haz_nev}</td>
                  <td>
                    {datumRovid(s.erkezes)}–{datumRovid(s.tavozas)}
                    <span className="halvany">
                      {' '}({ejszakak(s.erkezes, s.tavozas)} éj, {s.fo} fő)
                    </span>
                  </td>
                  <td>{s.vendeg_nev ?? '—'}</td>
                  <td>
                    {s.vendeg_email ? (
                      <a href={`mailto:${s.vendeg_email}`}>{s.vendeg_email}</a>
                    ) : '—'}
                    {s.vendeg_telefon && (
                      <>
                        <br />
                        <a className="halvany" href={`tel:${s.vendeg_telefon}`}>
                          {s.vendeg_telefon}
                        </a>
                      </>
                    )}
                  </td>
                  <td className="szam">{ft(s.vegosszeg)}</td>
                  <td>
                    <span className={`cimke ${s.statusz}`}>
                      {STATUSZ_NEV[s.statusz] ?? s.statusz}
                    </span>
                  </td>
                  <td>
                    <span className={`cimke ${s.forras}`}>
                      {FORRAS_NEV[s.forras] ?? s.forras}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
