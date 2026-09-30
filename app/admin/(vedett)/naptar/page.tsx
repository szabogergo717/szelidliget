import Link from 'next/link';
import { naptarAdat } from '@/lib/adminAdat';
import Zaras from '@/components/admin/Zaras';

export const dynamic = 'force-dynamic';

const HONAP_NEV = [
  'január', 'február', 'március', 'április', 'május', 'június',
  'július', 'augusztus', 'szeptember', 'október', 'november', 'december',
];
const NAP_ROVID = ['H', 'K', 'Sze', 'Cs', 'P', 'Szo', 'V'];

function ymd(ev: number, honap: number, nap: number): string {
  return `${ev}-${String(honap).padStart(2, '0')}-${String(nap).padStart(2, '0')}`;
}

/** Hétfővel kezdődő hét: hányadik oszlopba esik a hónap első napja. */
function elsoOszlop(ev: number, honap: number): number {
  const d = new Date(Date.UTC(ev, honap - 1, 1)).getUTCDay(); // 0 = vasárnap
  return (d + 6) % 7;
}

export default async function Naptar({
  searchParams,
}: {
  searchParams: Promise<{ ev?: string; honap?: string }>;
}) {
  const p = await searchParams;
  const most = new Date();
  const ev = Number(p.ev) || most.getFullYear();
  const honap = Number(p.honap) || most.getMonth() + 1;

  const { hazak, foglalasok, blokkok } = await naptarAdat(ev, honap);
  const napokSzama = new Date(Date.UTC(ev, honap, 0)).getUTCDate();
  const eltolas = elsoOszlop(ev, honap);

  const elozo = honap === 1 ? { ev: ev - 1, honap: 12 } : { ev, honap: honap - 1 };
  const kovetkezo = honap === 12 ? { ev: ev + 1, honap: 1 } : { ev, honap: honap + 1 };
  const maStr = most.toISOString().slice(0, 10);

  /**
   * Egy napra melyik foglalás vagy zárás esik.
   * A távozás napja már NEM foglalt — ugyanaz a szabály, mint az
   * adatbázisban és az árszámításban.
   */
  function napAllapot(hazSlug: string, nap: string) {
    const f = foglalasok.find(
      (x) => x.hazak?.slug === hazSlug && nap >= x.erkezes && nap < x.tavozas
    );
    if (f) {
      return {
        osztaly: f.statusz === 'fuggoben' ? 'fuggo' : 'foglalt',
        szoveg: f.vendegek?.nev ?? f.azonosito,
        link: `/admin/foglalas/${f.azonosito}`,
      };
    }
    const b = blokkok.find(
      (x) => x.hazak?.slug === hazSlug && nap >= x.kezdet && nap < x.veg
    );
    if (b) {
      return { osztaly: 'zart', szoveg: b.indok ?? 'Lezárva', link: null };
    }
    return null;
  }

  const blokkLista = blokkok.map((b) => ({
    id: b.id,
    kezdet: b.kezdet,
    veg: b.veg,
    indok: b.indok,
    haz: hazak.find((h) => h.slug === b.hazak?.slug)?.nev ?? '—',
  }));

  return (
    <>
      <h1>Naptár</h1>
      <p className="alcim">
        A távozás napja már újra foglalható, ezért az nem jelenik meg foglaltként.
      </p>

      <div className="naptar-fej">
        <Link className="gomb" href={`/admin/naptar?ev=${elozo.ev}&honap=${elozo.honap}`}>
          ← Előző
        </Link>
        <span className="honap">{ev}. {HONAP_NEV[honap - 1]}</span>
        <Link className="gomb" href={`/admin/naptar?ev=${kovetkezo.ev}&honap=${kovetkezo.honap}`}>
          Következő →
        </Link>
        <Link className="gomb" href="/admin/naptar">Mai hónap</Link>
      </div>

      {hazak.map((h) => (
        <div className="naptar-blokk" key={h.slug}>
          <h2>{h.nev}</h2>
          <div className="naptar-racs">
            {NAP_ROVID.map((n) => (
              <div className="fejnap" key={n}>{n}</div>
            ))}
            {Array.from({ length: eltolas }, (_, i) => (
              <div className="nap ures" key={`u${i}`} />
            ))}
            {Array.from({ length: napokSzama }, (_, i) => {
              const nap = i + 1;
              const datum = ymd(ev, honap, nap);
              const a = napAllapot(h.slug, datum);
              const ma = datum === maStr;
              const tartalom = (
                <>
                  <span className="d" style={ma ? { fontWeight: 600, color: 'var(--ochre)' } : undefined}>
                    {nap}
                  </span>
                  {a && <span className="cimke-kicsi">{a.szoveg}</span>}
                </>
              );
              return a?.link ? (
                <Link
                  className={`nap ${a.osztaly}`} key={datum} href={a.link}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  {tartalom}
                </Link>
              ) : (
                <div className={`nap ${a?.osztaly ?? ''}`} key={datum}>{tartalom}</div>
              );
            })}
          </div>
        </div>
      ))}

      <div className="jelmagyarazat">
        <span><i className="j-foglalt" /> Kifizetett foglalás</span>
        <span><i className="j-fuggo" /> Fizetésre vár</span>
        <span><i className="j-zart" /> Lezárt időszak</span>
      </div>

      <Zaras hazak={hazak} blokkok={blokkLista} />
    </>
  );
}
