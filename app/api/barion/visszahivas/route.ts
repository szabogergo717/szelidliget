import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { fizetesAllapota, statuszbolFoglalas } from '@/lib/barion';
import { visszaigazoloEmail, adminErtesito } from '@/lib/email';

/**
 * Barion visszahívás (szerver-szerver értesítés).
 *
 * EZ AZ EGYETLEN HELY, ahol a foglalás „kifizetve" státuszt kaphat.
 * A vendég böngészőjéből érkező visszatérés nem bizonyíték semmire —
 * azt a címet bárki beírhatja.
 *
 * Hogyan működik:
 *  1. A Barion meghívja ezt a címet, és átadja a fizetés azonosítóját.
 *  2. Mi NEM hisszük el, amit az üzenet állít. Visszakérdezünk a Barion
 *     API-tól, hogy mi a fizetés tényleges állapota.
 *  3. Csak a `Succeeded` állapotot tekintjük fizetésnek.
 *
 * A Barion ismételheti az értesítést, ezért a feldolgozás idempotens:
 * ha a foglalás már ki van fizetve, nem küldünk második e-mailt és nem
 * állítunk ki második számlát.
 */

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const paymentId = await paymentIdKiolvasas(req);
  return feldolgozas(paymentId);
}

/** A Barion GET-tel is hívhat, ezért ezt is kiszolgáljuk. */
export async function GET(req: NextRequest) {
  const paymentId = req.nextUrl.searchParams.get('paymentId');
  return feldolgozas(paymentId);
}

async function paymentIdKiolvasas(req: NextRequest): Promise<string | null> {
  // Az URL-ben is jöhet, és a törzsben is — mindkettőt megnézzük.
  const urlbol = req.nextUrl.searchParams.get('paymentId');
  if (urlbol) return urlbol;

  const nyers = await req.text();
  if (!nyers) return null;

  try {
    const j = JSON.parse(nyers) as Record<string, string>;
    return j.PaymentId ?? j.paymentId ?? null;
  } catch {
    // Űrlap formátum: paymentId=...
    const p = new URLSearchParams(nyers);
    return p.get('PaymentId') ?? p.get('paymentId');
  }
}

async function feldolgozas(paymentId: string | null) {
  if (!paymentId) {
    console.error('[barion] hiányzó paymentId');
    return new Response('Missing paymentId', { status: 400 });
  }

  let allapot;
  try {
    // A döntő lépés: az állapotot a Bariontól kérdezzük vissza.
    allapot = await fizetesAllapota(paymentId);
  } catch (e) {
    console.error('[barion] állapot lekérdezése sikertelen:', paymentId, e);
    // 500-at adunk, hogy a Barion később újra megpróbálja.
    return new Response('Upstream error', { status: 500 });
  }

  try {
    await foglalastFrissit(paymentId, allapot);
  } catch (e) {
    // A pénz beérkezhetett, de nálunk hiba volt. Naplózzuk, és 500-at
    // adunk, hogy a Barion ismételjen — a feldolgozás idempotens.
    console.error('[barion] feldolgozási hiba:', paymentId, e);
    return new Response('Processing error', { status: 500 });
  }

  return new Response('OK', { status: 200 });
}

async function foglalastFrissit(
  paymentId: string,
  allapot: { status: string; orderRef: string | null; nyers: Record<string, unknown> }
) {
  const db = supabaseAdmin();
  const ujStatusz = statuszbolFoglalas(allapot.status);

  // Amíg a vendég a fizetőoldalon van, nincs teendőnk.
  if (ujStatusz === 'fuggoben') {
    console.log('[barion] köztes állapot, kihagyva:', allapot.status, paymentId);
    return;
  }

  if (!allapot.orderRef) {
    throw new Error(`A Barion válasza nem tartalmaz foglalási azonosítót: ${paymentId}`);
  }

  const { data: foglalas, error } = await db
    .from('foglalasok')
    .select('id, azonosito, statusz, vegosszeg')
    .eq('azonosito', allapot.orderRef)
    .maybeSingle();

  if (error) throw new Error(`Foglalás lekérdezése: ${error.message}`);
  if (!foglalas) throw new Error(`Ismeretlen foglalási azonosító: ${allapot.orderRef}`);

  // Idempotencia: ha már kifizetett, nincs teendő.
  if (foglalas.statusz === 'kifizetve' && ujStatusz === 'kifizetve') {
    console.log('[barion] ismételt értesítés, kihagyva:', allapot.orderRef);
    return;
  }

  // A fizetési kísérletet mindig naplózzuk — vita esetén ez a bizonyíték.
  await db.from('fizetesek').insert({
    foglalas_id: foglalas.id,
    osszeg: foglalas.vegosszeg,
    statusz: ujStatusz === 'kifizetve' ? 'sikeres' : 'sikertelen',
    szolgaltato: 'barion',
    kulso_tranzakcio_id: paymentId,
    valasz: allapot.nyers,
  });

  await db
    .from('foglalasok')
    .update({ statusz: ujStatusz, modositva: new Date().toISOString() })
    .eq('id', foglalas.id);

  if (ujStatusz === 'kifizetve') {
    try {
      await visszaigazoloEmail(foglalas.id);
    } catch (e) {
      console.error('[barion] visszaigazoló e-mail nem ment ki:', e);
    }
    try {
      await adminErtesito(foglalas.id, 'kifizetve');
    } catch (e) {
      console.error('[barion] admin értesítő nem ment ki:', e);
    }

    // TODO: Számlázz.hu számlakiállítás — szándékosan külön lépés,
    // hogy egy számlázási hiba ne akadályozza a foglalás lezárását.
  }
}
