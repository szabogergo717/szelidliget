import Image from 'next/image';
import Link from 'next/link';
import {
  T, CEG, SOCIAL, KORNYEK, lista, type Nyelv, utvonal,
} from '@/lib/tartalom';
import FoglaloUrlap, { type HazAdat, type ExtraAdat } from './FoglaloUrlap';
import Terkep from './Terkep';
import HirlevelDoboz from './HirlevelDoboz';

/**
 * A teljes főoldal, nyelvtől függetlenül. A magyar és az angol változat
 * ugyanezt a komponenst használja, csak más `nyelv` értékkel — így nem
 * tud szétcsúszni a kettő.
 *
 * Ez szerveroldali komponens: a Google kész HTML-t kap, nem üres vázat.
 * Csak a foglalóűrlap, a térkép és a hírlevél-doboz fut a böngészőben.
 */

function ft(n: number, nyelv: Nyelv): string {
  return new Intl.NumberFormat(nyelv === 'en' ? 'en-GB' : 'hu-HU').format(n) + ' Ft';
}

function Fejlec({ nyelv }: { nyelv: Nyelv }) {
  return (
    <header className="site-header">
      <div className="nav">
        <Link className="brand" href={utvonal(nyelv)}>
          <Image src="/logo-mark.png" alt="" width={695} height={400} priority />
          <span>SZELID LIGET</span>
        </Link>
        <nav className="nav-links">
          <Link href="#hazak">{T.menuHazak[nyelv]}</Link>
          <Link href="#szolgaltatasok">{T.menuSzolgaltatasok[nyelv]}</Link>
          <Link href="#foglalas">{T.menuFoglalas[nyelv]}</Link>
          <Link href="#kornyek">{T.menuKornyek[nyelv]}</Link>
          <Link href="#rolunk">{T.menuRolunk[nyelv]}</Link>
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

function SocialLinkek() {
  const elemek = [
    { kulcs: 'facebook', url: SOCIAL.facebook, nev: 'Facebook' },
    { kulcs: 'instagram', url: SOCIAL.instagram, nev: 'Instagram' },
    { kulcs: 'tiktok', url: SOCIAL.tiktok, nev: 'TikTok' },
  ].filter((e) => e.url);

  if (elemek.length === 0) return null;

  return (
    <div className="social">
      {elemek.map((e) => (
        <a key={e.kulcs} href={e.url} target="_blank" rel="noreferrer" className="social-link">
          {e.nev}
        </a>
      ))}
    </div>
  );
}

function Lablec({ nyelv }: { nyelv: Nyelv }) {
  return (
    <footer className="site-footer">
      <div className="wrap foot">
        <div className="foot-bal">
          <Link className="brand foot-brand" href={utvonal(nyelv)}>
            <Image src="/logo-mark-light.png" alt="" width={620} height={356} />
            <span>SZELID LIGET</span>
          </Link>
          <p className="foot-ceg">
            {CEG.nev}
            {CEG.adoszam && <><br />Adószám: {CEG.adoszam}</>}
            {CEG.szekhely && <><br />Székhely: {CEG.szekhely}</>}
            <br />{CEG.cim}
          </p>
        </div>
        <ul className="foot-linkek">
          <li><Link href={utvonal(nyelv, '/aszf')}>{T.lablecAszf[nyelv]}</Link></li>
          <li><Link href={utvonal(nyelv, '/adatvedelem')}>{T.lablecAdatvedelem[nyelv]}</Link></li>
          <li><Link href={utvonal(nyelv, '/hazirend')}>{T.lablecHazirend[nyelv]}</Link></li>
          <li><Link href={utvonal(nyelv, '/impresszum')}>{T.lablecImpresszum[nyelv]}</Link></li>
        </ul>
        <div className="foot-jobb">
          <SocialLinkek />
          <div className="foot-copy">© {new Date().getFullYear()} {CEG.nev}</div>
        </div>
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
        {/* A valódi fotók helye. Amint megvannak, ide kerülnek. */}
        <span className="kep-helye">{T.kepekHelye[nyelv]}</span>
      </div>
      <div className="cabin-body">
        <h3>{haz.nev}</h3>
        <div className="cabin-tagline">{alcim}</div>
        <p>{leiras}</p>
        <table className="specs">
          <tbody>
            <tr>
              <td>{T.specVendegek[nyelv]}</td>
              <td>{haz.max_fo} {T.fo[nyelv]}</td>
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

function SzolgOszlop({ cim, elemek }: { cim: string; elemek: string[] }) {
  return (
    <div className="szolg-oszlop">
      <h3>{cim}</h3>
      <ul>
        {elemek.map((e) => <li key={e}>{e}</li>)}
      </ul>
    </div>
  );
}

export default function Oldal({
  nyelv, hazak, extrak,
}: {
  nyelv: Nyelv; hazak: HazAdat[]; extrak: ExtraAdat[];
}) {
  const videoVan = process.env.NEXT_PUBLIC_HERO_VIDEO === '1';

  const fuge = hazak.find((h) => h.slug === 'fuge');
  const mandula = hazak.find((h) => h.slug === 'mandula');
  const maxFo = Math.max(...hazak.map((h) => h.max_fo), 0);

  return (
    <>
      <Fejlec nyelv={nyelv} />

      <section className={`hero${videoVan ? ' hero-video' : ''}`} id="top">
        {videoVan && (
          <div className="hero-media" aria-hidden="true">
            <video autoPlay muted loop playsInline preload="metadata" poster="/hero-poster.jpg">
              <source src="/hero.mp4" type="video/mp4" />
            </video>
            <div className="hero-fatyol" />
          </div>
        )}

        <div className="wrap">
          <Image
            className="hero-logo"
            src={videoVan ? '/logo-light.png' : '/logo-transparent.png'}
            alt="Szelid Liget"
            width={869}
            height={517}
            sizes="(max-width: 600px) 72vw, 420px"
            priority
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
          <div className="fact"><strong>{maxFo}</strong><span>{T.tenyFo[nyelv]}</span></div>
          <div className="fact"><strong>5</strong><span>{T.tenyViz[nyelv]}</span></div>
          <div className="fact"><strong>24</strong><span>{T.tenyVisszaigazolas[nyelv]}</span></div>
        </div>
      </section>

      {/* ---------- Faházak ---------- */}
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

      {/* ---------- Szolgáltatások ---------- */}
      <section id="szolgaltatasok">
        <div className="wrap">
          <div className="head">
            <div className="label">{T.szolgCimke[nyelv]}</div>
            <h2>{T.szolgCim[nyelv]}</h2>
            <p>{T.szolgBevezeto[nyelv]}</p>
          </div>
          <div className="szolg-racs">
            <SzolgOszlop cim={T.szolgKiemeltCim[nyelv]} elemek={lista(T.szolgKiemelt[nyelv])} />
            <SzolgOszlop cim={T.szolgLakterCim[nyelv]} elemek={lista(T.szolgLakter[nyelv])} />
            <SzolgOszlop cim={T.szolgKonyhaCim[nyelv]} elemek={lista(T.szolgKonyha[nyelv])} />
          </div>
        </div>
      </section>

      {/* ---------- Foglalás ---------- */}
      <section className="band" id="foglalas">
        <div className="wrap">
          <div className="head">
            <div className="label">{T.foglalasCimke[nyelv]}</div>
            <h2>{T.foglalasCim[nyelv]}</h2>
            <p>{T.foglalasBevezeto[nyelv]}</p>
          </div>
          <FoglaloUrlap hazak={hazak} extrak={extrak} nyelv={nyelv} />
        </div>
      </section>

      {/* ---------- Környék ---------- */}
      <section id="kornyek">
        <div className="wrap">
          <div className="head">
            <div className="label">{T.kornyekCimke[nyelv]}</div>
            <h2>{T.kornyekCim[nyelv]}</h2>
            <p>{T.kornyekBevezeto[nyelv]}</p>
          </div>
          <div className="kornyek-racs">
            {KORNYEK.map((k) => (
              <article className="kornyek-elem" key={k.cim.hu}>
                <div className="n">{k.cimke[nyelv]}</div>
                <h3>{k.cim[nyelv]}</h3>
                <p>{k.szoveg[nyelv]}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Rólunk ---------- */}
      <section className="rolunk band" id="rolunk">
        <div className="wrap">
          <div className="rolunk-racs">
            <div>
              <div className="label">{T.rolunkCimke[nyelv]}</div>
              <h2>{T.rolunkCim[nyelv]}</h2>
            </div>
            <div className="rolunk-szoveg">
              <p>{T.rolunk1[nyelv]}</p>
              <p>{T.rolunk2[nyelv]}</p>
              <p>{T.rolunk3[nyelv]}</p>
              <p>{T.rolunk4[nyelv]}</p>
              <p className="rolunk-kiemeles">{T.rolunkKiemeles[nyelv]}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Házirend ---------- */}
      <section id="hazirend">
        <div className="wrap">
          <div className="head">
            <div className="label">{T.hazirendCimke[nyelv]}</div>
            <h2>{T.hazirendCim[nyelv]}</h2>
            <p>{T.hazirendBevezeto[nyelv]}</p>
          </div>
          <div className="hazirend-racs">
            {([
              [T.hazirend1Cim[nyelv], T.hazirend1[nyelv]],
              [T.hazirend2Cim[nyelv], T.hazirend2[nyelv]],
              [T.hazirend3Cim[nyelv], T.hazirend3[nyelv]],
              [T.hazirend4Cim[nyelv], T.hazirend4[nyelv]],
            ] as const).map(([cim, szoveg]) => (
              <div className="hazirend-elem" key={cim}>
                <h3>{cim}</h3>
                <p>{szoveg}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- GyIK ---------- */}
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
              [T.gyik5K[nyelv], T.gyik5V[nyelv], false],
              [T.gyik6K[nyelv], T.gyik6V[nyelv], false],
            ] as const).map(([k, v, nyitva]) => (
              <details key={k} open={nyitva}>
                <summary><span>{k}</span><span className="pm">+</span></summary>
                <p>{v}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Hírlevél ---------- */}
      <section id="hirlevel">
        <div className="wrap">
          <HirlevelDoboz nyelv={nyelv} />
        </div>
      </section>

      {/* ---------- Kapcsolat és térkép ---------- */}
      <section className="contact" id="kapcsolat">
        <div className="wrap">
          <div className="contact-grid">
            <div>
              <div className="label">{T.kapcsolatCimke[nyelv]}</div>
              <h2>{T.kapcsolatCim[nyelv]}</h2>
              <p className="lead">{T.kapcsolatBevezeto[nyelv]}</p>

              <div className="cd">
                <span className="k">{T.kapcsEmail[nyelv]}</span>
                <span><a href={`mailto:${CEG.email}`}>{CEG.email}</a></span>
              </div>
              {CEG.telefon && (
                <div className="cd">
                  <span className="k">{T.kapcsTelefon[nyelv]}</span>
                  <span><a href={`tel:${CEG.telefon.replace(/\s/g, '')}`}>{CEG.telefon}</a></span>
                </div>
              )}
              <div className="cd">
                <span className="k">{T.kapcsCim[nyelv]}</span>
                <span>{CEG.cim}</span>
              </div>
              <div className="cd">
                <span className="k">{T.kapcsErkezes[nyelv]}</span>
                <span>{T.kapcsErkezesErtek[nyelv]}</span>
              </div>
              <div className="cd">
                <span className="k">{T.kapcsTavozas[nyelv]}</span>
                <span>{T.kapcsTavozasErtek[nyelv]}</span>
              </div>

              {(SOCIAL.facebook || SOCIAL.instagram || SOCIAL.tiktok) && (
                <div className="cd" style={{ alignItems: 'center' }}>
                  <span className="k">{T.socialCim[nyelv].toUpperCase()}</span>
                  <SocialLinkek />
                </div>
              )}
            </div>

            <Terkep nyelv={nyelv} />
          </div>
        </div>
      </section>

      <Lablec nyelv={nyelv} />
    </>
  );
}
