import type { Metadata } from 'next';
import Allapot from '@/components/Allapot';
import { T, type Nyelv } from '@/lib/tartalom';

/** A SimplePay ide irányít vissza: letelt a fizetésre szánt idő. */

export const metadata: Metadata = {
  title: 'Lejárt fizetés — Szelid Liget',
  robots: { index: false, follow: false },
};

export default async function Lejart({
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
      cim={T.lejartCim[nyelv]}
      szoveg={T.lejartSzoveg[nyelv]}
      azonosito={p.ref}
    />
  );
}
