import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import {
  ipnHitelesites,
  ipnNyugta,
  statuszbolFoglalas,
} from '@/lib/simplepay';
import { visszaigazoloEmail, adminErtesito } from '@/lib/email';

/**
 * SimplePay IPN (szerver-szerver értesítés).
 *
 * EZ AZ EGYETLEN HELY, ahol a foglalás "kifizetve" státuszt kaphat.
 * A vendég böngészőjéből érkező visszatérés nem bizonyíték semmire.
 *
 * Fontos viselkedés:
 *  - A SimplePay ADDIG ISMÉTLI az értesítést, amíg nem kap helyesen
 *    aláírt nyugtát. Ezért a nyugtázás akkor is elmegy, ha közben
 *    a mi oldalunkon hiba történt — különben végtelen ismétlés lenne.
 *  - Emiatt ugyanaz az üzenet TÖBBSZÖR is megérkezhet. A feldolgozás
 *    idempotens: ha a foglalás már ki van fizetve, nem csinálunk
 *    semmit újra (nem küldünk második e-mailt, nem állítunk ki
 *    második számlát).
 */

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  // A nyers body kell, változatlanul — az aláírás erre készült.
  const nyersBody = await req.text();
  const signature = req.headers.get('signature');

  let uzenet;
  try {
    uzenet = ipnHitelesites(nyersBody, signature);
  } catch (e) {
    // Hitelesítetlen üzenetre NEM küldünk nyugtát, és nem áruljuk el,
    // mi volt a baj — ez így is lehet próbálkozás.
    console.error('[IPN] hitelesítés sikertelen:', e);
    return new Response('Unauthorized', { status: 401 });
  }

  // A nyugtát előre elkészítjük, hogy hiba esetén is el tudjuk küldeni.
  const nyugta = ipnNyugta(uzenet);

  try {
    await feldolgoz(uzenet);
  } catch (e) {
    // A pénz beérkezett, de nálunk hiba volt. Naplózzuk és riasztunk,
    // de a nyugtát elküldjük — az ismétlés nem oldaná meg a hibát.
    console.error('[IPN] feldolgozási hiba:', uzenet.orderRef, e);
  }

  return new Response(nyugta.body, {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      Signature: nyugta.signature,
    },
  });
}

async function feldolgoz(uzenet: {
  orderRef: string;
  status: string;
  transactionId: number;
  paymentDate?: string;
  method?: string;
}) {
  const db = supabaseAdmin();
  const ujStatusz = statuszbolFoglalas(uzenet.status);

  const { data: foglalas, error } = await db
    .from('foglalasok')
    .select('id, azonosito, statusz, vegosszeg, erkezes, tavozas, vendeg_id, haz_id')
    .eq('azonosito', uzenet.orderRef)
    .maybeSingle();

  if (error) throw new Error(`Foglalás lekérdezése: ${error.message}`);
  if (!foglalas) {
    throw new Error(`Ismeretlen foglalási azonosító: ${uzenet.orderRef}`);
  }

  // Idempotencia: ha már kifizetett, nincs teendő.
  if (foglalas.statusz === 'kifizetve' && ujStatusz === 'kifizetve') {
    console.log('[IPN] ismételt értesítés, kihagyva:', uzenet.orderRef);
    return;
  }

  // A fizetési kísérletet mindig naplózzuk — vita esetén ez a bizonyíték.
  await db.from('fizetesek').insert({
    foglalas_id: foglalas.id,
    osszeg: foglalas.vegosszeg,
    statusz: ujStatusz === 'kifizetve' ? 'sikeres' : 'sikertelen',
    szolgaltato: 'simplepay',
    kulso_tranzakcio_id: String(uzenet.transactionId),
    valasz: uzenet as unknown as Record<string, unknown>,
  });

  await db
    .from('foglalasok')
    .update({ statusz: ujStatusz, modositva: new Date().toISOString() })
    .eq('id', foglalas.id);

  if (ujStatusz === 'kifizetve') {
    // A visszaigazoló e-mail hibája nem borítja a fizetés feldolgozását.
    try {
      await visszaigazoloEmail(foglalas.id);
    } catch (e) {
      console.error('[IPN] visszaigazoló e-mail nem ment ki:', e);
    }

    // Értesítjük a tulajdonost is, hogy ne az adminban kelljen figyelni.
    try {
      await adminErtesito(foglalas.id, 'kifizetve');
    } catch (e) {
      console.error('[IPN] admin értesítő nem ment ki:', e);
    }

    // TODO: Számlázz.hu számlakiállítás.
    // Szándékosan külön lépés, hogy egy számlázási hiba ne
    // akadályozza meg a foglalás kifizetettre állítását.
  }
}
