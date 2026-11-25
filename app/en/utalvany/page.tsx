import type { Metadata } from 'next';
import UtalvanyOldal from '@/components/UtalvanyOldal';

export const metadata: Metadata = {
  title: 'Gift voucher',
  description:
    'Opening gift voucher: three nights for the price of two, for two people, 98,000 HUF. '
    + 'Valid until 20 December 2027.',
  alternates: {
    canonical: '/en/utalvany',
    languages: { hu: '/utalvany', en: '/en/utalvany' },
  },
};

export default function Oldal() {
  return <UtalvanyOldal nyelv="en" />;
}
