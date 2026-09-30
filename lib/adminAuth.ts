/**
 * Admin belépés.
 *
 * Egy tulajdonos használja, ezért nincs felhasználókezelés: egy jelszó
 * és egy aláírt munkamenet-süti. Ez egyszerű, de a részletek számítanak:
 *
 *  - A jelszót IDŐZÍTÉS-FÜGGETLENÜL hasonlítjuk össze. Sima `===` esetén
 *    a válaszidőből karakterenként ki lehetne találni a jelszót.
 *  - A süti `httpOnly`, tehát JavaScript nem fér hozzá (XSS ellen).
 *  - A süti `secure` és `sameSite=lax`, tehát csak HTTPS-en megy, és
 *    idegen oldalról indított kérésekkel nem küldi el a böngésző.
 *  - A munkamenet lejár, és a lejárati idő is alá van írva — nem lehet
 *    utólag átírni a sütiben.
 *
 * A Web Crypto API-t használjuk, mert a Next.js köztes rétege (middleware)
 * nem a teljes Node.js környezetben fut.
 */

export const SUTI_NEV = 'szl_admin';
const ERVENYESSEG_ORA = 12;

function titok(): string {
  const t = process.env.ADMIN_SESSION_TITOK;
  if (!t || t.length < 24) {
    throw new Error(
      'Hiányzik vagy túl rövid az ADMIN_SESSION_TITOK (legalább 24 karakter kell).'
    );
  }
  return t;
}

function b64url(bytes: Uint8Array): string {
  let s = '';
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function b64urlVissza(s: string): Uint8Array {
  const p = s.replace(/-/g, '+').replace(/_/g, '/');
  const bin = atob(p + '='.repeat((4 - (p.length % 4)) % 4));
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

async function alair(uzenet: string, kulcs: string): Promise<string> {
  const enc = new TextEncoder();
  const k = await crypto.subtle.importKey(
    'raw',
    enc.encode(kulcs),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', k, enc.encode(uzenet));
  return b64url(new Uint8Array(sig));
}

/** Időzítés-független összehasonlítás. */
function egyezik(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let kulonbseg = 0;
  for (let i = 0; i < a.length; i++) {
    kulonbseg |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return kulonbseg === 0;
}

/** Jelszó ellenőrzése. */
export function jelszoHelyes(megadott: string): boolean {
  const vart = process.env.ADMIN_JELSZO;
  if (!vart || vart.length < 12) {
    // Ha nincs beállítva jelszó, senki nem léphet be. Ez szándékos:
    // egy üres jelszó rosszabb, mint egy elérhetetlen admin felület.
    return false;
  }
  return egyezik(megadott, vart);
}

/** Új munkamenet-token. */
export async function tokenKeszit(): Promise<{ token: string; lejar: Date }> {
  const lejar = new Date(Date.now() + ERVENYESSEG_ORA * 3600 * 1000);
  const adat = b64url(new TextEncoder().encode(JSON.stringify({ exp: lejar.getTime() })));
  const sig = await alair(adat, titok());
  return { token: `${adat}.${sig}`, lejar };
}

/** Token ellenőrzése. Hamis, ha hamisított vagy lejárt. */
export async function tokenErvenyes(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const reszek = token.split('.');
  if (reszek.length !== 2) return false;

  const [adat, sig] = reszek;
  let vartSig: string;
  try {
    vartSig = await alair(adat, titok());
  } catch {
    return false;
  }
  if (!egyezik(sig, vartSig)) return false;

  try {
    const { exp } = JSON.parse(new TextDecoder().decode(b64urlVissza(adat)));
    return typeof exp === 'number' && exp > Date.now();
  } catch {
    return false;
  }
}

export const SUTI_BEALLITAS = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
};
