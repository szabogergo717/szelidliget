import type { Metadata } from 'next';
import JogiOldal from '@/components/JogiOldal';
import { aszf } from '@/lib/jogi';

export const metadata: Metadata = {
  title: 'Terms and Conditions — Szelid Liget',
  alternates: { canonical: '/en/aszf', languages: { hu: '/aszf', en: '/en/aszf' } },
};

export default function Oldal() {
  return <JogiOldal nyelv="en" adat={aszf('en')} />;
}
