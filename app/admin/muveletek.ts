'use server';

import { revalidatePath } from 'next/cache';
import { supabaseAdmin } from '@/lib/supabase';
import { lemondasEmail, visszaigazoloEmail, adminErtesito } from '@/lib/email';

/**
 * Admin műveletek.
 *
 * Ezek kiszolgálói műveletek ("server action"): a böngésző csak elindítja
 * őket, a kód a szerveren fut. Az /admin útvonalakat a middleware védi,
 * így ide csak bejelentkezett kérés juthat el.
 *
 * Minden módosítás után frissítjük a listát, hogy ne maradjon régi adat
 * a képernyőn.
 */

const ENGEDETT_STATUSZ = [
  'fuggoben', 'elolegezve', 'kifizetve', 'lemondva', 'nem_jelent_meg',
] as const;

export async function statuszValt(azonosito: string, ujStatusz: string) {
  if (!ENGEDETT_STATUSZ.includes(ujStatusz as (typeof ENGEDETT_STATUSZ)[number])) {
    throw new Error('Ismeretlen státusz.');
  }
  const db = supabaseAdmin();

  // A korábbi státuszt elmentjük, hogy csak VÁLTOZÁSKOR küldjünk levelet —
  // ha valaki kétszer kattint a „Lemondva" gombra, ne menjen ki két levél.
  const { data: elozo } = await db
    .from('foglalasok')
    .select('id, statusz')
    .eq('azonosito', azonosito)
    .maybeSingle();

  const regiStatusz = (elozo as { statusz: string } | null)?.statusz;
  const foglalasId = (elozo as { id: string } | null)?.id;

  const { error } = await db
    .from('foglalasok')
    .update({ statusz: ujStatusz, modositva: new Date().toISOString() })
    .eq('azonosito', azonosito);

  if (error) throw new Error(`A státusz módosítása nem sikerült: ${error.message}`);

  // Értesítők. Ezek hibája nem vonhatja vissza a státuszváltást,
  // ezért külön try-ban futnak.
  if (foglalasId && regiStatusz !== ujStatusz) {
    if (ujStatusz === 'lemondva') {
      try { await lemondasEmail(foglalasId); }
      catch (e) { console.error('[admin] lemondási e-mail:', e); }
      try { await adminErtesito(foglalasId, 'lemondva'); }
      catch (e) { console.error('[admin] admin értesítő:', e); }
    }
    if (ujStatusz === 'kifizetve') {
      // Utalásos foglalásnál itt lesz kifizetve a foglalás — a vendég
      // ilyenkor kapja meg a rendes visszaigazolást.
      try { await visszaigazoloEmail(foglalasId); }
      catch (e) { console.error('[admin] visszaigazoló e-mail:', e); }
    }
  }

  revalidatePath('/admin');
  revalidatePath(`/admin/foglalas/${azonosito}`);
  revalidatePath('/admin/naptar');
}

export async function megjegyzestMent(azonosito: string, szoveg: string) {
  const db = supabaseAdmin();
  const { error } = await db
    .from('foglalasok')
    .update({ megjegyzes: szoveg.slice(0, 2000), modositva: new Date().toISOString() })
    .eq('azonosito', azonosito);

  if (error) throw new Error(`A megjegyzés mentése nem sikerült: ${error.message}`);
  revalidatePath(`/admin/foglalas/${azonosito}`);
}

/** Időszak lezárása (karbantartás, saját használat). */
export async function idoszakotZar(
  hazSlug: string, kezdet: string, veg: string, indok: string
) {
  if (!hazSlug || !kezdet || !veg) throw new Error('Hiányzó adat.');
  if (veg <= kezdet) throw new Error('A záró dátum legyen későbbi a kezdőnél.');

  const db = supabaseAdmin();
  const { data: haz } = await db
    .from('hazak').select('id').eq('slug', hazSlug).maybeSingle();
  if (!haz) throw new Error('Ismeretlen faház.');

  const { error } = await db.from('blokkolt_idoszakok').insert({
    haz_id: (haz as { id: string }).id,
    kezdet, veg,
    indok: indok.slice(0, 200) || null,
    forras: 'kezi',
  });

  if (error) throw new Error(`A zárás nem sikerült: ${error.message}`);
  revalidatePath('/admin/naptar');
}

export async function zaratTorol(id: string) {
  const db = supabaseAdmin();
  const { error } = await db.from('blokkolt_idoszakok').delete().eq('id', id);
  if (error) throw new Error(`A törlés nem sikerült: ${error.message}`);
  revalidatePath('/admin/naptar');
}
