import type { Metadata } from 'next';
import UtalvanyOldal from '@/components/UtalvanyOldal';

export const metadata: Metadata = {
  title: 'Thank you for your purchase',
  robots: { index: false, follow: false },
};

export default function Oldal({
  searchParams,
}: {
  searchParams: { mod?: string };
}) {
  return <UtalvanyOldal nyelv="en" siker utalas={searchParams.mod === 'utalas'} />;
}
