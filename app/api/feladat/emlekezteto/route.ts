import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { emlekeztetoEmail } from '@/lib/email';

/**
 * Érkezés előtti emlékeztető — naponta egyszer fut.
 *
 * Kinek megy ki: akinek 3 nap múlva kezdődik a foglalása, ki van fizetve,
 * és még nem kapott emlékeztetőt.
 *
 * Miért kell az `emlekezteto_kuldve` mező? Mert a napi feladat elakadhat
 * félúton, és újraindulhat. Enélkül ugyanaz a vendég két levelet kapna.
 *
 * VÉDELEM: csak a Vercel ütemezője hívhatja. A Vercel egy titkos fejlécet
 * küld (CRON_SECRET); enélkül a végpont elutasít. Így nem tudja bárki
 * kiküldetni a leveleket.
 */

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const NAPOK_ELORE = 3;

export async function GET(req: NextRequest) {
  const titok = process.env.CRON_SECRET;
  if (!titok) {
    return NextResponse.json(
      { hiba: 'A CRON_SECRET nincs beállítva a szerveren.' },
      { status: 500 }
    );
  }

  const fejlec = req.headers.get('authorization');
  if (fejlec !== `Bearer ${titok}`) {
    return NextResponse.json({ hiba: 'Nincs jogosultság.' }, { status: 401 });
  }

  const cel = new Date();
  cel.setDate(cel.getDate() + NAPOK_ELORE);
  const celNap = cel.toISOString().slice(0, 10);

  const db = supabaseAdmin();
  const { data, error } = await db
    .from('foglalasok')
    .select('id, azonosito')
    .eq('erkezes', celNap)
    .in('statusz', ['elolegezve', 'kifizetve'])
    .is('emlekezteto_kuldve', null);

  if (error) {
    console.error('[emlekezteto] lekérdezés:', error);
    return NextResponse.json({ hiba: error.message }, { status: 500 });
  }

  const sorok = (data ?? []) as { id: string; azonosito: string }[];
  const eredmeny: { azonosito: string; rendben: boolean; hiba?: string }[] = [];

  // Sorban, nem párhuzamosan: néhány levélről van szó naponta, és így
  // nem terheljük egyszerre a levélküldőt.
  for (const f of sorok) {
    try {
      await emlekeztetoEmail(f.id);
      eredmeny.push({ azonosito: f.azonosito, rendben: true });
    } catch (e) {
      console.error('[emlekezteto]', f.azonosito, e);
      eredmeny.push({ azonosito: f.azonosito, rendben: false, hiba: String(e) });
    }
  }

  return NextResponse.json({
    nap: celNap,
    talalat: sorok.length,
    kikuldve: eredmeny.filter((e) => e.rendben).length,
    eredmeny,
  });
}
