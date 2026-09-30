-- ============================================================
--  Számlázási cím — külön mezőkben
--
--  Számlát cím nélkül nem lehet kiállítani, ezért a cím mostantól
--  kötelező a foglalásnál. A számlázóprogramok (Számlázz.hu, Billingo)
--  külön kérik az irányítószámot, a várost és az utcát, ezért nem
--  egy szabad szöveges mezőben tároljuk.
--
--  Futtasd a Supabase SQL Editorában, a 003 UTÁN.
--  Ez is többször futtatható.
-- ============================================================

alter table vendegek add column if not exists szla_irsz   text;
alter table vendegek add column if not exists szla_varos  text;
alter table vendegek add column if not exists szla_orszag text;

-- A meglévő vendégeknél az ország alapértelmezése Magyarország.
-- (Csak ott, ahol még üres — a korábbi sorok adatait nem írjuk felül.)
update vendegek set szla_orszag = 'Magyarország'
where szla_orszag is null;

comment on column vendegek.szla_cim    is 'Utca, házszám (a számlázási cím utcasora)';
comment on column vendegek.szla_irsz   is 'Irányítószám';
comment on column vendegek.szla_varos  is 'Város';
comment on column vendegek.szla_orszag is 'Ország, alapértelmezés: Magyarország';


-- ---------- Ellenőrzés ----------
-- Futtatás után ennek hat sort kell adnia: szla_nev, szla_cim,
-- szla_adoszam, szla_irsz, szla_varos, szla_orszag közül mindet.
--
--   select column_name from information_schema.columns
--   where table_name = 'vendegek' and column_name like 'szla\_%'
--   order by column_name;
