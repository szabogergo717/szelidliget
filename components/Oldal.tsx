import Image from 'next/image';
import Link from 'next/link';
import { T, type Nyelv, masikNyelvUt, utvonal } from '@/lib/tartalom';
import FoglaloUrlap, { type HazAdat, type ExtraAdat } from './FoglaloUrlap';

/**
 * A teljes főoldal, nyelvtől függetlenül. A magyar és az angol változat
 * ugyanezt a komponenst használja, csak más `nyelv` értékkel — így nem
 * tud szétcsúszni a kettő.
 *
 * Ez szerveroldali komponens: a Google kész HTML-t kap, nem üres vázat.
 * Csak a foglalóűrlap fut a böngészőben.
 */

function ft(n: number, nyelv: Nyelv): string {
  return new Intl.NumberFormat(nyelv === 'en' ? 'en-GB' : 'hu-HU').format(n) + ' Ft';
}

function Fejlec({ nyelv }: { nyelv: Nyelv }) {
  return (
    <header className="site-header">
      <div className="nav">
        <Link className="brand" href={utvonal(nyelv)}>
          <Image src="/logo-mark.png" alt="" width={120} height={69} priority />
          <span>SZELID LIGET</span>
        </Link>
        <nav className="nav-links">
          <Link href="#hazak">{T.menuHazak[nyelv]}</Link>
          <Link href="#foglalas">{T.menuFoglalas[nyelv]}</Link>
          <Link href="#kornyek">{T.menuKornyek[nyelv]}</Link>
          <Link href="#gyik">{T.menuGyik[nyelv]}</Link>
          <Link href="#kapcsolat">{T.menuKapcsolat[nyelv]}</Link>
        </nav>
        <div className="nav-right">
          <div className="lang">
            <Link href="/" className={nyelv === 'hu' ? 'active' : ''} hrefLang="hu">HU</Link>
            <Link href="/en" className={nyelv === 'en' ? 'active' : ''} hrefLang="en">EN</Link>
          </div>
          <Link href="#foglalas" className="btn small">{T.gombFoglalas[nyelv]}</Link>
        </div>
      </div>
    </header>
  );
}

function Lablec({ nyelv }: { nyelv: Nyelv }) {
  return (
    <footer className="site-footer">
      <div className="wrap foot">
        <Link className="brand foot-brand" href={utvonal(nyelv)}>
          <Image src="/logo-mark-light.png" alt="" width={110} height={63} />
          <span>SZELID LIGET</span>
        </Link>
        <ul>
          <li><Link href="#">{T.lablecAszf[nyelv]}</Link></li>
          <li><Link href="#">{T.lablecAdatvedelem[nyelv]}</Link></li>
          <li><Link href="#">{T.lablecImpresszum[nyelv]}</Link></li>
        </ul>
        <div>© {new Date().getFullYear()} Szelid Liget</div>
      </div>
    </footer>
  );
}

function FugeAg() {
  return (
    <svg className="botany" viewBox="0 0 220 200" aria-hidden="true">
      <path d="M110,196 C110,150 108,120 104,92" />
      <path d="M104,92 C86,74 60,70 42,78 C56,96 82,102 104,92Z" />
      <path d="M104,92 C122,70 150,64 170,72 C156,94 128,104 104,92Z" />
      <path d="M108,132 C92,118 70,116 54,124 C68,140 92,144 108,132Z" />
      <path d="M109,150 C126,136 150,134 164,142 C150,158 126,162 109,150Z" />
      <path d="M42,78 C52,82 62,86 72,86 M170,72 C160,78 148,84 136,86 M54,124 C64,127 74,130 86,130 M164,142 C152,146 140,149 128,149" />
      <circle cx="146" cy="112" r="15" />
      <path d="M146,97 L146,90 M141,90 C144,86 148,86 151,90" />
      <circle cx="76" cy="160" r="12" />
      <path d="M76,148 L76,142 M72,142 C74,139 78,139 80,142" />
    </svg>
  );
}

function MandulaAg() {
  return (
    <svg className="botany" viewBox="0 0 220 200" aria-hidden="true">
      <path d="M40,190 C74,168 100,140 122,104 C136,80 146,54 150,30" />
      <path d="M88,146 C78,130 60,122 44,124 C52,142 70,152 88,146Z" />
      <path d="M112,114 C108,94 94,80 78,76 C80,96 94,110 112,114Z" />
      <path d="M126,92 C140,80 162,78 176,84 C164,100 142,104 126,92Z" />
      <g className="bloom">
        <circle cx="150" cy="52" r="7" /><circle cx="164" cy="44" r="7" />
        <circle cx="164" cy="60" r="7" /><circle cx="178" cy="52" r="7" />
        <circle cx="164" cy="52" r="3.4" className="core" />
      </g>
      <g className="bloom">
        <circle cx="88" cy="58" r="6" /><circle cx="100" cy="50" r="6" />
        <circle cx="100" cy="66" r="6" /><circle cx="112" cy="58" r="6" />
        <circle cx="100" cy="58" r="3" className="core" />
      </g>
      <path d="M150,30 C152,24 156,20 162,18" />
    </svg>
  );
}

