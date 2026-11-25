-- ============================================================
--  Kuponkódok és ajándékutalvány-vásárlás
--
--  MIT OLDUNK MEG
--  Eddig a „3 éj a 2 áráért" akció MINDENKINEK automatikusan járt, aki
--  három éjszakát foglalt. Mostantól ez csak megvásárolt ajándék-
--  utalvánnyal jár: a vevő kifizeti a 98 000 Ft-ot, kap egy kódot
--  e-mailben, és azt bármikor beválthatja — vagy odaadhatja ajándékba.
--
--  KÉT TÁBLA
--   `utalvany_vasarlasok` — ki vette meg, mennyiért, kifizette-e.
--   `kuponok`             — maga a kód, és hogy beváltották-e már.
--
--  A kettő azért külön, mert a vásárlás és a kód élete elválik:
--  a vásárlás egy pillanat, a kód egy évig él, és más váltja be.
--
--  Futtasd a Supabase SQL Editorában, a 010 UTÁN.
--  Ez is többször futtatható.
-- ============================================================

-- ---------- 1. Az automatikus akció kikapcsolása ----------
-- Ha maradna, a kedvezmény ingyen járna, és az utalványt senki nem
-- venné meg. A sort nem töröljük: ha mégis vissza kell kapcsolni,
-- elég az `aktiv = true`.

-- A `do` blokk azért kell, mert ha a 006-os migráció valamiért nem
-- futott le, az `akciok` tábla nem létezik — egy sima UPDATE ilyenkor
-- megállítaná az egész fájlt. Így viszont átlépi, és megy tovább.
do $$ begin
  if to_regclass('public.akciok') is not null then
    update akciok set aktiv = false where slug = 'nyito_utalvany';
    raise notice 'Az automatikus akció kikapcsolva.';
  else
    raise notice 'Nincs `akciok` tábla — nincs mit kikapcsolni, ez rendben van.';
  end if;
end $$;


-- ---------- 2. Utalványvásárlások ----------

create table if not exists utalvany_vasarlasok (
  id           uuid primary key default gen_random_uuid(),
  -- Ez megy át a Barionnak megrendelésszámként. Az „UTA-" előtagról
  -- ismeri fel a visszahívás, hogy ez utalvány és nem foglalás.
  azonosito    text unique not null,
  nev          text not null,
  email        text not null,
  telefon      text,
  osszeg       int  not null check (osszeg > 0),
  statusz      text not null default 'fuggoben'
                 check (statusz in ('fuggoben','kifizetve','lemondva')),
  barion_id    text,
  -- Kinek szól az ajándék (ha nem magának veszi). Csak tájékoztató.
  ajandekozott text,
  uzenet       text,
  letrehozva   timestamptz not null default now(),
  modositva    timestamptz not null default now()
);

create index if not exists utalvany_vasarlasok_statusz_idx
  on utalvany_vasarlasok (statusz, letrehozva desc);

comment on table utalvany_vasarlasok is
  'Ajándékutalvány-vásárlások. A kód csak sikeres fizetés után születik meg.';


-- ---------- 3. Kuponkódok ----------

create table if not exists kuponok (
  id            uuid primary key default gen_random_uuid(),
  -- Mindig NAGYBETŰS, kötőjelekkel tagolva: SZL-7K4M-2PQX.
  -- A beváltáskor a kisbetűs és szóközös beírást is elfogadjuk,
  -- de tárolni csak ebben az alakban tárolunk.
  kod           text unique not null,

  /*
   * Mit ad a kupon. Pontosan EGY kitöltve a kettő közül:
   *  - `csomag_ar`: a szállásdíj fix összege ennyi éjszakára
   *    (az ajándékutalvány ilyen: 3 éjszaka 98 000 Ft-ért),
   *  - `kedvezmeny_ft`: egyszerű forintos kedvezmény.
   */
  ejszakak      int check (ejszakak is null or ejszakak > 0),
  csomag_ar     int check (csomag_ar is null or csomag_ar >= 0),
  kedvezmeny_ft int check (kedvezmeny_ft is null or kedvezmeny_ft > 0),

  ervenyes_ig   date not null,
  aktiv         boolean not null default true,

  -- Beváltás. Amíg `felhasznalva` üres, a kód szabad.
  felhasznalva  timestamptz,
  foglalas_id   uuid references foglalasok(id) on delete set null,

  -- Honnan jött: vásárlásból vagy kézi kiadásból.
  vasarlas_id   uuid references utalvany_vasarlasok(id) on delete set null,
  kiadva_nev    text,
  kiadva_email  text,
  megjegyzes    text,

  letrehozva    timestamptz not null default now(),

  -- Vagy csomagár van megadva éjszakaszámmal, vagy forintos kedvezmény.
  check (
    (csomag_ar is not null and ejszakak is not null and kedvezmeny_ft is null)
    or
    (kedvezmeny_ft is not null and csomag_ar is null)
  )
);

