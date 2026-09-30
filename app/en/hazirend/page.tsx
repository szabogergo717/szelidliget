import type { Metadata } from 'next';
import JogiOldal from '@/components/JogiOldal';
import { hazirend } from '@/lib/jogi';

export const metadata: Metadata = {
  title: 'House Rules — Szelid Liget',
  alternates: { canonical: '/en/hazirend', languages: { hu: '/hazirend', en: '/en/hazirend' } },
};

export default function Oldal() {
  return <JogiOldal nyelv="en" adat={hazirend('en')} />;
}
