import type { Metadata } from 'next';
import UtalvanyOldal from '@/components/UtalvanyOldal';

export const metadata: Metadata = {
  title: 'Ajándékutalvány',
  description:
    'Nyitási ajándékutalvány: három éjszaka a kettő áráért, két főnek, 98 000 Ft. '
    + '2027. december 20-ig felhasználható.',
  alternates: {
    canonical: '/utalvany',
    languages: { hu: '/utalvany', en: '/en/utalvany' },
  },
};

export default function Oldal() {
  return <UtalvanyOldal nyelv="hu" />;
}
