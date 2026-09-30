import { supabaseAdmin } from './supabase';

/**
 * Az admin felület adatlekérdezései.
 *
 * Ezek mind a service_role kulccsal futnak, tehát látják a vendégadatot.
 * Kizárólag szerveroldalról hívhatók, és az /admin útvonalakat a
 * middleware már a kérés elején megvédi.
 */

export type FoglalasSor = {
  id: string;
  azonosito: string;
  erkezes: string;
  tavozas: string;
  fo: number;
  statusz: string;
  forras: string;
  vegosszeg: number;
  szallasdij: number;
  extrak_dij: number;
  megjegyzes: string | null;
  letrehozva: string;
  haz_nev: string;
  haz_slug: string;
  vendeg_nev: string | null;
  vendeg_email: string | null;
  vendeg_telefon: string | null;
  vendeg_nyelv: string | null;
  /** Számlázási adatok — a számla kiállításához. */
  szla_nev: string | null;
  szla_cim: string | null;
  szla_irsz: string | null;
  szla_varos: string | null;
  szla_orszag: string | null;
  szla_adoszam: string | null;
};

type NyersSor = Omit<
  FoglalasSor,
  | 'haz_nev' | 'haz_slug' | 'vendeg_nev' | 'vendeg_email' | 'vendeg_telefon'
  | 'vendeg_nyelv' | 'szla_nev' | 'szla_cim' | 'szla_irsz' | 'szla_varos'
  | 'szla_orszag' | 'szla_adoszam'
> & {
  hazak: { nev: string; slug: string } | null;
  vendegek: {
    nev: string; email: string; telefon: string | null; nyelv: string;
    szla_nev: string | null; szla_cim: string | null; szla_irsz: string | null;
    szla_varos: string | null; szla_orszag: string | null;
    szla_adoszam: string | null;
  } | null;
};

const MEZOK =
  'id, azonosito, erkezes, tavozas, fo, statusz, forras, vegosszeg, ' +
  'szallasdij, extrak_dij, megjegyzes, letrehozva, ' +
  'hazak(nev, slug), vendegek(nev, email, telefon, nyelv, szla_nev, ' +
  'szla_cim, szla_irsz, szla_varos, szla_orszag, szla_adoszam)';

function lapit(s: NyersSor): FoglalasSor {
  return {
    id: s.id,
    azonosito: s.azonosito,
    erkezes: s.erkezes,
    tavozas: s.tavozas,
    fo: s.fo,
    statusz: s.statusz,
    forras: s.forras,
    vegosszeg: s.vegosszeg,
    szallasdij: s.szallasdij,
    extrak_dij: s.extrak_dij,
    megjegyzes: s.megjegyzes,
    letrehozva: s.letrehozva,
    haz_nev: s.hazak?.nev ?? '—',
    haz_slug: s.hazak?.slug ?? '',
    vendeg_nev: s.vendegek?.nev ?? null,
    vendeg_email: s.vendegek?.email ?? null,
    vendeg_telefon: s.vendegek?.telefon ?? null,
    vendeg_nyelv: s.vendegek?.nyelv ?? null,
    szla_nev: s.vendegek?.szla_nev ?? null,
    szla_cim: s.vendegek?.szla_cim ?? null,
    szla_irsz: s.vendegek?.szla_irsz ?? null,
    szla_varos: s.vendegek?.szla_varos ?? null,
    szla_orszag: s.vendegek?.szla_orszag ?? null,
    szla_adoszam: s.vendegek?.szla_adoszam ?? null,
  };
}

export type Szuro = 'kozelgo' | 'fuggoben' | 'mind' | 'lemondva';

export async function foglalasok(
  szuro: Szuro = 'kozelgo',
  kereses = ''
): Promise<FoglalasSor[]> {
  const db = supabaseAdmin();
  const ma = new Date().toISOString().slice(0, 10);

  let q = db.from('foglalasok').select(MEZOK);

  if (szuro === 'kozelgo') {
    q = q.gte('tavozas', ma).in('statusz', ['fuggoben', 'elolegezve', 'kifizetve']);
  } else if (szuro === 'fuggoben') {
    q = q.eq('statusz', 'fuggoben');
  } else if (szuro === 'lemondva') {
    q = q.in('statusz', ['lemondva', 'nem_jelent_meg']);
  }

  const { data, error } = await q.order('erkezes', { ascending: szuro !== 'mind' });
  if (error) throw new Error(error.message);

  let sorok = ((data ?? []) as unknown as NyersSor[]).map(lapit);

  // A keresést itt szűrjük, mert a kapcsolt táblák mezőire a Supabase
  // szűrője nem tud egyszerűen illeszteni. Két faháznál a foglalások
  // száma ezt bőven elbírja.
  const k = kereses.trim().toLowerCase();
  if (k) {
    sorok = sorok.filter(
      (s) =>
        s.azonosito.toLowerCase().includes(k) ||
        (s.vendeg_nev ?? '').toLowerCase().includes(k) ||
        (s.vendeg_email ?? '').toLowerCase().includes(k) ||
        (s.vendeg_telefon ?? '').toLowerCase().includes(k)
    );
  }
  return sorok;
}

export async function egyFoglalas(azonosito: string): Promise<FoglalasSor | null> {
  const db = supabaseAdmin();
  const { data, error } = await db
    .from('foglalasok')
    .select(MEZOK)
    .eq('azonosito', azonosito)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? lapit(data as unknown as NyersSor) : null;
}

export type Tetel = { nev: string; mennyiseg: number; egysegar: number };

