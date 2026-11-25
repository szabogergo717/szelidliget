import { test } from 'node:test';
import assert from 'node:assert/strict';
import { arajanlat, kuponHibaja } from '../lib/pricing.ts';

/**
 * Kuponkódok — ajándékutalvány és forintos kedvezmény.
 *
 * A lényeg, amit ezek a tesztek őriznek:
 *  - a csomagkupon pontosan a megadott éjszakaszámnál jár;
 *  - a HÉTVÉGI FELÁR a csomagáron FELÜL fizetendő (így szól az ajánlat);
 *  - lejárt kóddal nem lehet foglalni;
 *  - a kupon soha nem drágít, és soha nem visz nulla alá;
 *  - az extrák a kupon mellett is hozzáadódnak.
 */

const FUGE = {
  id: 'h1', slug: 'fuge', nev: 'Füge',
  max_fo: 2, alap_ar: 49000, min_ejszaka: 2, hetvegi_felar: 0,
};

const FUGE_FELAR = { ...FUGE, hetvegi_felar: 12000 };

const UTALVANY = {
  kod: 'SZL-7K4M-2PQX',
  ejszakak: 3,
  csomag_ar: 98000,
  kedvezmeny_ft: null,
  ervenyes_ig: '2027-12-20',
};

function ajanlat(erkezes, tavozas, haz = FUGE, kupon = UTALVANY) {
  return arajanlat({
    haz, erkezes, tavozas, arazasok: [], extrak: [], valasztott_extrak: [],
    akciok: [], kupon,
  });
}

test('az ajándékutalvány három éjszakát ad a kettő áráért', () => {
  // 2026-12-14 hétfő — három hétköznapi éjszaka.
  const a = ajanlat('2026-12-14', '2026-12-17');
  assert.equal(a.ejszakak, 3);
  assert.equal(a.szallasdij, 98000);
  assert.equal(a.vegosszeg, 98000);
  assert.equal(a.kupon?.kod, 'SZL-7K4M-2PQX');
  // Eredeti ár 3 × 49 000 = 147 000.
  assert.equal(a.kupon?.megtakaritas, 49000);
  assert.equal(a.kupon_hiba, null);
});

test('a hétvégi felár a csomagáron FELÜL fizetendő', () => {
  // 2026-12-18 péntek: péntek és szombat éjszaka feláras.
  const a = ajanlat('2026-12-18', '2026-12-21', FUGE_FELAR);
  assert.equal(a.ejszakak, 3);
  assert.equal(a.hetvegi_felar, 2 * 12000);
  assert.equal(a.szallasdij, 98000 + 2 * 12000);
  assert.equal(a.vegosszeg, 122000);
  // A megtakarítás csak az alapdíjra vonatkozik: 147 000 − 98 000.
  assert.equal(a.kupon?.megtakaritas, 49000);
});

test('két éjszakára nem váltható be', () => {
  const a = ajanlat('2026-12-14', '2026-12-16');
  assert.equal(a.kupon, null);
  assert.equal(a.kupon_hiba, 'ejszakak');
  assert.equal(a.szallasdij, 2 * 49000);
});

test('négy éjszakára sem', () => {
  const a = ajanlat('2026-12-14', '2026-12-18');
  assert.equal(a.kupon, null);
  assert.equal(a.kupon_hiba, 'ejszakak');
});

test('az utolsó érvényes napon még beváltható', () => {
  const a = ajanlat('2027-12-20', '2027-12-23');
  assert.equal(a.kupon?.kod, 'SZL-7K4M-2PQX');
  assert.equal(a.szallasdij, 98000);
});

test('a lejárat után nem váltható be', () => {
  const a = ajanlat('2027-12-21', '2027-12-24');
  assert.equal(a.kupon, null);
  assert.equal(a.kupon_hiba, 'lejart');
  assert.equal(a.szallasdij, 3 * 49000);
});

test('a kupon soha nem drágít', () => {
  // Olcsó ház: a csomagár többe kerülne, mint a rendes ár.
  const olcso = { ...FUGE, alap_ar: 20000 };
  const a = ajanlat('2026-12-14', '2026-12-17', olcso);
  assert.equal(a.kupon, null);
  assert.equal(a.kupon_hiba, 'nem_kedvezobb');
  assert.equal(a.szallasdij, 3 * 20000);
});

test('forintos kedvezmény levonódik', () => {
  const k = { kod: 'SZL-AAAA-BBBB', kedvezmeny_ft: 10000, ervenyes_ig: '2027-12-31' };
  const a = ajanlat('2026-12-14', '2026-12-16', FUGE, k);
  assert.equal(a.szallasdij, 2 * 49000 - 10000);
  assert.equal(a.kupon?.megtakaritas, 10000);
});

test('a forintos kedvezmény nem visz nulla alá', () => {
  const k = { kod: 'SZL-AAAA-BBBB', kedvezmeny_ft: 500000, ervenyes_ig: '2027-12-31' };
  const a = ajanlat('2026-12-14', '2026-12-16', FUGE, k);
  assert.equal(a.szallasdij, 0);
  assert.equal(a.vegosszeg, 0);
  assert.equal(a.kupon?.megtakaritas, 2 * 49000);
});

test('az extrák a kupon mellett is hozzáadódnak', () => {
  const a = arajanlat({
    haz: FUGE,
    erkezes: '2026-12-14',
    tavozas: '2026-12-17',
    arazasok: [],
    extrak: [{ id: 'e1', slug: 'szuletesnap', ar: 9900, ejszakankent: false }],
    valasztott_extrak: [{ extra_id: 'e1', mennyiseg: 1 }],
    akciok: [],
    kupon: UTALVANY,
  });
  assert.equal(a.szallasdij, 98000);
  assert.equal(a.extrak_dij, 9900);
  assert.equal(a.vegosszeg, 107900);
});

test('kupon nélkül minden a régiben marad', () => {
  const a = ajanlat('2026-12-14', '2026-12-17', FUGE, null);
  assert.equal(a.kupon, null);
  assert.equal(a.kupon_hiba, null);
  assert.equal(a.szallasdij, 3 * 49000);
});

test('az ellenőrző függvény önmagában is helyes', () => {
  const kozos = { kupon: UTALVANY, alapSzallasdij: 147000 };
  assert.equal(kuponHibaja({ ...kozos, erkezes: '2026-12-14', ejszakak: 3 }), null);
  assert.equal(kuponHibaja({ ...kozos, erkezes: '2026-12-14', ejszakak: 2 }), 'ejszakak');
  assert.equal(kuponHibaja({ ...kozos, erkezes: '2028-01-01', ejszakak: 3 }), 'lejart');
});

test('az összegek egész forintok maradnak', () => {
  const a = ajanlat('2026-12-18', '2026-12-21', FUGE_FELAR);
  assert.equal(Number.isInteger(a.szallasdij), true);
  assert.equal(Number.isInteger(a.vegosszeg), true);
  assert.equal(Number.isInteger(a.kupon?.megtakaritas ?? 0), true);
});
