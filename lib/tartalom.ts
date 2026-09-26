/**
 * Az oldal szövegei, magyarul és angolul.
 *
 * Miért egy fájlban? Mert így egy új szöveg felvitelekor a fordító
 * rögtön szól, ha valamelyik nyelv kimaradt — nem lehet félig lefordított
 * oldal. A típus (Szoveg) kényszeríti ki, hogy mindkét nyelv meglegyen.
 */

export type Nyelv = 'hu' | 'en';

export const NYELVEK: Nyelv[] = ['hu', 'en'];

/** A másik nyelv útvonala — a nyelvváltóhoz. */
export function masikNyelvUt(nyelv: Nyelv): string {
  return nyelv === 'hu' ? '/en' : '/';
}

export function utvonal(nyelv: Nyelv, ut = ''): string {
  const alap = nyelv === 'hu' ? '' : '/en';
  return `${alap}${ut}` || '/';
}

type Szoveg = { hu: string; en: string };

const S = (hu: string, en: string): Szoveg => ({ hu, en });

export const T = {
  // ---------- általános ----------
  markaNev: S('Szelid Liget', 'Szelid Liget'),
  oldalCim: S(
    'Szelid Liget — Füge és Mandula faház',
    'Szelid Liget — Füge and Mandula cabins'
  ),
  oldalLeiras: S(
    'Két önállóan foglalható prémium faház a víz partján. Online foglalás, azonnali visszaigazolás.',
    'Two independently bookable premium cabins by the water. Book online, confirmed instantly.'
  ),

  // ---------- menü ----------
  menuHazak: S('Faházak', 'Cabins'),
  menuFoglalas: S('Foglalás', 'Booking'),
  menuKornyek: S('Környék', 'Nearby'),
  menuGyik: S('GyIK', 'FAQ'),
  menuKapcsolat: S('Kapcsolat', 'Contact'),
  gombFoglalas: S('Foglalás', 'Book'),

  // ---------- hero ----------
  heroCim: S(
    'Két faház a vízparton',
    'Two cabins by the water'
  ),
  heroAlcim: S(
    'A Füge és a Mandula egymástól függetlenül foglalható, néhány lépésre a parttól. Kint dézsa, bent csend — és annyi kényelem, amennyi egy hosszú hétvégéhez kell.',
    'Füge and Mandula can be booked independently, a few steps from the shore. A hot tub outside, quiet inside — and enough comfort for a long weekend.'
  ),
  heroGombSzabad: S('Szabad időpontok', 'Check dates'),
  heroGombHazak: S('A két ház', 'The cabins'),

  tenyHazak: S('önálló faház', 'separate cabins'),
  tenyFo: S('fő házanként', 'guests per cabin'),
  tenyViz: S('perc a vízpartig', 'minutes to the water'),
  tenyVisszaigazolas: S('azonnali visszaigazolás', 'instant confirmation'),

  // ---------- faházak ----------
  hazakCimke: S('A KÉT HÁZ', 'THE CABINS'),
  hazakCim: S('Füge és Mandula', 'Füge and Mandula'),
  hazakBevezeto: S(
    'Két ház, két karakter, egy liget. Mindkettőnek saját terasza, dézsája és foglaltsági naptára van — külön-külön és együtt is foglalhatók.',
    'Two cabins, two characters, one grove. Each has its own terrace, hot tub and availability calendar — bookable separately or together.'
  ),

  fugeCimke: S('A FÜGEFA MELLETT', 'BY THE FIG TREE'),
  fugeAlcim: S(
    'Kisebb, védettebb, két főnek ideális',
    'Smaller, sheltered, ideal for two'
  ),
  fugeLeiras: S(
    'A Füge a liget csendesebb felén áll, egy öreg fügefa mellett. Nyitott belső tér galériával, kandallóval és padlófűtéssel — ősztől tavaszig is meleg. A terasz délnyugatra néz, így a késő délutáni nap végig kitart rajta.',
    'Füge sits on the quieter side of the grove, beside an old fig tree. Open-plan inside with a loft, fireplace and underfloor heating — warm from autumn through spring. The terrace faces southwest, so it holds the late afternoon sun.'
  ),
  fugeFelszereltseg: S(
    'Kültéri dézsa, kandalló, szauna',
    'Hot tub, fireplace, sauna'
  ),
  fugeHalo: S('1 hálószoba + galéria', '1 bedroom + loft'),

  mandulaCimke: S('A MANDULÁSNÁL', 'BY THE ALMOND TREES'),
  mandulaAlcim: S(
    'Tágasabb, vízparti, nagyobb társaságnak',
    'Larger, waterside, for bigger groups'
  ),
  mandulaLeiras: S(
    'A Mandula lejjebb, közvetlenül a víz mellett áll, saját stéggel és tűzrakóhellyel. Két külön hálótér és tágas nappali — két családnak vagy baráti társaságnak is kényelmes. Tavasszal a mandulafák virágzása a teraszról nézhető.',
    'Mandula sits lower, right by the water, with its own deck and fire pit. Two separate sleeping areas and a spacious living room — comfortable for two families or a group of friends. In spring you can watch the almond blossom from the terrace.'
  ),
  mandulaFelszereltseg: S(
    'Kültéri dézsa, tűzrakó, saját stég',
    'Hot tub, fire pit, private deck'
  ),
  mandulaHalo: S('2 hálószoba', '2 bedrooms'),

  specVendegek: S('Vendégek', 'Sleeps'),
  specHalo: S('Hálótér', 'Bedrooms'),
  specFelszereltseg: S('Felszereltség', 'Amenities'),
  specMinimum: S('Minimum', 'Minimum stay'),
  fo: S('fő', 'guests'),
  ejszakaTol: S('éjszakától', 'nights or more'),
  arEttol: S('Éjszakánként, ettől', 'Per night, from'),
  gombFoglalom: S('Foglalom', 'Book this'),

  // ---------- foglalás ----------
  foglalasCimke: S('FOGLALÁS', 'BOOKING'),
  foglalasCim: S('Nézzük meg a szabad időpontokat', 'Find your dates'),
  foglalasBevezeto: S(
    'Válassz házat, dátumot és extrákat. Az árat a rendszer élőben számolja, és pontosan ennyit fogsz fizetni.',
    'Pick a cabin, dates and extras. The price is calculated live, and that is exactly what you will pay.'
  ),

  mezoHaz: S('FAHÁZ', 'CABIN'),
  mezoVendegek: S('VENDÉGEK', 'GUESTS'),
  mezoErkezes: S('ÉRKEZÉS', 'CHECK-IN'),
  mezoTavozas: S('TÁVOZÁS', 'CHECK-OUT'),
  extrakCim: S('EXTRA SZOLGÁLTATÁSOK', 'EXTRA SERVICES'),
  ejszakankent: S('éjszakánként', 'per night'),

  osszesito: S('Összesítő', 'Summary'),
  osszEjszakak: S('Éjszakák', 'Nights'),
  osszSzallas: S('Szállásdíj', 'Accommodation'),
  osszExtrak: S('Extrák', 'Extras'),
  osszFizetendo: S('Fizetendő', 'Total'),

  adataidCim: S('Adataid', 'Your details'),
  mezoNev: S('NÉV', 'NAME'),
  mezoEmail: S('E-MAIL', 'EMAIL'),
  mezoTelefon: S('TELEFON (nem kötelező)', 'PHONE (optional)'),
  mezoMegjegyzes: S('MEGJEGYZÉS (nem kötelező)', 'NOTES (optional)'),

  gombTovabb: S('Tovább a fizetéshez', 'Continue to payment'),
  gombFeldolgozas: S('Feldolgozás…', 'Processing…'),
  fizetesiTajekoztato: S(
    'A teljes összeg foglaláskor fizetendő bankkártyával. A visszaigazoló e-mail és a számla automatikusan érkezik.',
    'The full amount is payable at booking by card. The confirmation email and invoice arrive automatically.'
  ),

  allapotSzabad: S(
    'A választott időszak szabad.',
    'The selected dates are available.'
  ),
  allapotFoglalt: S(
    'Ez az időszak sajnos foglalt. Válassz másik dátumot.',
    'These dates are already taken. Please choose others.'
  ),
  allapotBetoltes: S('Egy pillanat…', 'One moment…'),
  hibaAltalanos: S(
    'Valami hiba történt. Próbáld újra, vagy írj nekünk e-mailben.',
    'Something went wrong. Please try again, or email us.'
  ),

  // ---------- folyamat ----------
  folyamatCimke: S('FOLYAMAT', 'PROCESS'),
  folyamatCim: S('Foglalástól az érkezésig', 'From booking to arrival'),
  folyamatBevezeto: S(
    'A teljes folyamat automatikus — emberi beavatkozás csak akkor kell, ha valami rendhagyó történik.',
    'The whole process is automatic — a person is only involved when something out of the ordinary happens.'
  ),
  lepes1Cim: S('Ház és dátum', 'Cabin and dates'),
  lepes1: S(
    'A naptár valós időben mutatja a szabad napokat, a saját oldalon és a külső csatornákon egyszerre.',
    'The calendar shows free dates in real time, on the site and across external channels at once.'
  ),
  lepes2Cim: S('Fizetés', 'Payment'),
  lepes2: S(
    'Bankkártyás fizetés SimplePayen. A foglalás státusza automatikusan követi a fizetés eredményét.',
    'Card payment via SimplePay. The booking status follows the payment result automatically.'
  ),
  lepes3Cim: S('Visszaigazolás és számla', 'Confirmation and invoice'),
  lepes3: S(
    'Automatikus e-mail és számla, a vendég nyelvén — magyarul vagy angolul.',
    "Automatic email and invoice, in the guest's language — Hungarian or English."
  ),
  lepes4Cim: S('Érkezés előtt', 'Before arrival'),
  lepes4: S(
    'Pár nappal korábban megérkezik a kulcsdoboz kódja, a megközelítés és a parkolás leírása.',
    'A few days ahead: the lockbox code, directions and parking details.'
  ),

  // ---------- környék ----------
  kornyekCimke: S('A KÖRNYÉK', 'NEARBY'),
  kornyekCim: S('Mit érdemes csinálni', "What's worth doing"),
  kornyek1Cimke: S('VÍZPART', 'WATERSIDE'),
  kornyek1Cim: S('Csónakázás és horgászat', 'Boating and fishing'),
  kornyek1: S(
    'A Mandula stégjéről indulhatsz. Csónak és horgászfelszerelés a helyszínen kérhető.',
    "Set off from Mandula's deck. Boat and fishing gear available on site."
  ),
  kornyek2Cimke: S('TÚRA', 'HIKING'),
  kornyek2Cim: S('Erdei ösvények', 'Forest trails'),
  kornyek2: S(
    'Jelzett útvonalak indulnak a ligetből, gyerekkel is teljesíthető szakaszokkal.',
    'Marked trails start from the grove, with sections easy enough for children.'
  ),
  kornyek3Cimke: S('BOR', 'WINE'),
  kornyek3Cim: S('Pincészetek', 'Wineries'),
  kornyek3: S(
    'Kóstolók és pincelátogatások a közeli falvakban, autóval negyed óra.',
    'Tastings and cellar visits in nearby villages, a fifteen-minute drive.'
  ),
  kornyek4Cimke: S('TÉL', 'WINTER'),
  kornyek4Cim: S('Dézsa és kandalló', 'Hot tub and fireplace'),
  kornyek4: S(
    'Hidegben a dézsa a fő program. Tűzifa és forralt bor alapanyag a házban.',
    'In the cold the hot tub is the main event. Firewood and mulled wine supplies in the cabin.'
  ),

  // ---------- GyIK ----------
  gyikCimke: S('KÉRDÉSEK', 'QUESTIONS'),
  gyikCim: S('Gyakran ismételt kérdések', 'Frequently asked questions'),
  gyik1K: S('Mennyit kell fizetni foglaláskor?', 'How much is due at booking?'),
  gyik1V: S(
    'A teljes összeget. Így nincs utólagos utánkövetés, és a foglalás azonnal véglegessé válik.',
    'The full amount. This means no chasing payments later, and the booking is final straight away.'
  ),
  gyik2K: S('Mi történik lemondás esetén?', 'What happens if I cancel?'),
  gyik2V: S(
    'A lemondási és visszatérítési szabályokat a foglalás visszaigazolása és az ÁSZF tartalmazza.',
    'Cancellation and refund rules are set out in the booking confirmation and the terms of service.'
  ),
  gyik3K: S(
    'Foglalható a két ház egyszerre?',
    'Can both cabins be booked together?'
  ),
  gyik3V: S(
    'Igen. Nagyobb társaságnál ez a leggyakoribb — együtt tíz főig kényelmes.',
    "Yes. For larger groups this is the most common choice — together they're comfortable for up to ten."
  ),
  gyik4K: S('Vihetünk kutyát?', 'Can we bring a dog?'),
  gyik4V: S(
    'A Mandulába igen, előzetes jelzéssel. A Fügébe a kisebb terasz és a szomszédos ház közelsége miatt nem.',
    'To Mandula yes, with advance notice. Not to Füge, because of the smaller terrace and the neighbouring cabin.'
  ),

  // ---------- kapcsolat ----------
  kapcsolatCimke: S('KAPCSOLAT', 'CONTACT'),
  kapcsolatCim: S('Kérdésed van érkezés előtt?', 'Questions before you arrive?'),
  kapcsolatBevezeto: S(
    'A foglalás és a fizetés automatikus, de egyedi kérésekben szívesen segítünk e-mailben.',
    "Booking and payment run automatically, but we're glad to help with special requests by email."
  ),
  kapcsEmail: S('E-MAIL', 'EMAIL'),
  kapcsErkezes: S('ÉRKEZÉS', 'CHECK-IN'),
  kapcsErkezesErtek: S('16:00-tól, kulcsdobozzal', 'From 4:00 pm, via lockbox'),
  terkepHelye: S(
    'Térkép — a pontos cím a visszaigazolóban',
    'Map — exact address in your confirmation'
  ),

  // ---------- lábléc ----------
  lablecAszf: S('ÁSZF', 'Terms'),
  lablecAdatvedelem: S('Adatvédelem', 'Privacy'),
  lablecImpresszum: S('Impresszum', 'Imprint'),

  // ---------- fizetés utáni oldalak ----------
  sikerCim: S('Köszönjük a foglalást!', 'Thank you for your booking'),
  sikerSzoveg: S(
    'A fizetés megérkezett, a foglalásod véglegesítve. A visszaigazoló e-mailt és a számlát néhány percen belül megkapod.',
    'Your payment has arrived and your booking is confirmed. The confirmation email and invoice will arrive within a few minutes.'
  ),
  sikerAzonosito: S('Foglalási azonosító', 'Booking reference'),
  sikerEmailNemJott: S(
    'Ha 10 percen belül nem érkezik meg az e-mail, nézd meg a spam mappát is, vagy írj nekünk.',
    "If the email hasn't arrived within 10 minutes, check your spam folder or email us."
  ),

  hibaCim: S('A fizetés nem sikerült', 'The payment did not go through'),
  hibaSzoveg: S(
    'A bank elutasította a tranzakciót, vagy megszakadt a kapcsolat. Pénz nem került levonásra. A foglalásod nem jött létre — nyugodtan próbáld újra.',
    'The bank declined the transaction, or the connection was lost. No money was taken. Your booking was not created — feel free to try again.'
  ),

  megszakitvaCim: S('Megszakítottad a fizetést', 'You cancelled the payment'),
  megszakitvaSzoveg: S(
    'Nem történt terhelés, és foglalás sem jött létre. Ha meggondolod magad, az időpont továbbra is elérhető lehet.',
    'Nothing was charged and no booking was created. If you change your mind, the dates may still be available.'
  ),

  lejartCim: S('Lejárt a fizetési idő', 'The payment timed out'),
  lejartSzoveg: S(
    'A fizetésre szánt idő letelt, ezért a tranzakció megszakadt. Terhelés nem történt. Kezdd újra a foglalást.',
    'The time allowed for payment ran out, so the transaction was cancelled. Nothing was charged. Please start the booking again.'
  ),

  vissza: S('Vissza a foglaláshoz', 'Back to booking'),
  fooldalra: S('Főoldal', 'Home'),
} satisfies Record<string, Szoveg>;

/** Rövidítés a komponensekben: t(nyelv, 'heroCim') */
export function t(nyelv: Nyelv, kulcs: keyof typeof T): string {
  return T[kulcs][nyelv];
}
