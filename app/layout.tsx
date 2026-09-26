import type { Metadata } from 'next';

/**
 * A betűtípusok a projekt részeként utaznak (@fontsource), nem a Google
 * szerveréről töltődnek. Három előnye van:
 *  - a build nem függ attól, hogy elérhető-e a Google Fonts,
 *  - a látogató adata nem kerül ki harmadik félhez (GDPR),
 *  - egy kéréssel kevesebb külső szolgáltatóhoz, tehát gyorsabb betöltés.
 */
import '@fontsource/jost/300.css';
import '@fontsource/jost/400.css';
import '@fontsource/jost/500.css';
import '@fontsource/source-serif-4/300.css';
import '@fontsource/source-serif-4/400.css';
import '@fontsource/source-serif-4/600.css';

import './globals.css';

const ALAP_URL = process.env.NEXT_PUBLIC_OLDAL_URL ?? 'https://www.szelidliget.hu';

export const metadata: Metadata = {
  metadataBase: new URL(ALAP_URL),
  title: 'Szelid Liget — Füge és Mandula faház',
  description:
    'Két önállóan foglalható prémium faház a víz partján. Online foglalás, azonnali visszaigazolás.',
  icons: { icon: '/logo-mark.png' },
  openGraph: {
    title: 'Szelid Liget — Füge és Mandula faház',
    description:
      'Két önállóan foglalható prémium faház a víz partján. Online foglalás, azonnali visszaigazolás.',
    url: ALAP_URL,
    siteName: 'Szelid Liget',
    locale: 'hu_HU',
    type: 'website',
    images: [{ url: '/logo.png', width: 869, height: 517, alt: 'Szelid Liget' }],
  },
  alternates: {
    canonical: '/',
    languages: { hu: '/', en: '/en' },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="hu">
      <body>{children}</body>
    </html>
  );
}
