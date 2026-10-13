-- ============================================================
--  Hétvégi felár
--
--  Péntek és szombat éjszakára felárat lehet kérni. Egy éjszaka a
--  KEZDŐ napjához tartozik:
--
--    péntekről szombatra virradó éjszaka  → péntek  → felár jár
--    szombatról vasárnapra virradó éjszaka → szombat → felár jár
--    vasárnapról hétfőre virradó éjszaka  → vasárnap → nincs felár
--
--  Futtasd a Supabase SQL Editorában, a 004 UTÁN.
--  Ez is többször futtatható.
-- ============================================================

-- ---------- A ház alapértelmezett hétvégi felára ----------
-- 0 = nincs felár. Az összeg forintban, éjszakánként.

alter table hazak
  add column if not exists hetvegi_felar integer not null default 0;

alter table hazak drop constraint if exists hetvegi_felar_nem_negativ;
alter table hazak add constraint hetvegi_felar_nem_negativ
  check (hetvegi_felar >= 0);


-- ---------- Időszakonkénti kivétel ----------
-- NULL = nincs külön szabály, a ház beállítása érvényes.
-- 0 = ebben az időszakban nincs hétvégi felár (pl. ünnepi áraknál,
--     ahol a felár már benne van a megadott árban).

alter table arazas
  add column if not exists hetvegi_felar integer;

alter table arazas drop constraint if exists arazas_hetvegi_felar_nem_negativ;
alter table arazas add constraint arazas_hetvegi_felar_nem_negativ
  check (hetvegi_felar is null or hetvegi_felar >= 0);


comment on column hazak.hetvegi_felar is
  'Péntek és szombat éjszakára járó felár forintban. 0 = nincs felár.';
comment on column arazas.hetvegi_felar is
  'Hétvégi felár erre az időszakra. NULL = a ház beállítása érvényes, 0 = nincs felár.';


-- ---------- A felár beállítása ----------
-- Alapból 0, tehát a futtatás önmagában NEM változtat egyetlen árat sem.
-- Amikor eldöntitek az összeget, ezt az egy sort kell lefuttatni
-- (a 12 000 helyére a saját összegeteket írva):
--
--   update hazak set hetvegi_felar = 12000 where slug in ('fuge', 'mandula');
--
-- Kikapcsolni ugyanígy lehet:
--
--   update hazak set hetvegi_felar = 0 where slug in ('fuge', 'mandula');


-- ---------- Ellenőrzés ----------
--   select slug, alap_ar, hetvegi_felar from hazak order by slug;
