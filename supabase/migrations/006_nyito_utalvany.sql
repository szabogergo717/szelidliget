-- ============================================================
--  Nyitó ajándékutalvány — 3 éjszaka a 2 éjszaka áráért
--
--  A szezonnyitó ajánlat: pontosan 3 éjszakás foglalásnál a
--  szállásdíj fix 98 000 Ft, a szabad helyek függvényében.
--
--  LEJÁRAT: 2027. november 30. Ezen a napon túl a rendszer magától
--  visszaáll a rendes árazásra — nem kell hozzá hozzányúlni semmihez.
--  Ami lejár, az nem jelenik meg, és nem is számol.
--
--  Futtasd a Supabase SQL Editorában, a 005 UTÁN.
--  Ez is többször futtatható.
-- ============================================================

-- ---------- Akciók táblája ----------
-- Külön tábla, nem az `arazas`: az időszakos ár egy éjszaka árát
-- mondja meg, ez viszont a TELJES tartózkodásra ad fix összeget.
-- A kettő más logika, ezért nem keverjük őket.

create table if not exists akciok (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,
  -- Hány éjszakára szól. Pontosan ennyi éjszakánál érvényes.
  ejszakak      int not null check (ejszakak > 0),
  -- A teljes szállásdíj forintban, erre a hosszra.
  teljes_ar     int not null check (teljes_ar >= 0),
  -- Mettől meddig lehet FOGLALNI (az érkezés napja esik ide).
  ervenyes_tol  date not null,
  ervenyes_ig   date not null,
  aktiv         boolean not null default true,
  letrehozva    timestamptz not null default now(),
  check (ervenyes_ig >= ervenyes_tol)
);

comment on table akciok is
  'Teljes tartózkodásra szóló fix árak (pl. 3 éj a 2 éj áráért). '
  'A lejárt sorok magától nem érvényesülnek — nem kell törölni őket.';

-- Melyik házakra szól. Ha egy akcióhoz nincs sor, minden házra érvényes.
create table if not exists akcio_hazak (
  akcio_id uuid not null references akciok(id) on delete cascade,
  haz_id   uuid not null references hazak(id) on delete cascade,
  primary key (akcio_id, haz_id)
);

-- Kétnyelvű megnevezés, hogy az oldalon is meg tudjuk mutatni.
create table if not exists akciok_forditas (
  akcio_id uuid not null references akciok(id) on delete cascade,
  nyelv    text not null check (nyelv in ('hu','en')),
  nev      text not null,
  leiras   text,
  primary key (akcio_id, nyelv)
);

alter table akciok           enable row level security;
alter table akcio_hazak      enable row level security;
alter table akciok_forditas  enable row level security;

-- Az akció nyilvános adat: a látogatónak látnia kell.
do $$ begin
  create policy akciok_olvasas on akciok for select using (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy akcio_hazak_olvasas on akcio_hazak for select using (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy akciok_forditas_olvasas on akciok_forditas for select using (true);
exception when duplicate_object then null; end $$;


-- ---------- A nyitó ajándékutalvány ----------

insert into akciok (slug, ejszakak, teljes_ar, ervenyes_tol, ervenyes_ig, aktiv)
values ('nyito_utalvany', 3, 98000, current_date, '2027-11-30', true)
on conflict (slug) do update set
  ejszakak     = excluded.ejszakak,
  teljes_ar    = excluded.teljes_ar,
  ervenyes_ig  = excluded.ervenyes_ig,
  aktiv        = excluded.aktiv;

insert into akciok_forditas (akcio_id, nyelv, nev, leiras)
select id, 'hu', 'Nyitó ajándékutalvány',
  'Három éjszaka a kettő áráért: 98 000 Ft. 2027. november 30-ig, a szabad helyek függvényében.'
from akciok where slug = 'nyito_utalvany'
on conflict (akcio_id, nyelv) do update set nev = excluded.nev, leiras = excluded.leiras;

insert into akciok_forditas (akcio_id, nyelv, nev, leiras)
select id, 'en', 'Opening gift voucher',
  'Three nights for the price of two: 98,000 HUF. Until 30 November 2027, subject to availability.'
from akciok where slug = 'nyito_utalvany'
on conflict (akcio_id, nyelv) do update set nev = excluded.nev, leiras = excluded.leiras;


-- ---------- Hogyan kapcsold ki korábban ----------
-- Ha az ajánlat idő előtt elfogy, elég ennyi:
--   update akciok set aktiv = false where slug = 'nyito_utalvany';
-- Újra bekapcsolni ugyanígy, true értékkel.
--
-- A dátum módosítása:
--   update akciok set ervenyes_ig = '2027-06-30' where slug = 'nyito_utalvany';


-- ---------- Ellenőrzés ----------
--   select slug, ejszakak, teljes_ar, ervenyes_tol, ervenyes_ig, aktiv
--   from akciok;
