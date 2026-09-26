import type { Metadata } from 'next';
import Oldal from '@/components/Oldal';
import { oldalAdat } from '@/lib/oldalAdat';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Szelid Liget — Füge and Mandula cabins',
  description:
    'Two independently bookable premium cabins by the water. Book online, confirmed instantly.',
  alternates: {
    canonical: '/en',
    languages: { hu: '/', en: '/en' },
  },
  openGraph: { locale: 'en_GB' },
};

export default async function EnglishHome() {
  const { hazak, extrak } = await oldalAdat('en');
  return <Oldal nyelv="en" hazak={hazak} extrak={extrak} />;
}
