import type { UtalasAdat } from '@/lib/utalas';
import type { Nyelv } from '@/lib/tartalom';

/**
 * Az utalási adatok megjelenítése a képernyőn.
 *
 * Miért kell: eddig ezek csak e-mailben mentek ki. Ha a levél késett
 * vagy a levélszemét mappába esett, a vendég nem tudott utalni, és
 * nem volt hova fordulnia. Most a weboldalon is ott vannak.
 *
 * A `kozlemeny` a foglalási vagy rendelési azonosító. Ez a legfontosabb
 * mező az egészben: enélkül nem tudjuk párosítani a beérkező összeget
 * a foglalással, ezért külön ki is emeljük.
 */
export default function UtalasiAdatok({
  adat,
  kozlemeny,
  nyelv = 'hu',
}: {
  adat: UtalasAdat;
  /** A foglalás vagy rendelés azonosítója. Üres is lehet. */
  kozlemeny?: string;
  nyelv?: Nyelv;
}) {
  const hu = nyelv !== 'en';

  // Ha nincs számlaszám és IBAN sem, hiányos adatsort mutatni rosszabb,
  // mint semmit: a vendég elkezdene utalni a semmibe.
  if (!adat.vanAdat) {
    return (
      <div className="utalas-adatok hianyos">
        {hu
          ? 'Az utalási adatokat e-mailben küldjük el, a foglalás rögzítése után.'
          : 'We will email the bank transfer details once your booking is recorded.'}
      </div>
    );
  }

  return (
    <div className="utalas-adatok">
      <div className="ua-cim">
        {hu ? 'Utalási adatok' : 'Bank transfer details'}
      </div>

      <dl className="ua-lista">
        <dt>{hu ? 'Kedvezményezett' : 'Beneficiary'}</dt>
        <dd>{adat.kedvezmenyezett}</dd>

        {adat.szamlaszam && (
          <>
            <dt>{hu ? 'Számlaszám' : 'Account number'}</dt>
            <dd className="ua-szam">{adat.szamlaszam}</dd>
          </>
        )}

        {adat.iban && (
          <>
            <dt>IBAN</dt>
            <dd className="ua-szam">{adat.iban}</dd>
          </>
        )}

        {kozlemeny && (
          <>
            <dt>{hu ? 'Közlemény' : 'Payment reference'}</dt>
            <dd className="ua-szam ua-kiemelt">{kozlemeny}</dd>
          </>
        )}

        <dt>{hu ? 'Határidő' : 'Deadline'}</dt>
        <dd>
          {hu
            ? `${adat.hatarido_nap} napon belül`
            : `within ${adat.hatarido_nap} days`}
        </dd>
      </dl>

      {kozlemeny ? (
        <p className="ua-megjegyzes">
          {hu
            ? 'A közlemény rovatba feltétlenül írd be a fenti azonosítót — ebből tudjuk beazonosítani az utalásodat.'
            : 'Please quote the reference above when you make the transfer — this is how we match your payment.'}
        </p>
      ) : (
        <p className="ua-megjegyzes">
          {hu
            ? 'A közlemény rovatba a foglalási azonosítód kerül majd, amit a foglalás után e-mailben is megkapsz.'
            : 'Your booking reference will go in the payment reference field; we will email it to you after booking.'}
        </p>
      )}
    </div>
  );
}
