-- ============================================================
--  Árak, létszám, extrák és fizetési mód frissítése
--
--  A 2026.09.27-i egyeztetés alapján.
--  Futtasd a Supabase SQL Editorában, a 001 és 002 UTÁN.
--  Ez is többször futtatható.
-- ============================================================

-- ---------- 1. Házak: 2 fő, 49 000 Ft/éj ----------
-- A ház ára 2 főre szól. Egy fő is foglalhat, de ugyanezt fizeti —
-- ezért a létszám nem befolyásolja az árat sehol a rendszerben.

update hazak set max_fo = 2, alap_ar = 49000, min_ejszaka = 2
where slug in ('fuge', 'mandula');


-- ---------- 2. Régi szezonális árak eltávolítása ----------
-- Az egyeztetésen egységes 49 000 Ft-os ár szerepelt. A korábbi
-- főszezon/szilveszter sorok félrevezetőek lennének, ezért töröljük.
-- Új szezonális árat a 001-es séma leírása szerint bármikor felvihetsz.

delete from arazas
where haz_id in (select id from hazak where slug in ('fuge', 'mandula'));


-- ---------- 3. Extrák cseréje ----------
-- A régi extrákat kivezetjük (nem töröljük, mert korábbi foglalások
-- hivatkozhatnak rájuk — csak inaktívvá tesszük).

update extrak set aktiv = false
where slug in ('reggeli', 'tuzifa', 'dezsa');

-- Az „ár kérésre” tételeknél az ar = 0. Ezeket a weboldal külön
-- jelöli, és nem számítja bele az összegbe — a részleteket
-- e-mailben egyeztetitek a foglalás után.

insert into extrak (slug, ar, ejszakankent, aktiv) values
  ('gourmet_reggeli',  19900, false, true),
  ('sajttal',          11900, false, true),
  ('lovaskocsi',       35000, false, true),
  ('szuletesnap',          0, false, true),
  ('evfordulo',            0, false, true),
  ('lanykeres',            0, false, true)
on conflict (slug) do update set
  ar = excluded.ar,
  ejszakankent = excluded.ejszakankent,
  aktiv = true;

-- Fordítások
insert into extrak_forditas (extra_id, nyelv, nev, leiras)
select id, 'hu', 'Gourmet reggeli kosár',
  'Környékbeli gazdák tejtermékei, sajtok, kolbászok, szalámik, töpörtyű, friss kenyér, házi lekvárok, méz, gyümölcslé, zöldségek. Két reggelire, két főnek elegendő.'
from extrak where slug = 'gourmet_reggeli'
on conflict (extra_id, nyelv) do update set nev = excluded.nev, leiras = excluded.leiras;

insert into extrak_forditas (extra_id, nyelv, nev, leiras)
select id, 'en', 'Gourmet breakfast basket',
  'Dairy, cheeses, sausages, salami, crackling, fresh bread, homemade jams, honey, juice and vegetables from local farmers. Enough for two breakfasts for two people.'
from extrak where slug = 'gourmet_reggeli'
on conflict (extra_id, nyelv) do update set nev = excluded.nev, leiras = excluded.leiras;

insert into extrak_forditas (extra_id, nyelv, nev, leiras)
select id, 'hu', 'Sajttál borozáshoz',
  'Helyi kézműves sajtok aszalt gyümölccsel és magokkal. Két estére, két főnek elegendő.'
from extrak where slug = 'sajttal'
on conflict (extra_id, nyelv) do update set nev = excluded.nev, leiras = excluded.leiras;

insert into extrak_forditas (extra_id, nyelv, nev, leiras)
select id, 'en', 'Cheese board',
  'Local artisan cheeses with dried fruit and nuts. Enough for two evenings for two people.'
from extrak where slug = 'sajttal'
on conflict (extra_id, nyelv) do update set nev = excluded.nev, leiras = excluded.leiras;

insert into extrak_forditas (extra_id, nyelv, nev, leiras)
select id, 'hu', 'Lovaskocsikázás', 'A helyi tájban, kocsissal. Óránkénti díj.'
from extrak where slug = 'lovaskocsi'
on conflict (extra_id, nyelv) do update set nev = excluded.nev, leiras = excluded.leiras;

insert into extrak_forditas (extra_id, nyelv, nev, leiras)
select id, 'en', 'Horse-drawn carriage ride', 'Through the local landscape, with a driver. Charged per hour.'
from extrak where slug = 'lovaskocsi'
on conflict (extra_id, nyelv) do update set nev = excluded.nev, leiras = excluded.leiras;

