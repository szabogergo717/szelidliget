import { utalvanyok } from '@/lib/adminAdat';
import { idopont } from '@/lib/adminFormat';
import { utalvanyKifizetve, utalvanyLemondva } from '@/app/admin/muveletek';

export const dynamic = 'force-dynamic';

function ft(n: number): string {
  return new Intl.NumberFormat('hu-HU').format(n) + ' Ft';
}

/**
 * Ajándékutalvány-vásárlások.
 *
 * A kártyás vásárlásokat a Barion zárja le magától: a kód a sikeres
 * fizetés után automatikusan megszületik és kimegy e-mailben.
 *
 * Az UTALÁSOS vásárlásokat viszont neked kell lezárni, mert a pénz
 * beérkezését a rendszer nem látja. A „Kifizetve" gomb adja ki a
 * kódot és küldi el a vevőnek.
 */
export default async function Utalvanyok() {
  const lista = await utalvanyok();
  const fuggo = lista.filter((u) => u.statusz === 'fuggoben');

  return (
    <>
      <h1>Ajándékutalványok</h1>
      <p className="alcim">
        {lista.length} vásárlás
        {fuggo.length > 0 && ` · ${fuggo.length} fizetésre vár`}
      </p>

      <div className="doboz" style={{ marginBottom: 22 }}>
        <h2>Mikor kell beavatkoznod</h2>
        <p style={{ fontSize: 14.5, color: 'var(--slate-soft)', lineHeight: 1.6 }}>
          A <strong>bankkártyás</strong> vásárlásokkal nincs dolgod: a Barion
          visszaigazolása után a kód magától megszületik és kimegy e-mailben.
        </p>
        <p style={{ fontSize: 14.5, color: 'var(--slate-soft)', lineHeight: 1.6, marginTop: 10 }}>
          Az <strong>utalásos</strong> vásárlások „fizetésre vár" állapotban
          maradnak, amíg a pénz meg nem érkezik a számlára. Amikor látod a
          banki kivonaton (a közlemény a rendelésszám), nyomd meg a
          <strong> Kifizetve</strong> gombot — ekkor adja ki a rendszer a kódot,
          és küldi el a vevőnek. A gombot kétszer megnyomni ártalmatlan:
          második kód nem születik.
        </p>
      </div>

      <div className="tabla-keret">
        {lista.length === 0 ? (
          <div className="ures">Még nem vásárolt senki ajándékutalványt.</div>
        ) : (
          <table className="tabla">
            <thead>
              <tr>
                <th>Rendelés</th>
                <th>Vevő</th>
                <th>Összeg</th>
                <th>Állapot</th>
                <th>Kód</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {lista.map((u) => (
                <tr key={u.id}>
                  <td>
                    <strong>{u.azonosito}</strong>
                    <br />
                    <span className="halvany">{idopont(u.letrehozva)}</span>
                  </td>
                  <td>
                    {u.nev}
                    <br />
                    <span className="halvany">{u.email}</span>
                    {u.ajandekozott && (
                      <>
                        <br />
                        <span className="halvany">Ajándék: {u.ajandekozott}</span>
                      </>
                    )}
                  </td>
                  <td>{ft(u.osszeg)}</td>
                  <td>
                    {u.statusz === 'kifizetve'
                      ? 'Kifizetve'
                      : u.statusz === 'lemondva'
                        ? 'Lemondva'
                        : 'Fizetésre vár'}
                  </td>
                  <td>
                    {u.kod ? (
                      <>
                        <code>{u.kod}</code>
                        <br />
                        <span className="halvany">
                          {u.kod_felhasznalva
                            ? `beváltva: ${idopont(u.kod_felhasznalva)}`
                            : `szabad · ${u.kod_ervenyes_ig}-ig`}
                        </span>
                      </>
                    ) : (
                      <span className="halvany">még nincs</span>
                    )}
                  </td>
                  <td>
                    {u.statusz !== 'kifizetve' && (
                      <form action={utalvanyKifizetve.bind(null, u.azonosito)}>
                        <button type="submit" className="gomb elsodleges">
                          Kifizetve
                        </button>
                      </form>
                    )}
                    {u.statusz === 'fuggoben' && (
                      <form
                        action={utalvanyLemondva.bind(null, u.azonosito)}
                        style={{ marginTop: 6 }}
                      >
                        <button type="submit" className="gomb veszely">
                          Lemondva
                        </button>
                      </form>
                    )}
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
