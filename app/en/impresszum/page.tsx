import type { Metadata } from 'next';
import JogiOldal from '@/components/JogiOldal';
import { impresszum } from '@/lib/jogi';

export const metadata: Metadata = {
  title: 'Imprint — Szelid Liget',
  alternates: { canonical: '/en/impresszum', languages: { hu: '/impresszum', en: '/en/impresszum' } },
};

export default function Oldal() {
  return <JogiOldal nyelv="en" adat={impresszum('en')} />;
}
