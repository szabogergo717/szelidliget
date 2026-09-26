import crypto from 'crypto';

/**
 * SimplePay (OTP Mobil) v2.1 integráció.
 *
 * Működés dióhéjban:
 *  1. A szerver elküld egy "start" kérést → visszakap egy fizetési URL-t.
 *  2. A vendéget átirányítjuk erre az URL-re. A kártyaadatot SOHA nem
 *     látjuk és nem tároljuk — az a SimplePay oldalán marad.
 *  3. Fizetés után a vendég visszatér a mi oldalunkra (`vissza`), ÉS
 *     a SimplePay szervere külön értesít minket (IPN).
 *
 * ⚠ A foglalást KIZÁRÓLAG az IPN alapján szabad kifizetettnek jelölni.
 *   A visszatérési URL-t a felhasználó kézzel is meghívhatja a
 *   böngészőjében — az nem bizonyíték a fizetésre. Az IPN szerver-szerver
 *   hívás, aláírással hitelesítve.
 */

// ⚠ ELLENŐRIZD a kereskedői fiókodhoz kapott dokumentációban, mielőtt
//   élesítesz. A SimplePay időnként változtat a végpontokon, és egy
//   elgépelt URL-nél a fizetés némán elszáll.
const VEGPONT = {
  sandbox: 'https://sandbox.simplepay.hu/payment/v2',
  live: 'https://secure.simplepay.hu/payment/v2',
};

function config() {
  const merchant = process.env.SIMPLEPAY_MERCHANT;
  const secret = process.env.SIMPLEPAY_SECRET_KEY;
  if (!merchant || !secret) {
    throw new Error('Hiányzik a SIMPLEPAY_MERCHANT vagy a SIMPLEPAY_SECRET_KEY.');
  }
  const sandbox = process.env.SIMPLEPAY_SANDBOX !== 'false';
  return { merchant, secret, sandbox, alap: sandbox ? VEGPONT.sandbox : VEGPONT.live };
}

/**
 * Aláírás: a kérés body-jának HMAC-SHA384 hash-e, Base64-ben.
 *
 * ⚠ Az aláírást PONTOSAN azon a stringen kell számolni, amit elküldünk.
 *   Ezért mindenhol ugyanazt a `body` változót használjuk — ha újra
 *   JSON.stringify-olnánk, a kulcsok sorrendje eltérhetne, és az
 *   aláírás érvénytelen lenne.
 */
export function alairas(body: string, secret: string): string {
  return crypto.createHmac('sha384', secret).update(body, 'utf8').digest('base64');
}

/** Időzítés-független összehasonlítás. Sima `===` esetén a válaszidőből
 *  következtetni lehetne az aláírás helyes karaktereire. */
export function alairasEgyezik(kapott: string, vart: string): boolean {
  const a = Buffer.from(kapott);
  const b = Buffer.from(vart);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

/** A SimplePay ISO8601 formátumot vár időzónával: 2026-09-26T15:26:00+02:00 */
export function isoIdo(d = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  const eltolas = -d.getTimezoneOffset();
  const jel = eltolas >= 0 ? '+' : '-';
  const abs = Math.abs(eltolas);
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
    `T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}` +
    `${jel}${pad(Math.floor(abs / 60))}:${pad(abs % 60)}`
  );
}

export type StartParams = {
  orderRef: string;       // a mi foglalási azonosítónk
  total: number;          // Ft, egész szám
  customerEmail: string;
  customer?: string;
  nyelv?: 'HU' | 'EN';
  sikeresUrl: string;
  sikertelenUrl: string;
  megszakitottUrl: string;
  idouSzUrl: string;
  ipnUrl: string;
  szamlazas?: {
    name: string;
    country: string;   // 'hu'
    state?: string;
    city: string;
    zip: string;
    address: string;
  };
};

export type StartValasz = {
  salt: string;
  merchant: string;
  orderRef: string;
  currency: string;
  transactionId: number;
  timeout: string;
  total: number;
  paymentUrl: string;
};

/**
 * Fizetés indítása. Visszaadja a `paymentUrl`-t, ahová a vendéget
 * át kell irányítani.
 */
