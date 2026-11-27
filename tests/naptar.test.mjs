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

/* ============================================================
   Zárások (ünnep, nyitás előtti időszak)

   A félnapok csak FOGLALÁSNÁL értelmesek: ott a vendég délelőtt
   kijelentkezik, tehát a nap fele szabad. Egy zárásnál viszont
   senki nem érkezik és nem is távozik — az a nap egészen zárva.
   ============================================================ */

test('a zárás első napja teljesen foglalt, nem „érkező"', () => {
  const foglalt = new Set(['2026-12-24', '2026-12-25', '2026-12-26']);
  const zart = new Set(['2026-12-24', '2026-12-25', '2026-12-26']);
  assert.equal(napAllapot('2026-12-24', '2026-11-01', foglalt, zart), 'foglalt');
  assert.equal(napAllapot('2026-12-25', '2026-11-01', foglalt, zart), 'foglalt');
  assert.equal(napAllapot('2026-12-26', '2026-11-01', foglalt, zart), 'foglalt');
});

test('a zárás utáni első nap teljesen szabad, nem „távozó"', () => {
  const foglalt = new Set(['2026-12-24', '2026-12-25', '2026-12-26']);
  const zart = new Set(['2026-12-24', '2026-12-25', '2026-12-26']);
  assert.equal(napAllapot('2026-12-27', '2026-11-01', foglalt, zart), 'szabad');
});

test('a zárás előtti nap szabad marad', () => {
  const foglalt = new Set(['2026-12-24']);
  const zart = new Set(['2026-12-24']);
  assert.equal(napAllapot('2026-12-23', '2026-11-01', foglalt, zart), 'szabad');
});

test('a nyitás napja szabad: a zárás az előző éjszakáig tart', () => {
  // Nyitás előtti zárás: december 9. éjszakája az utolsó zárt.
  const napok = ['2026-12-07', '2026-12-08', '2026-12-09'];
  const foglalt = new Set(napok);
  const zart = new Set(napok);
  assert.equal(napAllapot('2026-12-09', '2026-11-01', foglalt, zart), 'foglalt');
  assert.equal(napAllapot('2026-12-10', '2026-11-01', foglalt, zart), 'szabad');
});

test('a foglalás félnapjai zárás nélkül változatlanok', () => {
  const foglalt = new Set(['2026-10-10', '2026-10-11']);
  assert.equal(napAllapot('2026-10-10', '2026-10-01', foglalt, new Set()), 'erkezo');
  assert.equal(napAllapot('2026-10-11', '2026-10-01', foglalt, new Set()), 'foglalt');
  assert.equal(napAllapot('2026-10-12', '2026-10-01', foglalt, new Set()), 'tavozo');
});

test('zárás és foglalás egymás mellett', () => {
  // 24–26 zárva, 27–28 foglalt. A 27. így nem „érkező", hanem foglalt,
  // mert az előző éjszaka is foglalt volt — csak épp zárásból.
  const zart = new Set(['2026-12-24', '2026-12-25', '2026-12-26']);
  const foglalt = new Set([...zart, '2026-12-27', '2026-12-28']);
  assert.equal(napAllapot('2026-12-26', '2026-11-01', foglalt, zart), 'foglalt');
  assert.equal(napAllapot('2026-12-27', '2026-11-01', foglalt, zart), 'foglalt');
  // A foglalás után viszont van távozó félnap.
  assert.equal(napAllapot('2026-12-29', '2026-11-01', foglalt, zart), 'tavozo');
});

test('a múlt mindent felülír', () => {
  const zart = new Set(['2020-01-01']);
  assert.equal(napAllapot('2020-01-01', '2026-11-01', new Set(zart), zart), 'mult');
});