export async function foglalasTetelei(foglalasId: string): Promise<Tetel[]> {
  const db = supabaseAdmin();
  const { data } = await db
    .from('foglalas_extrak')
    .select('mennyiseg, egysegar, extrak(slug, extrak_forditas(nyelv, nev))')
    .eq('foglalas_id', foglalasId);

  type Sor = {
    mennyiseg: number;
    egysegar: number;
    extrak: {
      slug: string;
      extrak_forditas: { nyelv: string; nev: string }[] | null;
    } | null;
  };

  return ((data ?? []) as unknown as Sor[]).map((t) => ({
    nev:
      t.extrak?.extrak_forditas?.find((f) => f.nyelv === 'hu')?.nev ??
      t.extrak?.slug ??
      '—',
    mennyiseg: t.mennyiseg,
    egysegar: t.egysegar,
  }));
}

export type FizetesSor = {
  osszeg: number; statusz: string; szolgaltato: string | null;
  kulso_tranzakcio_id: string | null; letrehozva: string;
};

export async function fizetesek(foglalasId: string): Promise<FizetesSor[]> {
  const db = supabaseAdmin();
  const { data } = await db
    .from('fizetesek')
    .select('osszeg, statusz, szolgaltato, kulso_tranzakcio_id, letrehozva')
    .eq('foglalas_id', foglalasId)
    .order('letrehozva', { ascending: false });
  return (data ?? []) as FizetesSor[];
}

export type EmailSor = {
  tipus: string; cimzett: string; nyelv: string;
  sikeres: boolean; hiba: string | null; kuldve: string;
};

export async function emailek(foglalasId: string): Promise<EmailSor[]> {
  const db = supabaseAdmin();
  const { data } = await db
    .from('email_naplo')
    .select('tipus, cimzett, nyelv, sikeres, hiba, kuldve')
    .eq('foglalas_id', foglalasId)
    .order('kuldve', { ascending: false });
  return (data ?? []) as EmailSor[];
}

/** Áttekintő számok a lista tetejére. */
export async function attekintes() {
  const db = supabaseAdmin();
  const ma = new Date().toISOString().slice(0, 10);
  const evKezdet = `${new Date().getFullYear()}-01-01`;

  const [kozelgo, fuggo, erkezikMa, evi] = await Promise.all([
    db.from('foglalasok').select('id', { count: 'exact', head: true })
      .gte('erkezes', ma).in('statusz', ['fuggoben', 'elolegezve', 'kifizetve']),
    db.from('foglalasok').select('id', { count: 'exact', head: true })
      .eq('statusz', 'fuggoben'),
    db.from('foglalasok').select('id', { count: 'exact', head: true })
      .eq('erkezes', ma).in('statusz', ['elolegezve', 'kifizetve']),
    db.from('foglalasok').select('vegosszeg')
      .gte('erkezes', evKezdet).eq('statusz', 'kifizetve'),
  ]);

  const bevetel = ((evi.data ?? []) as { vegosszeg: number }[])
    .reduce((ossz, s) => ossz + s.vegosszeg, 0);

  return {
    kozelgo: kozelgo.count ?? 0,
    fuggoben: fuggo.count ?? 0,
    erkezikMa: erkezikMa.count ?? 0,
    eviBevetel: bevetel,
  };
}

/** Naptárhoz: foglalások és lezárt időszakok egy hónapra. */
export async function naptarAdat(ev: number, honap: number) {
  const db = supabaseAdmin();
  const elso = new Date(Date.UTC(ev, honap - 1, 1)).toISOString().slice(0, 10);
  const utolso = new Date(Date.UTC(ev, honap, 0)).toISOString().slice(0, 10);

  const [{ data: hazak }, { data: fogl }, { data: blokk }] = await Promise.all([
    db.from('hazak').select('slug, nev').eq('aktiv', true).order('nev'),
    db.from('foglalasok')
      .select('azonosito, erkezes, tavozas, statusz, hazak(slug), vendegek(nev)')
      .lte('erkezes', utolso).gte('tavozas', elso)
      .in('statusz', ['fuggoben', 'elolegezve', 'kifizetve']),
    db.from('blokkolt_idoszakok')
      .select('id, kezdet, veg, indok, hazak(slug)')
      .lte('kezdet', utolso).gte('veg', elso),
  ]);

  return {
    hazak: (hazak ?? []) as { slug: string; nev: string }[],
    foglalasok: (fogl ?? []) as unknown as {
      azonosito: string; erkezes: string; tavozas: string; statusz: string;
      hazak: { slug: string } | null; vendegek: { nev: string } | null;
    }[],
    blokkok: (blokk ?? []) as unknown as {
      id: string; kezdet: string; veg: string; indok: string | null;
      hazak: { slug: string } | null;
    }[],
  };
}

export type Feliratkozo = {
  email: string; nev: string | null; nyelv: string;
  hozzajarulas_ideje: string; leiratkozott: boolean;
};

/** Hírlevél-feliratkozók. A leiratkozottak is látszanak, jelölve. */
export async function feliratkozok(): Promise<Feliratkozo[]> {
  const db = supabaseAdmin();
  const { data, error } = await db
    .from('hirlevel_feliratkozok')
    .select('email, nev, nyelv, hozzajarulas_ideje, leiratkozott')
    .order('hozzajarulas_ideje', { ascending: false });
  // Ha a 002-es migráció még nem futott le, a tábla hiányzik —
  // ilyenkor üres lista, nem hiba.
  if (error) return [];
  return (data ?? []) as Feliratkozo[];
}
