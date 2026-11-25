import type { Metadata } from 'next';
import UtalvanyOldal from '@/components/UtalvanyOldal';

export const metadata: Metadata = {
  title: 'Köszönjük a vásárlást',
  robots: { index: false, follow: false },
};

export default function Oldal() {
  return <UtalvanyOldal nyelv="hu" siker />;
}
