import type { Metadata } from 'next';
import Allapot from '@/components/Allapot';
import { T, type Nyelv } from '@/lib/tartalom';

/**
 * A SimplePay ide irányítja vissza a vendéget sikeres fizetés után.
 *
 * ⚠ Ez NEM állítja a foglalás állapotát — azt csak az aláírt IPN teszi.
 *   Ezt a címet bárki megnyithatja, ezért csak tájékoztat.
 */

export const metadata: Metadata = {
  title: 'Foglalás visszaigazolva — Szelid Liget',
  robots: { index: false, follow: false },
};

export default async function Siker({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string; lang?: string }>;
}) {
  const p = await searchParams;
  const nyelv: Nyelv = p.lang === 'en' ? 'en' : 'hu';

  return (
    <Allapot
      nyelv={nyelv}
      jelleg="ok"
      cim={T.sikerCim[nyelv]}
      szoveg={T.sikerSzoveg[nyelv]}
      azonosito={p.ref}
      megjegyzes={T.sikerEmailNemJott[nyelv]}
    />
  );
}
