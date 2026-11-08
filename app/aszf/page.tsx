import type { Metadata } from 'next';
import JogiOldal from '@/components/JogiOldal';
import { aszf } from '@/lib/jogi';

export const metadata: Metadata = {
  title: 'Általános Szerződési Feltételek',
  alternates: { canonical: '/aszf', languages: { hu: '/aszf', en: '/en/aszf' } },
};

export default function Oldal() {
  return <JogiOldal nyelv="hu" adat={aszf('hu')} />;
}
