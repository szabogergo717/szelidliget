import type { MetadataRoute } from 'next';

const ALAP = process.env.NEXT_PUBLIC_OLDAL_URL ?? 'https://www.szelidliget.hu';

/**
 * Oldaltérkép a keresőknek. A két nyelvi változat egymás párja —
 * ezt az `alternates` mondja meg a Google-nek, hogy ne duplikált
 * tartalomnak lássa őket.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const most = new Date();
  return [
    {
      url: `${ALAP}/`,
      lastModified: most,
      changeFrequency: 'weekly',
      priority: 1,
      alternates: { languages: { hu: `${ALAP}/`, en: `${ALAP}/en` } },
    },
    {
      url: `${ALAP}/en`,
      lastModified: most,
      changeFrequency: 'weekly',
      priority: 0.9,
      alternates: { languages: { hu: `${ALAP}/`, en: `${ALAP}/en` } },
    },
  ];
}
