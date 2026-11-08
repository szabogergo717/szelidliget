import type { Metadata } from 'next';
import JogiOldal from '@/components/JogiOldal';
import { hazirend } from '@/lib/jogi';

export const metadata: Metadata = {
  title: 'Házirend',
  alternates: { canonical: '/hazirend', languages: { hu: '/hazirend', en: '/en/hazirend' } },
};

export default function Oldal() {
  return <JogiOldal nyelv="hu" adat={hazirend('hu')} />;
}
