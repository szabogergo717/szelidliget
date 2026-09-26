import Link from 'next/link';
import Image from 'next/image';
import { T, type Nyelv, utvonal } from '@/lib/tartalom';

/**
 * A fizetés utáni visszatérő oldalak közös váza.
 *
 * FONTOS: ez az oldal csak TÁJÉKOZTAT. A foglalás állapotát nem innen
 * állítjuk — azt kizárólag a SimplePay szerverétől érkező, aláírt IPN
 * üzenet dönti el. Ezt a címet bárki megnyithatja a böngészőjében,
 * ezért semmilyen következtetést nem vonunk le belőle.
 */

type Jelleg = 'ok' | 'bad' | 'warn';

function Jel({ jelleg }: { jelleg: Jelleg }) {
  return (
    <svg className={`allapot-jel ${jelleg}`} viewBox="0 0 48 48" aria-hidden="true">
      <circle cx="24" cy="24" r="20" />
      {jelleg === 'ok' && <path d="M15,24.5 L21.5,31 L33,19" />}
      {jelleg === 'bad' && <path d="M17,17 L31,31 M31,17 L17,31" />}
      {jelleg === 'warn' && <path d="M24,14 L24,26 M24,32.5 L24,33" />}
    </svg>
  );
}

export default function Allapot({
  nyelv, jelleg, cim, szoveg, azonosito, megjegyzes,
}: {
  nyelv: Nyelv;
  jelleg: Jelleg;
  cim: string;
  szoveg: string;
  azonosito?: string;
  megjegyzes?: string;
}) {
  return (
    <>
      <header className="site-header">
        <div className="nav">
          <Link className="brand" href={utvonal(nyelv)}>
            <Image src="/logo-mark.png" alt="" width={120} height={69} priority />
            <span>SZELID LIGET</span>
          </Link>
        </div>
      </header>

      <main className="allapot">
        <div className="wrap">
          <div className="allapot-doboz">
            <Jel jelleg={jelleg} />
            <h1>{cim}</h1>
            <p>{szoveg}</p>

            {azonosito && (
              <div>
                <span className="ref-cimke">{T.sikerAzonosito[nyelv]}</span>
                <span className="ref">{azonosito}</span>
              </div>
            )}

            {megjegyzes && (
              <p style={{ fontSize: 14.5, marginTop: 18 }}>{megjegyzes}</p>
            )}

            <div className="allapot-gombok">
              <Link href={utvonal(nyelv) + '#foglalas'} className="btn">
                {T.vissza[nyelv]}
              </Link>
              <Link href={utvonal(nyelv)} className="btn ghost">
                {T.fooldalra[nyelv]}
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
