/** Közös formázók az admin felülethez. */

export function ft(n: number): string {
  return new Intl.NumberFormat('hu-HU').format(n) + ' Ft';
}

export function datum(s: string): string {
  return new Date(s + 'T12:00:00Z').toLocaleDateString('hu-HU', {
    year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'UTC',
  });
}

export function datumRovid(s: string): string {
  return new Date(s + 'T12:00:00Z').toLocaleDateString('hu-HU', {
    month: '2-digit', day: '2-digit', timeZone: 'UTC',
  });
}

export function idopont(s: string): string {
  return new Date(s).toLocaleString('hu-HU', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Budapest',
  });
}

export function ejszakak(erkezes: string, tavozas: string): number {
  const a = new Date(erkezes + 'T12:00:00Z').getTime();
  const b = new Date(tavozas + 'T12:00:00Z').getTime();
  return Math.round((b - a) / 86_400_000);
}

export const STATUSZ_NEV: Record<string, string> = {
  fuggoben: 'Függőben',
  elolegezve: 'Előlegezve',
  kifizetve: 'Kifizetve',
  lemondva: 'Lemondva',
  nem_jelent_meg: 'Nem jelent meg',
};

export const FORRAS_NEV: Record<string, string> = {
  sajat: 'Saját oldal',
  booking: 'Booking.com',
  szallas_hu: 'Szallas.hu',
  kezi: 'Kézi felvitel',
};