function Hazkartya({
  haz, nyelv, cimke, alcim, leiras, halo, felszereltseg, abra,
}: {
  haz: HazAdat; nyelv: Nyelv; cimke: string; alcim: string;
  leiras: string; halo: string; felszereltseg: string; abra: React.ReactNode;
}) {
  return (
    <article className="cabin">
      <div className="cabin-art">
        <span className="cabin-badge">{cimke}</span>
        {abra}
      </div>
      <div className="cabin-body">
        <h3>{haz.nev}</h3>
        <div className="cabin-tagline">{alcim}</div>
        <p>{leiras}</p>
        <table className="specs">
          <tbody>
            <tr>
              <td>{T.specVendegek[nyelv]}</td>
              <td>2–{haz.max_fo} {T.fo[nyelv]}</td>
            </tr>
            <tr><td>{T.specHalo[nyelv]}</td><td>{halo}</td></tr>
            <tr><td>{T.specFelszereltseg[nyelv]}</td><td>{felszereltseg}</td></tr>
            <tr>
              <td>{T.specMinimum[nyelv]}</td>
              <td>{haz.min_ejszaka} {T.ejszakaTol[nyelv]}</td>
            </tr>
          </tbody>
        </table>
        <div className="cabin-foot">
          <div className="price">
            <span>{T.arEttol[nyelv]}</span>
            <strong>{ft(haz.alap_ar, nyelv)}</strong>
          </div>
          <Link href="#foglalas" className="btn small">{T.gombFoglalom[nyelv]}</Link>
        </div>
      </div>
    </article>
  );
}

