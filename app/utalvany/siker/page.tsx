import type { Metadata } from 'next';
import UtalvanyOldal from '@/components/UtalvanyOldal';

export const metadata: Metadata = {
  title: 'Köszönjük a vásárlást',
  robots: { index: false, follow: false },
};

export default function Oldal({
  searchParams,
}: {
  searchParams: { mod?: string; ref?: string };
}) {
  return <UtalvanyOldal nyelv="hu" siker utalas={searchParams.mod === 'utalas'}
      azonosito={searchParams.ref}
    />;
}
