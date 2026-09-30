import Link from 'next/link';
import Image from 'next/image';
import { T, CEG, type Nyelv, utvonal } from '@/lib/tartalom';
import type { JogiOldal as JogiOldalAdat } from '@/lib/jogi';

/** Közös keret a jogi oldalakhoz: egyszerű, olvasható, nyomtatható. */
export default function JogiOldal({
  nyelv, adat,
}: {
  nyelv: Nyelv; adat: JogiOldalAdat;
}) {
  return (
    <>
      <header className="site-header">
        <div className="nav">
          <Link className="brand" href={utvonal(nyelv)}>
            <Image src="/logo-mark.png" alt="" width={120} height={69} priority />
            <span>SZELID LIGET</span>
          </Link>
          <div className="nav-right">
            <div className="lang">
              <Link href="/" className={nyelv === 'hu' ? 'active' : ''} hrefLang="hu">HU</Link>
              <Link href="/en" className={nyelv === 'en' ? 'active' : ''} hrefLang="en">EN</Link>
            </div>
            <Link href={utvonal(nyelv)} className="btn small ghost">
              {T.fooldalra[nyelv]}
            </Link>
          </div>
        </div>
      </header>

      <main className="jogi">
        <div className="wrap">
          <h1>{adat.cim}</h1>
          <p className="jogi-frissitve">
            {nyelv === 'hu' ? 'Hatályos' : 'Effective'}: {adat.frissitve}
          </p>

          {adat.blokkok.map((b, i) => (
            <section className="jogi-blokk" key={i}>
              {b.cim && <h2>{b.cim}</h2>}
              {b.szoveg.map((s, j) => (
                <p key={j}>{s}</p>
              ))}
            </section>
          ))}

          <p className="jogi-labl">
            {CEG.nev} · {CEG.cim} ·{' '}
            <a href={`mailto:${CEG.email}`}>{CEG.email}</a>
          </p>
        </div>
      </main>
    </>
  );
}
