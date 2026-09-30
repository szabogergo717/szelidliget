import { feliratkozok } from '@/lib/adminAdat';
import { idopont } from '@/lib/adminFormat';

export const dynamic = 'force-dynamic';

export default async function Hirlevel() {
  const lista = await feliratkozok();
  const aktiv = lista.filter((f) => !f.leiratkozott);

  return (
    <>
      <h1>Hírlevél-feliratkozók</h1>
      <p className="alcim">
        {aktiv.length} aktív feliratkozó
        {lista.length > aktiv.length && ` · ${lista.length - aktiv.length} leiratkozott`}
      </p>

      <div className="doboz" style={{ marginBottom: 22 }}>
        <h2>Mielőtt levelet küldesz</h2>
        <p style={{ fontSize: 14.5, color: 'var(--slate-soft)', lineHeight: 1.6 }}>
          Ez a lista <strong>nem azonos</strong> a foglalók listájával.
          Csak azok szerepelnek rajta, akik a foglaláskor külön bepipálták,
          hogy kérnek hírlevelet. A foglalók többi részének marketing
          levelet küldeni GDPR-sértés.
        </p>
        <p style={{ fontSize: 14.5, color: 'var(--slate-soft)', lineHeight: 1.6, marginTop: 10 }}>
          A kiküldéshez a Resend <em>Audiences</em> és <em>Broadcasts</em>
          {' '}funkciója való: a leiratkozást automatikusan kezeli, és
          minden levélbe leiratkozó linket tesz. A lenti listát CSV-be
          exportálva importálhatod oda.
        </p>
      </div>

      <div className="tabla-keret">
        {lista.length === 0 ? (
          <div className="ures">
            Még senki nem iratkozott fel.
            <br />
            <span className="halvany">
              Ha a lista üresnek tűnik, de már volt feliratkozás, ellenőrizd,
              hogy lefutott-e a <code>002_hirlevel.sql</code> az adatbázison.
            </span>
          </div>
        ) : (
          <table className="lista">
            <thead>
              <tr>
                <th>E-MAIL</th>
                <th>NÉV</th>
                <th>NYELV</th>
                <th>HOZZÁJÁRULÁS IDEJE</th>
                <th>ÁLLAPOT</th>
              </tr>
            </thead>
            <tbody>
              {lista.map((f) => (
                <tr key={f.email}>
                  <td><a href={`mailto:${f.email}`}>{f.email}</a></td>
                  <td>{f.nev ?? '—'}</td>
                  <td>{f.nyelv === 'en' ? 'Angol' : 'Magyar'}</td>
                  <td className="halvany">{idopont(f.hozzajarulas_ideje)}</td>
                  <td>
                    <span className={`cimke ${f.leiratkozott ? 'lemondva' : 'kifizetve'}`}>
                      {f.leiratkozott ? 'Leiratkozott' : 'Aktív'}
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
