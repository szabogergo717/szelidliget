import Link from 'next/link';
import Image from 'next/image';
import { T, type Nyelv, utvonal } from '@/lib/tartalom';
import UtalvanyUrlap from './UtalvanyUrlap';
import UtalasiAdatok from './UtalasiAdatok';
import { utalasiAdatok } from '@/lib/utalas';

/**
 * Az ajándékutalvány vásárlási oldala.
 *
 * Szándékosan csupasz: egy fejléc, az ajánlat, és az űrlap. Aki
 * idáig eljutott, az már tudja, mit akar — a meggyőzés a főoldal
 * dolga, nem ezé.
 */
export default function UtalvanyOldal({
  nyelv,
  siker = false,
  utalas = false,
  azonosito,
}: {
  nyelv: Nyelv;
  siker?: boolean;
  /** Utalásos rendelésnél más a folytatás, ezért más a szöveg is. */
  utalas?: boolean;
  /** A rendelésszám — ez megy a közlemény rovatba. */
  azonosito?: string;
}) {
  return (
    <>
      <header className="site-header">
        <div className="nav">
          <Link className="brand" href={utvonal(nyelv)}>
            <Image src="/logo-mark.png" alt="" width={728} height={421} priority />
            <span>SZELID LIGET</span>
          </Link>
          <div className="nav-right">
            <Link href={utvonal(nyelv)} className="btn small ghost">
              {T.fooldalra[nyelv]}
            </Link>
          </div>
        </div>
      </header>

      <main className="utalvany-oldal">
        <div className="wrap">
          <div className="label">{T.utalvanyCimke[nyelv]}</div>
          <h1>
            {!siker
              ? T.utalvanyCim[nyelv]
              : utalas
                ? T.utalvanySikerUtalasCim[nyelv]
                : T.utalvanySikerCim[nyelv]}
          </h1>
          <p className="lead">
            {!siker
              ? T.utalvanyAlcim[nyelv]
              : utalas
                ? T.utalvanySikerUtalas[nyelv]
                : T.utalvanySikerSzoveg[nyelv]}
          </p>

          {siker ? (
            <>
              {utalas && (
                <UtalasiAdatok
                  adat={utalasiAdatok()}
                  kozlemeny={azonosito}
                  nyelv={nyelv}
                />
              )}
              <Link href={utvonal(nyelv)} className="btn" style={{ marginTop: 22 }}>
                {T.fooldalra[nyelv]}
              </Link>
            </>
          ) : (
            <UtalvanyUrlap nyelv={nyelv} utalas={utalasiAdatok()} />
          )}
        </div>
      </main>
    </>
  );
}
