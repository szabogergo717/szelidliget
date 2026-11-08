import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { UTVONAL_FEJLEC } from '@/middleware';
import { elsoKep } from '@/lib/galeria';

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

/**
 * A kép, ami a Facebookon, a Messengerben és a WhatsAppban megjelenik,
 * amikor valaki megosztja az oldalt. Ha már van nyitófotó, azt
 * használjuk — egy fotó sokkal többet mond, mint a logó.
 */
const MEGOSZTASI_KEP = (() => {
  const elso = elsoKep('hero') ?? elsoKep('liget') ?? elsoKep('fuge');
  if (elso) {
    const nagy = elso.valtozatok[elso.valtozatok.length - 1];
    const aranyosMagassag = Math.round(
      (nagy.szelesseg * elso.magassag) / elso.szelesseg
    );
    return { url: nagy.fajl, width: nagy.szelesseg, height: aranyosMagassag };
  }
  return { url: '/logo.png', width: 1200, height: 630 };
})();

const CIM = 'Luxus faházak a Szelidi-tónál — Szelid Liget';
const LEIRAS =
  'Két prémium faház privát jakuzzival a Szelidi-tó partján, Dunapatajon. ' +
  'A Füge és a Mandula külön-külön és együtt is foglalható. ' +
  'Online foglalás, azonnali visszaigazolás.';

export const metadata: Metadata = {
  metadataBase: new URL(ALAP_URL),
  title: {
    default: CIM,
    /** Az aloldalak címe mögé a márkanév kerül. */
    template: '%s — Szelid Liget',
  },
  description: LEIRAS,
  applicationName: 'Szelid Liget',
  authors: [{ name: 'Szelid Liget' }],
  icons: { icon: '/logo-mark.png' },
  /**
   * A keresőknek szóló részletes utasítás. A `max-image-preview: large`
   * engedi, hogy a találat mellett nagy kép jelenjen meg — szálláshelynél
   * ez számít a legtöbbet a kattintásban.
   */
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  openGraph: {
    title: CIM,
    description: LEIRAS,
    url: ALAP_URL,
    siteName: 'Szelid Liget',
    locale: 'hu_HU',
    alternateLocale: 'en_GB',
    type: 'website',
    images: [{ url: MEGOSZTASI_KEP.url, width: MEGOSZTASI_KEP.width, height: MEGOSZTASI_KEP.height, alt: 'Szelid Liget — luxus faházak a Szelidi-tónál' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: CIM,
    description: LEIRAS,
    images: [MEGOSZTASI_KEP.url],
  },
  alternates: {
    canonical: '/',
    languages: { hu: '/', en: '/en', 'x-default': '/' },
  },
};

/**
 * A nyelvjelölés az útvonalból jön: az /en kezdetű oldalak angolok.
 * A middleware adja át az útvonalat — enélkül minden oldal magyarként
 * szerepelne a keresőkben, az angol változat is.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  const utvonal = headers().get(UTVONAL_FEJLEC) ?? '/';
  const nyelv = utvonal === '/en' || utvonal.startsWith('/en/') ? 'en' : 'hu';

  return (
    <html lang={nyelv}>
      <body>{children}</body>
    </html>
  );
}