create index if not exists kuponok_szabad_idx
  on kuponok (kod) where felhasznalva is null;

comment on table kuponok is
  'Beváltható kódok. A beváltás egyszeri: a `felhasznalva` kitöltése zárja le.';
comment on column kuponok.csomag_ar is
  'Fix szállásdíj `ejszakak` éjszakára. A hétvégi felár ezen FELÜL fizetendő.';


-- ---------- 4. A foglaláson is maradjon nyoma ----------

alter table foglalasok add column if not exists kupon_kod text;

comment on column foglalasok.kupon_kod is
  'A beváltott kuponkód, ha volt. A kuponok tábla `foglalas_id` mezője a párja.';

-- A kuponos fizetés is fizetési mód.
--
-- A `fizetesi_mod` egy felsorolás (enum), nem szabad szöveg — ezért
-- nem elég új értéket beírni, a TÍPUST kell bővíteni. Az `if not
-- exists` miatt az ismételt futtatás nem okoz hibát.
--
-- FIGYELEM: a PostgreSQL nem engedi, hogy egy frissen hozzáadott enum
-- értéket UGYANABBAN a tranzakcióban használjunk is. Itt csak
-- hozzáadjuk; használni majd a weboldal fogja, külön kérésben.
do $$ begin
  if exists (select 1 from pg_type where typname = 'fizetesi_mod') then
    alter type fizetesi_mod add value if not exists 'kupon';
  end if;
end $$;


-- ---------- 5. Kódgenerálás ----------
-- Könnyen felolvasható készlet: nincs benne 0/O és 1/I, mert azokat
-- telefonban és kézírásban is összekeverik.

create or replace function kupon_kod_general()
returns text
language plpgsql
as $$
declare
  keszlet text := '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  blokk1  text := '';
  blokk2  text := '';
  i int;
begin
  for i in 1..4 loop
    blokk1 := blokk1 || substr(keszlet, 1 + floor(random() * length(keszlet))::int, 1);
    blokk2 := blokk2 || substr(keszlet, 1 + floor(random() * length(keszlet))::int, 1);
  end loop;
  return 'SZL-' || blokk1 || '-' || blokk2;
end $$;

comment on function kupon_kod_general is
  'Véletlen kuponkód, pl. SZL-7K4M-2PQX. Az ütközést a hívó kezeli (unique).';


-- ---------- 6. RLS ----------
-- Egyik tábla sem publikus: a kódokat a böngésző soha nem listázhatja,
-- különben végig lehetne próbálni őket. Az ellenőrzés szerveroldalon,
-- a service_role kulccsal történik.

alter table utalvany_vasarlasok enable row level security;
alter table kuponok             enable row level security;

revoke all on utalvany_vasarlasok from anon, authenticated;
revoke all on kuponok            from anon, authenticated;


-- ---------- Kézi kódkiadás (pl. kárpótlás, nyeremény) ----------
--   insert into kuponok (kod, ejszakak, csomag_ar, ervenyes_ig, kiadva_nev, megjegyzes)
--   values (kupon_kod_general(), 3, 98000, '2027-12-20', 'Teszt Elek', 'Nyeremény');
--
--   -- Forintos kedvezmény:
--   insert into kuponok (kod, kedvezmeny_ft, ervenyes_ig, megjegyzes)
--   values (kupon_kod_general(), 10000, '2027-12-31', 'Kárpótlás');


-- ---------- Ellenőrzés ----------
--   select kod, ejszakak, csomag_ar, kedvezmeny_ft, ervenyes_ig,
--          case when felhasznalva is null then 'szabad' else 'beváltva' end
--   from kuponok order by letrehozva desc;