export default function Oldal({
  nyelv, hazak, extrak,
}: {
  nyelv: Nyelv; hazak: HazAdat[]; extrak: ExtraAdat[];
}) {
  const fuge = hazak.find((h) => h.slug === 'fuge');
  const mandula = hazak.find((h) => h.slug === 'mandula');
  const maxFo = Math.max(...hazak.map((h) => h.max_fo), 0);
  const minFo = Math.min(...hazak.map((h) => h.max_fo), maxFo);

  return (
    <>
      <Fejlec nyelv={nyelv} />

      <section className="hero" id="top">
        <div className="wrap">
          <Image
            className="hero-logo" src="/logo-transparent.png"
            alt="Szelid Liget" width={760} height={452} priority
          />
          <h1>{T.heroCim[nyelv]}</h1>
          <p className="hero-sub">{T.heroAlcim[nyelv]}</p>
          <div className="hero-cta">
            <Link href="#foglalas" className="btn">{T.heroGombSzabad[nyelv]}</Link>
            <Link href="#hazak" className="btn ghost">{T.heroGombHazak[nyelv]}</Link>
          </div>
        </div>

        <svg className="waves" viewBox="0 0 1200 90" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0,34 C150,14 270,54 420,34 C570,14 690,54 840,34 C990,14 1110,54 1200,38" />
          <path d="M0,54 C160,34 280,74 430,54 C580,34 700,74 850,54 C1000,34 1120,74 1200,58" />
          <path d="M60,72 C200,54 320,90 470,72 C620,54 740,90 890,72 C1020,56 1120,84 1180,76" />
        </svg>

        <div className="facts">
          <div className="fact"><strong>{hazak.length}</strong><span>{T.tenyHazak[nyelv]}</span></div>
          <div className="fact"><strong>{minFo}–{maxFo}</strong><span>{T.tenyFo[nyelv]}</span></div>
          <div className="fact"><strong>2</strong><span>{T.tenyViz[nyelv]}</span></div>
          <div className="fact"><strong>24ó</strong><span>{T.tenyVisszaigazolas[nyelv]}</span></div>
        </div>
      </section>

      <section className="cabins" id="hazak">
        <div className="wrap">
          <div className="head">
            <div className="label">{T.hazakCimke[nyelv]}</div>
            <h2>{T.hazakCim[nyelv]}</h2>
            <p>{T.hazakBevezeto[nyelv]}</p>
          </div>

          {fuge && (
            <Hazkartya
              haz={fuge} nyelv={nyelv}
              cimke={T.fugeCimke[nyelv]} alcim={T.fugeAlcim[nyelv]}
              leiras={T.fugeLeiras[nyelv]} halo={T.fugeHalo[nyelv]}
              felszereltseg={T.fugeFelszereltseg[nyelv]} abra={<FugeAg />}
            />
          )}
          {mandula && (
            <Hazkartya
              haz={mandula} nyelv={nyelv}
              cimke={T.mandulaCimke[nyelv]} alcim={T.mandulaAlcim[nyelv]}
              leiras={T.mandulaLeiras[nyelv]} halo={T.mandulaHalo[nyelv]}
              felszereltseg={T.mandulaFelszereltseg[nyelv]} abra={<MandulaAg />}
            />
          )}
        </div>
      </section>

      <section id="foglalas">
        <div className="wrap">
          <div className="head">
            <div className="label">{T.foglalasCimke[nyelv]}</div>
            <h2>{T.foglalasCim[nyelv]}</h2>
            <p>{T.foglalasBevezeto[nyelv]}</p>
          </div>
          <FoglaloUrlap hazak={hazak} extrak={extrak} nyelv={nyelv} />
        </div>
      </section>

      <section className="band">
        <div className="wrap">
          <div className="head">
            <div className="label">{T.folyamatCimke[nyelv]}</div>
            <h2>{T.folyamatCim[nyelv]}</h2>
            <p>{T.folyamatBevezeto[nyelv]}</p>
          </div>
          <div className="steps">
            {([
              ['01', T.lepes1Cim[nyelv], T.lepes1[nyelv]],
              ['02', T.lepes2Cim[nyelv], T.lepes2[nyelv]],
              ['03', T.lepes3Cim[nyelv], T.lepes3[nyelv]],
              ['04', T.lepes4Cim[nyelv], T.lepes4[nyelv]],
            ] as const).map(([n, cim, szoveg]) => (
              <div className="step" key={n}>
                <div className="n">{n}</div>
                <h3>{cim}</h3>
                <p>{szoveg}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="kornyek">
        <div className="wrap">
          <div className="head">
            <div className="label">{T.kornyekCimke[nyelv]}</div>
            <h2>{T.kornyekCim[nyelv]}</h2>
          </div>
          <div className="steps">
            {([
              [T.kornyek1Cimke[nyelv], T.kornyek1Cim[nyelv], T.kornyek1[nyelv]],
              [T.kornyek2Cimke[nyelv], T.kornyek2Cim[nyelv], T.kornyek2[nyelv]],
              [T.kornyek3Cimke[nyelv], T.kornyek3Cim[nyelv], T.kornyek3[nyelv]],
              [T.kornyek4Cimke[nyelv], T.kornyek4Cim[nyelv], T.kornyek4[nyelv]],
            ] as const).map(([cimke, cim, szoveg]) => (
              <div className="step" key={cimke}>
                <div className="n">{cimke}</div>
                <h3>{cim}</h3>
                <p>{szoveg}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="band" id="gyik">
        <div className="wrap">
          <div className="head">
            <div className="label">{T.gyikCimke[nyelv]}</div>
            <h2>{T.gyikCim[nyelv]}</h2>
          </div>
          <div style={{ maxWidth: 780 }}>
            {([
              [T.gyik1K[nyelv], T.gyik1V[nyelv], true],
              [T.gyik2K[nyelv], T.gyik2V[nyelv], false],
              [T.gyik3K[nyelv], T.gyik3V[nyelv], false],
              [T.gyik4K[nyelv], T.gyik4V[nyelv], false],
            ] as const).map(([k, v, nyitva]) => (
              <details key={k} open={nyitva}>
                <summary><span>{k}</span><span className="pm">+</span></summary>
                <p>{v}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="contact" id="kapcsolat">
        <div className="wrap">
          <div className="contact-grid">
            <div>
              <div className="label">{T.kapcsolatCimke[nyelv]}</div>
              <h2>{T.kapcsolatCim[nyelv]}</h2>
              <p className="lead">{T.kapcsolatBevezeto[nyelv]}</p>
              <div className="cd">
                <span className="k">{T.kapcsEmail[nyelv]}</span>
                <span>foglalas@szelidliget.hu</span>
              </div>
              <div className="cd">
                <span className="k">WEB</span>
                <span>www.szelidliget.hu</span>
              </div>
              <div className="cd">
                <span className="k">{T.kapcsErkezes[nyelv]}</span>
                <span>{T.kapcsErkezesErtek[nyelv]}</span>
              </div>
            </div>
            <div className="map"><span>{T.terkepHelye[nyelv]}</span></div>
          </div>
        </div>
      </section>

      <Lablec nyelv={nyelv} />
    </>
  );
}
