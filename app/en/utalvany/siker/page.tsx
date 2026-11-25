import type { Metadata } from 'next';
import UtalvanyOldal from '@/components/UtalvanyOldal';

export const metadata: Metadata = {
  title: 'Thank you for your purchase',
  robots: { index: false, follow: false },
};

export default function Oldal() {
  return <UtalvanyOldal nyelv="en" siker />;
}
