-- ============================================================
--  Faházas foglalási rendszer — Supabase alapséma
--  Postgres / Supabase (RLS-sel)
-- ============================================================

-- ---------- Segédtípusok ----------

create type foglalas_statusz as enum (
  'fuggoben',      -- létrejött, de még nincs fizetve
  'elolegezve',    -- előleg beérkezett
  'kifizetve',     -- teljes összeg beérkezett
  'lemondva',
  'nem_jelent_meg'
);

create type foglalas_mandula as enum (
  'sajat',         -- a saját weboldalról
  'booking',
  'szallas_hu',
  'kezi'           -- admin vitte fel telefonos foglalásnál
);

create type fizetes_statusz as enum (
  'varakozik', 'sikeres', 'sikertelen', 'visszateritve'
);


-- ---------- Faházak ----------

create table hazak (
  id             uuid primary key default gen_random_uuid(),
  slug           text not null unique,          -- 'fuge', 'mandula'
  nev            text not null,
  max_fo         int  not null check (max_fo > 0),
  alap_ar        int  not null,                 -- Ft / éj, fallback ár
  min_ejszaka    int  not null default 2,
  aktiv          boolean not null default true,
  letrehozva     timestamptz not null default now()
);

-- Kétnyelvű tartalom külön táblában, hogy új nyelv ne igényeljen
-- séma-módosítást (ez a kétnyelvűség tiszta megoldása)
create table hazak_forditas (
  haz_id     uuid not null references hazak(id) on delete cascade,
  nyelv      text not null check (nyelv in ('hu','en')),
  cim        text not null,
  alcim      text,
  leiras     text,
  primary key (haz_id, nyelv)
);


-- ---------- Árazás ----------
-- Időszakos árak: szezon, hétvége, ünnep. Ami nincs lefedve,
-- arra a hazak.alap_ar érvényes.

create table arazas (
  id          uuid primary key default gen_random_uuid(),
  haz_id      uuid not null references hazak(id) on delete cascade,
  kezdet      date not null,
  veg         date not null,
  ar          int  not null check (ar >= 0),
  min_ejszaka int,                               -- felülírja a ház alapértékét
  megnevezes  text,                              -- 'Főszezon', 'Szilveszter'
  prioritas   int not null default 0,            -- ütközésnél a nagyobb nyer
  check (veg >= kezdet)
);

create index on arazas (haz_id, kezdet, veg);


-- ---------- Extra szolgáltatások ----------

create table extrak (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique,
  ar           int  not null,
  ejszakankent boolean not null default false,   -- naponta vagy alkalmanként
  aktiv        boolean not null default true
);

create table extrak_forditas (
  extra_id uuid not null references extrak(id) on delete cascade,
  nyelv    text not null check (nyelv in ('hu','en')),
  nev      text not null,
  leiras   text,
  primary key (extra_id, nyelv)
);


-- ---------- Vendégek ----------

create table vendegek (
  id         uuid primary key default gen_random_uuid(),
  email      text not null,
  nev        text not null,
  telefon    text,
  nyelv      text not null default 'hu' check (nyelv in ('hu','en')),
  -- számlázási adatok
  szla_nev   text,
  szla_cim   text,
  szla_adoszam text,
  letrehozva timestamptz not null default now()
);

create index on vendegek (lower(email));


-- ---------- Foglalások ----------

create table foglalasok (
  id            uuid primary key default gen_random_uuid(),
  azonosito     text not null unique,            -- 'SZL-2026-0147', vendégnek
  haz_id        uuid not null references hazak(id),
  vendeg_id     uuid references vendegek(id),
  erkezes       date not null,
  tavozas       date not null,
  fo            int  not null check (fo > 0),
  statusz       foglalas_statusz not null default 'fuggoben',
  mandula        foglalas_mandula  not null default 'sajat',
  kulso_id      text,                            -- Booking.com foglalásazonosító
  -- pénzügy (Ft-ban, egész számként — soha ne float!)
  szallasdij    int not null default 0,
  extrak_dij    int not null default 0,
  vegosszeg     int not null default 0,
  elolegoosszeg int not null default 0,
  megjegyzes    text,
  letrehozva    timestamptz not null default now(),
  modositva     timestamptz not null default now(),
  check (tavozas > erkezes)
);

-- ⚠ A rendszer legfontosabb sora: adatbázis-szinten tiltja a túlfoglalást.
-- Enélkül két egyszerre érkező foglalás átcsúszhat az alkalmazás
-- ellenőrzésén. A '[)' azt jelenti: a távozás napja már szabad.
create extension if not exists btree_gist;

alter table foglalasok add constraint nincs_tulfoglalas
  exclude using gist (
    haz_id with =,
    daterange(erkezes, tavozas, '[)') with &&
  )
  where (statusz in ('fuggoben','elolegezve','kifizetve'));

create index on foglalasok (haz_id, erkezes);
create index on foglalasok (statusz);


-- ---------- Foglaláshoz tartozó extrák ----------

