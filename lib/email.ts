import { Resend } from 'resend';
import { supabaseAdmin } from './supabase';
import { CEG } from './tartalom';

/**
 * Tranzakciós e-mailek Resenden keresztül.
 *
 * Minden kiküldést naplózunk az `email_naplo` táblába. Enélkül egy
 * „nem kaptam visszaigazolást" bejelentésnél nincs mit megnézni.
 *
 * Levéltípusok:
 *   visszaigazolas   — a vendégnek, sikeres kártyás fizetés után
 *   utalasi_adatok   — a vendégnek, utalásos foglalásnál
 *   emlekezteto      — a vendégnek, érkezés előtt 3 nappal
 *   lemondas         — a vendégnek, ha a foglalás lemondásra kerül
 *   admin_*          — nekünk, hogy ne az adminban kelljen figyelni
 */

function resend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error('Hiányzik a RESEND_API_KEY.');
  return new Resend(key);
}

const FELADO = process.env.EMAIL_FELADO ?? 'Szelid Liget <foglalas@szelidliget.hu>';
const ADMIN_CIM = process.env.EMAIL_ERTESITES ?? '';
const OLDAL = process.env.NEXT_PUBLIC_OLDAL_URL ?? 'https://www.szelidliget.hu';
const LOGO_URL = `${OLDAL}/logo.png`;

/** Utalási adatok — a Vercel beállításaiból, hogy ne a kódban álljanak. */
const UTALAS = {
  kedvezmenyezett: process.env.UTALAS_KEDVEZMENYEZETT ?? CEG.nev,
  szamlaszam: process.env.UTALAS_SZAMLASZAM ?? '',
  iban: process.env.UTALAS_IBAN ?? '',
  hatarido_nap: Number(process.env.UTALAS_HATARIDO_NAP ?? 3),
};

function ft(n: number): string {
  return new Intl.NumberFormat('hu-HU').format(n) + ' Ft';
}

function datum(s: string, nyelv: string): string {
  return new Date(s + 'T12:00:00Z').toLocaleDateString(
    nyelv === 'en' ? 'en-GB' : 'hu-HU',
    { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }
  );
}

type FoglalasSor = {
  id: string;
  azonosito: string;
  erkezes: string;
  tavozas: string;
  fo: number;
  vegosszeg: number;
  statusz: string;
  fizetesi_mod: string | null;
  megjegyzes: string | null;
  hazak: { nev: string } | null;
  vendegek: { nev: string; email: string; telefon: string | null; nyelv: string } | null;
};

async function foglalastBetolt(foglalasId: string): Promise<FoglalasSor> {
  const db = supabaseAdmin();
  const { data, error } = await db
    .from('foglalasok')
    .select(
      'id, azonosito, erkezes, tavozas, fo, vegosszeg, statusz, fizetesi_mod, megjegyzes, ' +
        'hazak(nev), vendegek(nev, email, telefon, nyelv)'
    )
    .eq('id', foglalasId)
    .single();

  if (error || !data) throw new Error(`Foglalás nem található: ${foglalasId}`);
  return data as unknown as FoglalasSor;
}

async function naploz(
  foglalasId: string,
  tipus: string,
  cimzett: string,
  nyelv: string,
  sikeres: boolean,
  resendId?: string,
  hiba?: string
) {
  try {
    await supabaseAdmin().from('email_naplo').insert({
      foglalas_id: foglalasId,
      tipus,
      cimzett,
      nyelv,
      resend_id: resendId,
      sikeres,
      hiba,
    });
  } catch (e) {
    console.error('[email] naplózás sikertelen:', e);
  }
}

/** Közös keret minden levélhez — a logóval és az arculat színeivel. */
function keret(tartalom: string, nyelv: string): string {
  return `<!doctype html>
<html lang="${nyelv}"><body style="margin:0;background:#fefcf5;font-family:Helvetica,Arial,sans-serif;color:#3e4250">
  <div style="max-width:560px;margin:0 auto;padding:36px 24px">
    <img src="${LOGO_URL}" alt="Szelid Liget" width="200"
         style="display:block;margin:0 auto 30px;width:200px;height:auto">
    ${tartalom}
    <p style="margin:26px 0 0;padding-top:20px;border-top:1px solid #e8e1d1;color:#8a8ba0;font-size:13px">
      ${CEG.nev} · ${CEG.cim}<br>
      ${CEG.email} · ${OLDAL.replace('https://', '')}
    </p>
  </div>
</body></html>`;
}

