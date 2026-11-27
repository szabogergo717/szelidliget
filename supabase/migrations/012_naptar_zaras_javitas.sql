-- ============================================================
--  Naptárzárás javítása — minden házra, a slugtól függetlenül
--
--  MI VOLT A BAJ
--  A 009-es migráció név szerint sorolta fel a házakat
--  (`where slug in ('fuge','mandula')`). Ha egy ház slugja ettől
--  bármiben eltér — ékezet, kötőjel, elgépelés —, az a ház kimaradt
--  a zárásból. Pontosan ez történt: az egyik ház naptára zárt lett,
--  a másiké nyitva maradt.
--
--  MIT CSINÁL EZ
--  Ugyanazt a két zárást viszi fel, de MINDEN házra, ami az
--  adatbázisban van. Így nem tud kimaradni egy sem, és egy később
--  felvett harmadik házra is érvényes lesz, ha újrafuttatod.
--
--  Futtasd a Supabase SQL Editorában, a 011 UTÁN.
--  Ez is többször futtatható.
-- ============================================================

-- A korábbi, ugyanilyen indokú zárásokat töröljük, hogy ne
-- halmozódjanak. Kézi zárásokat és foglalásokat nem bántunk.
delete from blokkolt_idoszakok
where indok in ('Nyitás előtt', 'Karácsony');


-- ---------- Nyitás előtt: 2026. december 10-ig ----------
-- A `veg` a kijelentkezés napja, ezért december 10-e már foglalható.

insert into blokkolt_idoszakok (haz_id, kezdet, veg, indok, forras)
select id, date '2026-01-01', date '2026-12-10', 'Nyitás előtt', 'kezi'
from hazak;


-- ---------- Karácsony: december 24., 25., 26. éjszakája ----------
-- A 26-i éjszaka az utolsó zárt, ezért a `veg` 27-e.

insert into blokkolt_idoszakok (haz_id, kezdet, veg, indok, forras)
select id, date '2026-12-24', date '2026-12-27', 'Karácsony', 'kezi'
from hazak;


-- ---------- Ellenőrzés ----------
-- Minden háznak két sorral kell szerepelnie:
--
--   select h.slug, h.nev, b.kezdet, b.veg, b.indok
--   from hazak h left join blokkolt_idoszakok b on b.haz_id = h.id
--   order by h.slug, b.kezdet;
