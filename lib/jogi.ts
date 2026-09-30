import { CEG, type Nyelv } from './tartalom';

/**
 * Jogi oldalak tartalma.
 *
 * ⚠ FONTOS: ezek VÁZLATOK. A ti feltételeitekből és a magyar
 * szálláshely-szolgáltatás szokásos gyakorlatából állítottuk össze,
 * de nem helyettesítik az ügyvédi átnézést. Más szálláshely szövegét
 * szándékosan nem vettük át — az szerzői jogi és jogi kockázat is lenne,
 * mert a feltételek az adott vállalkozásra szabottak.
 *
 * Amit mindenképp nézessetek át ügyvéddel:
 *  - a lemondási és visszatérítési feltételek (ezek pénzügyi
 *    következménnyel járnak),
 *  - az adatkezelési tájékoztató teljessége,
 *  - a kártérítési és felelősségi szakaszok.
 */

export type Bekezdes = { cim?: string; szoveg: string[] };
export type JogiOldal = { cim: string; frissitve: string; blokkok: Bekezdes[] };

const FRISSITVE = '2026. szeptember 30.';
const FRISSITVE_EN = '30 September 2026';

// ============================================================
//  ÁSZF
// ============================================================

export function aszf(nyelv: Nyelv): JogiOldal {
  if (nyelv === 'en') {
    return {
      cim: 'Terms and Conditions',
      frissitve: FRISSITVE_EN,
      blokkok: [
        {
          szoveg: [
            `These terms govern bookings made on ${CEG.cim.split(',')[0]} through www.szelidliget.hu, operated by ${CEG.nev}.`,
            'By completing a booking you accept these terms.',
          ],
        },
        {
          cim: '1. The service provider',
          szoveg: [
            `Name: ${CEG.nev}`,
            CEG.adoszam ? `Tax number: ${CEG.adoszam}` : 'Tax number: to be completed',
            CEG.szekhely ? `Registered office: ${CEG.szekhely}` : 'Registered office: to be completed',
            `Property: ${CEG.cim}`,
            `Email: ${CEG.email}`,
          ],
        },
        {
          cim: '2. Booking and payment',
          szoveg: [
            'A booking is made online, by selecting the cabin, the dates and any extras. The price shown at the time of booking is the price payable.',
            'The full amount is due at the time of booking. Payment can be made by bank card through SimplePay (operated by OTP Mobil Kft.) or by bank transfer.',
            'For card payments the booking is confirmed once the payment is authorised. For bank transfers we hold the dates and the booking becomes final when the amount arrives in our account. If the transfer does not arrive within the stated deadline, we may release the dates.',
            'An invoice is issued electronically and sent to the email address given at booking.',
          ],
        },
        {
          cim: '3. The price',
          szoveg: [
            'The nightly rate applies to the cabin for up to two guests. A booking for one guest is charged at the same rate.',
            'The minimum stay is two nights. If a single night remains free between two bookings, that night may be booked on request by email.',
            'Extras are charged in addition to the accommodation. Some extras are priced on request; these are agreed by email after the booking and are not included in the amount paid online.',
            'Tourist tax, where applicable, is payable on site unless stated otherwise.',
          ],
        },
        {
          cim: '4. Cancellation and modification',
          szoveg: [
            'Cancellation is possible by email to the address above, quoting the booking reference.',
            'Cancellation more than 30 days before arrival: the full amount is refunded.',
            'Cancellation between 30 and 14 days before arrival: 50% of the amount is refunded.',
            'Cancellation within 14 days of arrival, or non-arrival: no refund is given.',
            'Modification of dates is possible subject to availability; we will confirm any modification in writing.',
            'If we are unable to provide the accommodation for a reason within our control, we refund the full amount paid.',
          ],
        },
        {
          cim: '5. Arrival and departure',
          szoveg: [
            'Check-in is from 3:00 pm; check-out is by 10:00 am. Different times may be agreed in advance where possible.',
          ],
        },
        {
          cim: '6. House rules',
          szoveg: [
            'Pets cannot be accommodated in either cabin.',
            'Smoking is not permitted inside the cabins or on the covered terrace.',
            'Open fires, including barbecues and campfires, are not permitted on the property.',
            'Between 10:00 pm and 7:00 am we ask guests to keep noise to a minimum.',
            'The number of guests staying may not exceed the number given at booking.',
            'Guests are liable for damage caused to the property or its equipment.',
          ],
        },
        {
          cim: '7. Liability',
          szoveg: [
            'The hot tub and the outdoor areas are used at the guest\'s own risk. Children must be supervised at all times.',
            'We are not liable for valuables left in the cabin, or for damage arising from use contrary to these terms or the house rules.',
          ],
        },
        {
          cim: '8. Complaints and disputes',
          szoveg: [
            'Please raise any complaint with us during your stay so that we can resolve it.',
            'Consumer disputes may be referred to the competent conciliation board. Hungarian law applies.',
          ],
        },
      ],
    };
  }

  return {
    cim: 'Általános Szerződési Feltételek',
    frissitve: FRISSITVE,
    blokkok: [
      {
        szoveg: [
          `Jelen feltételek a www.szelidliget.hu oldalon keresztül leadott foglalásokra vonatkoznak. A szálláshelyet a ${CEG.nev} üzemelteti.`,
          'A foglalás véglegesítésével elfogadod az alábbi feltételeket.',
        ],
      },
      {
        cim: '1. A szolgáltató',
        szoveg: [
          `Név: ${CEG.nev}`,
          CEG.adoszam ? `Adószám: ${CEG.adoszam}` : 'Adószám: kitöltendő',
          CEG.szekhely ? `Székhely: ${CEG.szekhely}` : 'Székhely: kitöltendő',
          `A szálláshely címe: ${CEG.cim}`,
          `E-mail: ${CEG.email}`,
        ],
      },
      {
        cim: '2. A foglalás és a fizetés',
        szoveg: [
          'A foglalás online történik: kiválasztod a faházat, az időpontot és az esetleges extrákat. A foglaláskor megjelenített ár a fizetendő ár.',
          'A teljes összeg a foglaláskor esedékes. Fizetni bankkártyával a SimplePay rendszerén keresztül (üzemeltető: OTP Mobil Kft.) vagy banki átutalással lehet.',
          'Bankkártyás fizetésnél a foglalás a sikeres tranzakcióval válik véglegessé. Átutalásnál az időpontot fenntartjuk, és a foglalás akkor válik véglegessé, amikor az összeg megérkezik a számlánkra. Ha az utalás a megadott határidőn belül nem érkezik meg, az időpontot felszabadíthatjuk.',
          'A számlát elektronikusan állítjuk ki, és a foglaláskor megadott e-mail címre küldjük.',
        ],
      },
      {
        cim: '3. Az ár',
        szoveg: [
          'Az éjszakánkénti ár a faházra vonatkozik, legfeljebb két fő részére. Egy fő esetén is ugyanez az ár fizetendő.',
          'A minimum tartózkodás két éjszaka. Ha a naptárban két foglalás között egyetlen nap marad szabadon, az az egy éjszaka e-mailben kérhető.',
          'Az extra szolgáltatások díja a szállásdíjon felül értendő. Egyes extrák ára egyedi egyeztetés tárgya; ezeket a foglalás után e-mailben rögzítjük, és nem részei az online kifizetett összegnek.',
          'Az idegenforgalmi adó — ahol ez irányadó — a helyszínen fizetendő, eltérő rendelkezés hiányában.',
        ],
      },
      {
        cim: '4. Lemondás és módosítás',
        szoveg: [
          'A lemondás a fenti e-mail címen lehetséges, a foglalási azonosító megadásával.',
          'Érkezés előtt több mint 30 nappal történő lemondás esetén a teljes összeget visszatérítjük.',
          'Érkezés előtt 30 és 14 nap között történő lemondás esetén az összeg 50%-át térítjük vissza.',
          'Érkezés előtt 14 napon belüli lemondás, illetve meg nem jelenés esetén visszatérítésre nincs mód.',
          'Az időpont módosítására szabad kapacitás függvényében van lehetőség; a módosítást írásban visszaigazoljuk.',
          'Ha a szállást rajtunk múló okból nem tudjuk biztosítani, a befizetett teljes összeget visszatérítjük.',
        ],
      },
      {
        cim: '5. Érkezés és távozás',
        szoveg: [
          'Bejelentkezés 15:00-tól, kijelentkezés 10:00-ig. Ettől eltérő időpont előzetes egyeztetés alapján, lehetőség szerint biztosítható.',
        ],
      },
      {
        cim: '6. Házirend',
        szoveg: [
          'Háziállatot egyik faházba sem tudunk fogadni.',
          'A faházakban és a fedett teraszon a dohányzás tilos.',
          'A birtok területén nyílt tűz gyújtása — beleértve a grillezést és a tűzrakást — tilos.',
          'Este 22:00 és reggel 7:00 között kérjük a csend megőrzését.',
          'A szálláshelyen tartózkodók száma nem haladhatja meg a foglaláskor megadott létszámot.',
          'A vendég felel az általa a szálláshelyben vagy annak felszerelésében okozott kárért.',
        ],
      },
      {
        cim: '7. Felelősség',
        szoveg: [
          'A jakuzzi és a kültéri területek használata saját felelősségre történik. Gyermekek felügyeletéről a vendégnek kell gondoskodnia.',
          'Nem vállalunk felelősséget a faházban hagyott értéktárgyakért, valamint a jelen feltételekkel vagy a házirenddel ellentétes használatból eredő károkért.',
        ],
      },
      {
        cim: '8. Panaszkezelés',
        szoveg: [
          'Kérjük, az esetleges panaszt még a tartózkodás alatt jelezd, hogy orvosolni tudjuk.',
          'Fogyasztói jogvita esetén az illetékes békéltető testülethez lehet fordulni. A szerződésre a magyar jog az irányadó.',
        ],
      },
    ],
  };
}

