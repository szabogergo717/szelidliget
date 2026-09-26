import type { MetadataRoute } from 'next';

const ALAP = process.env.NEXT_PUBLIC_OLDAL_URL ?? 'https://www.szelidliget.hu';

/**
 * A keresőket a bemutatkozó oldalakra engedjük, a foglalás utáni
 * visszatérő oldalakat és az API-t viszont nem indexeltetjük — azok
 * egyedi hivatkozások, nem nyilvános tartalom.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/foglalas/'],
    },
    sitemap: `${ALAP}/sitemap.xml`,
  };
}
