-- ============================================================
--  Naptárzárások — nyitás előtt és az ünnepekre
--
--  Két dolgot zárunk le mindkét házra:
--
--   1. NYITÁS: 2026. december 10-e az első foglalható érkezési nap.
--      Addig a naptár pirosan, foglalhatatlanul jelenik meg.
--
--   2. ÜNNEPEK: 2026. december 24., 25. és 26. zárva.
--
--  FIGYELEM A DÁTUMOKRA: a `veg` mező a KIJELENTKEZÉS napja, tehát
--  nem számít bele a zárásba. Ha december 26-a az utolsó zárt nap,
--  akkor `veg` = december 27. Ez ugyanaz a logika, mint a foglalásnál:
--  egy 24–27 közötti foglalás a 24., 25. és 26. éjszakát foglalja el.
--
--  Futtasd a Supabase SQL Editorában, a 008 UTÁN.
--  Ez is többször futtatható: a régi zárásokat felülírja, nem duplázza.
-- ============================================================

-- A korábbi, ugyanilyen indokú zárásokat töröljük, hogy az ismételt
-- futtatás ne halmozza őket egymásra. Csak a sajátjainkat bántjuk —
-- a kézzel felvitt zárásokat és a foglalásokat nem.
delete from blokkolt_idoszakok
where indok in ('Nyitás előtt', 'Karácsony');


-- ---------- 1. Nyitás előtt ----------
-- A mai naptól (illetve 2026. január 1-től, hogy a múlt is zárt legyen)
-- 2026. december 10-ig. A 10-e már foglalható.

insert into blokkolt_idoszakok (haz_id, kezdet, veg, indok, forras)
select id, date '2026-01-01', date '2026-12-10', 'Nyitás előtt', 'kezi'
from hazak
where slug in ('fuge', 'mandula');


-- ---------- 2. Karácsony ----------
-- December 24., 25. és 26. éjszakája zárva. A `veg` ezért 27-e.

insert into blokkolt_idoszakok (haz_id, kezdet, veg, indok, forras)
select id, date '2026-12-24', date '2026-12-27', 'Karácsony', 'kezi'
from hazak
where slug in ('fuge', 'mandula');


-- ---------- Hogyan oldd fel később ----------
-- Egy zárás megszüntetése:
--   delete from blokkolt_idoszakok where indok = 'Karácsony';
--
-- Új zárás felvitele (pl. szilveszter):
--   insert into blokkolt_idoszakok (haz_id, kezdet, veg, indok, forras)
--   select id, date '2026-12-31', date '2027-01-02', 'Szilveszter', 'kezi'
--   from hazak where slug in ('fuge', 'mandula');


-- ---------- Ellenőrzés ----------
--   select h.slug, b.kezdet, b.veg, b.indok
--   from blokkolt_idoszakok b join hazak h on h.id = b.haz_id
--   order by h.slug, b.kezdet;
