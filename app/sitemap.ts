import type { MetadataRoute } from 'next';

const ALAP = process.env.NEXT_PUBLIC_OLDAL_URL ?? 'https://www.szelidliget.hu';

/**
 * Oldaltérkép a keresőknek. A két nyelvi változat egymás párja —
 * ezt az `alternates` mondja meg a Google-nek, hogy ne duplikált
 * tartalomnak lássa őket.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const most = new Date();

  const oldalak: { ut: string; prioritas: number }[] = [
    { ut: '', prioritas: 1 },
    { ut: '/aszf', prioritas: 0.3 },
    { ut: '/adatvedelem', prioritas: 0.3 },
    { ut: '/hazirend', prioritas: 0.4 },
    { ut: '/impresszum', prioritas: 0.3 },
  ];

  return oldalak.flatMap((o) => [
    {
      url: `${ALAP}${o.ut || '/'}`,
      lastModified: most,
      changeFrequency: 'weekly' as const,
      priority: o.prioritas,
      alternates: {
        languages: { hu: `${ALAP}${o.ut || '/'}`, en: `${ALAP}/en${o.ut}` },
      },
    },
    {
      url: `${ALAP}/en${o.ut}`,
      lastModified: most,
      changeFrequency: 'weekly' as const,
      priority: o.prioritas * 0.9,
      alternates: {
        languages: { hu: `${ALAP}${o.ut || '/'}`, en: `${ALAP}/en${o.ut}` },
      },
    },
  ]);
}
