-- ============================================================
--  ⚠ FIGYELEM: EZ MINDENT TÖRÖL
--
--  Ez a szkript törli a foglalási rendszer összes tábláját és
--  a bennük lévő MINDEN ADATOT — foglalásokat, vendégeket,
--  fizetéseket is.
--
--  MIKOR HASZNÁLD:
--  - ha a séma felvitele félbeszakadt, és tiszta lappal
--    akarsz újrakezdeni
--  - amíg csak tesztadatok vannak a rendszerben
--
--  MIKOR NE HASZNÁLD:
--  - ha már van valódi vendégfoglalás az adatbázisban
--
--  Használat: futtasd le ezt, majd utána a 001-es sémát.
--  (A 001-es séma amúgy többször is futtatható biztonságosan,
--   szóval erre általában nincs is szükség.)
-- ============================================================

-- A sorrend számít: előbb azok a táblák, amikre mások hivatkoznak.
drop table if exists email_naplo cascade;
drop table if exists szamlak cascade;
drop table if exists fizetesek cascade;
drop table if exists foglalas_extrak cascade;
drop table if exists blokkolt_idoszakok cascade;
drop table if exists foglalasok cascade;
drop table if exists vendegek cascade;
drop table if exists extrak_forditas cascade;
drop table if exists extrak cascade;
drop table if exists arazas cascade;
drop table if exists hazak_forditas cascade;
drop table if exists hazak cascade;

drop function if exists foglalt_napok(text, date, date);

drop type if exists foglalas_statusz;
drop type if exists foglalas_forras;
drop type if exists fizetes_statusz;
