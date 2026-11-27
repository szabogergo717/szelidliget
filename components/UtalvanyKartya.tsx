import Link from 'next/link';
import { T, type Nyelv, utvonal } from '@/lib/tartalom';
import { UTALVANY } from '@/lib/utalvany';

/**
 * Az ajándékutalvány ajánlója a foglalóűrlap fizetési szakasza mellett.
 *
 * Korábban ez egy halk link volt a kuponmező alatt, és elveszett. Itt
 * egy önálló kártya, a fizetési blokk mellett lévő üres sávban — ott,
 * ahol a vendég úgyis a fizetésre gondol.
 *
 * ÜNNEPI VÁLTOZAT
 * November közepétől vízkeresztig ünnepi arcot kap: mélyzöld alap,
 * arany keret, egy fenyőág-motívum. A többi hónapban a ház szokásos
 * okker színeit viseli — egy júliusi fenyőágas kártya olcsónak hatna.
 *
 * A FELIRAT viszont mindkét változatban „Nyitási akció": az ajánlat
 * nem karácsonyi, hanem a nyitáshoz kötődik, és januárban is él.
 * Csak a megjelenés ünnepi, a tartalom nem.
 *
 * A váltás a SZERVEREN dől el, a dátum alapján, és nincs hozzá
 * beállítás: magától jön és magától megy.
 */

/** Ünnepi időszak: november 15. – január 6. */
function unnepiE(ma = new Date()): boolean {
  const ho = ma.getMonth() + 1;
  const nap = ma.getDate();
  if (ho === 12) return true;
  if (ho === 11 && nap >= 15) return true;
  if (ho === 1 && nap <= 6) return true;
  return false;
}

function ft(n: number, nyelv: Nyelv): string {
  return new Intl.NumberFormat(nyelv === 'en' ? 'en-GB' : 'hu-HU').format(n) + ' Ft';
}

/** Fenyőág — vékony vonalas rajz, a logó kézjegyéhez illően. */
function Fenyoag() {
  return (
    <svg className="uk-motivum" viewBox="0 0 120 160" aria-hidden="true">
      <path d="M60,150 L60,34" />
      <path d="M60,44 L30,62 M60,44 L90,62" />
      <path d="M60,66 L26,88 M60,66 L94,88" />
      <path d="M60,90 L22,114 M60,90 L98,114" />
      <path d="M60,114 L30,134 M60,114 L90,134" />
      <path d="M60,34 L54,24 M60,34 L66,24" />
      <circle cx="60" cy="18" r="5" />
    </svg>
  );
}

export default function UtalvanyKartya({ nyelv }: { nyelv: Nyelv }) {
  const unnepi = unnepiE();

  return (
    <aside className={`utalvany-kartya-ajanlo${unnepi ? ' unnepi' : ''}`}>
      {unnepi && <Fenyoag />}

      {/* A felirat mindig ugyanaz: az ajánlat a nyitáshoz kötődik,
          nem az ünnephez. Csak a megjelenés váltakozik. */}
      <div className="uk-cimke">{T.utalvanyUnnepiCimke[nyelv]}</div>

      <h3 className="uk-cim">{T.utalvanyKartyaCim[nyelv]}</h3>

      <p className="uk-szoveg">{T.utalvanyKartyaSzoveg[nyelv]}</p>

      <div className="uk-ar">
        <span className="uk-ar-szam">{ft(UTALVANY.ar, nyelv)}</span>
        <span className="uk-ar-alatt">{T.utalvanyKartyaAr[nyelv]}</span>
      </div>

      <Link href={utvonal(nyelv, '/utalvany')} className="uk-gomb">
        {T.utalvanyKartyaGomb[nyelv]}
      </Link>

      <p className="uk-labjegyzet">{T.utalvanyKartyaLab[nyelv]}</p>
    </aside>
  );
}
