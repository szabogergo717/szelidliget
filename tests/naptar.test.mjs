import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  napPlusz,
  napAllapot,
  erkezhet,
  tavozhat,
} from '../lib/naptarLogika.ts';

/**
 * Egy 2026-10-10 → 2026-10-13 foglalás a 10., 11. és 12. éjszakát
 * foglalja. A 13. (a távozás napja) már szabad.
 */
const FOGLALT = new Set(['2026-10-10', '2026-10-11', '2026-10-12']);
const MA = '2026-09-01';

test('napPlusz átlép hónaphatárt', () => {
  assert.equal(napPlusz('2026-10-31', 1), '2026-11-01');
  assert.equal(napPlusz('2026-11-01', -1), '2026-10-31');
});

test('napPlusz átlép évhatárt', () => {
  assert.equal(napPlusz('2026-12-31', 1), '2027-01-01');
});

test('napPlusz átlép szökőnapot', () => {
  assert.equal(napPlusz('2028-02-28', 1), '2028-02-29');
  assert.equal(napPlusz('2028-02-29', 1), '2028-03-01');
});

test('napPlusz óraátállítás körül sem csúszik el', () => {
  // Magyarországon 2026-10-25-én éjjel állítanak órát.
  assert.equal(napPlusz('2026-10-24', 1), '2026-10-25');
  assert.equal(napPlusz('2026-10-25', 1), '2026-10-26');
  // Tavasszal is:
  assert.equal(napPlusz('2027-03-27', 1), '2027-03-28');
  assert.equal(napPlusz('2027-03-28', 1), '2027-03-29');
});

test('múltbeli nap állapota: mult', () => {
  assert.equal(napAllapot('2026-08-31', MA, FOGLALT), 'mult');
});

test('érintetlen nap szabad', () => {
  assert.equal(napAllapot('2026-10-05', MA, FOGLALT), 'szabad');
});

test('a foglalás középső napja teljesen foglalt', () => {
  assert.equal(napAllapot('2026-10-11', MA, FOGLALT), 'foglalt');
  assert.equal(napAllapot('2026-10-12', MA, FOGLALT), 'foglalt');
});

test('az érkezés napja fél nap: délelőtt szabad', () => {
  assert.equal(napAllapot('2026-10-10', MA, FOGLALT), 'erkezo');
});

test('a távozás napja fél nap: délután szabad', () => {
  assert.equal(napAllapot('2026-10-13', MA, FOGLALT), 'tavozo');
});

test('a távozás utáni nap már teljesen szabad', () => {
  assert.equal(napAllapot('2026-10-14', MA, FOGLALT), 'szabad');
});

test('érkezni lehet a távozás napjára', () => {
  assert.equal(erkezhet('2026-10-13', MA, FOGLALT), true);
});

test('érkezni nem lehet foglalt éjszakára', () => {
  assert.equal(erkezhet('2026-10-10', MA, FOGLALT), false);
  assert.equal(erkezhet('2026-10-11', MA, FOGLALT), false);
});

test('érkezni nem lehet a múltba', () => {
  assert.equal(erkezhet('2026-08-31', MA, FOGLALT), false);
});

test('távozni lehet az érkezés napjára', () => {
  // 2026-10-08-tól 10-ig: a 8. és 9. éjszaka szabad, a 10-i már foglalt,
  // de a távozás napjának éjszakája nem számít.
  assert.equal(tavozhat('2026-10-08', '2026-10-10', FOGLALT), true);
});

test('távozás nem ugorhat át foglalt éjszakát', () => {
  assert.equal(tavozhat('2026-10-08', '2026-10-14', FOGLALT), false);
});

test('a távozás nem lehet az érkezés napján vagy előtte', () => {
  assert.equal(tavozhat('2026-10-08', '2026-10-08', FOGLALT), false);
  assert.equal(tavozhat('2026-10-08', '2026-10-07', FOGLALT), false);
});

test('két foglalás közötti egyetlen szabad éjszaka kiadható', () => {
  // 10–12. és 14–15. foglalt: a 13-i éjszaka egyedül marad.
  const ket = new Set([
    '2026-10-10', '2026-10-11', '2026-10-12',
    '2026-10-14', '2026-10-15',
  ]);
  assert.equal(napAllapot('2026-10-13', MA, ket), 'tavozo');
  assert.equal(napAllapot('2026-10-14', MA, ket), 'erkezo');
  assert.equal(erkezhet('2026-10-13', MA, ket), true);
  assert.equal(tavozhat('2026-10-13', '2026-10-14', ket), true);
  // De két éjszakára már nem: a 14-i éjszaka foglalt.
  assert.equal(tavozhat('2026-10-13', '2026-10-15', ket), false);
});

test('egymáshoz érő foglalások napja teljesen foglalt', () => {
  // 10–12. és 12–14.: a 12-i nap mindkét felében foglalt.
  const egymasutan = new Set([
    '2026-10-10', '2026-10-11', '2026-10-12', '2026-10-13',
  ]);
  assert.equal(napAllapot('2026-10-12', MA, egymasutan), 'foglalt');
});

test('üres naptárban minden nap szabad', () => {
  const ures = new Set();
  assert.equal(napAllapot('2026-10-11', MA, ures), 'szabad');
  assert.equal(erkezhet('2026-10-11', MA, ures), true);
  assert.equal(tavozhat('2026-10-11', '2026-10-30', ures), true);
});
