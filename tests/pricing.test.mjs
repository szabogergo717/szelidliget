import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  ejszakakSzama,
  tartozkodasNapjai,
  naptAr,
  arajanlat,
  foglalasHibai,
  foglalasAzonosito,
} from '../lib/pricing.ts';

const FUGE = {
  id: 'h1',
  slug: 'fuge',
  nev: 'Füge',
  max_fo: 4,
  alap_ar: 42000,
  min_ejszaka: 2,
};

const EXTRAK = [
  { id: 'e1', slug: 'reggeli', ar: 9000, ejszakankent: true },
  { id: 'e2', slug: 'tuzifa', ar: 6000, ejszakankent: false },
];

test('éjszakák száma', () => {
  assert.equal(ejszakakSzama('2026-10-01', '2026-10-03'), 2);
  assert.equal(ejszakakSzama('2026-10-01', '2026-10-02'), 1);
  assert.equal(ejszakakSzama('2026-10-01', '2026-10-01'), 0);
});

test('nyári időszámítás átállása nem tol el egy napot', () => {
  // Magyarországon 2026. október 25-én van az óraátállítás.
  assert.equal(ejszakakSzama('2026-10-24', '2026-10-27'), 3);
  // És tavasszal, márciusban is:
  assert.equal(ejszakakSzama('2026-03-28', '2026-03-31'), 3);
});

test('a távozás napja nem számít bele a tartózkodásba', () => {
  const napok = tartozkodasNapjai('2026-10-01', '2026-10-04');
  assert.deepEqual(napok, ['2026-10-01', '2026-10-02', '2026-10-03']);
});

test('ha nincs árszabály, az alapár érvényes', () => {
  const r = naptAr('2026-10-01', FUGE, []);
  assert.equal(r.ar, 42000);
  assert.equal(r.min_ejszaka, 2);
});

test('nagyobb prioritású árszabály felülírja a kisebbet', () => {
  const arazasok = [
    { kezdet: '2026-12-01', veg: '2026-12-31', ar: 55000, min_ejszaka: null, prioritas: 1, megnevezes: 'Főszezon' },
    { kezdet: '2026-12-29', veg: '2027-01-02', ar: 89000, min_ejszaka: 4, prioritas: 10, megnevezes: 'Szilveszter' },
  ];
  assert.equal(naptAr('2026-12-15', FUGE, arazasok).ar, 55000);
  assert.equal(naptAr('2026-12-30', FUGE, arazasok).ar, 89000);
  assert.equal(naptAr('2026-12-30', FUGE, arazasok).min_ejszaka, 4);
});

test('vegyes árazású tartózkodás naponta számol', () => {
  const arazasok = [
    { kezdet: '2026-12-29', veg: '2027-01-02', ar: 89000, min_ejszaka: 4, prioritas: 10 },
  ];
  // dec 28 (alapár) + dec 29, 30 (szilveszteri)
  const a = arajanlat({
    haz: FUGE,
    erkezes: '2026-12-28',
    tavozas: '2026-12-31',
    arazasok,
    extrak: [],
    valasztott_extrak: [],
  });
  assert.equal(a.ejszakak, 3);
  assert.equal(a.szallasdij, 42000 + 89000 + 89000);
  // A legszigorúbb minimum érvényesül a tartózkodás alatt
  assert.equal(a.min_ejszaka, 4);
});

test('éjszakánkénti és alkalmankénti extra eltérően számol', () => {
  const a = arajanlat({
    haz: FUGE,
    erkezes: '2026-10-01',
    tavozas: '2026-10-04', // 3 éjszaka
    arazasok: [],
    extrak: EXTRAK,
    valasztott_extrak: [
      { extra_id: 'e1', mennyiseg: 1 }, // reggeli: 9000 × 3 éj
      { extra_id: 'e2', mennyiseg: 1 }, // tűzifa: 6000 egyszer
    ],
  });
  assert.equal(a.extrak_dij, 9000 * 3 + 6000);
  assert.equal(a.vegosszeg, 42000 * 3 + 27000 + 6000);
});

