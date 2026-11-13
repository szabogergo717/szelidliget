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

const FRISSITVE = '2026. november 13.';
const FRISSITVE_EN = '13 November 2026';

/**
 * Az ÁSZF és az adatkezelési tájékoztató verziószáma.
 *
 * Ezt mentjük el minden foglalás mellé (foglalasok.aszf_verzio), hogy
 * később bizonyítható legyen, a vendég MELYIK szöveget fogadta el.
 * Ha érdemben módosítjátok a feltételeket, LÉPTESSÉTEK ELŐRE — és a
 * FRISSITVE dátumot is írjátok át.
 */
export const ASZF_VERZIO = '2026-11-13';

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
            CEG.szekhely ? `Registered office: ${CEG.szekhely}` : 'Registered office: to be completed',
            CEG.cegjegyzekszam
              ? `Company registration number: ${CEG.cegjegyzekszam}`
              : 'Company registration number: to be completed',
            CEG.adoszam ? `Tax number: ${CEG.adoszam}` : 'Tax number: to be completed',
            `Property: ${CEG.cim}`,
            `Email: ${CEG.email}`,
            CEG.telefon ? `Phone: ${CEG.telefon}` : 'Phone: to be completed',
            'The language of the contract is Hungarian. The booking is recorded electronically and confirmed by email; details can be corrected on the booking form before the order is placed.',
          ],
        },
        {
          cim: '2. Booking and payment',
          szoveg: [
            'A booking is made online, by selecting the cabin, the dates and any extras. The price shown at the time of booking is the price payable.',
            'The full amount is due at the time of booking. Payment can be made by bank card through Barion (operated by Barion Payment Zrt.) or by bank transfer.',
            'For card payments the booking is confirmed once the payment is authorised. For bank transfers we hold the dates and the booking becomes final when the amount arrives in our account. If the transfer does not arrive within the stated deadline, we may release the dates.',
            'Placing a booking creates an obligation to pay. Acceptance of these Terms and of the Privacy Notice is required before the order is placed.',
            'An invoice is issued electronically and sent to the email address given at booking.',
          ],
        },
        {
          cim: '2.1. Card payment — Barion',
          szoveg: [
            'Online card payments are processed by Barion. Card details never reach the merchant.',
            'Barion Payment Zrt. is supervised by the Central Bank of Hungary; licence number H-EN-I-1064/2013.',
            'Barion Payment Zrt. — registered office: Irinyi József utca 4–20. 2nd floor, 1117 Budapest, Hungary; company registration number: 01-10-048552; tax number: 25353192-2-43.',
            'Accepted payment methods: Mastercard, Maestro, Visa and Visa Electron cards, Barion wallet balance, Apple Pay and Google Pay. Payment is made in HUF over a secure (SSL) connection with 3D Secure authentication.',
            'Payment takes place on the Barion payment page, to which you are redirected when finalising the booking. After a successful payment you are returned to our site and receive an email confirmation.',
            'Payment is recognised solely on the basis of Barion\'s confirmation. If a payment fails or is interrupted, no booking is created and the dates are released; the booking can then be repeated.',
            'Refunds are made using the same payment method and to the same card used for the payment.',
          ],
        },
        {
          cim: '2.2. Fulfilment time',
          szoveg: [
            'Our service is accommodation, so there is no shipping: the service is provided on the dates booked, on site.',
            'The booking is processed and the confirmation email sent immediately and automatically after successful payment — within 24 hours at the latest.',
            'Extras priced on request (e.g. massage, activities) are confirmed within 2 working days.',
            'If no confirmation arrives within 24 hours, you are released from the booking; please contact us on the phone number above.',
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
          cim: '4.1. The 14-day right of withdrawal',
          szoveg: [
            'Under Section 29(1)(l) of Government Decree 45/2014 (II. 26.), a consumer has NO 14-day right of withdrawal in the case of a contract for accommodation services for a specified date.',
            'Cancellations are therefore governed by section 4 above, not by the 14-day withdrawal rules.',
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
            'The hot tub and the outdoor areas are used at the guest\'s own risk.',
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
          CEG.szekhely ? `Székhely: ${CEG.szekhely}` : 'Székhely: kitöltendő',
          CEG.cegjegyzekszam
            ? `Cégjegyzékszám: ${CEG.cegjegyzekszam}`
            : 'Cégjegyzékszám: kitöltendő',
          CEG.adoszam ? `Adószám: ${CEG.adoszam}` : 'Adószám: kitöltendő',
          `A szálláshely címe: ${CEG.cim}`,
          `E-mail: ${CEG.email}`,
          CEG.telefon ? `Telefon: ${CEG.telefon}` : 'Telefon: kitöltendő',
          'A szerződés nyelve: magyar. A szerződés írásbeli szerződésnek minősül; a foglalást elektronikusan rögzítjük, és visszaigazoló e-mailben küldjük meg. A foglalás leadása előtt az adatok a foglalási űrlapon javíthatók.',
        ],
      },
      {
        cim: '2. A foglalás és a fizetés',
        szoveg: [
          'A foglalás online történik: kiválasztod a faházat, az időpontot és az esetleges extrákat. A foglaláskor megjelenített ár a fizetendő ár.',
          'A teljes összeg a foglaláskor esedékes. Fizetni bankkártyával a Barion rendszerén keresztül vagy banki átutalással lehet.',
          'Bankkártyás fizetésnél a foglalás a sikeres tranzakcióval válik véglegessé. Átutalásnál az időpontot fenntartjuk, és a foglalás akkor válik véglegessé, amikor az összeg megérkezik a számlánkra. Ha az utalás a megadott határidőn belül nem érkezik meg, az időpontot felszabadíthatjuk.',
          'A foglalás leadása fizetési kötelezettséget keletkeztet. A megrendelés leadása előtt a jelen ÁSZF és az Adatkezelési tájékoztató elfogadása kötelező.',
          'A számlát elektronikusan állítjuk ki, és a foglaláskor megadott e-mail címre küldjük. Az elektronikus számlát elfogadod.',
        ],
      },
      {
        cim: '2.1. A bankkártyás fizetésről — Barion',
        szoveg: [
          'Az online bankkártyás fizetések a Barion rendszerén keresztül valósulnak meg. A bankkártya adatai a kereskedőhöz nem jutnak el.',
          'A szolgáltatást nyújtó Barion Payment Zrt. a Magyar Nemzeti Bank felügyelete alatt álló intézmény, engedélyének száma: H-EN-I-1064/2013.',
          'Barion Payment Zrt. — székhely: 1117 Budapest, Irinyi József utca 4–20. 2. emelet; cégjegyzékszám: 01-10-048552; adószám: 25353192-2-43.',
          'Elfogadott fizetési módok: Mastercard, Maestro, Visa, Visa Electron bankkártya, Barion-tárca egyenleg, valamint Apple Pay és Google Pay. A fizetés HUF-ban, biztonságos (SSL) csatornán, 3D Secure azonosítással történik.',
          'A fizetés a Barion fizetőoldalán zajlik, ahova a foglalás véglegesítésekor irányítunk át. Sikeres fizetés után a rendszer visszatereli az oldalunkra, és a visszaigazolást e-mailben is megküldjük.',
          'A fizetés tényét kizárólag a Barion visszaigazolása alapján állapítjuk meg. Sikertelen vagy megszakadt fizetés esetén a foglalás nem jön létre, és az időpont felszabadul; ilyenkor a foglalás megismételhető.',
          'Visszatérítés esetén az összeget azon a fizetési módon és arra a kártyára térítjük vissza, amellyel a fizetés történt.',
        ],
      },
      {
        cim: '2.2. A teljesítés ideje',
        szoveg: [
          'Szolgáltatásunk szállás, ezért nincs kiszállítás: a teljesítés a foglalásban megjelölt időpontban, a helyszínen történik.',
          'A foglalás feldolgozása és a visszaigazoló e-mail kiküldése a sikeres fizetést követően azonnal, automatikusan megtörténik — legkésőbb 24 órán belül.',
          'Az e-mailben kért, egyedi árazású extrákat (pl. masszázs, programok) 2 munkanapon belül visszaigazoljuk.',
          'Ha a visszaigazolás 24 órán belül nem érkezik meg, a foglalási kötelezettség alól mentesülsz; ilyen esetben kérjük, keress minket a fenti telefonszámon.',
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
        cim: '4.1. A 14 napos elállási jogról',
        szoveg: [
          'A fogyasztó és a vállalkozás közötti szerződések részletes szabályairól szóló 45/2014. (II. 26.) Korm. rendelet 29. § (1) bekezdés l) pontja alapján a szállásnyújtásra irányuló, határnapra szóló szerződés esetén a fogyasztót NEM illeti meg a 14 napos indokolás nélküli elállási jog.',
          'Ez azt jelenti, hogy a foglalás lemondására a fenti 4. pont szerinti feltételek az irányadók, nem a 14 napos elállás.',
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
          'Háziállatot egyik faházban sem tudunk fogadni.',
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
          'A jakuzzi és a kültéri területek használata saját felelősségre történik.',
          'Nem vállalunk felelősséget a faházban hagyott értéktárgyakért, valamint a jelen feltételekkel vagy a házirenddel ellentétes használatból eredő károkért.',
        ],
      },
      {
        cim: '8. Panaszkezelés',
        szoveg: [
          'Kérjük, az esetleges panaszt még a tartózkodás alatt jelezd, hogy orvosolni tudjuk. Írásbeli panaszt a fenti e-mail címen fogadunk, és 30 napon belül érdemben megválaszolunk.',
          'Fogyasztóvédelmi panasszal a lakóhely szerint illetékes fővárosi vagy megyei kormányhivatal fogyasztóvédelmi hatóságához lehet fordulni.',
          'Békéltető testület (a székhelyünk szerint illetékes): Pest Megyei és Érd Megyei Jogú Városi Kereskedelmi és Iparkamara mellett működő Békéltető Testület, 1055 Budapest, Balassi Bálint utca 25. IV/2.',
          'Online vásárolt szolgáltatás esetén az Európai Bizottság online vitarendezési platformja is igénybe vehető.',
          'A szerződésre a magyar jog az irányadó.',
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
          cim: '1. The data controller',
          szoveg: [
            `Name: ${CEG.nev}`,
            CEG.szekhely ? `Registered office: ${CEG.szekhely}` : 'Registered office: to be completed',
            CEG.cegjegyzekszam
              ? `Company registration number: ${CEG.cegjegyzekszam}`
              : 'Company registration number: to be completed',
            CEG.adoszam ? `Tax number: ${CEG.adoszam}` : 'Tax number: to be completed',
            `Email: ${CEG.email}`,
            CEG.telefon ? `Phone: ${CEG.telefon}` : 'Phone: to be completed',
          ],
        },
        {
          cim: '2. What we collect and why',
          szoveg: [
            'Booking: name, email address, phone number, and billing details if given. We need these to provide the accommodation and to issue an invoice. Legal basis: performance of a contract, and a legal obligation for invoicing.',
            'Newsletter: email address and name, only if you tick the box or subscribe on the site. Legal basis: your consent, which you may withdraw at any time.',
            'Payment: card details are entered on Barion\'s own payment page and never reach us.',
          ],
        },
        {
          cim: '2.1. Legal bases',
          szoveg: [
            'Booking and guest data: performance of the contract (GDPR Art. 6(1)(b)). Without this data a booking cannot be made.',
            'Invoicing data and retention of invoices: compliance with a legal obligation (GDPR Art. 6(1)(c)) under Hungarian accounting law.',
            'Newsletter: your separate, voluntary consent (GDPR Art. 6(1)(a)). Subscribing is independent of booking and is never a condition of purchase. Consent can be withdrawn at any time, without giving a reason, using the unsubscribe link in every email or by writing to the address above.',
            'The fact, time and document version of the acceptance of these Terms: legitimate interest (GDPR Art. 6(1)(f)) — proving that the contract was concluded.',
          ],
        },
        {
          cim: '3. Who else sees the data',
          szoveg: [
            'Barion Payment Zrt. — card payment processing.',
            'Resend — sending transactional and newsletter emails.',
            'Supabase — database hosting within the EU.',
            'Vercel — website hosting.',
            'Számlázz.hu — invoicing, where used.',
            'We do not sell or share personal data for advertising.',
          ],
        },
        {
          cim: '4. Data transfer statement',
          szoveg: [
            `I acknowledge that the following personal data stored by ${CEG.nev} as data controller in the user database of www.szelidliget.hu will be transferred to Barion Payment Zrt. (Irinyi József utca 4–20. 2nd floor, 1117 Budapest, Hungary) as data processor. The scope of the data transferred: name, email address, phone number, billing address, amount. The nature and purpose of the processing carried out by the data processor can be reviewed in Barion's privacy notice: https://www.barion.com/en/privacy-policy/`,
          ],
        },
        {
          cim: '5. How long we keep it',
          szoveg: [
            'Booking and invoicing data: for the period required by accounting law (currently eight years).',
            'Newsletter data: until you unsubscribe.',
          ],
        },
        {
          cim: '6. Your rights',
          szoveg: [
            'You may request access to, correction or deletion of your data, restriction of processing, or a copy in a portable format. You may withdraw consent for the newsletter at any time using the unsubscribe link.',
            `Requests: ${CEG.email}`,
            'You may also lodge a complaint with the Hungarian National Authority for Data Protection and Freedom of Information (NAIH).',
          ],
        },
        {
          cim: '7. Cookies',
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
          'Az adatkezelés az Európai Parlament és a Tanács (EU) 2016/679 rendelete (GDPR) és az információs önrendelkezési jogról szóló 2011. évi CXII. törvény szerint történik.',
        ],
      },
      {
        cim: '1. Az adatkezelő',
        szoveg: [
          `Név: ${CEG.nev}`,
          CEG.szekhely ? `Székhely: ${CEG.szekhely}` : 'Székhely: kitöltendő',
          CEG.cegjegyzekszam
            ? `Cégjegyzékszám: ${CEG.cegjegyzekszam}`
            : 'Cégjegyzékszám: kitöltendő',
          CEG.adoszam ? `Adószám: ${CEG.adoszam}` : 'Adószám: kitöltendő',
          `E-mail: ${CEG.email}`,
          CEG.telefon ? `Telefon: ${CEG.telefon}` : 'Telefon: kitöltendő',
          'Önálló adatvédelmi tisztviselő kijelölése nem kötelező, ezért nem jelöltünk ki ilyet. Adatvédelmi kérdésekben a fenti e-mail címen válaszolunk.',
        ],
      },
      {
        cim: '2. Milyen adatot kezelünk és miért',
        szoveg: [
          'Foglalás: név, e-mail cím, telefonszám, valamint — ha megadod — számlázási adatok. Ezekre a szállás biztosításához és a számla kiállításához van szükség. Jogalap: szerződés teljesítése, illetve a számlázás körében jogi kötelezettség.',
          'Hírlevél: e-mail cím és név, kizárólag akkor, ha a jelölőnégyzetet bepipálod, vagy feliratkozol az oldalon. Jogalap: a te hozzájárulásod, amit bármikor visszavonhatsz.',
          'Fizetés: a bankkártya adatait a Barion saját fizetőoldalán adod meg, azok hozzánk nem jutnak el.',
        ],
      },
      {
        cim: '2.1. Milyen jogalapon',
        szoveg: [
          'Foglalási és vendégadatok: a szerződés teljesítése (GDPR 6. cikk (1) b)). Ezek megadása nélkül a foglalás nem jöhet létre.',
          'Számlázási adatok és a számla megőrzése: jogi kötelezettség teljesítése (GDPR 6. cikk (1) c)), a számviteli törvény alapján.',
          'Hírlevél: a te önkéntes, külön hozzájárulásod (GDPR 6. cikk (1) a)). A hírlevélre feliratkozni a foglalástól függetlenül lehet, és ez SOHA nem feltétele a vásárlásnak. A hozzájárulás bármikor, indokolás nélkül visszavonható: minden levél alján van leiratkozó link, vagy írj a fenti e-mail címre. A visszavonás a korábbi adatkezelés jogszerűségét nem érinti.',
          'Az ÁSZF elfogadásának ténye, időpontja és a dokumentum verziószáma: jogos érdek (GDPR 6. cikk (1) f)) — a szerződés létrejöttének bizonyítása, esetleges jogvita esetén.',
        ],
      },
      {
        cim: '3. Kik láthatják még az adatokat',
        szoveg: [
          'Barion Payment Zrt. — bankkártyás fizetés lebonyolítása.',
          'Resend — a visszaigazoló és hírlevél e-mailek kiküldése.',
          'Supabase — adatbázis-tárolás az Európai Unión belül.',
          'Vercel — a weboldal kiszolgálása.',
          'Számlázz.hu — számlázás, ahol ezt használjuk.',
          'Személyes adatot reklámcélra nem adunk át és nem értékesítünk.',
        ],
      },
      {
        cim: '4. Adattovábbítási nyilatkozat',
        szoveg: [
          `Tudomásul veszem, hogy a ${CEG.nev} adatkezelő által a www.szelidliget.hu felhasználói adatbázisában tárolt alábbi személyes adataim átadásra kerülnek a Barion Payment Zrt. (1117 Budapest, Irinyi József utca 4–20. 2. emelet), mint adatfeldolgozó részére. Az adatkezelő által továbbított adatok köre az alábbi: név, e-mail cím, telefonszám, számlázási cím, összeg. Az adatfeldolgozó által végzett adatfeldolgozási tevékenység jellege és célja a Barion Adatkezelési tájékoztatójában tekinthető meg: https://www.barion.com/hu/adatvedelmi-tajekoztato/`,
        ],
      },
      {
        cim: '5. Meddig őrizzük',
        szoveg: [
          'Foglalási és számlázási adatok: a számviteli törvény szerinti ideig (jelenleg nyolc év).',
          'Hírlevél-adatok: a leiratkozásig.',
        ],
      },
      {
        cim: '6. A te jogaid',
        szoveg: [
          'Kérheted az adataidhoz való hozzáférést, azok helyesbítését vagy törlését, a kezelés korlátozását, illetve másolatot hordozható formátumban. A hírlevélhez adott hozzájárulást bármikor visszavonhatod a levelek alján lévő leiratkozó linkkel.',
          `Megkeresés: ${CEG.email}`,
          'Panasszal a Nemzeti Adatvédelmi és Információszabadság Hatósághoz (NAIH) is fordulhatsz.',
        ],
      },
      {
        cim: '7. Sütik',
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
            'Smoking is not permitted inside the cabins or on the covered terrace. If you smoke, please do so well away from the cabins and put the stub out carefully — by the forest, a single ember is enough to cause harm.',
          ],
        },
        {
          cim: 'No open fire',
          szoveg: [
            'A fire ban is in force on the property all year round. We are right by the forest, so open fires — including barbecues and campfires — are not permitted anywhere on the property.',
          ],
        },
        {
          cim: 'Quiet hours',
          szoveg: [
            'Between 10:00 pm and 7:00 am please keep noise down. The quiet of the grove is what our guests come here for.',
          ],
        },
        {
          cim: 'The hot tub',
          szoveg: [
            'If you have epilepsy or are sensitive to flashing light, please do NOT switch on the light therapy. The changing, flickering colours can trigger a seizure, which in water is life-threatening. The lights can be turned off at any time with the LIGHT button.',
            'Please shower before using the hot tub, and do not take glass into or near it. Use is at your own risk.',
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
          'Egyik faházban sem tudunk háziállatot fogadni. Ez a berendezést és a textíliákat védi, a jakuzzi tisztán tartását szolgálja, és allergiás vendégeink érdeke is.',
        ],
      },
      {
        cim: 'A dohányzás tilos',
        szoveg: [
          'A faházakban és a fedett teraszon egyaránt tilos a dohányzás. Ha dohányzol, kérjük, tedd a házaktól távolabb, és a csikket gondosan oltsd el — erdőszéli környezetben egy parázs is elég a bajhoz.',
        ],
      },
      {
        cim: 'Nyílt tűz nem gyújtható',
        szoveg: [
          'A területen egész évben tűzgyújtási tilalom van érvényben. Erdőszéli környezetben vagyunk, ezért a birtok egész területén tilos a nyílt tűz gyújtása — ideértve a grillezést és a tűzrakást is.',
        ],
      },
      {
        cim: 'Csendes pihenő',
        szoveg: [
          'Este 22:00 és reggel 7:00 között kérjük a csend megőrzését. A liget nyugalma az, amiért a vendégeink idejönnek.',
        ],
      },
      {
        cim: 'A jakuzzi — fényterápia, epilepszia',
        szoveg: [
          'Ha epilepsziás vagy, vagy fényérzékenységre hajlamos, kérjük, NE kapcsold be a fényterápiát. A váltakozó, villódzó színes fény rohamot válthat ki.',
          'Ez a vízben életveszélyes: egy roham fulladáshoz vezethet. Ha bizonytalan vagy, hagyd kikapcsolva — a medence fényterápia nélkül is ugyanúgy használható, és a világítás a LIGHT gombbal bármikor kioltható.',
        ],
      },
      {
        cim: 'A jakuzzi — alapvető szabályok',
        szoveg: [
          'A kültéri jakuzzit mindenki saját felelősségére, egészségi állapota tudatában veheti igénybe. A medencében egyszerre 2 fő tartózkodhat.',
          'A jakuzzi lazításra és masszázsra való, tisztálkodásra kérjük ne használd. Használat előtt mindig zuhanyozz le, és mosd le a krémeket, testápolót, sminket — ezek erősen habzó vizet okoznak és rontják a víz minőségét.',
          'Izzadtan (napozás, sportolás után) ne menj be a vízbe. Idegen anyagot — szappant, tusfürdőt — bevinni tilos. Ételt és italt kérjük ne vigyél a jakuzziba.',
          'Gyertyát, mécsest a jakuzzi peremére helyezni tilos. Elektromos eszközt ne használj a vízben, mert áramütést okozhat. Viharban ne tartózkodj a vízben.',
          'Terhes nők, gyógykezelés alatt állók és keringési panaszokkal élők a használat előtt kérjék orvosuk tanácsát. Az eszméletvesztés elkerülése érdekében fürdőzés előtt és közben ne igyál alkoholt.',
          'Be- és kiszállásnál légy óvatos a csúszásveszély miatt, és kapcsold ki a masszázsfunkciókat, hogy lásd, hova lépsz.',
        ],
      },
      {
        cim: 'A jakuzzi — használat',
        szoveg: [
          'A kijelzőn az aktuális hőmérséklet látható, a fel-le nyilakkal állítható, fél fokonként. Amíg a hőmérséklet villog, más gombhoz ne nyúlj, mert elállítódhat a program.',
          'Az alapbeállítás hideg időben 37, nyáron 34 fok. Kérjük, ne állítsd 38 fok fölé: a hosszas fürdőzés ennél melegebb vízben árthat az egészségnek.',
          'A masszázsprogram 15 percig megy, majd leáll — a JET gombbal újraindítható. A peremen lévő szürke gomb eltekerésével oxigénnel dúsítható a víz. A LIGHT gomb a fényterápiát kapcsolja (epilepszia vagy fényérzékenység esetén hagyd kikapcsolva), a FLIP a kijelző irányát fordítja.',
          'A jakuzzi időnként magától vizet forgat és tisztít: ilyenkor egyes fúvókák működnek, és ózonbuborékok jönnek fel. Ez normális, kikapcsolni nem lehet. Ugyanígy a fűtés közbeni vízforgatás is.',
          'Ha valami beleesik a vízbe, a reggeli szekrényke oldalában találsz hálót.',
        ],
      },
      {
        cim: 'A jakuzzi — használat után',
        szoveg: [
          'Óvatosan szállj ki, és kapcsold ki az esetleg még működő masszázsprogramot és fényterápiát.',
          'Emeld vissza a thermotetőt a medencére, győződj meg róla, hogy mindenhol illeszkedik, és rögzítsd a csatokkal — szeles időben a szél lekaphatja. A tető tartja a hőmérsékletet és a víz tisztaságát.',
          'A jakuzzit nem kell (és nem is szabad) kikapcsolni: elég a thermotetőt visszahelyezni.',
          'Kérjük, olyan állapotban hagyd a jakuzzit, ahogyan legközelebb te is találni szeretnéd. Ha meghibásodást, rendellenes működést vagy hibaüzenetet tapasztalsz, illetve ha a víz beszennyeződött, kérjük, szólj nekünk, hogy mielőbb intézkedhessünk.',
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
            `Registered office: ${CEG.szekhely || hianyzo}`,
            `Company registration number: ${CEG.cegjegyzekszam || hianyzo}`,
            `Tax number: ${CEG.adoszam || hianyzo}`,
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
            'Card payments are processed by Barion Payment Zrt., 1117 Budapest, Irinyi József utca 4–20. 2. emelet.',
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
          `Székhely: ${CEG.szekhely || hianyzo}`,
          `Cégjegyzékszám: ${CEG.cegjegyzekszam || hianyzo}`,
          `Adószám: ${CEG.adoszam || hianyzo}`,
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
          'A bankkártyás fizetést a Barion Payment Zrt. biztosítja, 1117 Budapest, Irinyi József utca 4–20. 2. emelet.',
        ],
      },
    ],
  };
}
