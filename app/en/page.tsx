import type { Metadata } from 'next';
import Oldal from '@/components/Oldal';
import { oldalAdat } from '@/lib/oldalAdat';

export const dynamic = 'force-dynamic';

const CIM = 'Luxury cabins at Lake Szelid — Szelid Liget';
const LEIRAS =
  'Two premium cabins with private hot tubs on the shore of Lake Szelid, Hungary. ' +
  'Füge and Mandula can be booked separately or together. ' +
  'Book online, confirmed instantly.';

export const metadata: Metadata = {
  /** Az abszolút cím kell, különben a magyar sablon kerülne mögé. */
  title: { absolute: CIM },
  description: LEIRAS,
  alternates: {
    canonical: '/en',
    languages: { hu: '/', en: '/en', 'x-default': '/' },
  },
  openGraph: { title: CIM, description: LEIRAS, url: '/en', locale: 'en_GB' },
  twitter: { title: CIM, description: LEIRAS },
};

export default async function EnglishHome() {
  const { hazak, extrak } = await oldalAdat('en');
  return <Oldal nyelv="en" hazak={hazak} extrak={extrak} />;
}
