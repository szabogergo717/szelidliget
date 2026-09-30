import type { Metadata } from 'next';
import JogiOldal from '@/components/JogiOldal';
import { adatvedelem } from '@/lib/jogi';

export const metadata: Metadata = {
  title: 'Privacy Notice — Szelid Liget',
  alternates: { canonical: '/en/adatvedelem', languages: { hu: '/adatvedelem', en: '/en/adatvedelem' } },
};

export default function Oldal() {
  return <JogiOldal nyelv="en" adat={adatvedelem('en')} />;
}