function adatSor(cimke: string, ertek: string): string {
  return (
    `<tr><td style="padding:8px 0;color:#5d6273;border-top:1px solid #e8e1d1">${cimke}</td>` +
    `<td style="padding:8px 0;text-align:right;font-weight:600">${ertek}</td></tr>`
  );
}

function adatTabla(sorok: string): string {
  return `<table style="width:100%;border-collapse:collapse;font-size:15px">${sorok}</table>`;
}

async function kuld(
  foglalasId: string,
  tipus: string,
  cimzett: string,
  nyelv: string,
  targy: string,
  html: string
) {
  try {
    const { data } = await resend().emails.send({
      from: FELADO, to: cimzett, subject: targy, html,
    });
    await naploz(foglalasId, tipus, cimzett, nyelv, true, data?.id);
  } catch (e) {
    await naploz(foglalasId, tipus, cimzett, nyelv, false, undefined, String(e));
    throw e;
  }
}

// ============================================================
//  1. Visszaigazolás — sikeres kártyás fizetés után
// ============================================================

const SZOVEG = {
  hu: {
    targy: (az: string) => `Foglalás visszaigazolása — ${az}`,
    cim: 'Köszönjük a foglalást!',
    bevezeto: 'A fizetés megérkezett, a foglalásod véglegesítve.',
    azonosito: 'Foglalási azonosító', haz: 'Faház', erkezes: 'Érkezés',
    tavozas: 'Távozás', vendegek: 'Vendégek', fo: 'fő', osszeg: 'Fizetett összeg',
    erkezesInfo:
      'Érkezés 15:00-tól, távozás 10:00-ig. Néhány nappal az érkezés előtt küldünk egy tájékoztatót a megközelítésről és a parkolásról.',
    labl: 'Ha bármi kérdésed van, válaszolj erre a levélre.',
  },
  en: {
    targy: (az: string) => `Booking confirmation — ${az}`,
    cim: 'Thank you for your booking',
    bevezeto: 'Your payment has arrived and the booking is confirmed.',
    azonosito: 'Booking reference', haz: 'Cabin', erkezes: 'Check-in',
    tavozas: 'Check-out', vendegek: 'Guests', fo: 'guests', osszeg: 'Amount paid',
    erkezesInfo:
      'Check-in from 3:00 pm, check-out by 10:00 am. A few days before arrival we will send directions and parking details.',
    labl: 'If you have any questions, just reply to this email.',
  },
};

export async function visszaigazoloEmail(foglalasId: string): Promise<void> {
  const f = await foglalastBetolt(foglalasId);
  const v = f.vendegek;
  if (!v?.email) throw new Error('A foglaláshoz nincs e-mail cím.');

  const nyelv = (v.nyelv === 'en' ? 'en' : 'hu') as 'hu' | 'en';
  const t = SZOVEG[nyelv];

  const html = keret(
    `<h1 style="font-size:24px;font-weight:400;margin:0 0 12px;text-align:center">${t.cim}</h1>
     <p style="margin:0 0 30px;color:#5d6273;line-height:1.6;text-align:center">${t.bevezeto}</p>
     ${adatTabla(
       adatSor(t.azonosito, f.azonosito) +
       adatSor(t.haz, f.hazak?.nev ?? '') +
       adatSor(t.erkezes, datum(f.erkezes, nyelv)) +
       adatSor(t.tavozas, datum(f.tavozas, nyelv)) +
       adatSor(t.vendegek, `${f.fo} ${t.fo}`) +
       adatSor(t.osszeg, ft(f.vegosszeg))
     )}
     <p style="margin:28px 0 0;color:#5d6273;line-height:1.6">${t.erkezesInfo}</p>`,
    nyelv
  );

  await kuld(f.id, 'visszaigazolas', v.email, nyelv, t.targy(f.azonosito), html);
}

// ============================================================
//  2. Utalási adatok — utalásos foglalásnál
// ============================================================

