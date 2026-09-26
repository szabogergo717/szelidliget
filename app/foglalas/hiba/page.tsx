import type { Metadata } from 'next';
import Allapot from '@/components/Allapot';
import { T, type Nyelv } from '@/lib/tartalom';

/** A SimplePay ide irányít vissza: a bank elutasította a tranzakciót. */

export const metadata: Metadata = {
  title: 'A fizetés nem sikerült — Szelid Liget',
  robots: { index: false, follow: false },
};

export default async function Hiba({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string; lang?: string }>;
}) {
  const p = await searchParams;
  const nyelv: Nyelv = p.lang === 'en' ? 'en' : 'hu';

  return (
    <Allapot
      nyelv={nyelv}
      jelleg="bad"
      cim={T.hibaCim[nyelv]}
      szoveg={T.hibaSzoveg[nyelv]}
      azonosito={p.ref}
    />
  );
}