// ============================================================
//  Adatvédelmi tájékoztató
// ============================================================

export function adatvedelem(nyelv: Nyelv): JogiOldal {
  if (nyelv === 'en') {
    return {
      cim: 'Privacy Notice',
      frissitve: FRISSITVE_EN,
      blokkok: [
        {
          szoveg: [
            `This notice explains how ${CEG.nev} handles personal data collected through www.szelidliget.hu.`,
          ],
        },
        {
          cim: '1. What we collect and why',
          szoveg: [
            'Booking: name, email address, phone number, and billing details if given. We need these to provide the accommodation and to issue an invoice. Legal basis: performance of a contract, and a legal obligation for invoicing.',
            'Newsletter: email address and name, only if you tick the box or subscribe on the site. Legal basis: your consent, which you may withdraw at any time.',
            'Payment: card details are entered on SimplePay\'s own payment page and never reach us.',
          ],
        },
        {
          cim: '2. Who else sees the data',
          szoveg: [
            'SimplePay (OTP Mobil Kft.) — card payment processing.',
            'Resend — sending transactional and newsletter emails.',
            'Supabase — database hosting within the EU.',
            'Vercel — website hosting.',
            'Számlázz.hu — invoicing, where used.',
            'We do not sell or share personal data for advertising.',
          ],
        },
        {
          cim: '3. Data transfer statement',
          szoveg: [
            `I acknowledge that the following personal data stored by ${CEG.nev} in the user account of www.szelidliget.hu will be transferred to OTP Mobil Kft. as data processor. The scope of the data transferred: name, email address, phone number, billing address, amount. The purpose of the data processing by the data processor: assisting the customer with online payment, confirming the transaction and fraud prevention.`,
          ],
        },
        {
          cim: '4. How long we keep it',
          szoveg: [
            'Booking and invoicing data: for the period required by accounting law (currently eight years).',
            'Newsletter data: until you unsubscribe.',
          ],
        },
        {
          cim: '5. Your rights',
          szoveg: [
            'You may request access to, correction or deletion of your data, restriction of processing, or a copy in a portable format. You may withdraw consent for the newsletter at any time using the unsubscribe link.',
            `Requests: ${CEG.email}`,
            'You may also lodge a complaint with the Hungarian National Authority for Data Protection and Freedom of Information (NAIH).',
          ],
        },
        {
          cim: '6. Cookies',
          szoveg: [
            'The site uses no tracking or advertising cookies.',
            'The map on the contact page loads from Google Maps only after you click it. Until then, no data is sent to Google.',
          ],
        },
      ],
    };
  }

  return {
    cim: 'Adatkezelési tájékoztató',
    frissitve: FRISSITVE,
    blokkok: [
      {
        szoveg: [
          `Ez a tájékoztató azt írja le, hogyan kezeli a ${CEG.nev} a www.szelidliget.hu oldalon keresztül megadott személyes adatokat.`,
        ],
      },
      {
        cim: '1. Milyen adatot kezelünk és miért',
        szoveg: [
          'Foglalás: név, e-mail cím, telefonszám, valamint — ha megadod — számlázási adatok. Ezekre a szállás biztosításához és a számla kiállításához van szükség. Jogalap: szerződés teljesítése, illetve a számlázás körében jogi kötelezettség.',
          'Hírlevél: e-mail cím és név, kizárólag akkor, ha a jelölőnégyzetet bepipálod, vagy feliratkozol az oldalon. Jogalap: a te hozzájárulásod, amit bármikor visszavonhatsz.',
          'Fizetés: a bankkártya adatait a SimplePay saját fizetőoldalán adod meg, azok hozzánk nem jutnak el.',
        ],
      },
      {
        cim: '2. Kik láthatják még az adatokat',
        szoveg: [
          'SimplePay (OTP Mobil Kft.) — bankkártyás fizetés lebonyolítása.',
          'Resend — a visszaigazoló és hírlevél e-mailek kiküldése.',
          'Supabase — adatbázis-tárolás az Európai Unión belül.',
          'Vercel — a weboldal kiszolgálása.',
          'Számlázz.hu — számlázás, ahol ezt használjuk.',
          'Személyes adatot reklámcélra nem adunk át és nem értékesítünk.',
        ],
      },
      {
        cim: '3. Adattovábbítási nyilatkozat',
        szoveg: [
          `Tudomásul veszem, hogy a ${CEG.nev} adatkezelő által a www.szelidliget.hu felhasználói adatbázisában tárolt alábbi személyes adataim átadásra kerülnek az OTP Mobil Kft., mint adatfeldolgozó részére. Az adatkezelő által továbbított adatok köre az alábbi: név, e-mail cím, telefonszám, számlázási cím, összeg. Az adatfeldolgozó által végzett adatfeldolgozási tevékenység jellege és célja a SimplePay Adatkezelési tájékoztatóban, az alábbi linken tekinthető meg: http://simplepay.hu/vasarlo-aff`,
        ],
      },
      {
        cim: '4. Meddig őrizzük',
        szoveg: [
          'Foglalási és számlázási adatok: a számviteli törvény szerinti ideig (jelenleg nyolc év).',
          'Hírlevél-adatok: a leiratkozásig.',
        ],
      },
      {
        cim: '5. A te jogaid',
        szoveg: [
          'Kérheted az adataidhoz való hozzáférést, azok helyesbítését vagy törlését, a kezelés korlátozását, illetve másolatot hordozható formátumban. A hírlevélhez adott hozzájárulást bármikor visszavonhatod a levelek alján lévő leiratkozó linkkel.',
          `Megkeresés: ${CEG.email}`,
          'Panasszal a Nemzeti Adatvédelmi és Információszabadság Hatósághoz (NAIH) is fordulhatsz.',
        ],
      },
      {
        cim: '6. Sütik',
        szoveg: [
          'Az oldal nem használ nyomkövető vagy hirdetési sütit.',
          'A kapcsolat résznél lévő térkép csak akkor töltődik be a Google Mapsből, ha rákattintasz. Addig semmilyen adat nem kerül a Google-höz.',
        ],
      },
    ],
  };
}

