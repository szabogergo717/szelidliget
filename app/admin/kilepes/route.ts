import { NextRequest, NextResponse } from 'next/server';
import { SUTI_NEV, SUTI_BEALLITAS } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

/** Kilépés: töröljük a munkamenet-sütit, és vissza a belépőoldalra. */
export async function GET(req: NextRequest) {
  const valasz = NextResponse.redirect(new URL('/admin/belepes', req.url));
  valasz.cookies.set(SUTI_NEV, '', { ...SUTI_BEALLITAS, maxAge: 0 });
  return valasz;
}
