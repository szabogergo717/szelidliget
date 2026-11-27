/**
 * Banki utalás adatai — egy helyen, mindenhonnan.
 *
 * Eddig ezek csak a levélküldő modulban léteztek, ezért az utalási
 * adatok kizárólag e-mailben jutottak el a vendéghez. Ha a levél
 * késett vagy a levélszemét mappába esett, a vendégnek nem volt
 * semmije, amiből utalhatott volna.
 *
 * Mostantól a weboldal is meg tudja mutatni őket: a foglalóűrlapon,
 * amikor az átutalást választja, és a foglalás utáni oldalon is.
 *
 * ⚠ EZ SZERVEROLDALI MODUL. A változók nem `NEXT_PUBLIC_` kezdetűek,
 *   ezért csak szerveren olvashatók. A kliens komponensek a szerver
 *   oldalról kapják meg őket adatként — így marad egy forrás.
 *
 * Kitöltés kódmódosítás nélkül: Vercel → Settings → Environment
 * Variables. Ha üresen maradnak, a weboldal nem mutat hiányos
 * adatsort, hanem azt írja, hogy e-mailben küldjük.
 */

export type UtalasAdat = {
  kedvezmenyezett: string;
  szamlaszam: string;
  iban: string;
  /** Hány napon belül várjuk az utalást. */
  hatarido_nap: number;
  /** Van-e egyáltalán mit mutatni. */
  vanAdat: boolean;
};

export function utalasiAdatok(): UtalasAdat {
  const szamlaszam = process.env.UTALAS_SZAMLASZAM ?? '';
  const iban = process.env.UTALAS_IBAN ?? '';

  return {
    kedvezmenyezett: process.env.UTALAS_KEDVEZMENYEZETT ?? 'Szekundum Kft.',
    szamlaszam,
    iban,
    hatarido_nap: Number(process.env.UTALAS_HATARIDO_NAP ?? 3),
    // Kedvezményezett mindig van (alapértéke a cégnév), de az
    // önmagában kevés az utaláshoz. Számlaszám vagy IBAN kell hozzá.
    vanAdat: Boolean(szamlaszam || iban),
  };
}
