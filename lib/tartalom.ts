/**
 * Az oldal szövegei, magyarul és angolul.
 *
 * Miért egy fájlban? Mert így egy új szöveg felvitelekor a fordító
 * rögtön szól, ha valamelyik nyelv kimaradt — nem lehet félig lefordított
 * oldal. A típus (Szoveg) kényszeríti ki, hogy mindkét nyelv meglegyen.
 */

export type Nyelv = 'hu' | 'en';

export const NYELVEK: Nyelv[] = ['hu', 'en'];

export function masikNyelvUt(nyelv: Nyelv): string {
  return nyelv === 'hu' ? '/en' : '/';
}

export function utvonal(nyelv: Nyelv, ut = ''): string {
  const alap = nyelv === 'hu' ? '' : '/en';
  return `${alap}${ut}` || '/';
}

/** A vállalkozás adatai — egy helyen, hogy ne csússzon szét az oldalon. */
export const CEG = {
  nev: 'Szekundum Kft.',
  // A hiányzó adatokat a NEXT_PUBLIC_ADOSZAM és NEXT_PUBLIC_SZEKHELY
  // környezeti változóból vesszük, hogy ne kelljen kódot módosítani.
  adoszam: process.env.NEXT_PUBLIC_ADOSZAM ?? '',
  szekhely: process.env.NEXT_PUBLIC_SZEKHELY ?? '',
  cim: '6328 Dunapataj-Szelidi tó, Kastély utca 17.',
  email: 'foglalas@szelidliget.hu',
  telefon: process.env.NEXT_PUBLIC_TELEFON ?? '',
  // Térkép: a cím koordinátái
  terkepQuery: 'Dunapataj, Kastély utca 17, 6328',
};

/** Közösségi oldalak. Üres érték = a link nem jelenik meg. */
export const SOCIAL = {
  facebook: process.env.NEXT_PUBLIC_FACEBOOK ?? '',
  instagram: process.env.NEXT_PUBLIC_INSTAGRAM ?? '',
  tiktok: process.env.NEXT_PUBLIC_TIKTOK ?? '',
};

type Szoveg = { hu: string; en: string };
const S = (hu: string, en: string): Szoveg => ({ hu, en });

