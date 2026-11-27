import { Resend } from 'resend';
import { supabaseAdmin } from './supabase';
import { CEG, IFA_FO_EJ } from './tartalom';

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
  foglalasId: string | null,
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
  foglalasId: string | null,
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
    ifa: 'Idegenforgalmi adó',
    ifaMagyarazat: (ar: string, osszeg: string) =>
      `Az idegenforgalmi adó (${ar} Ft/fő/éj, összesen ${osszeg}) a helyszínen fizetendő, érkezéskor. Ez nem része a fent kifizetett összegnek.`,
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
    ifa: 'Tourist tax',
    ifaMagyarazat: (ar: string, osszeg: string) =>
      `The tourist tax (${ar} HUF per person per night, ${osszeg} in total) is payable on arrival. It is not included in the amount paid above.`,
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

  // Az idegenforgalmi adót a vendég a helyszínen fizeti — itt csak
  // megmutatjuk, hogy érkezéskor ne érje meglepetés.
  const ejszakak = Math.max(
    0,
    Math.round(
      (new Date(f.tavozas + 'T12:00:00Z').getTime() -
        new Date(f.erkezes + 'T12:00:00Z').getTime()) / 86_400_000
    )
  );
  const ifaOsszeg = IFA_FO_EJ * f.fo * ejszakak;

  const html = keret(
    `<h1 style="font-size:24px;font-weight:400;margin:0 0 12px;text-align:center">${t.cim}</h1>
     <p style="margin:0 0 30px;color:#5d6273;line-height:1.6;text-align:center">${t.bevezeto}</p>
     ${adatTabla(
       adatSor(t.azonosito, f.azonosito) +
       adatSor(t.haz, f.hazak?.nev ?? '') +
       adatSor(t.erkezes, datum(f.erkezes, nyelv)) +
       adatSor(t.tavozas, datum(f.tavozas, nyelv)) +
       adatSor(t.vendegek, `${f.fo} ${t.fo}`) +
       adatSor(t.osszeg, ft(f.vegosszeg)) +
       (IFA_FO_EJ > 0 ? adatSor(t.ifa, ft(ifaOsszeg)) : '')
     )}
     ${
       IFA_FO_EJ > 0
         ? `<p style="margin:18px 0 0;color:#a97231;line-height:1.6;font-size:14.5px">${t.ifaMagyarazat(
             new Intl.NumberFormat(nyelv === 'en' ? 'en-GB' : 'hu-HU').format(IFA_FO_EJ),
             ft(ifaOsszeg)
           )}</p>`
         : ''
     }
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
    jakuzziCim: 'A jakuzzi használata',
    jakuzziSzoveg:
      'A faházban kinyomtatva is megtalálod, de érkezés előtt is elolvashatod — egy oldal, a legfontosabb tudnivalókkal:',
    jakuzziGomb: 'Jakuzzi házirend megnyitása',
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
    jakuzziCim: 'Using the hot tub',
    jakuzziSzoveg:
      'You will find it printed in the cabin, but you can also read it before you arrive — one page with everything that matters:',
    jakuzziGomb: 'Open the hot tub guide',
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
     <h2 style="font-size:17px;font-weight:600;margin:30px 0 8px">${t.jakuzziCim}</h2>
     <p style="margin:0 0 14px;color:#5d6273;line-height:1.6">${t.jakuzziSzoveg}</p>
     <p style="margin:0">
       <a href="${OLDAL}/jakuzzi-hazirend.pdf"
          style="display:inline-block;padding:11px 18px;background:#3b7ea0;color:#fefcf5;text-decoration:none;border-radius:3px;font-size:15px">${t.jakuzziGomb}</a>
     </p>
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


// ============================================================
//  6. Ajándékutalvány — sikeres vásárlás után
// ============================================================

/**
 * A megvásárolt ajándékutalvány kiküldése.
 *
 * Akkor fut, amikor a Barion visszaigazolta a fizetést. A kódot ekkor
 * már megkapta a vásárlás (lásd app/api/barion/visszahivas), itt csak
 * elküldjük.
 *
 * Ez a levél MAGA az utalvány: kinyomtatható, továbbküldhető. Ezért
 * benne van minden, ami a beváltáshoz kell — a kód, a lejárat, és
 * hogy mit fed és mit nem.
 */
export async function utalvanyEmail(vasarlasId: string): Promise<void> {
  const db = supabaseAdmin();

  const { data, error } = await db
    .from('utalvany_vasarlasok')
    .select('id, azonosito, nev, email, osszeg, ajandekozott, uzenet')
    .eq('id', vasarlasId)
    .single();

  if (error || !data) throw new Error(`Utalványvásárlás nem található: ${vasarlasId}`);

  const { data: kupon } = await db
    .from('kuponok')
    .select('kod, ejszakak, csomag_ar, ervenyes_ig')
    .eq('vasarlas_id', vasarlasId)
    .maybeSingle();

  if (!kupon) throw new Error(`Nincs kupon ehhez a vásárláshoz: ${vasarlasId}`);

  const lejarat = datum(kupon.ervenyes_ig as string, 'hu');

  const tartalom = `
    <h1 style="margin:0 0 6px;font-size:25px;font-weight:400;text-align:center">
      Ajándékutalvány
    </h1>
    <p style="margin:0 0 26px;text-align:center;color:#5d6273;font-size:15px">
      ${kupon.ejszakak} éjszaka a Szelid Ligetben, két főnek
    </p>

    <div style="border:2px solid #a97231;border-radius:3px;padding:22px;text-align:center;margin-bottom:26px">
      <div style="font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:#a97231">
        A beváltáshoz szükséges kód
      </div>
      <div style="font-family:'Courier New',monospace;font-size:28px;font-weight:700;letter-spacing:.08em;margin:10px 0 6px">
        ${kupon.kod}
      </div>
      <div style="font-size:13px;color:#5d6273">
        Felhasználható ${lejarat}-ig
      </div>
    </div>

    ${adatTabla(
      adatSor('Utalvány azonosítója', data.azonosito as string) +
      adatSor('Amit tartalmaz', `${kupon.ejszakak} éjszaka szállás, 2 fő`) +
      adatSor('Kifizetett összeg', ft(data.osszeg as number))
    )}

    <p style="margin:24px 0 8px;font-size:15px;font-weight:600">Hogyan váltható be</p>
    <ol style="margin:0 0 20px;padding-left:20px;font-size:15px;line-height:1.7;color:#5d6273">
      <li>Keresd fel a <a href="${OLDAL}/#foglalas" style="color:#a97231">foglalási oldalt</a>,
          és válassz egy pontosan ${kupon.ejszakak} éjszakás időpontot.</li>
      <li>A foglalás véglegesítésekor írd be a fenti kódot a „Kuponkód" mezőbe.</li>
      <li>A szállásdíj helyébe az utalvány lép; a visszaigazolást e-mailben küldjük.</li>
    </ol>

    <p style="margin:0 0 20px;font-size:14px;line-height:1.7;color:#5d6273">
      <strong>Jó tudni:</strong> az utalvány a szabad helyek függvényében használható fel,
      hétköznapi éjszakákra. Pénteki és szombati éjszakára hétvégi felár jön rá,
      éjszakánként ${ft(12000)}. Az extra szolgáltatások ára szintén az utalványon felül
      értendő. A kód egyszer váltható be, és átadható másnak.
    </p>

    ${data.ajandekozott ? `
      <p style="margin:0 0 20px;font-size:14px;color:#5d6273">
        Ajándékozott neve a vásárláskor: <strong>${data.ajandekozott}</strong>
      </p>` : ''}

    <p style="margin:0;font-size:14px;color:#5d6273">
      Kérdés esetén hívj minket a ${CEG.telefon} számon, vagy válaszolj erre a levélre.
    </p>`;

  await kuld(
    null,
    'ajandekutalvany',
    data.email as string,
    'hu',
    `Ajándékutalvány — ${kupon.kod}`,
    keret(tartalom, 'hu')
  );
}


/**
 * Utalásos utalványvásárlás — az utalási adatok kiküldése.
 *
 * A KÓD MÉG NEM SZEREPEL BENNE. Utalásnál a pénz beérkezését nem
 * tudjuk automatikusan észlelni, ezért a kód akkor születik meg,
 * amikor az admin felületen „kifizetve"-re állítod a vásárlást.
 * Addig ez a levél csak annyit mond: megvan a rendelés, ennyit kell
 * utalni, és a kód utána jön.
 */
export async function utalvanyUtalasiEmail(vasarlasId: string): Promise<void> {
  const db = supabaseAdmin();
  const { data, error } = await db
    .from('utalvany_vasarlasok')
    .select('id, azonosito, nev, email, osszeg')
    .eq('id', vasarlasId)
    .single();

  if (error || !data) throw new Error(`Utalványvásárlás nem található: ${vasarlasId}`);

  const hatarido = new Date();
  hatarido.setDate(hatarido.getDate() + UTALAS.hatarido_nap);

  const tartalom = `
    <h1 style="margin:0 0 10px;font-size:24px;font-weight:400">Megkaptuk a rendelésed</h1>
    <p style="margin:0 0 22px;font-size:15px;line-height:1.7;color:#5d6273">
      Az ajándékutalványt az összeg beérkezése után küldjük el erre az e-mail címre,
      a beváltáshoz szükséges kóddal együtt. Ez általában egy munkanapot vesz igénybe.
    </p>

    <p style="margin:0 0 8px;font-size:15px;font-weight:600">Utalási adatok</p>
    ${adatTabla(
      adatSor('Kedvezményezett', UTALAS.kedvezmenyezett) +
      (UTALAS.szamlaszam ? adatSor('Számlaszám', UTALAS.szamlaszam) : '') +
      (UTALAS.iban ? adatSor('IBAN', UTALAS.iban) : '') +
      adatSor('Közlemény', data.azonosito as string) +
      adatSor('Utalandó összeg', ft(data.osszeg as number)) +
      adatSor('Határidő', datum(hatarido.toISOString().slice(0, 10), 'hu'))
    )}

    <p style="margin:22px 0 0;font-size:14px;line-height:1.7;color:#5d6273">
      <strong>A közlemény rovatba kérjük, írd be a(z) ${data.azonosito} azonosítót</strong> —
      ebből tudjuk beazonosítani az utalásodat. Ez NEM a beváltási kód; azt a fizetés
      beérkezése után küldjük.
    </p>

    <p style="margin:18px 0 0;font-size:14px;color:#5d6273">
      Kérdés esetén hívj minket a ${CEG.telefon} számon, vagy válaszolj erre a levélre.
    </p>`;

  await kuld(
    null,
    'utalvany_utalas',
    data.email as string,
    'hu',
    `Ajándékutalvány rendelés — ${data.azonosito}`,
    keret(tartalom, 'hu')
  );
}