const UTALAS_SZOVEG = {
  hu: {
    targy: (az: string) => `Foglalásod és az utalási adatok — ${az}`,
    cim: 'Foglalásodat rögzítettük',
    bevezeto:
      'Az időpontot fenntartjuk. A foglalás akkor válik véglegessé, amikor az összeg megérkezik a számlánkra.',
    utalasCim: 'Utalási adatok',
    kedvezmenyezett: 'Kedvezményezett', szamlaszam: 'Számlaszám', iban: 'IBAN',
    kozlemeny: 'Közlemény', osszeg: 'Utalandó összeg', hatarido: 'Utalási határidő',
    azonosito: 'Foglalási azonosító', haz: 'Faház', erkezes: 'Érkezés', tavozas: 'Távozás',
    fontos:
      'Kérjük, a közlemény rovatba írd be a foglalási azonosítót — így tudjuk gyorsan beazonosítani az utalást.',
    hianyzoAdat:
      'Az utalási adatokat külön e-mailben küldjük, amint összeállítottuk.',
    labl: 'Ha kérdésed van, válaszolj erre a levélre.',
  },
  en: {
    targy: (az: string) => `Your booking and transfer details — ${az}`,
    cim: 'Your booking is registered',
    bevezeto:
      'We are holding your dates. The booking becomes final once the amount arrives in our account.',
    utalasCim: 'Transfer details',
    kedvezmenyezett: 'Beneficiary', szamlaszam: 'Account number', iban: 'IBAN',
    kozlemeny: 'Reference', osszeg: 'Amount to transfer', hatarido: 'Transfer deadline',
    azonosito: 'Booking reference', haz: 'Cabin', erkezes: 'Check-in', tavozas: 'Check-out',
    fontos:
      'Please put the booking reference in the payment reference field — this lets us match your transfer quickly.',
    hianyzoAdat:
      'We will send the transfer details in a separate email shortly.',
    labl: 'If you have any questions, just reply to this email.',
  },
};

export async function utalasiEmail(foglalasId: string): Promise<void> {
  const f = await foglalastBetolt(foglalasId);
  const v = f.vendegek;
  if (!v?.email) throw new Error('A foglaláshoz nincs e-mail cím.');

  const nyelv = (v.nyelv === 'en' ? 'en' : 'hu') as 'hu' | 'en';
  const t = UTALAS_SZOVEG[nyelv];

  const hatarido = new Date();
  hatarido.setDate(hatarido.getDate() + UTALAS.hatarido_nap);

  // Ha a számlaszám még nincs beállítva, nem küldünk üres mezőket —
  // inkább jelezzük, hogy külön levélben jön.
  const vanAdat = Boolean(UTALAS.szamlaszam || UTALAS.iban);

  const utalasBlokk = vanAdat
    ? adatTabla(
        adatSor(t.kedvezmenyezett, UTALAS.kedvezmenyezett) +
        (UTALAS.szamlaszam ? adatSor(t.szamlaszam, UTALAS.szamlaszam) : '') +
        (UTALAS.iban ? adatSor(t.iban, UTALAS.iban) : '') +
        adatSor(t.kozlemeny, f.azonosito) +
        adatSor(t.osszeg, ft(f.vegosszeg)) +
        adatSor(t.hatarido, datum(hatarido.toISOString().slice(0, 10), nyelv))
      ) +
      `<p style="margin:18px 0 0;color:#a97231;line-height:1.6;font-size:14.5px">${t.fontos}</p>`
    : `<p style="margin:0;color:#5d6273;line-height:1.6">${t.hianyzoAdat}</p>`;

  const html = keret(
    `<h1 style="font-size:24px;font-weight:400;margin:0 0 12px;text-align:center">${t.cim}</h1>
     <p style="margin:0 0 30px;color:#5d6273;line-height:1.6;text-align:center">${t.bevezeto}</p>
     <h2 style="font-size:17px;font-weight:600;margin:0 0 10px">${t.utalasCim}</h2>
     ${utalasBlokk}
     <h2 style="font-size:17px;font-weight:600;margin:30px 0 10px">${t.azonosito}</h2>
     ${adatTabla(
       adatSor(t.azonosito, f.azonosito) +
       adatSor(t.haz, f.hazak?.nev ?? '') +
       adatSor(t.erkezes, datum(f.erkezes, nyelv)) +
       adatSor(t.tavozas, datum(f.tavozas, nyelv))
     )}`,
    nyelv
  );

  await kuld(f.id, 'utalasi_adatok', v.email, nyelv, t.targy(f.azonosito), html);
}

