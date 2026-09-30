import { supabaseAdmin } from './supabase';
import type { Nyelv } from './tartalom';
import type { HazAdat, ExtraAdat } from '@/components/FoglaloUrlap';

/**
 * A főoldal adatai az adatbázisból.
 *
 * Ha az adatbázis épp nem érhető el, NEM dobunk hibát: az oldal
 * megjelenik, csak a foglalóűrlap marad üres. Egy átmeneti
 * adatbázis-hiba ne tegye elérhetetlenné a teljes bemutatkozó oldalt —
 * a látogató így is lát árat, leírást és elérhetőséget.
 */

export type OldalAdat = { hazak: HazAdat[]; extrak: ExtraAdat[] };

const TARTALEK: OldalAdat = {
  hazak: [
    { slug: 'fuge', nev: 'Füge', max_fo: 4, alap_ar: 42000, min_ejszaka: 2 },
    { slug: 'mandula', nev: 'Mandula', max_fo: 6, alap_ar: 48000, min_ejszaka: 2 },
  ],
  extrak: [],
};

export async function oldalAdat(nyelv: Nyelv): Promise<OldalAdat> {
  try {
    const db = supabaseAdmin();

    const [{ data: hazak }, { data: extrak }] = await Promise.all([
      db
        .from('hazak')
        .select('slug, nev, max_fo, alap_ar, min_ejszaka')
        .eq('aktiv', true)
        .order('alap_ar', { ascending: true }),
      db
        .from('extrak')
        .select('slug, ar, ejszakankent, extrak_forditas(nyelv, nev, leiras)')
        .eq('aktiv', true)
        .order('ar', { ascending: true }),
    ]);

    if (!hazak?.length) return TARTALEK;

    /**
     * A Supabase a kapcsolt fordítótáblát beágyazva adja vissza, és a
     * típusa túl tág ahhoz, hogy magától felismerje. Ezért itt írjuk le,
     * mit várunk — így a fordító és a szerkesztő is tudja.
     */
    type ExtraSor = {
      slug: string;
      ar: number;
      ejszakankent: boolean;
      extrak_forditas: { nyelv: string; nev: string; leiras: string | null }[] | null;
    };

    const extrakAdat: ExtraAdat[] = ((extrak ?? []) as unknown as ExtraSor[]).map(
      (e: ExtraSor): ExtraAdat => {
        const forditasok = e.extrak_forditas;
        // Ha a kért nyelv hiányzik, inkább az első fordítás, mint semmi.
        const sajat = forditasok?.find((f) => f.nyelv === nyelv);
        const tartalek = forditasok?.[0];
        const nev = sajat?.nev ?? tartalek?.nev ?? e.slug;
        const leiras = sajat?.leiras ?? tartalek?.leiras ?? null;
        return { slug: e.slug, nev, leiras, ar: e.ar, ejszakankent: e.ejszakankent };
      }
    );

    return { hazak: hazak as HazAdat[], extrak: extrakAdat };
  } catch (e) {
    console.error('[oldalAdat] az adatbázis nem érhető el:', e);
    return TARTALEK;
  }
}
