import { Resend } from 'resend';
import { supabaseAdmin } from './supabase';

/**
 * Tranzakciós e-mailek Resenden keresztül.
 *
 * Minden kiküldést naplózunk az `email_naplo` táblába. Enélkül egy
 * "nem kaptam visszaigazolást" bejelentésnél nincs mit megnézni.
 */

function resend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error('Hiányzik a RESEND_API_KEY.');
  return new Resend(key);
}

const FELADO = process.env.EMAIL_FELADO ?? 'Szelid Liget <foglalas@szelidliget.hu>';

/**
 * A logó abszolút URL-lel hivatkozva. E-mailben nem használható
 * relatív útvonal, és a legtöbb levelezőkliens a beágyazott base64
 * képet sem jeleníti meg — ezért a publikus fájlra mutatunk.
 */
const OLDAL = process.env.NEXT_PUBLIC_OLDAL_URL ?? 'https://www.szelidliget.hu';
const LOGO_URL = `${OLDAL}/logo.png`;

function ft(n: number): string {
  return new Intl.NumberFormat('hu-HU').format(n) + ' Ft';
}

function datum(s: string, nyelv: string): string {
  return new Date(s + 'T12:00:00Z').toLocaleDateString(
    nyelv === 'en' ? 'en-GB' : 'hu-HU',
    { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }
  );
}

const SZOVEG = {
  hu: {
    targy: (az: string) => `Foglalás visszaigazolása — ${az}`,
    cim: 'Köszönjük a foglalást!',
    bevezeto: 'A fizetés megérkezett, a foglalásod véglegesítve.',
    azonosito: 'Foglalási azonosító',
    haz: 'Faház',
    erkezes: 'Érkezés',
    tavozas: 'Távozás',
    vendegek: 'Vendégek',
    fo: 'fő',
    osszeg: 'Fizetett összeg',
    bejelentkezes: 'Bejelentkezés 16:00-tól, a kulcsdoboz kódját érkezés előtt küldjük.',
    labl: 'Ha bármi kérdésed van, válaszolj erre a levélre.',
  },
  en: {
    targy: (az: string) => `Booking confirmation — ${az}`,
    cim: 'Thank you for your booking',
    bevezeto: 'Your payment has arrived and the booking is confirmed.',
    azonosito: 'Booking reference',
    haz: 'Cabin',
    erkezes: 'Check-in',
    tavozas: 'Check-out',
    vendegek: 'Guests',
    fo: 'guests',
    osszeg: 'Amount paid',
    bejelentkezes: 'Check-in from 4:00 pm; we send the lockbox code before arrival.',
    labl: 'If you have any questions, just reply to this email.',
  },
};

export async function visszaigazoloEmail(foglalasId: string): Promise<void> {
  const db = supabaseAdmin();

  /**
   * A kapcsolt táblák (hazak, vendegek) miatt a Supabase típusa túl tág
   * ahhoz, hogy magától felismerje a mezőket. Ezért itt írjuk le, mit
   * várunk vissza — így a fordító és a szerkesztő is tudja.
   */
  type FoglalasSor = {
    id: string;
    azonosito: string;
    erkezes: string;
    tavozas: string;
    fo: number;
    vegosszeg: number;
    hazak: { nev: string } | null;
    vendegek: { nev: string; email: string; nyelv: string } | null;
  };

  const { data, error } = await db
    .from('foglalasok')
    .select(
      'id, azonosito, erkezes, tavozas, fo, vegosszeg, ' +
        'hazak(nev), vendegek(nev, email, nyelv)'
    )
    .eq('id', foglalasId)
    .single();

  if (error || !data) throw new Error(`Foglalás nem található: ${foglalasId}`);

  const f = data as unknown as FoglalasSor;
  const vendeg = f.vendegek;
  const haz = f.hazak;
  if (!vendeg?.email) throw new Error('A foglaláshoz nincs e-mail cím.');

  const nyelv = (vendeg.nyelv === 'en' ? 'en' : 'hu') as 'hu' | 'en';
  const t = SZOVEG[nyelv];

  const sor = (cimke: string, ertek: string) =>
    `<tr><td style="padding:8px 0;color:#5d6273;border-top:1px solid #e8e1d1">${cimke}</td>` +
    `<td style="padding:8px 0;text-align:right;font-weight:600">${ertek}</td></tr>`;

  // Az arculat színei a logóból: krém háttér, pala szöveg, okker kiemelés.
  const html = `<!doctype html>
<html lang="${nyelv}"><body style="margin:0;background:#fefcf5;font-family:Helvetica,Arial,sans-serif;color:#3e4250">
  <div style="max-width:560px;margin:0 auto;padding:36px 24px">
    <img src="${LOGO_URL}" alt="Szelid Liget" width="200"
         style="display:block;margin:0 auto 30px;width:200px;height:auto">
    <h1 style="font-size:24px;font-weight:400;margin:0 0 12px;text-align:center">${t.cim}</h1>
    <p style="margin:0 0 30px;color:#5d6273;line-height:1.6;text-align:center">${t.bevezeto}</p>
    <table style="width:100%;border-collapse:collapse;font-size:15px">
      ${sor(t.azonosito, f.azonosito)}
      ${sor(t.haz, haz?.nev ?? '')}
      ${sor(t.erkezes, datum(f.erkezes, nyelv))}
      ${sor(t.tavozas, datum(f.tavozas, nyelv))}
      ${sor(t.vendegek, `${f.fo} ${t.fo}`)}
      ${sor(t.osszeg, ft(f.vegosszeg))}
    </table>
    <p style="margin:28px 0 0;color:#5d6273;line-height:1.6">${t.bejelentkezes}</p>
    <p style="margin:26px 0 0;padding-top:20px;border-top:1px solid #e8e1d1;color:#8a8ba0;font-size:13px">${t.labl}</p>
  </div>
</body></html>`;

  try {
    const { data } = await resend().emails.send({
      from: FELADO,
      to: vendeg.email,
      subject: t.targy(f.azonosito),
      html,
    });

    await db.from('email_naplo').insert({
      foglalas_id: f.id,
      tipus: 'visszaigazolas',
      cimzett: vendeg.email,
      nyelv,
      resend_id: data?.id,
      sikeres: true,
    });
  } catch (e) {
    await db.from('email_naplo').insert({
      foglalas_id: f.id,
      tipus: 'visszaigazolas',
      cimzett: vendeg.email,
      nyelv,
      sikeres: false,
      hiba: String(e),
    });
    throw e;
  }
}
