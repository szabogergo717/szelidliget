import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hetvegiEjszaka, naptAr, arajanlat } from '../lib/pricing.ts';

/**
 * Hétvégi felár.
 *
 * Egy éjszaka a KEZDŐ napjához tartozik. A felár tehát a péntek és a
 * szombat éjszakára jár — vagyis a péntekről szombatra és a szombatról
 * vasárnapra virradó éjszakára.
 *
 * Tájékozódási pontok: 2026-10-09 péntek, 10 szombat, 11 vasárnap,
 * 12 hétfő, 16 péntek, 17 szombat.
 */

const FUGE = {
  id: 'h1',
  slug: 'fuge',
  nev: 'Füge',
  max_fo: 2,
  alap_ar: 49000,
  min_ejszaka: 2,
  hetvegi_felar: 12000,
};

const FELAR_NELKUL = { ...FUGE, hetvegi_felar: 0 };

test('péntek és szombat éjszaka hétvégi', () => {
  assert.equal(hetvegiEjszaka('2026-10-09'), true); // péntek
  assert.equal(hetvegiEjszaka('2026-10-10'), true); // szombat
});

test('vasárnaptól csütörtökig nem hétvégi', () => {
  assert.equal(hetvegiEjszaka('2026-10-11'), false); // vasárnap
  assert.equal(hetvegiEjszaka('2026-10-12'), false); // hétfő
  assert.equal(hetvegiEjszaka('2026-10-13'), false);
  assert.equal(hetvegiEjszaka('2026-10-14'), false);
  assert.equal(hetvegiEjszaka('2026-10-15'), false);
});

test('péntek éjszaka ára tartalmazza a felárat', () => {
  const r = naptAr('2026-10-09', FUGE, []);
  assert.equal(r.alapar, 49000);
  assert.equal(r.felar, 12000);
  assert.equal(r.ar, 61000);
  assert.equal(r.hetvege, true);
});

test('hétköznapi éjszakán nincs felár', () => {
  const r = naptAr('2026-10-13', FUGE, []);
  assert.equal(r.felar, 0);
  assert.equal(r.ar, 49000);
  assert.equal(r.hetvege, false);
});

test('nulla felárral a hétvége is alapáras', () => {
  const r = naptAr('2026-10-09', FELAR_NELKUL, []);
  assert.equal(r.felar, 0);
  assert.equal(r.ar, 49000);
});

function ajanlat(haz, erkezes, tavozas, arazasok = []) {
  return arajanlat({
    haz, erkezes, tavozas, arazasok, extrak: [], valasztott_extrak: [],
  });
}

test('péntek–vasárnap: két hétvégi éjszaka', () => {
  // 9-én érkezik, 11-én távozik: a 9-i (péntek) és a 10-i (szombat) éjszaka.
  const a = ajanlat(FUGE, '2026-10-09', '2026-10-11');
  assert.equal(a.ejszakak, 2);
  assert.equal(a.hetvegi_felar, 24000);
  assert.equal(a.szallasdij, 2 * 49000 + 24000);
  assert.equal(a.vegosszeg, 122000);
});

test('szombat–vasárnap: egy hétvégi éjszaka', () => {
  const a = ajanlat(FUGE, '2026-10-10', '2026-10-11');
  assert.equal(a.ejszakak, 1);
  assert.equal(a.hetvegi_felar, 12000);
  assert.equal(a.szallasdij, 61000);
});

test('vasárnap–hétfő éjszakára nincs felár', () => {
  const a = ajanlat(FUGE, '2026-10-11', '2026-10-12');
  assert.equal(a.hetvegi_felar, 0);
  assert.equal(a.szallasdij, 49000);
});

test('hétköznapi foglalás teljesen felármentes', () => {
  // hétfőtől péntekig: 12, 13, 14, 15 — egyik sem péntek vagy szombat
  const a = ajanlat(FUGE, '2026-10-12', '2026-10-16');
  assert.equal(a.ejszakak, 4);
  assert.equal(a.hetvegi_felar, 0);
  assert.equal(a.szallasdij, 4 * 49000);
});