// ============================================================
//  Házirend
// ============================================================

export function hazirend(nyelv: Nyelv): JogiOldal {
  if (nyelv === 'en') {
    return {
      cim: 'House Rules',
      frissitve: FRISSITVE_EN,
      blokkok: [
        {
          szoveg: [
            'A few requests so that every guest finds the cabin in the same condition you did.',
          ],
        },
        {
          cim: 'No pets',
          szoveg: [
            'We cannot accommodate pets in either cabin. This protects the furnishings and textiles, keeps the hot tub clean, and looks after guests with allergies.',
          ],
        },
        {
          cim: 'No smoking',
          szoveg: [
            'Smoking is not permitted inside the cabins or on the covered terrace. The smell cannot be removed from wood and textiles.',
          ],
        },
        {
          cim: 'No open fire',
          szoveg: [
            'We are right by the forest, so open fires — including barbecues and campfires — are not permitted anywhere on the property.',
          ],
        },
        {
          cim: 'Quiet hours',
          szoveg: [
            'Between 10:00 pm and 7:00 am please keep noise down, out of consideration for guests in the neighbouring cabin.',
          ],
        },
        {
          cim: 'The hot tub',
          szoveg: [
            'Please shower before using the hot tub, and do not take glass into or near it. Children must be supervised at all times. Use is at your own risk.',
          ],
        },
        {
          cim: 'Number of guests',
          szoveg: [
            'Only the number of guests given at booking may stay in the cabin. Visitors during the day are welcome, but please let us know in advance.',
          ],
        },
        {
          cim: 'Arrival and departure',
          szoveg: ['Check-in from 3:00 pm, check-out by 10:00 am.'],
        },
      ],
    };
  }

  return {
    cim: 'Házirend',
    frissitve: FRISSITVE,
    blokkok: [
      {
        szoveg: [
          'Néhány kérés, hogy minden vendégünk ugyanolyan állapotban találja a házat, mint te.',
        ],
      },
      {
        cim: 'Háziállat nem hozható',
        szoveg: [
          'Egyik faházba sem tudunk háziállatot fogadni. Ez a berendezést és a textíliákat védi, a jakuzzi tisztán tartását szolgálja, és allergiás vendégeink érdeke is.',
        ],
      },
      {
        cim: 'A dohányzás tilos',
        szoveg: [
          'A faházakban és a fedett teraszon egyaránt tilos a dohányzás. A szag a fából és a textíliából nem távolítható el.',
        ],
      },
      {
        cim: 'Nyílt tűz nem gyújtható',
        szoveg: [
          'Erdőszéli környezetben vagyunk, ezért a birtok egész területén tilos a nyílt tűz gyújtása — ideértve a grillezést és a tűzrakást is.',
        ],
      },
      {
        cim: 'Csendes pihenő',
        szoveg: [
          'Este 22:00 és reggel 7:00 között kérjük a csend megőrzését, a szomszédos ház vendégeire tekintettel.',
        ],
      },
      {
        cim: 'A jakuzzi',
        szoveg: [
          'Használat előtt kérjük a zuhanyzást, és kérjük, hogy üveget ne vigyetek a jakuzziba vagy a közelébe. Gyermekek felügyeletéről a vendégnek kell gondoskodnia. A használat saját felelősségre történik.',
        ],
      },
      {
        cim: 'Létszám',
        szoveg: [
          'A faházban csak a foglaláskor megadott létszám tartózkodhat. Nappali látogatót szívesen fogadunk, de kérjük, előre jelezd.',
        ],
      },
      {
        cim: 'Érkezés és távozás',
        szoveg: ['Bejelentkezés 15:00-tól, kijelentkezés 10:00-ig.'],
      },
    ],
  };
}

