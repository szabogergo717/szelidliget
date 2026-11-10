/**
 * Barion Smart Gateway — bankkártyás fizetés.
 *
 * ALAPELVEK
 *
 *  1. **Az árat mindig a szerver számolja.** A böngészőből érkező
 *     összeget soha nem fogadjuk el.
 *
 *  2. **A fizetés tényét csak a Bariontól fogadjuk el.** A vendég
 *     böngészőjéből érkező visszatérés (RedirectUrl) nem bizonyíték:
 *     azt a címet bárki beírhatja. A visszahívás (CallbackUrl) is csak
 *     annyit mond, hogy „nézz rá erre a fizetésre" — a tényleges
 *     állapotot mi kérdezzük vissza a Barion API-tól.
 *
 *  3. **A titkos kulcs (POSKey) soha nem kerül a böngészőbe.** Ez a
 *     fájl kizárólag szerveroldalon fut.
 *
 * A Barion két környezetet ad: egy tesztet (api.test.barion.com) és egy
 * éleset (api.barion.com). Mindkettőhöz KÜLÖN fiók és KÜLÖN POSKey
 * tartozik — a teszt kulcs éles környezetben nem működik, és fordítva.
 */

const TESZT = process.env.BARION_TESZT !== 'false';

const ALAP_URL = TESZT ? 'https://api.test.barion.com' : 'https://api.barion.com';

/** A fizetőoldal, ahova a vendéget küldjük. */
const KAPU_URL = TESZT
  ? 'https://secure.test.barion.com/Pay'
  : 'https://secure.barion.com/Pay';

function poskey(): string {
  const k = process.env.BARION_POSKEY;
  if (!k) {
    throw new Error(
      'Hiányzik a BARION_POSKEY. Vidd fel a Vercel "Environment Variables" ' +
        'beállításai közé (a Barion fiókodban: Shops → a boltod → POSKey).'
    );
  }
  return k;
}

/** A kedvezményezett e-mail címe a Barion fiókban. */
function kedvezmenyezett(): string {
  const e = process.env.BARION_EMAIL;
  if (!e) {
    throw new Error(
      'Hiányzik a BARION_EMAIL — a Barion fiókod e-mail címe (a kedvezményezett).'
    );
  }
  return e;
}

export type FizetesIndito = {
  /** A mi foglalási azonosítónk, pl. 'SZL-2026-0147'. */
  orderRef: string;
  /** Fizetendő, egész forint. */
  total: number;
  customer: string;
  customerEmail: string;
  nyelv: 'HU' | 'EN';
  /** Ide tér vissza a vendég böngészője a fizetés után. */
  visszaUrl: string;
  /** Ide szól a Barion szerver-szerver értesítése. */
  visszahivasUrl: string;
};

export type FizetesValasz = {
  /** A Barion fizetésazonosítója — ezt eltesszük, ezzel kérdezünk vissza. */
  paymentId: string;
  /** Ide kell átirányítani a vendéget. */
  fizetesiUrl: string;
};

type BarionHiba = { ErrorCode?: string; Title?: string; Description?: string };

/**
 * Fizetés indítása. A válaszból a `fizetesiUrl`-re kell küldeni a
 * vendéget, a `paymentId`-t pedig elmentjük, hogy később vissza tudjuk
 * kérdezni az állapotot.
 */