test('egy teljes hétre pontosan két felár jut', () => {
  const a = ajanlat(FUGE, '2026-10-12', '2026-10-19');
  assert.equal(a.ejszakak, 7);
  assert.equal(a.hetvegi_felar, 2 * 12000);
  assert.equal(a.szallasdij, 7 * 49000 + 24000);
});

test('a naponkénti bontás megjelöli a hétvégi éjszakákat', () => {
  const a = ajanlat(FUGE, '2026-10-08', '2026-10-11');
  assert.deepEqual(
    a.naponta.map((n) => [n.datum, n.hetvege, n.felar]),
    [
      ['2026-10-08', false, 0],     // csütörtök
      ['2026-10-09', true, 12000],  // péntek
      ['2026-10-10', true, 12000],  // szombat
    ]
  );
});

test('a szezonális ár fölé is rájön a felár', () => {
  const foszezon = [{
    kezdet: '2026-10-01', veg: '2026-10-31',
    ar: 59000, min_ejszaka: 3, prioritas: 1,
  }];
  const r = naptAr('2026-10-09', FUGE, foszezon);
  assert.equal(r.alapar, 59000);
  assert.equal(r.felar, 12000);
  assert.equal(r.ar, 71000);
});

test('az időszak saját felára felülírja a házét', () => {
  const unnep = [{
    kezdet: '2026-12-29', veg: '2027-01-02',
    ar: 89000, min_ejszaka: 4, prioritas: 10, hetvegi_felar: 0,
  }];
  // 2027-01-01 péntek, 01-02 szombat — felár nélkül, mert az ünnepi
  // ár már tartalmazza.
  assert.equal(naptAr('2027-01-01', FUGE, unnep).felar, 0);
  assert.equal(naptAr('2027-01-01', FUGE, unnep).ar, 89000);
});

test('az időszak magasabb felárat is kérhet', () => {
  const idoszak = [{
    kezdet: '2026-10-01', veg: '2026-10-31',
    ar: 49000, min_ejszaka: 2, prioritas: 1, hetvegi_felar: 20000,
  }];
  assert.equal(naptAr('2026-10-09', FUGE, idoszak).ar, 69000);
});

test('a null felár a ház beállítását hagyja érvényben', () => {
  const idoszak = [{
    kezdet: '2026-10-01', veg: '2026-10-31',
    ar: 49000, min_ejszaka: 2, prioritas: 1, hetvegi_felar: null,
  }];
  assert.equal(naptAr('2026-10-09', FUGE, idoszak).felar, 12000);
});

test('a felár egész forint marad', () => {
  const furcsa = { ...FUGE, hetvegi_felar: 12000.6 };
  const r = naptAr('2026-10-09', furcsa, []);
  assert.equal(Number.isInteger(r.ar), true);
  assert.equal(Number.isInteger(r.felar), true);
});

test('negatív felárat nem fogad el', () => {
  const rossz = { ...FUGE, hetvegi_felar: -5000 };
  assert.equal(naptAr('2026-10-09', rossz, []).felar, 0);
  assert.equal(naptAr('2026-10-09', rossz, []).ar, 49000);
});

test('óraátállítás hetén is jó napra esik a felár', () => {
  // Magyarországon 2026-10-25-én hajnalban állítanak órát.
  // 2026-10-23 péntek, 24 szombat, 25 vasárnap.
  assert.equal(hetvegiEjszaka('2026-10-23'), true);
  assert.equal(hetvegiEjszaka('2026-10-24'), true);
  assert.equal(hetvegiEjszaka('2026-10-25'), false);
  const a = ajanlat(FUGE, '2026-10-23', '2026-10-26');
  assert.equal(a.ejszakak, 3);
  assert.equal(a.hetvegi_felar, 24000);
});

test('a felár nem szól bele a minimum éjszakába', () => {
  const a = ajanlat(FUGE, '2026-10-09', '2026-10-11');
  assert.equal(a.min_ejszaka, 2);
});
