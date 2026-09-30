import type { Metadata } from 'next';
import JogiOldal from '@/components/JogiOldal';
import { impresszum } from '@/lib/jogi';

export const metadata: Metadata = {
  title: 'Impresszum — Szelid Liget',
  alternates: { canonical: '/impresszum', languages: { hu: '/impresszum', en: '/en/impresszum' } },
};

export default function Oldal() {
  return <JogiOldal nyelv="hu" adat={impresszum('hu')} />;
}
