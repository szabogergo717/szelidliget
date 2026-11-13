import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ervenyesAkcio, arajanlat } from '../lib/pricing.ts';

/**
 * Nyitó ajándékutalvány: 3 éjszaka a 2 éjszaka áráért, 98 000 Ft.
 *
 * A lényeg, amit ezek a tesztek őriznek:
 *  - pontosan 3 éjszakánál jár, se kevesebbnél, se többnél;
 *  - csak az érvényességi időszakban;
 *  - lejárat után magától visszaáll a rendes ár;
 *  - soha nem drágít.
 */

const FUGE = {
  id: 'h1', slug: 'fuge', nev: 'Füge',
  max_fo: 2, alap_ar: 49000, min_ejszaka: 2, hetvegi_felar: 0,
};

const UTALVANY = {
  slug: 'nyito_utalvany',
  ejszakak: 3,
  teljes_ar: 98000,
  ervenyes_tol: '2026-11-01',
  ervenyes_ig: '2027-11-30',
  aktiv: true,
  nev: 'Nyitó ajándékutalvány',
};

function ajanlat(erkezes, tavozas, haz = FUGE, akciok = [UTALVANY]) {
  return arajanlat({
    haz, erkezes, tavozas, arazasok: [], extrak: [], valasztott_extrak: [], akciok,
  });
}

test('három éjszaka a két éjszaka áráért', () => {
  const a = ajanlat('2026-12-01', '2026-12-04');
  assert.equal(a.ejszakak, 3);
  assert.equal(a.szallasdij, 98000);
  assert.equal(a.vegosszeg, 98000);
  assert.equal(a.akcio?.slug, 'nyito_utalvany');
  // Az eredeti ár 3 × 49 000 = 147 000 lett volna.
  assert.equal(a.akcio?.megtakaritas, 49000);
});

test('két éjszakára nem jár', () => {
  const a = ajanlat('2026-12-01', '2026-12-03');
  assert.equal(a.ejszakak, 2);
  assert.equal(a.szallasdij, 98000); // 2 × 49 000, de nem az akciótól
  assert.equal(a.akcio, null);
});

test('négy éjszakára nem jár', () => {
  const a = ajanlat('2026-12-01', '2026-12-05');
  assert.equal(a.ejszakak, 4);
  assert.equal(a.szallasdij, 4 * 49000);
  assert.equal(a.akcio, null);
});

test('az érvényesség előtt nem jár', () => {
  const a = ajanlat('2026-10-20', '2026-10-23');
  assert.equal(a.akcio, null);
  assert.equal(a.szallasdij, 3 * 49000);
});

test('az utolsó érvényes napon még jár', () => {
  const a = ajanlat('2027-11-30', '2027-12-03');
  assert.equal(a.akcio?.slug, 'nyito_utalvany');
  assert.equal(a.szallasdij, 98000);
});

test('a lejárat után magától visszaáll a rendes ár', () => {
  const a = ajanlat('2027-12-01', '2027-12-04');
  assert.equal(a.akcio, null);
  assert.equal(a.szallasdij, 3 * 49000);
});

test('kikapcsolt akció nem érvényesül', () => {
  const a = ajanlat('2026-12-01', '2026-12-04', FUGE, [{ ...UTALVANY, aktiv: false }]);
  assert.equal(a.akcio, null);
  assert.equal(a.szallasdij, 3 * 49000);
});

test('az akció a hétvégi felárat is kiváltja', () => {
  const felaras = { ...FUGE, hetvegi_felar: 12000 };
  // 2026-12-04 péntek, 12-05 szombat — két feláras éjszaka.
  const a = ajanlat('2026-12-04', '2026-12-07', felaras);
  assert.equal(a.ejszakak, 3);
  assert.equal(a.szallasdij, 98000);
  assert.equal(a.hetvegi_felar, 0);
  // Felár nélkül 147 000, felárral 171 000 lett volna.
  assert.equal(a.akcio?.megtakaritas, 3 * 49000 + 2 * 12000 - 98000);
});

test('az extrák ára az akció mellett is hozzáadódik', () => {
  const a = arajanlat({
    haz: FUGE,
    erkezes: '2026-12-01',
    tavozas: '2026-12-04',
    arazasok: [],
    extrak: [{ id: 'e1', slug: 'reggeli', ar: 19900, ejszakankent: false }],
    valasztott_extrak: [{ extra_id: 'e1', mennyiseg: 1 }],
    akciok: [UTALVANY],
  });
  assert.equal(a.szallasdij, 98000);
  assert.equal(a.extrak_dij, 19900);
  assert.equal(a.vegosszeg, 117900);
});

test('az akció soha nem drágít', () => {
  // Rosszul beírt akció: drágább, mint a rendes ár.
  const dragabb = { ...UTALVANY, teljes_ar: 200000 };
  const a = ajanlat('2026-12-01', '2026-12-04', FUGE, [dragabb]);
  assert.equal(a.akcio, null);
  assert.equal(a.szallasdij, 3 * 49000);
});

test('csak a megjelölt házra érvényes, ha van házlista', () => {
  const csakMandula = { ...UTALVANY, haz_slugok: ['mandula'] };
  const a = ajanlat('2026-12-01', '2026-12-04', FUGE, [csakMandula]);
  assert.equal(a.akcio, null);

  const mandula = { ...FUGE, slug: 'mandula', nev: 'Mandula' };
  const b = ajanlat('2026-12-01', '2026-12-04', mandula, [csakMandula]);
  assert.equal(b.akcio?.slug, 'nyito_utalvany');
});

test('üres házlista esetén minden házra érvényes', () => {
  const mind = { ...UTALVANY, haz_slugok: [] };
  const a = ajanlat('2026-12-01', '2026-12-04', FUGE, [mind]);
  assert.equal(a.akcio?.slug, 'nyito_utalvany');
});

test('több illeszkedő akcióból a kedvezőbb nyer', () => {
  const gyengebb = { ...UTALVANY, slug: 'gyengebb', teljes_ar: 120000 };
  const a = ajanlat('2026-12-01', '2026-12-04', FUGE, [gyengebb, UTALVANY]);
  assert.equal(a.akcio?.slug, 'nyito_utalvany');
  assert.equal(a.szallasdij, 98000);
});

test('akció nélkül minden a régiben marad', () => {
  const a = ajanlat('2026-12-01', '2026-12-04', FUGE, []);
  assert.equal(a.akcio, null);
  assert.equal(a.szallasdij, 3 * 49000);
});

test('a kiválasztó függvény önmagában is helyes', () => {
  const kozos = { akciok: [UTALVANY], hazSlug: 'fuge', szallasdij: 147000 };
  assert.equal(
    ervenyesAkcio({ ...kozos, erkezes: '2026-12-01', ejszakak: 3 })?.slug,
    'nyito_utalvany'
  );
  assert.equal(ervenyesAkcio({ ...kozos, erkezes: '2026-12-01', ejszakak: 2 }), null);
  assert.equal(ervenyesAkcio({ ...kozos, erkezes: '2028-01-01', ejszakak: 3 }), null);
});

test('az összeg egész forint marad', () => {
  const a = ajanlat('2026-12-01', '2026-12-04');
  assert.equal(Number.isInteger(a.szallasdij), true);
  assert.equal(Number.isInteger(a.vegosszeg), true);
  assert.equal(Number.isInteger(a.akcio?.megtakaritas ?? 0), true);
});