create table foglalas_extrak (
  foglalas_id uuid not null references foglalasok(id) on delete cascade,
  extra_id    uuid not null references extrak(id),
  mennyiseg   int  not null default 1,
  egysegar    int  not null,        -- foglaláskori ár, nem a mai
  primary key (foglalas_id, extra_id)
);


-- ---------- Blokkolt időszakok ----------
-- Karbantartás, saját használat, külső naptárból jövő zárás

create table blokkolt_idoszakok (
  id         uuid primary key default gen_random_uuid(),
  haz_id     uuid not null references hazak(id) on delete cascade,
  kezdet     date not null,
  veg        date not null,
  indok      text,
  mandula     foglalas_mandula not null default 'kezi',
  check (veg > kezdet)
);

create index on blokkolt_idoszakok (haz_id, kezdet);


-- ---------- Fizetések ----------

create table fizetesek (
  id             uuid primary key default gen_random_uuid(),
  foglalas_id    uuid not null references foglalasok(id),
  osszeg         int not null,
  statusz        fizetes_statusz not null default 'varakozik',
  szolgaltato    text,                       -- 'barion', 'simplepay', 'atutalas'
  kulso_tranzakcio_id text,
  -- a szolgáltató nyers válasza, hogy vita esetén legyen bizonyíték
  valasz         jsonb,
  letrehozva     timestamptz not null default now()
);

create index on fizetesek (foglalas_id);


-- ---------- Számlák ----------

create table szamlak (
  id            uuid primary key default gen_random_uuid(),
  foglalas_id   uuid not null references foglalasok(id),
  tipus         text not null check (tipus in ('eloleg','vegszamla','sztorno')),
  szamlazz_id   text,                        -- Számlázz.hu bizonylatszám
  pdf_url       text,
  osszeg        int not null,
  kiallitva     timestamptz not null default now()
);


-- ---------- Kiküldött e-mailek naplója ----------
-- Enélkül nem tudod megmondani, kapott-e a vendég visszaigazolást

create table email_naplo (
  id          uuid primary key default gen_random_uuid(),
  foglalas_id uuid references foglalasok(id),
  tipus       text not null,        -- 'visszaigazolas', 'erkezes_elott', ...
  cimzett     text not null,
  nyelv       text not null,
  resend_id   text,
  sikeres     boolean not null default true,
  hiba        text,
  kuldve      timestamptz not null default now()
);


-- ============================================================
--  Row Level Security
--  Alapelv: a publikus oldal CSAK a szabad/foglalt napokat
--  láthatja, vendégadatot soha.
-- ============================================================

alter table hazak                enable row level security;
alter table hazak_forditas       enable row level security;
alter table extrak               enable row level security;
alter table extrak_forditas      enable row level security;
alter table arazas               enable row level security;
alter table foglalasok           enable row level security;
alter table vendegek             enable row level security;
alter table fizetesek            enable row level security;
alter table szamlak              enable row level security;
alter table email_naplo          enable row level security;
alter table blokkolt_idoszakok   enable row level security;

-- Publikusan olvasható: a házak és az áraik
create policy "hazak publikus" on hazak
  for select using (aktiv = true);
create policy "hazak forditas publikus" on hazak_forditas
  for select using (true);
create policy "extrak publikus" on extrak
  for select using (aktiv = true);
create policy "extrak forditas publikus" on extrak_forditas
  for select using (true);
create policy "arazas publikus" on arazas
  for select using (true);

-- Foglalás, vendég, fizetés, számla: SEMMILYEN publikus hozzáférés.
-- Ezekhez csak a szerveroldali kód fér hozzá a service_role kulccsal,
-- ami megkerüli az RLS-t. Ezért nem írunk rájuk policy-t.
-- (Next.js szerveroldal = a kulcs soha nem kerül a böngészőbe.)


-- ============================================================
--  Szabad napok lekérdezése publikusan, vendégadat kiszivárgása nélkül
-- ============================================================

create or replace function foglalt_napok(p_haz_slug text, p_tol date, p_ig date)
returns table (kezdet date, veg date)
language sql
security definer
set search_path = public
as $$
  select f.erkezes, f.tavozas
  from foglalasok f
  join hazak h on h.id = f.haz_id
  where h.slug = p_haz_slug
    and f.statusz in ('fuggoben','elolegezve','kifizetve')
    and f.erkezes < p_ig and f.tavozas > p_tol
  union all
  select b.kezdet, b.veg
  from blokkolt_idoszakok b
  join hazak h on h.id = b.haz_id
  where h.slug = p_haz_slug
    and b.kezdet < p_ig and b.veg > p_tol;
$$;

grant execute on function foglalt_napok(text, date, date) to anon;


-- ---------- Kezdő adatok ----------

insert into hazak (slug, nev, max_fo, alap_ar, min_ejszaka) values
  ('fuge', 'Füge', 4, 42000, 2),
  ('mandula',  'Mandula',  6, 48000, 2);
