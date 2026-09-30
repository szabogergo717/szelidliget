import type { Metadata } from 'next';
import JogiOldal from '@/components/JogiOldal';
import { adatvedelem } from '@/lib/jogi';

export const metadata: Metadata = {
  title: 'Adatkezelési tájékoztató — Szelid Liget',
  alternates: { canonical: '/adatvedelem', languages: { hu: '/adatvedelem', en: '/en/adatvedelem' } },
};

export default function Oldal() {
  return <JogiOldal nyelv="hu" adat={adatvedelem('hu')} />;
}