// ============================================================
//  3. Érkezés előtti emlékeztető (3 nappal korábban)
// ============================================================

const EMLEK_SZOVEG = {
  hu: {
    targy: 'Néhány nap és találkozunk — Szelid Liget',
    cim: 'Szeretettel várunk!',
    bevezeto:
      'Már készülünk az érkezésedre. Addig is összefoglaljuk a legfontosabbakat.',
    erkezes: 'Érkezés', tavozas: 'Távozás', haz: 'Faház', cim2: 'Cím',
    tudnivalok: 'Jó tudni',
    lista: [
      'Érkezés 15:00-tól, távozás 10:00-ig.',
      'A házban minden megtalálható: ágynemű, törülköző, köntös, tisztálkodószerek.',
      'A konyha felszerelt, kávékapszula és tea a házban van.',
      'Háziállatot sajnos nem tudunk fogadni, és a dohányzás a házban és a teraszon is tilos.',
      'Nyílt tüzet — grillt, tűzrakást — az erdő közelsége miatt nem gyújthatunk.',
    ],
    labl: 'Ha bármi közbejön, vagy késnél, hívj minket nyugodtan.',
  },
  en: {
    targy: 'See you in a few days — Szelid Liget',
    cim: 'We look forward to welcoming you',
    bevezeto:
      'We are getting everything ready for your arrival. Here is a quick summary.',
    erkezes: 'Check-in', tavozas: 'Check-out', haz: 'Cabin', cim2: 'Address',
    tudnivalok: 'Good to know',
    lista: [
      'Check-in from 3:00 pm, check-out by 10:00 am.',
      'Everything is provided: bed linen, towels, bathrobes and toiletries.',
      'The kitchen is fully equipped; coffee capsules and tea are in the cabin.',
      'We cannot accept pets, and smoking is not allowed inside or on the terrace.',
      'Open fires — barbecues or campfires — are not permitted because of the forest.',
    ],
    labl: 'If anything comes up, or you are running late, just give us a call.',
  },
};

export async function emlekeztetoEmail(foglalasId: string): Promise<void> {
  const f = await foglalastBetolt(foglalasId);
  const v = f.vendegek;
  if (!v?.email) throw new Error('A foglaláshoz nincs e-mail cím.');

  const nyelv = (v.nyelv === 'en' ? 'en' : 'hu') as 'hu' | 'en';
  const t = EMLEK_SZOVEG[nyelv];

  const html = keret(
    `<h1 style="font-size:24px;font-weight:400;margin:0 0 12px;text-align:center">${t.cim}</h1>
     <p style="margin:0 0 30px;color:#5d6273;line-height:1.6;text-align:center">${t.bevezeto}</p>
     ${adatTabla(
       adatSor(t.haz, f.hazak?.nev ?? '') +
       adatSor(t.erkezes, datum(f.erkezes, nyelv)) +
       adatSor(t.tavozas, datum(f.tavozas, nyelv)) +
       adatSor(t.cim2, CEG.cim)
     )}
     <h2 style="font-size:17px;font-weight:600;margin:30px 0 10px">${t.tudnivalok}</h2>
     <ul style="margin:0;padding-left:20px;color:#5d6273;line-height:1.7;font-size:14.5px">
       ${t.lista.map((s) => `<li>${s}</li>`).join('')}
     </ul>
     <p style="margin:24px 0 0;color:#5d6273;line-height:1.6">${t.labl}</p>`,
    nyelv
  );

  await kuld(f.id, 'emlekezteto', v.email, nyelv, t.targy, html);

  // Megjelöljük, hogy ne menjen ki kétszer.
  await supabaseAdmin()
    .from('foglalasok')
    .update({ emlekezteto_kuldve: new Date().toISOString() })
    .eq('id', f.id);
}

// ============================================================
//  4. Lemondás — a vendégnek
// ============================================================

