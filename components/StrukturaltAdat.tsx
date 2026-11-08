import { T, CEG, SOCIAL, lista, type Nyelv } from '@/lib/tartalom';
import { elsoKep, kepek, legnagyobb } from '@/lib/galeria';
import type { HazAdat } from './FoglaloUrlap';

/**
 * Strukturált adat a keresőknek (JSON-LD).
 *
 * Ez a blokk nem látszik a látogatónak — a Google, a Bing és a többi
 * kereső olvassa. Ebből tudják meg gépi pontossággal, hogy ez egy
 * szálláshely, hol van, mennyibe kerül, mi van benne, és mik a
 * gyakori kérdések.
 *
 * Mire jó: a találat mellett megjelenhet a csillagos értékelés, az ár,
 * a kép és a lenyíló kérdés-válasz. Ettől feltűnőbb a találat, és
 * többen kattintanak rá — a helyezést önmagában nem javítja, de a
 * megjelenést igen.
 *
 * FONTOS: csak olyat írunk ide, ami az oldalon is szerepel. A Google
 * bünteti, ha a strukturált adat mást állít, mint a látható tartalom.
 */

const ALAP = process.env.NEXT_PUBLIC_OLDAL_URL ?? 'https://www.szelidliget.hu';

/** A szélességi és hosszúsági fok a Google Mapsből. Üresen kimarad. */
function koordinatak(): { lat: number; lng: number } | null {
  const nyers = process.env.NEXT_PUBLIC_GEO ?? '';
  const [lat, lng] = nyers.split(',').map((x) => Number(x.trim()));
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (lat === 0 && lng === 0) return null;
  return { lat, lng };
}

/** Teljes URL egy képhez — a strukturált adatban nem lehet relatív út. */
function teljesKep(ut: string | null): string | null {
  return ut ? `${ALAP}${ut}` : null;
}

function hazKepei(slug: string): string[] {
  return kepek(slug)
    .map((k) => teljesKep(legnagyobb(k)))
    .filter((x): x is string => Boolean(x))
    .slice(0, 8);
}

export default function StrukturaltAdat({
  nyelv, hazak,
}: {
  nyelv: Nyelv; hazak: HazAdat[];
}) {
  const geo = koordinatak();
  const utvonal = nyelv === 'hu' ? ALAP : `${ALAP}/en`;

  const fokep =
    teljesKep(legnagyobbUt('hero')) ??
    teljesKep(legnagyobbUt('liget')) ??
    `${ALAP}/logo.png`;

  const osszesKep = [
    ...hazKepei('hero'),
    ...hazKepei('liget'),
    ...hazKepei('fuge'),
    ...hazKepei('mandula'),
  ].slice(0, 12);

  const legolcsobb = hazak.length
    ? Math.min(...hazak.map((h) => h.alap_ar))
    : 0;

  const felszereltseg = [
    ...lista(T.szolgKiemelt[nyelv]),
    ...lista(T.szolgLakter[nyelv]),
    ...lista(T.szolgKonyha[nyelv]),
  ].map((nev) => ({
    '@type': 'LocationFeatureSpecification',
    name: nev,
    value: true,
  }));

  const szallas = {
    '@context': 'https://schema.org',
    '@type': 'LodgingBusiness',
    '@id': `${ALAP}/#szallashely`,
    name: 'Szelid Liget',
    description: T.heroAlcim[nyelv],
    url: utvonal,
    image: osszesKep.length ? osszesKep : [fokep],
    logo: `${ALAP}/logo.png`,
    email: CEG.email,
    ...(CEG.telefon ? { telephone: CEG.telefon } : {}),
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Kastély utca 17.',
      addressLocality: 'Dunapataj',
      postalCode: '6328',
      addressRegion: 'Bács-Kiskun',
      addressCountry: 'HU',
    },
    ...(geo
      ? { geo: { '@type': 'GeoCoordinates', latitude: geo.lat, longitude: geo.lng } }
      : {}),
    ...(legolcsobb
      ? {
          priceRange: `${legolcsobb} HUF+`,
          makesOffer: hazak.map((h) => ({
            '@type': 'Offer',
            name: h.nev,
            price: h.alap_ar,
            priceCurrency: 'HUF',
            availability: 'https://schema.org/InStock',
            url: `${utvonal}#foglalas`,
          })),
        }
      : {}),
    numberOfRooms: hazak.length,
    petsAllowed: false,
    smokingAllowed: false,
    checkinTime: '15:00',
    checkoutTime: '10:00',
    amenityFeature: felszereltseg,
    containsPlace: hazak.map((h) => ({
      '@type': 'Accommodation',
      name: h.nev,
      occupancy: {
        '@type': 'QuantitativeValue',
        maxValue: h.max_fo,
        unitCode: 'C62',
      },
      ...(hazKepei(h.slug).length ? { image: hazKepei(h.slug) } : {}),
    })),
    sameAs: [SOCIAL.facebook, SOCIAL.instagram, SOCIAL.tiktok].filter(Boolean),
    potentialAction: {
      '@type': 'ReserveAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${utvonal}#foglalas`,
        actionPlatform: [
          'https://schema.org/DesktopWebPlatform',
          'https://schema.org/MobileWebPlatform',
        ],
      },
      result: { '@type': 'LodgingReservation', name: 'Szelid Liget' },
    },
  };

  // A gyakori kérdések gépi formában. A Google ezekből lenyíló
  // kérdés-válasz blokkot tud mutatni a találat alatt.
  const kerdesek: [string, string][] = [
    [T.gyik1K[nyelv], T.gyik1V[nyelv]],
    [T.gyik2K[nyelv], T.gyik2V[nyelv]],
    [T.gyik3K[nyelv], T.gyik3V[nyelv]],
    [T.gyik4K[nyelv], T.gyik4V[nyelv]],
    [T.gyik5K[nyelv], T.gyik5V[nyelv]],
    [T.gyik6K[nyelv], T.gyik6V[nyelv]],
  ];

  const gyik = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${utvonal}#gyik`,
    mainEntity: kerdesek.map(([k, v]) => ({
      '@type': 'Question',
      name: k,
      acceptedAnswer: { '@type': 'Answer', text: v },
    })),
  };

  const oldal = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${ALAP}/#weboldal`,
    name: 'Szelid Liget',
    url: ALAP,
    inLanguage: nyelv === 'hu' ? 'hu-HU' : 'en-GB',
    publisher: { '@id': `${ALAP}/#szallashely` },
  };

  return (
    <>
      {[szallas, gyik, oldal].map((adat, i) => (
        <script
          key={i}
          type="application/ld+json"
          // A JSON.stringify kimenete nem tartalmaz HTML-t, de a
          // `</script>` sorozatot a biztonság kedvéért széttördeljük.
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(adat).replace(/</g, '\\u003c'),
          }}
        />
      ))}
    </>
  );
}

/** Egy csoport első képének legnagyobb változata, út formában. */
function legnagyobbUt(kulcs: string): string | null {
  const k = elsoKep(kulcs);
  return k ? legnagyobb(k) : null;
}
