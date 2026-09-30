import type { Metadata } from 'next';
import Allapot from '@/components/Allapot';
import { T, type Nyelv } from '@/lib/tartalom';

/**
 * Utalásos foglalás után ide jut a vendég.
 *
 * A foglalás ilyenkor „fuggoben" — az utalási adatokat e-mailben
 * küldtük, és a státuszt az adminban állítod „kifizetve"-re, amikor
 * a pénz megérkezett.
 */

export const metadata: Metadata = {
  title: 'Foglalás rögzítve — Szelid Liget',
  robots: { index: false, follow: false },
};

export default async function Utalas({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string; lang?: string }>;
}) {
  const p = await searchParams;
  const nyelv: Nyelv = p.lang === 'en' ? 'en' : 'hu';

  return (
    <Allapot
      nyelv={nyelv}
      jelleg="warn"
      cim={T.utalasCim[nyelv]}
      szoveg={T.utalasSzoveg[nyelv]}
      azonosito={p.ref}
      megjegyzes={T.sikerEmailNemJott[nyelv]}
    />
  );
}