export async function fizetestIndit(p: StartParams): Promise<StartValasz> {
  const { merchant, secret, alap } = config();

  const payload = {
    salt: crypto.randomBytes(16).toString('hex'), // 32 karakter
    merchant,
    orderRef: p.orderRef,
    currency: 'HUF',
    customerEmail: p.customerEmail,
    customer: p.customer,
    language: p.nyelv ?? 'HU',
    sdkVersion: 'szelidliget-1.0',
    methods: ['CARD'],
    total: Math.round(p.total), // egész forint, minden esetben
    timeout: isoIdo(new Date(Date.now() + 30 * 60 * 1000)), // 30 perc
    url: p.sikeresUrl,
    urls: {
      success: p.sikeresUrl,
      fail: p.sikertelenUrl,
      cancel: p.megszakitottUrl,
      timeout: p.idouSzUrl,
    },
    invoice: p.szamlazas,
    // Az IPN ide fog érkezni. Ha nincs megadva, a fiókban beállított
    // alapértelmezett cím érvényes.
    ipnUrl: p.ipnUrl,
  };

  // Egyszer stringify-olunk, és ugyanazt írjuk alá, amit elküldünk.
  const body = JSON.stringify(payload);
  const sig = alairas(body, secret);

  const valasz = await fetch(`${alap}/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Signature: sig },
    body,
  });

  const szoveg = await valasz.text();

  if (!valasz.ok) {
    throw new Error(`SimplePay start hiba (${valasz.status}): ${szoveg}`);
  }

  // A válasz aláírását is ellenőrizzük — enélkül egy közbeékelt
  // támadó hamis fizetési URL-re irányíthatná a vendéget.
  const valaszSig = valasz.headers.get('Signature') ?? '';
  if (!valaszSig || !alairasEgyezik(valaszSig, alairas(szoveg, secret))) {
    throw new Error('A SimplePay válaszának aláírása érvénytelen.');
  }

  const adat = JSON.parse(szoveg) as StartValasz & { errorCodes?: number[] };
  if (adat.errorCodes?.length) {
    throw new Error(`SimplePay hibakód: ${adat.errorCodes.join(', ')}`);
  }
  if (!adat.paymentUrl) {
    throw new Error('A SimplePay nem adott vissza fizetési URL-t.');
  }
  return adat;
}

export type IpnUzenet = {
  salt: string;
  orderRef: string;
  merchant: string;
  status: string;      // 'FINISHED', 'CANCELLED', 'FAIL', ...
  transactionId: number;
  paymentDate?: string;
  method?: string;
};

/**
 * Beérkező IPN hitelesítése.
 *
 * A `nyersBody`-t VÁLTOZATLANUL kell átadni — ha a keretrendszer
 * parse-olja és újra stringify-olja, az aláírás nem fog egyezni.
 */
export function ipnHitelesites(
  nyersBody: string,
  kapottSignature: string | null
): IpnUzenet {
  const { secret, merchant } = config();

  if (!kapottSignature) {
    throw new Error('Hiányzó Signature fejléc az IPN üzenetben.');
  }
  if (!alairasEgyezik(kapottSignature.trim(), alairas(nyersBody, secret))) {
    throw new Error('Érvénytelen IPN aláírás.');
  }

  const uzenet = JSON.parse(nyersBody) as IpnUzenet;

  if (uzenet.merchant !== merchant) {
    throw new Error('Az IPN üzenet nem ehhez a kereskedői fiókhoz tartozik.');
  }
  return uzenet;
}

/**
 * IPN nyugtázása. A SimplePay addig ismétli az értesítést, amíg
 * nem kap helyesen aláírt visszaigazolást — ezért ezt nem szabad
 * kihagyni, még hiba esetén sem.
 *
 * A válasz az eredeti üzenet + egy `receiveDate` mező, és erre a
 * kiegészített JSON stringre kell számolni az aláírást.
 */
export function ipnNyugta(uzenet: IpnUzenet): { body: string; signature: string } {
  const { secret } = config();
  const valasz = { ...uzenet, receiveDate: isoIdo() };
  const body = JSON.stringify(valasz);
  return { body, signature: alairas(body, secret) };
}

/** A fizetés eredménye alapján milyen foglalási státusz jár. */
export function statuszbolFoglalas(
  status: string
): 'kifizetve' | 'lemondva' | 'fuggoben' {
  switch (status.toUpperCase()) {
    case 'FINISHED':
      return 'kifizetve';
    case 'CANCELLED':
    case 'FAIL':
    case 'TIMEOUT':
      return 'lemondva';
    default:
      return 'fuggoben';
  }
}