export async function fizetestIndit(p: FizetesIndito): Promise<FizetesValasz> {
  if (!Number.isInteger(p.total) || p.total <= 0) {
    throw new Error(`Érvénytelen fizetendő összeg: ${p.total}`);
  }

  const keres = {
    POSKey: poskey(),
    PaymentType: 'Immediate',
    GuestCheckOut: true,
    FundingSources: ['All'],
    /** Egyedi azonosító a mi oldalunkról — ismétlődő kérést ebből szűr a Barion. */
    PaymentRequestId: p.orderRef,
    OrderNumber: p.orderRef,
    Currency: 'HUF',
    Locale: p.nyelv === 'EN' ? 'en-US' : 'hu-HU',
    PayerHint: p.customerEmail,
    RedirectUrl: p.visszaUrl,
    CallbackUrl: p.visszahivasUrl,
    Transactions: [
      {
        POSTransactionId: p.orderRef,
        Payee: kedvezmenyezett(),
        Total: p.total,
        Comment: `Szelid Liget — ${p.orderRef}`,
        Items: [
          {
            Name: p.nyelv === 'EN' ? 'Accommodation' : 'Szállásdíj',
            Description: `Szelid Liget — ${p.orderRef}`,
            Quantity: 1,
            Unit: p.nyelv === 'EN' ? 'booking' : 'foglalás',
            UnitPrice: p.total,
            ItemTotal: p.total,
            SKU: p.orderRef,
          },
        ],
      },
    ],
  };

  const valasz = await fetch(`${ALAP_URL}/v2/Payment/Start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(keres),
    // A fizetésindítás nem cache-elhető.
    cache: 'no-store',
  });

  const adat = (await valasz.json()) as {
    PaymentId?: string;
    GatewayUrl?: string;
    Errors?: BarionHiba[];
  };

  const hibak = adat.Errors ?? [];
  if (!valasz.ok || hibak.length > 0 || !adat.PaymentId) {
    const leiras = hibak
      .map((h) => `${h.ErrorCode ?? ''} ${h.Title ?? ''} ${h.Description ?? ''}`.trim())
      .join(' | ');
    throw new Error(
      `A Barion elutasította a fizetésindítást${leiras ? ': ' + leiras : ''}`
    );
  }

  return {
    paymentId: adat.PaymentId,
    // A Barion GatewayUrl-t is ad; ha nem, összerakjuk magunk.
    fizetesiUrl: adat.GatewayUrl ?? `${KAPU_URL}?id=${encodeURIComponent(adat.PaymentId)}`,
  };
}

export type BarionAllapot = {
  /** A Barion állapotneve, pl. 'Succeeded'. */
  status: string;
  /** A mi foglalási azonosítónk, ahogy indításkor megadtuk. */
  orderRef: string | null;
  /** A teljes válasz — naplózzuk, vita esetén ez a bizonyíték. */
  nyers: Record<string, unknown>;
};

/**
 * A fizetés tényleges állapota — közvetlenül a Bariontól.
 *
 * Ezt hívjuk a visszahívás után: a visszahívás csak annyit árul el,
 * MELYIK fizetésről van szó, az állapotát nem fogadjuk el tőle.
 */
export async function fizetesAllapota(paymentId: string): Promise<BarionAllapot> {
  const url = new URL(`${ALAP_URL}/v2/Payment/GetPaymentState`);
  url.searchParams.set('POSKey', poskey());
  url.searchParams.set('PaymentId', paymentId);

  const valasz = await fetch(url, { cache: 'no-store' });
  const adat = (await valasz.json()) as {
    Status?: string;
    OrderNumber?: string;
    PaymentRequestId?: string;
    Errors?: BarionHiba[];
  };

  const hibak = adat.Errors ?? [];
  if (!valasz.ok || hibak.length > 0 || !adat.Status) {
    const leiras = hibak
      .map((h) => `${h.ErrorCode ?? ''} ${h.Title ?? ''}`.trim())
      .join(' | ');
    throw new Error(
      `A fizetés állapota nem kérdezhető le${leiras ? ': ' + leiras : ''}`
    );
  }

  return {
    status: adat.Status,
    orderRef: adat.OrderNumber ?? adat.PaymentRequestId ?? null,
    nyers: adat as unknown as Record<string, unknown>,
  };
}

/**
 * A Barion állapotából a mi foglalási státuszunk.
 *
 * Csak a `Succeeded` számít fizetettnek. A `Prepared`, `Started` és
 * `InProgress` azt jelenti, hogy a vendég még a fizetőoldalon van —
 * ilyenkor NEM nyúlunk a foglaláshoz.
 */
export function statuszbolFoglalas(
  barionStatus: string
): 'kifizetve' | 'lemondva' | 'fuggoben' {
  switch (barionStatus) {
    case 'Succeeded':
      return 'kifizetve';
    case 'Canceled':
    case 'Expired':
    case 'Failed':
      return 'lemondva';
    default:
      // Prepared, Started, InProgress, Reserved, Authorized, PartiallySucceeded…
      return 'fuggoben';
  }
}

/** Teszt vagy éles módban fut-e. Az admin felületen megmutatjuk. */
export const BARION_TESZT_MOD = TESZT;