const LEMOND_SZOVEG = {
  hu: {
    targy: (az: string) => `Foglalásod lemondva — ${az}`,
    cim: 'Foglalásodat lemondtuk',
    bevezeto:
      'A lenti foglalás lemondásra került. Ha ez tévedés, válaszolj erre a levélre, és rendezzük.',
    azonosito: 'Foglalási azonosító', haz: 'Faház', erkezes: 'Érkezés', tavozas: 'Távozás',
    visszaterites:
      'A visszatérítésről külön értesítünk. Reméljük, máskor sikerül vendégül látnunk.',
  },
  en: {
    targy: (az: string) => `Your booking has been cancelled — ${az}`,
    cim: 'Your booking has been cancelled',
    bevezeto:
      'The booking below has been cancelled. If this is a mistake, reply to this email and we will sort it out.',
    azonosito: 'Booking reference', haz: 'Cabin', erkezes: 'Check-in', tavozas: 'Check-out',
    visszaterites:
      'We will contact you separately about any refund. We hope to host you another time.',
  },
};

export async function lemondasEmail(foglalasId: string): Promise<void> {
  const f = await foglalastBetolt(foglalasId);
  const v = f.vendegek;
  if (!v?.email) throw new Error('A foglaláshoz nincs e-mail cím.');

  const nyelv = (v.nyelv === 'en' ? 'en' : 'hu') as 'hu' | 'en';
  const t = LEMOND_SZOVEG[nyelv];

  const html = keret(
    `<h1 style="font-size:24px;font-weight:400;margin:0 0 12px;text-align:center">${t.cim}</h1>
     <p style="margin:0 0 30px;color:#5d6273;line-height:1.6;text-align:center">${t.bevezeto}</p>
     ${adatTabla(
       adatSor(t.azonosito, f.azonosito) +
       adatSor(t.haz, f.hazak?.nev ?? '') +
       adatSor(t.erkezes, datum(f.erkezes, nyelv)) +
       adatSor(t.tavozas, datum(f.tavozas, nyelv))
     )}
     <p style="margin:24px 0 0;color:#5d6273;line-height:1.6">${t.visszaterites}</p>`,
    nyelv
  );

  await kuld(f.id, 'lemondas', v.email, nyelv, t.targy(f.azonosito), html);
}

// ============================================================
//  5. Admin értesítők — nekünk
// ============================================================

export type AdminEsemeny = 'uj_foglalas' | 'kifizetve' | 'lemondva';

const ADMIN_CIMEK: Record<AdminEsemeny, string> = {
  uj_foglalas: 'Új foglalás',
  kifizetve: 'Foglalás kifizetve',
  lemondva: 'Foglalás lemondva',
};

/**
 * Értesítő a tulajdonosnak. Magyarul, tömören, a lényeggel —
 * hogy a telefon értesítéséből is látszódjon, mi történt.
 */
export async function adminErtesito(
  foglalasId: string,
  esemeny: AdminEsemeny
): Promise<void> {
  if (!ADMIN_CIM) return; // nincs beállítva értesítési cím

  const f = await foglalastBetolt(foglalasId);
  const v = f.vendegek;
  const cim = ADMIN_CIMEK[esemeny];

  const fizMod =
    f.fizetesi_mod === 'utalas' ? 'banki átutalás' : 'bankkártya';

  const html = keret(
    `<h1 style="font-size:22px;font-weight:400;margin:0 0 20px">${cim}: ${f.azonosito}</h1>
     ${adatTabla(
       adatSor('Faház', f.hazak?.nev ?? '') +
       adatSor('Időszak', `${datum(f.erkezes, 'hu')} – ${datum(f.tavozas, 'hu')}`) +
       adatSor('Vendégek', `${f.fo} fő`) +
       adatSor('Vendég', v?.nev ?? '—') +
       adatSor('E-mail', v?.email ?? '—') +
       adatSor('Telefon', v?.telefon ?? '—') +
       adatSor('Összeg', ft(f.vegosszeg)) +
       adatSor('Fizetési mód', fizMod) +
       adatSor('Státusz', f.statusz)
     )}
     ${
       f.megjegyzes
         ? `<p style="margin:20px 0 0;color:#5d6273;line-height:1.6"><strong>Vendég megjegyzése:</strong><br>${f.megjegyzes}</p>`
         : ''
     }
     <p style="margin:26px 0 0">
       <a href="${OLDAL}/admin/foglalas/${f.azonosito}"
          style="display:inline-block;background:#a97231;color:#fff;padding:12px 24px;text-decoration:none">
         Megnyitás az adminban
       </a>
     </p>`,
    'hu'
  );

  await kuld(
    f.id,
    `admin_${esemeny}`,
    ADMIN_CIM,
    'hu',
    `[Szelid Liget] ${cim} — ${f.azonosito}`,
    html
  );
}