test('ismeretlen extrát csendben eldob, nem hibázik', () => {
  const a = arajanlat({
    haz: FUGE,
    erkezes: '2026-10-01',
    tavozas: '2026-10-03',
    arazasok: [],
    extrak: EXTRAK,
    valasztott_extrak: [{ extra_id: 'nincs-ilyen', mennyiseg: 1 }],
  });
  assert.equal(a.extrak_dij, 0);
});

test('minden összeg egész szám marad', () => {
  const a = arajanlat({
    haz: FUGE,
    erkezes: '2026-10-01',
    tavozas: '2026-10-08',
    arazasok: [],
    extrak: EXTRAK,
    valasztott_extrak: [{ extra_id: 'e1', mennyiseg: 2 }],
  });
  assert.ok(Number.isInteger(a.vegosszeg), 'a végösszeg nem egész');
  assert.ok(Number.isInteger(a.szallasdij), 'a szállásdíj nem egész');
});

test('túl rövid foglalást elutasít', () => {
  const a = arajanlat({
    haz: FUGE, erkezes: '2026-10-01', tavozas: '2026-10-02',
    arazasok: [], extrak: [], valasztott_extrak: [],
  });
  const hibak = foglalasHibai({
    haz: FUGE, erkezes: '2026-10-01', tavozas: '2026-10-02',
    fo: 2, ajanlat: a, ma: '2026-09-26',
  });
  assert.ok(hibak.some((h) => h.includes('minimum foglalás')));
});

test('túl sok vendéget elutasít', () => {
  const a = arajanlat({
    haz: FUGE, erkezes: '2026-10-01', tavozas: '2026-10-03',
    arazasok: [], extrak: [], valasztott_extrak: [],
  });
  const hibak = foglalasHibai({
    haz: FUGE, erkezes: '2026-10-01', tavozas: '2026-10-03',
    fo: 9, ajanlat: a, ma: '2026-09-26',
  });
  assert.ok(hibak.some((h) => h.includes('legfeljebb 4')));
});

test('múltbeli dátumot elutasít', () => {
  const a = arajanlat({
    haz: FUGE, erkezes: '2026-01-01', tavozas: '2026-01-03',
    arazasok: [], extrak: [], valasztott_extrak: [],
  });
  const hibak = foglalasHibai({
    haz: FUGE, erkezes: '2026-01-01', tavozas: '2026-01-03',
    fo: 2, ajanlat: a, ma: '2026-09-26',
  });
  assert.ok(hibak.some((h) => h.includes('múltban')));
});

test('fordított dátumot elutasít', () => {
  const a = arajanlat({
    haz: FUGE, erkezes: '2026-10-05', tavozas: '2026-10-01',
    arazasok: [], extrak: [], valasztott_extrak: [],
  });
  const hibak = foglalasHibai({
    haz: FUGE, erkezes: '2026-10-05', tavozas: '2026-10-01',
    fo: 2, ajanlat: a, ma: '2026-09-26',
  });
  assert.ok(hibak.some((h) => h.includes('későbbi')));
});

test('érvényes foglalásnál nincs hiba', () => {
  const a = arajanlat({
    haz: FUGE, erkezes: '2026-10-01', tavozas: '2026-10-04',
    arazasok: [], extrak: [], valasztott_extrak: [],
  });
  const hibak = foglalasHibai({
    haz: FUGE, erkezes: '2026-10-01', tavozas: '2026-10-04',
    fo: 4, ajanlat: a, ma: '2026-09-26',
  });
  assert.deepEqual(hibak, []);
});

test('foglalási azonosító formátuma', () => {
  assert.equal(foglalasAzonosito(147, 2026), 'SZL-2026-0147');
  assert.equal(foglalasAzonosito(1, 2026), 'SZL-2026-0001');
});