export const T = {
  // ---------- általános ----------
  markaNev: S('Szelid Liget', 'Szelid Liget'),
  oldalCim: S(
    'Szelid Liget — Luxus faházak a Szelidi-tónál',
    'Szelid Liget — Luxury cabins at Lake Szelid'
  ),
  oldalLeiras: S(
    'Két prémium faház privát jakuzzival, az erdő szélén, a Szelidi-tónál. Online foglalás, azonnali visszaigazolás.',
    'Two premium cabins with private hot tubs, at the forest edge by Lake Szelid. Book online, confirmed instantly.'
  ),

  // ---------- menü ----------
  menuHazak: S('Faházak', 'Cabins'),
  menuSzolgaltatasok: S('Szolgáltatások', 'Amenities'),
  menuFoglalas: S('Foglalás', 'Booking'),
  menuKornyek: S('Környék', 'Nearby'),
  menuRolunk: S('Rólunk', 'About us'),
  menuGyik: S('GyIK', 'FAQ'),
  menuKapcsolat: S('Kapcsolat', 'Contact'),
  gombFoglalas: S('Foglalás', 'Book'),

  // ---------- hero ----------
  heroCim: S('Luxus faházak az erdő szélén', 'Luxury cabins at the forest edge'),
  heroAlcim: S(
    'A Füge és a Mandula egymástól függetlenül foglalható, néhány lépésre az erdő szélétől. Kint jakuzzi, bent csend és kényelem.',
    'Füge and Mandula can be booked independently, a few steps from the forest edge. A hot tub outside, quiet and comfort inside.'
  ),
  heroGombSzabad: S('Szabad időpontok', 'Check dates'),
  heroGombHazak: S('A két ház', 'The cabins'),

  tenyHazak: S('önálló faház', 'separate cabins'),
  tenyFo: S('fő házanként', 'guests per cabin'),
  tenyViz: S('perc a vízpartig', 'minutes to the lake'),
  tenyVisszaigazolas: S('órás visszaigazolás', 'hour confirmation'),

  // ---------- faházak ----------
  hazakCimke: S('A KÉT HÁZ', 'THE CABINS'),
  hazakCim: S('Füge és Mandula', 'Füge and Mandula'),
  hazakBevezeto: S(
    'Két ház, két karakter, egy liget. Mindkettőnek saját terasza és jakuzzija van — külön-külön és együtt is foglalhatók.',
    'Two cabins, two characters, one grove. Each has its own terrace and hot tub — bookable separately or together.'
  ),

  fugeCimke: S('AZ ERDŐ KÖZELÉBEN', 'CLOSE TO THE FOREST'),
  fugeAlcim: S(
    'Védettebb, az erdő közvetlen közelében',
    'More sheltered, right by the forest'
  ),
  fugeLeiras: S(
    'A Füge a liget csendesebb, nyugodtabb részén található, ahol a természet közelsége és a zavartalan pihenés kerül a középpontba. Elegáns enteriőrjében az arany, fekete és drapp árnyalatok harmonikus kombinációja teremti meg a kifinomult, otthonos hangulatot. A légkondicionáló, a látványkandalló és a kiváló minőségű matrac egész évben gondoskodnak a kényelemről, míg a fényterápia tovább fokozza a relaxáció élményét. A délnyugati fekvésű teraszon a késő délutáni napfény hosszan elkísér, így tökéletes helyszín egy nyugodt nap lezárásához. A Füge egész évben foglalható, hogy bármely évszakban legyen egy saját kis menedéked a természetben.',
    'Füge sits on the quieter, calmer side of the grove, where closeness to nature and undisturbed rest come first. Its elegant interior combines gold, black and beige tones into a refined, homely atmosphere. Air conditioning, a feature fireplace and a high-quality mattress keep it comfortable all year, while light therapy deepens the sense of relaxation. On the southwest-facing terrace the late afternoon sun stays with you for hours — the perfect place to close a quiet day. Füge is bookable all year round, so you have your own small retreat in nature in any season.'
  ),
  fugeFelszereltseg: S(
    'Jakuzzi 24 m²-es fedett teraszon, kerti bútorok, franciaágy 30 cm-es matraccal, TV (Netflix), gépesített konyha, Tchibo kapszulás kávéfőző',
    'Hot tub on a 24 m² covered terrace, garden furniture, double bed with 30 cm mattress, TV (Netflix), fitted kitchen, Tchibo capsule coffee machine'
  ),
  fugeHalo: S('Stúdió jellegű elrendezés', 'Studio layout'),

  mandulaCimke: S('AZ ÓRIÁS PLATÁNNÁL', 'BY THE GIANT PLANE TREE'),
  mandulaAlcim: S(
    'Ligeti kilátás, óriás platán közelében',
    'Grove views, beside a giant plane tree'
  ),
  mandulaLeiras: S(
    'Élvezd a természet nyugalmát egy különleges, erdőszéli luxus faházban, ahol a modern kényelem és a természet közelsége tökéletes harmóniában találkozik. A 28 m²-es, nyugati fekvésű terasz ideális hely a pihenésre, miközben a saját jakuzzi gondoskodik a teljes kikapcsolódásról. A kényelmes kerti bútorokon ülve gyönyörködhetsz a naplementében és az erdő nyugalmában. Egy privát kis menedék, ahol kiszakadhatsz a mindennapokból, és igazán átadhatod magad a pihenésnek. A faház elegáns, modern enteriőrjét a kék, ezüst és fekete színek harmonikus kombinációja teszi igazán különlegessé.',
    'Enjoy the calm of nature in a striking luxury cabin at the forest edge, where modern comfort and closeness to nature meet in perfect harmony. The 28 m², west-facing terrace is made for resting, while the private hot tub takes care of switching off completely. From the comfortable garden furniture you can watch the sunset and the quiet of the forest. A private little retreat where you can step out of everyday life and truly give yourself over to rest. The cabin\'s elegant, modern interior is made distinctive by a harmonious combination of blue, silver and black.'
  ),
  mandulaFelszereltseg: S(
    'Jakuzzi 28 m²-es fedett teraszon, kerti bútorok, franciaágy 30 cm-es matraccal, TV (Netflix), gépesített konyha, Tchibo kapszulás kávéfőző (ingyen kapszula)',
    'Hot tub on a 28 m² covered terrace, garden furniture, double bed with 30 cm mattress, TV (Netflix), fitted kitchen, Tchibo capsule coffee machine (capsules included)'
  ),
  mandulaHalo: S('Stúdió jellegű elrendezés', 'Studio layout'),

  specVendegek: S('Vendégek', 'Guests'),
  specHalo: S('Hálótér', 'Sleeping area'),
  specFelszereltseg: S('Felszereltség', 'Amenities'),
  specMinimum: S('Minimum', 'Minimum stay'),
  fo: S('fő', 'guests'),
  ejszakaTol: S('éjszakától', 'nights or more'),
  arEttol: S('Éjszakánként, 2 főre', 'Per night, for 2 guests'),
  gombFoglalom: S('Foglalom', 'Book this'),
  kepekHelye: S('Képek hamarosan', 'Photos coming soon'),

  // ---------- szolgáltatások ----------
  szolgCimke: S('SZOLGÁLTATÁSOK', 'AMENITIES'),
  szolgCim: S('Ami a házakban vár', "What's waiting in the cabins"),
  szolgBevezeto: S(
    'Mindkét ház teljesen felszerelt — a törülközőtől a kávékapszuláig mindent megtalálsz.',
    'Both cabins are fully equipped — from towels to coffee capsules, everything is there.'
  ),

  szolgKiemeltCim: S('Kiemelt szolgáltatások', 'Highlights'),
  szolgKiemelt: S(
    'Privát jakuzzi|Ajándék pezsgő|Gourmet reggeli kosár (opcionális)|WiFi|Full HD Smart TV|Netflix|Bicikli bérlési lehetőség|Kávé és tea fogyasztás|Szappan, tusfürdő',
    'Private hot tub|Complimentary sparkling wine|Gourmet breakfast basket (optional)|WiFi|Full HD Smart TV|Netflix|Bicycle rental available|Coffee and tea included|Soap and shower gel'
  ),
  szolgLakterCim: S('Lakótér', 'Living space'),
  szolgLakter: S(
    'Franciaágy 160×200 cm|Látványkandalló|Légkondicionáló|Kerti pihenő|Köntös|Hajszárító|Ágynemű és törülközők',
    'Double bed 160×200 cm|Feature fireplace|Air conditioning|Garden seating|Bathrobes|Hairdryer|Bed linen and towels'
  ),
  szolgKonyhaCim: S('Konyha', 'Kitchen'),
  szolgKonyha: S(
    'Indukciós főzőlap|Hűtő fagyasztóval|Mosogatógép|Beépített mikrohullámú sütő|Kenyérpirító|Vízforraló|Tchibo kávéfőző és kapszulák|Tea és fűszerek|Palackozott ásványvíz|Tisztítószerek',
    'Induction hob|Fridge with freezer|Dishwasher|Built-in microwave|Toaster|Kettle|Tchibo coffee machine and capsules|Tea and spices|Bottled mineral water|Cleaning supplies'
  ),

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
  arKeresre: S('Ár kérésre', 'Price on request'),
  arKeresreMagyarazat: S(
    'Ezt a foglalás után e-mailben egyeztetjük.',
    'We will arrange this by email after your booking.'
  ),

  egyFoTajekoztato: S(
    'Egy főre is foglalható — az ár ilyenkor is a 2 fős ár.',
    'Bookable for one guest too — the two-guest rate applies.'
  ),

  osszesito: S('Összesítő', 'Summary'),
  osszEjszakak: S('Éjszakák', 'Nights'),
  osszSzallas: S('Szállásdíj', 'Accommodation'),
  osszExtrak: S('Extrák', 'Extras'),
  osszFizetendo: S('Fizetendő', 'Total'),

  adataidCim: S('Adataid', 'Your details'),
  mezoNev: S('NÉV', 'NAME'),
  mezoEmail: S('E-MAIL', 'EMAIL'),
  mezoTelefon: S('TELEFON', 'PHONE'),
  mezoMegjegyzes: S('MEGJEGYZÉS (nem kötelező)', 'NOTES (optional)'),

  szamlazasCim: S('Számlázási adatok', 'Billing details'),
  szamlazasBevezeto: S(
    'A számlát ezekkel az adatokkal állítjuk ki. A cím megadása kötelező — ' +
      'számlát cím nélkül nem lehet kiállítani.',
    'Your invoice will be issued with these details. The address is required — ' +
      'an invoice cannot be issued without it.'
  ),
  szamlazasSajat: S(
    'A fenti névvel kérem a számlát',
    'Use the name above on the invoice'
  ),
  mezoSzlaNev: S('SZÁMLÁZÁSI NÉV', 'BILLING NAME'),
  mezoSzlaCim: S('UTCA, HÁZSZÁM', 'STREET AND NUMBER'),
  mezoSzlaIrsz: S('IRÁNYÍTÓSZÁM', 'POSTCODE'),
  mezoSzlaVaros: S('VÁROS', 'CITY'),
  mezoSzlaOrszag: S('ORSZÁG', 'COUNTRY'),
  mezoSzlaAdoszam: S('ADÓSZÁM (céges számlához)', 'TAX NUMBER (for company invoice)'),

  // ---------- Naptár ----------
  naptarCim: S('Szabad időpontok', 'Availability'),
  naptarValasszErkezes: S('Válaszd ki az érkezés napját', 'Pick your arrival day'),
  naptarValasszTavozas: S('Most a távozás napját', 'Now pick your departure day'),
  naptarBetoltes: S('Naptár betöltése…', 'Loading calendar…'),
  naptarHiba: S(
    'A naptár most nem érhető el — a dátumokat kézzel is megadhatod.',
    'The calendar is unavailable — you can still enter the dates by hand.'
  ),
  naptarElozo: S('Előző hónap', 'Previous month'),
  naptarKovetkezo: S('Következő hónap', 'Next month'),
  naptarSzabad: S('Szabad', 'Available'),
  naptarFoglalt: S('Foglalt', 'Booked'),
  naptarFelnap: S('Érkezés- vagy távozásnap', 'Arrival or departure day'),
  naptarDelutanFoglalt: S(
    'délelőtt még szabad, délután érkezik valaki',
    'free until midday, someone arrives in the afternoon'
  ),
  naptarDelelottFoglalt: S(
    'délelőtt még foglalt, délután szabad',
    'occupied until midday, free in the afternoon'
  ),
  naptarMinEjszaka: S(
    'Legalább {n} éjszakára lehet foglalni.',
    'Minimum stay: {n} nights.'
  ),
  ejszaka: S('éjszaka', 'nights'),

  fizetesCim: S('Fizetési mód', 'Payment method'),
  fizetesKartya: S('Bankkártya', 'Card payment'),
  fizetesKartyaLeiras: S(
    'Azonnali visszaigazolás, a számla automatikusan érkezik.',
    'Instant confirmation, invoice sent automatically.'
  ),
  fizetesUtalas: S('Banki átutalás', 'Bank transfer'),
  fizetesUtalasLeiras: S(
    'Az utalási adatokat e-mailben küldjük. A foglalás a beérkezés után válik véglegessé.',
    'We email the transfer details. The booking is confirmed once the payment arrives.'
  ),

  gombTovabb: S('Tovább a fizetéshez', 'Continue to payment'),
  gombUtalas: S('Foglalás utalással', 'Book with bank transfer'),
  gombFeldolgozas: S('Feldolgozás…', 'Processing…'),
  fizetesiTajekoztato: S(
    'A teljes összeg foglaláskor fizetendő. A visszaigazoló e-mail és a számla automatikusan érkezik.',
    'The full amount is payable at booking. The confirmation email and invoice arrive automatically.'
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
  egyEjszakaTajekoztato: S(
    'Ha a naptárban két foglalás között kimarad egy nap, az a nap egy éjszakára is foglalható — írj nekünk e-mailben.',
    'If a single night is left free between two bookings, it can be booked for one night — just email us.'
  ),
  hosszuFoglalasKedvezmeny: S(
    'Hat éjszakától egyedi kedvezményt tudunk adni. Írj nekünk a foglalás előtt!',
    'For six nights or more we can offer a special rate. Get in touch before booking!'
  ),

  // ---------- környék ----------
  kornyekCimke: S('A KÖRNYÉK', 'NEARBY'),
  kornyekCim: S('Mit érdemes csinálni', "What's worth doing"),
  kornyekBevezeto: S(
    'A Szelidi-tó környéke tele van olyan helyekkel, amikért érdemes kimozdulni a teraszról.',
    'The area around Lake Szelid is full of places worth leaving the terrace for.'
  ),

  // ---------- rólunk ----------
  rolunkCimke: S('RÓLUNK', 'ABOUT US'),
  rolunkCim: S('Több mint 30 év vendéglátás', 'Over 30 years of hosting'),
  rolunk1: S(
    'Már több mint 30 éve foglalkozunk üdültetéssel, és ez idő alatt rengeteg vendéget, történetet, mosolyt és élményt kaptunk. Megtanultuk, hogy egy igazán jó pihenés nem csupán egy szép szállásról szól, hanem arról az érzésről is, amikor az ember végre megérkezik, lelassul, és egy kicsit kiszakad a mindennapokból.',
    'We have been in the holiday business for over 30 years, and in that time we have been given countless guests, stories, smiles and experiences. We learned that a truly good break is not only about beautiful accommodation, but about the feeling of finally arriving, slowing down, and stepping out of everyday life for a while.'
  ),
  rolunk2: S(
    'Sokat utaztunk, sok különleges helyen jártunk, és közben számtalan olyan szálláshelyet láttunk, amely megihletett bennünket. Egy idő után megszületett bennünk a gondolat: miért ne valósíthatnánk meg mi is azt a világot, amelyben mi magunk is szívesen töltenénk el néhány napot?',
    'We travelled a lot, visited many special places, and saw countless properties that inspired us. In time an idea took shape: why should we not create the kind of world we would gladly spend a few days in ourselves?'
  ),
  rolunk3: S(
    'Így születtek meg vadonatúj, prémium minőségű faházaink a Szelidi-tónál. Egy olyan helyet álmodtunk meg, ahol a luxus és a természet nem egymás ellentéte, hanem tökéletesen kiegészíti egymást. A házak az erdő közvetlen közelében, természetközeli környezetben várnak, miközben a kényelmet olyan részletek teszik teljessé, mint a privát jakuzzi, a minőségi berendezés és az otthonos, közvetlen hangulat.',
    'This is how our brand new, premium quality cabins at Lake Szelid came about. We dreamed up a place where luxury and nature are not opposites but complete each other. The cabins wait for you right by the forest, in a natural setting, while details like the private hot tub, the quality furnishings and the homely, direct atmosphere make the comfort complete.'
  ),
  rolunk4: S(
    'Hiszünk abban, hogy a Szelidi-tó különleges hely. Mi ezt szeretnénk megmutatni egy olyan színvonalon, amelyhez hasonlót itt még nem találhattál. Szeretettel várunk, hogy egyszer ne csak elképzeld, milyen itt lenni, hanem át is éld.',
    'We believe Lake Szelid is a special place. We want to show it to you at a standard you have not found here before. We would love to welcome you, so that one day you do not only imagine what it is like here — you live it.'
  ),
  rolunkKiemeles: S(
    'Egy kis álomország a Szelidi-tónál, ahol nem kell választanod a természet közelsége és a kényelem között.',
    'A small dreamland at Lake Szelid, where you do not have to choose between nature and comfort.'
  ),

  // ---------- GyIK ----------
  gyikCimke: S('KÉRDÉSEK', 'QUESTIONS'),
  gyikCim: S('Gyakran ismételt kérdések', 'Frequently asked questions'),
  gyik1K: S('Mennyit kell fizetni foglaláskor?', 'How much is due at booking?'),
  gyik1V: S(
    'A teljes összeget. Így nincs utólagos utánkövetés, és a foglalás azonnal véglegessé válik. Bankkártyával és banki átutalással is fizethetsz.',
    'The full amount. This means no chasing payments later, and the booking is final straight away. You can pay by card or by bank transfer.'
  ),
  gyik2K: S('Foglalható a két ház egyszerre?', 'Can both cabins be booked together?'),
  gyik2V: S(
    'Igen. Együtt négy főt tudunk fogadni, házanként két főt. Nagyobb társaságnál ez a leggyakoribb választás.',
    'Yes. Together we can host four guests, two per cabin. For larger groups this is the most common choice.'
  ),
  gyik3K: S('Vihetünk háziállatot?', 'Can we bring a pet?'),
  gyik3V: S(
    'Sajnos nem. A faházak berendezése, a textíliák és a jakuzzi tisztán tartása, valamint az allergiás vendégeink védelme miatt egyik házba sem tudunk háziállatot fogadni. Megértésedet köszönjük.',
    'Unfortunately not. Because of the cabins\' furnishings, the textiles, keeping the hot tub clean, and to protect guests with allergies, we cannot accept pets in either cabin. Thank you for understanding.'
  ),
  gyik4K: S('Mikor érkezhetünk és mikor kell távozni?', 'What are the check-in and check-out times?'),
  gyik4V: S(
    'Érkezés 15:00-tól, távozás 10:00-ig. Ha ettől eltérő időpont kellene, írj nekünk — igyekszünk rugalmasak lenni.',
    'Check-in from 3:00 pm, check-out by 10:00 am. If you need different times, write to us — we try to be flexible.'
  ),
  gyik5K: S('Lehet egy éjszakára foglalni?', 'Can I book for a single night?'),
  gyik5V: S(
    'Alapesetben két éjszakától foglalható. Ha viszont a naptárban két foglalás között kimarad egy nap, azt az egy éjszakát is ki tudjuk adni — ilyenkor írj nekünk e-mailben.',
    'Normally the minimum stay is two nights. But if a single night is left free between two bookings, we can let it — just email us in that case.'
  ),
  gyik6K: S('Van kedvezmény hosszabb tartózkodásra?', 'Is there a discount for longer stays?'),
  gyik6V: S(
    'Hat éjszakától egyedi kedvezményt tudunk adni. Keress minket a foglalás előtt az elérhetőségeinken.',
    'For six nights or more we can offer a special rate. Contact us before booking.'
  ),

  // ---------- házirend ----------
  hazirendCimke: S('HÁZIREND', 'HOUSE RULES'),
  hazirendCim: S('Néhány kérés', 'A few requests'),
  hazirendBevezeto: S(
    'Hogy minden vendégünk ugyanolyan állapotban találja a házat, mint te.',
    'So that every guest finds the cabin in the same condition you did.'
  ),
  hazirend1Cim: S('Háziállat nem hozható', 'No pets'),
  hazirend1: S(
    'Egyik faházba sem tudunk háziállatot fogadni — a berendezés, a textíliák és allergiás vendégeink védelmében.',
    'We cannot accept pets in either cabin — to protect the furnishings, the textiles and guests with allergies.'
  ),
  hazirend2Cim: S('A dohányzás tilos', 'No smoking'),
  hazirend2: S(
    'A faházakban és a fedett teraszon egyaránt tilos a dohányzás. A szag a fából és a textíliából nem távolítható el.',
    'Smoking is not allowed in the cabins or on the covered terrace. The smell cannot be removed from wood and textiles.'
  ),
  hazirend3Cim: S('Nyílt tűz nem gyújtható', 'No open fire'),
  hazirend3: S(
    'Erdőszéli környezetben vagyunk, ezért a szabadtéri tűzgyújtás — beleértve a grillezést és a tűzrakást — nem engedélyezett.',
    'We are right by the forest, so open fires outdoors — including barbecues and campfires — are not permitted.'
  ),
  hazirend4Cim: S('Csendes pihenő', 'Quiet hours'),
  hazirend4: S(
    'Este 22:00 és reggel 7:00 között kérjük a csend megőrzését, a szomszédos ház vendégeire tekintettel.',
    'Between 10:00 pm and 7:00 am please keep noise down, out of consideration for guests in the neighbouring cabin.'
  ),

  // ---------- hírlevél ----------
  hirlevelSzekcioCimke: S('HÍRLEVÉL', 'NEWSLETTER'),
  hirlevelSzekcioCim: S('Értesülj a szabad időpontokról', 'Hear about available dates'),
  hirlevelSzekcioLeiras: S(
    'Évente néhány levél: szabad időpontok a szezon előtt, esetleg egy téli ajánlat. Bármikor leiratkozhatsz.',
    'A few emails a year: available dates before the season, sometimes a winter offer. Unsubscribe any time.'
  ),
  hirlevelEmail: S('E-mail címed', 'Your email'),
  hirlevelGomb: S('Feliratkozom', 'Subscribe'),
  hirlevelKuldes: S('Feliratkozás…', 'Subscribing…'),
  hirlevelSiker: S(
    'Köszönjük! Feliratkoztunk a listára.',
    'Thank you! You are on the list.'
  ),
  hirlevelHiba: S(
    'Nem sikerült feliratkozni. Próbáld újra, vagy írj nekünk.',
    'Could not subscribe. Please try again, or email us.'
  ),

  // A foglalóűrlapon lévő jelölőnégyzet
  hirlevelCimke: S(
    'Szeretnék értesülni az akciókról és a szabad időpontokról',
    'I would like to hear about offers and available dates'
  ),
  hirlevelMagyarazat: S(
    'Évente néhány levél, bármikor leiratkozhatsz. A foglaláshoz nem szükséges.',
    'A few emails a year, unsubscribe any time. Not required for booking.'
  ),

  // ---------- kapcsolat ----------
  kapcsolatCimke: S('KAPCSOLAT', 'CONTACT'),
  kapcsolatCim: S('Kérdésed van érkezés előtt?', 'Questions before you arrive?'),
  kapcsolatBevezeto: S(
    'A foglalás és a fizetés automatikus, de egyedi kérésekben szívesen segítünk.',
    "Booking and payment run automatically, but we're glad to help with special requests."
  ),
  kapcsEmail: S('E-MAIL', 'EMAIL'),
  kapcsTelefon: S('TELEFON', 'PHONE'),
  kapcsCim: S('CÍM', 'ADDRESS'),
  kapcsErkezes: S('ÉRKEZÉS', 'CHECK-IN'),
  kapcsErkezesErtek: S('15:00-tól', 'From 3:00 pm'),
  kapcsTavozas: S('TÁVOZÁS', 'CHECK-OUT'),
  kapcsTavozasErtek: S('10:00-ig', 'By 10:00 am'),
  socialCim: S('Keress minket', 'Find us'),

  terkepMutat: S('Térkép megjelenítése', 'Show map'),
  terkepSuti: S(
    'A térkép a Google Mapsből töltődik be, amely sütiket helyez el. Kattints, ha meg szeretnéd nézni.',
    'The map loads from Google Maps, which sets cookies. Click to display it.'
  ),
  utvonalterv: S('Útvonalterv', 'Directions'),

  // ---------- lábléc ----------
  lablecAszf: S('ÁSZF', 'Terms'),
  lablecAdatvedelem: S('Adatvédelem', 'Privacy'),
  lablecHazirend: S('Házirend', 'House rules'),
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

  utalasCim: S('Foglalásod rögzítettük', 'Your booking is registered'),
  utalasSzoveg: S(
    'Az utalási adatokat e-mailben elküldtük. A foglalás akkor válik véglegessé, amikor az összeg megérkezik a számlánkra. Az időpontot addig fenntartjuk.',
    'We have emailed you the transfer details. The booking becomes final once the amount arrives in our account. We hold the dates until then.'
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

export function t(nyelv: Nyelv, kulcs: keyof typeof T): string {
  return T[kulcs][nyelv];
}

/** A „|” jellel elválasztott felsorolásokat listává bontja. */
export function lista(szoveg: string): string[] {
  return szoveg.split('|').map((s) => s.trim()).filter(Boolean);
}

/** A környék programjai — kép nélkül, rövid leírással. */
export const KORNYEK: { cimke: Szoveg; cim: Szoveg; szoveg: Szoveg }[] = [
  {
    cimke: S('A TÓN', 'ON THE LAKE'),
    cim: S('Csónakázás a Szelidi-tavon', 'Boating on Lake Szelid'),
    szoveg: S(
      'Májustól szeptemberig, kísérővel, elektromos meghajtású csónakkal. A tó természetvédelmi terület, ezért horgászni nem lehet — cserébe olyan csend van, amilyet motoros vizeken sosem találsz.',
      'From May to September, with a guide, in an electric boat. The lake is a nature reserve, so fishing is not allowed — in exchange you get a quiet you will never find on motorised waters.'
    ),
  },
  {
    cimke: S('TÚRA', 'HIKING'),
    cim: S('Kékmoszat tanösvény', 'Blue-algae nature trail'),
    szoveg: S(
      'A tóparton és a tölgyerdőben vezető tanösvény, akár vezetett túrával. A Szelidi-tó sós vizű, szikes tó — a tanösvény ennek a különleges élővilágnak a nyomait mutatja meg.',
      'A nature trail along the shore and through the oak woods, with guided walks available. Lake Szelid is a salty, alkaline lake — the trail shows the traces of this unusual ecosystem.'
    ),
  },
  {
    cimke: S('BOR', 'WINE'),
    cim: S('Hajósi pincesor', 'The Hajós cellar village'),
    szoveg: S(
      'Több mint kétezer pince egymás mellett — Európában egyedülálló látvány. A pincesor egész falunyi méretű, saját utcákkal; több pincészet fogad kóstolóra, és a hangulat önmagában megéri az utat.',
      'More than two thousand cellars side by side — a sight unique in Europe. The cellar village is the size of a small town, with its own streets; several cellars welcome you for tastings, and the atmosphere alone is worth the trip.'
    ),
  },
  {
    cimke: S('VÁROS', 'TOWN'),
    cim: S('Kalocsai városnézés', 'A day in Kalocsa'),
    szoveg: S(
      'Paprika múzeum, Érseki palota, Érsekkert, az Érseki könyvtár, a Nagyboldogasszony-székesegyház és a Fazekas alkotóház — egy teljes nap program, autóval húsz percre.',
      'The Paprika Museum, the Archbishop\'s Palace and garden, the Archiepiscopal Library, the Assumption Cathedral and the potters\' workshop — a full day out, twenty minutes by car.'
    ),
  },
  {
    cimke: S('LOVAK', 'HORSES'),
    cim: S('Bakodpusztai lovasbemutató', 'Bakodpuszta horse show'),
    szoveg: S(
      'Márciustól október végéig, nemzetközi színvonalú lovasbemutató és hagyományos csikós produkció. A környék egyik legismertebb programja.',
      'From March to late October, an international-standard horse show and a traditional Hungarian herdsmen performance. One of the best-known attractions in the area.'
    ),
  },
  {
    cimke: S('KOCSIKÁZÁS', 'CARRIAGE'),
    cim: S('Lovaskocsikázás', 'Horse-drawn carriage ride'),
    szoveg: S(
      'A helyi tájban, kocsissal. Extraként a foglalásnál is kérhető — óránkénti díjjal, előzetes egyeztetéssel.',
      'Through the local landscape, with a driver. Available as an extra when booking — charged by the hour, arranged in advance.'
    ),
  },
  {
    cimke: S('MADARAK', 'BIRDS'),
    cim: S('Hajnali madárles', 'Dawn birdwatching'),
    szoveg: S(
      'Ornitológus vezetésével a nádasokban és a közeli erdőkben. Korán kell kelni, de a szikes tó madárvilága ritka élmény.',
      'Led by an ornithologist through the reed beds and nearby woods. An early start, but the birdlife of an alkaline lake is a rare experience.'
    ),
  },
  {
    cimke: S('JÁTÉK', 'GAMES'),
    cim: S('Bowling a tónál', 'Bowling by the lake'),
    szoveg: S(
      'Négypályás bowling center a Family étterem mellett, biliárddal, darts-szal, csocsóval és léghokival. Esős napra tökéletes.',
      'A four-lane bowling centre next to the Family restaurant, with billiards, darts, table football and air hockey. Perfect for a rainy day.'
    ),
  },
  {
    cimke: S('ASZTAL', 'TABLE'),
    cim: S('Éttermek a közelben', 'Restaurants nearby'),
    szoveg: S(
      'A Family étterem a tónál finom ebédet és vacsorát ad, a Pataji tanyacsárda pedig országos hírű pacalkínálatáról ismert.',
      'The Family restaurant by the lake serves good lunches and dinners, while the Pataji tanyacsárda is known nationwide for its tripe dishes.'
    ),
  },
  {
    cimke: S('KERÉKPÁR', 'CYCLING'),
    cim: S('Tóparti kerékpártúra és séta', 'Cycling and walking by the lake'),
    szoveg: S(
      'A tavat körbe lehet kerekezni és sétálni. Bicikli a helyszínen bérelhető.',
      'The lake can be circled by bike or on foot. Bicycles can be rented on site.'
    ),
  },
  {
    cimke: S('DUNA', 'DANUBE'),
    cim: S('Hartai Duna-parti séta', 'Danube walk at Harta'),
    szoveg: S(
      'Az ország egyik legszebb Duna-partja, néhány percre autóval. Nyugodt, tágas, szinte mindig üres.',
      'One of the most beautiful stretches of the Danube in the country, a few minutes by car. Calm, open, and almost always empty.'
    ),
  },
  {
    cimke: S('ESTE', 'EVENING'),
    cim: S('Naplemente a tóparton', 'Sunset by the lake'),
    szoveg: S(
      'A legegyszerűbb és talán a legjobb program. A nyugati fekvésű teraszokról is látszik, de a partról különösen szép.',
      'The simplest and perhaps the best thing to do. Visible from the west-facing terraces too, but especially beautiful from the shore.'
    ),
  },
];