// ============================================================
//  Impresszum
// ============================================================

export function impresszum(nyelv: Nyelv): JogiOldal {
  const hianyzo = nyelv === 'en' ? 'to be completed' : 'kitöltendő';

  if (nyelv === 'en') {
    return {
      cim: 'Imprint',
      frissitve: FRISSITVE_EN,
      blokkok: [
        {
          cim: 'Service provider',
          szoveg: [
            `Company: ${CEG.nev}`,
            `Tax number: ${CEG.adoszam || hianyzo}`,
            `Registered office: ${CEG.szekhely || hianyzo}`,
            `Property: ${CEG.cim}`,
            `Email: ${CEG.email}`,
            CEG.telefon ? `Phone: ${CEG.telefon}` : `Phone: ${hianyzo}`,
          ],
        },
        {
          cim: 'Hosting',
          szoveg: [
            'Website: Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, USA',
            'Database: Supabase (EU region)',
          ],
        },
        {
          cim: 'Payment',
          szoveg: [
            'Card payments are processed by OTP Mobil Kft. (SimplePay), 1143 Budapest, Hungária krt. 17-19.',
          ],
        },
      ],
    };
  }

  return {
    cim: 'Impresszum',
    frissitve: FRISSITVE,
    blokkok: [
      {
        cim: 'Szolgáltató',
        szoveg: [
          `Cégnév: ${CEG.nev}`,
          `Adószám: ${CEG.adoszam || hianyzo}`,
          `Székhely: ${CEG.szekhely || hianyzo}`,
          `A szálláshely címe: ${CEG.cim}`,
          `E-mail: ${CEG.email}`,
          CEG.telefon ? `Telefon: ${CEG.telefon}` : `Telefon: ${hianyzo}`,
        ],
      },
      {
        cim: 'Tárhelyszolgáltató',
        szoveg: [
          'Weboldal: Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, USA',
          'Adatbázis: Supabase (EU régió)',
        ],
      },
      {
        cim: 'Fizetés',
        szoveg: [
          'A bankkártyás fizetést az OTP Mobil Kft. (SimplePay) biztosítja, 1143 Budapest, Hungária krt. 17-19.',
        ],
      },
    ],
  };
}
