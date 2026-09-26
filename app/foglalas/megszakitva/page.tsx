import type { Metadata } from 'next';
import Allapot from '@/components/Allapot';
import { T, type Nyelv } from '@/lib/tartalom';

/** A SimplePay ide irányít vissza: a vendég megszakította a fizetést. */

export const metadata: Metadata = {
  title: 'Megszakított fizetés — Szelid Liget',
  robots: { index: false, follow: false },
};

export default async function Megszakitva({
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
      cim={T.megszakitvaCim[nyelv]}
      szoveg={T.megszakitvaSzoveg[nyelv]}
      azonosito={p.ref}
    />
  );
}