insert into extrak_forditas (extra_id, nyelv, nev, leiras)
select id, 'hu', 'Születésnapi bekészítés', 'Virág, csokoládé, torta, virágszirmok, dekoráció.'
from extrak where slug = 'szuletesnap'
on conflict (extra_id, nyelv) do update set nev = excluded.nev, leiras = excluded.leiras;

insert into extrak_forditas (extra_id, nyelv, nev, leiras)
select id, 'en', 'Birthday set-up', 'Flowers, chocolate, cake, rose petals, decoration.'
from extrak where slug = 'szuletesnap'
on conflict (extra_id, nyelv) do update set nev = excluded.nev, leiras = excluded.leiras;

insert into extrak_forditas (extra_id, nyelv, nev, leiras)
select id, 'hu', 'Házassági évforduló bekészítés', 'Virág, csokoládé, torta, virágszirmok, dekoráció.'
from extrak where slug = 'evfordulo'
on conflict (extra_id, nyelv) do update set nev = excluded.nev, leiras = excluded.leiras;

insert into extrak_forditas (extra_id, nyelv, nev, leiras)
select id, 'en', 'Anniversary set-up', 'Flowers, chocolate, cake, rose petals, decoration.'
from extrak where slug = 'evfordulo'
on conflict (extra_id, nyelv) do update set nev = excluded.nev, leiras = excluded.leiras;

insert into extrak_forditas (extra_id, nyelv, nev, leiras)
select id, 'hu', 'Lánykérős bekészítés', 'Virág, csokoládé, torta, virágszirmok, dekoráció.'
from extrak where slug = 'lanykeres'
on conflict (extra_id, nyelv) do update set nev = excluded.nev, leiras = excluded.leiras;

insert into extrak_forditas (extra_id, nyelv, nev, leiras)
select id, 'en', 'Proposal set-up', 'Flowers, chocolate, cake, rose petals, decoration.'
from extrak where slug = 'lanykeres'
on conflict (extra_id, nyelv) do update set nev = excluded.nev, leiras = excluded.leiras;


-- ---------- 4. Fizetési mód a foglaláson ----------
-- Eddig csak bankkártya volt. Az utalásos foglalás ugyanúgy létrejön,
-- de „fuggoben” marad, amíg az összeg meg nem érkezik.

do $$ begin
  create type fizetesi_mod as enum ('kartya', 'utalas');
exception when duplicate_object then null;
end $$;

alter table foglalasok
  add column if not exists fizetesi_mod fizetesi_mod not null default 'kartya';


-- ---------- 5. Számlázási adatok ----------
-- A vendegek táblában már megvannak (szla_nev, szla_cim, szla_adoszam),
-- csak az űrlapról nem töltöttük eddig. Nincs séma-módosítás.


-- ---------- 6. Érkezés előtti emlékeztető nyomon követése ----------
-- Hogy a napi feladat ne küldje ki kétszer ugyanannak.

alter table foglalasok
  add column if not exists emlekezteto_kuldve timestamptz;


-- ---------- Ellenőrzés ----------
-- Futtatás után ennek 2 sort kell adnia, 49000-es árral és 2 fővel:
--   select slug, nev, max_fo, alap_ar, min_ejszaka from hazak order by slug;
-- És 6 aktív extrát:
--   select e.slug, e.ar, f.nev from extrak e
--     join extrak_forditas f on f.extra_id = e.id and f.nyelv = 'hu'
--     where e.aktiv = true order by e.ar desc;


-- ---------- 7. Régi faházak eltávolítása ----------
-- A korábbi változatokban „Fenyves” és „Forrás” néven szerepelt a két ház.
-- Ha az adatbázisodban még ott vannak ezek a sorok, itt tűnnek el.
--
-- Óvatosan dolgozik: amelyik házhoz tartozik már foglalás, azt NEM törli
-- (az a foglalás története), csak inaktívvá teszi, hogy ne jelenjen meg
-- az oldalon. Amelyikhez nincs foglalás, azt véglegesen törli.

-- Az árak és blokkolt időszakok a hazak törlésével maguktól eltűnnek
-- (on delete cascade), a hazak_forditas és arazas sorokkal együtt.

update hazak set aktiv = false
where slug not in ('fuge', 'mandula')
  and id in (select distinct haz_id from foglalasok);

delete from hazak
where slug not in ('fuge', 'mandula')
  and id not in (select distinct haz_id from foglalasok);

-- ---------- Ellenőrzés a 7. ponthoz ----------
-- Futtatás után ennek PONTOSAN két sort kell adnia (Füge, Mandula):
--   select slug, nev, aktiv from hazak order by slug;
