-- ============================================================
--  RLS hiánypótlás — a Supabase biztonsági riasztására
--
--  MI VOLT A BAJ
--  A 001-es migrációban a `foglalas_extrak` táblára lemaradt a
--  sorszintű védelem (RLS) bekapcsolása. A Supabase alapértelmezésben
--  minden publikus sémában lévő táblához ad jogot az `anon` szerepnek,
--  és RLS nélkül ezt semmi nem korlátozza. Mivel az anon kulcs a
--  böngészőben van (ott is kell lennie), ez azt jelentette, hogy a
--  tábla tartalma kívülről olvasható és írható volt.
--
--  Mi volt benne: melyik foglaláshoz milyen extra tartozik, mennyi
--  darab, és mennyi volt az akkori egységár. Vendégnév, e-mail,
--  telefonszám, cím és fizetési adat NEM — azok más táblákban vannak,
--  amelyeken az RLS kezdettől be volt kapcsolva.
--
--  MIT CSINÁL EZ A FÁJL
--   1. Bekapcsolja az RLS-t a `foglalas_extrak` táblán.
--   2. Végigmegy a publikus séma MINDEN tábláján, és bekapcsolja az
--      RLS-t, ahol még nincs. Így egy jövőbeli új tábla sem maradhat
--      védtelenül csak azért, mert valaki elfelejtett egy sort.
--   3. Elveszi az `anon` és `authenticated` szerepek jogait azokról a
--      táblákról, amelyekhez a böngészőnek soha semmi köze.
--   4. A hírlevél-nézetet a hívó jogaival futtatja, nem a tulajdonoséval.
--
--  Futtasd a Supabase SQL Editorában, a 007 UTÁN.
--  Ez is többször futtatható.
-- ============================================================


-- ---------- 1. A konkrét hiányzó tábla ----------
-- Policy-t szándékosan NEM írunk rá: a szerveroldali kód a
-- service_role kulccsal dolgozik, ami megkerüli az RLS-t. A böngésző
-- felől semmi dolga ezzel a táblával.

alter table foglalas_extrak enable row level security;


-- ---------- 2. Minden publikus tábla, kivétel nélkül ----------
-- Ha legközelebb születik egy új tábla, és lemarad róla az RLS, ez a
-- blokk újrafuttatva bekapcsolja. Ahol már be van kapcsolva, ott nem
-- csinál semmit.

do $$
declare
  t record;
begin
  for t in
    select c.relname
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relkind = 'r'          -- csak sima táblák
      and c.relrowsecurity = false -- csak ahol még nincs bekapcsolva
  loop
    execute format('alter table public.%I enable row level security', t.relname);
    raise notice 'RLS bekapcsolva: %', t.relname;
  end loop;
end $$;


-- ---------- 3. Jogok elvétele a bizalmas tábláktól ----------
-- Az RLS önmagában elég volna, de a két védelem egymástól független.
-- Ha egyszer valaki véletlenül kikapcsolja az RLS-t, a hiányzó jog
-- akkor is megfogja a kérést.
--
-- A `do` blokk azért kell, mert egy `revoke` nem létező táblára hibát
-- dobna, és megállítaná a futást.

do $$
declare
  t text;
  zart text[] := array[
    'foglalasok', 'foglalas_extrak', 'vendegek', 'fizetesek',
    'szamlak', 'email_naplo', 'blokkolt_idoszakok', 'hirlevel_feliratkozok'
  ];
begin
  foreach t in array zart loop
    if to_regclass('public.' || t) is not null then
      execute format('revoke all on public.%I from anon, authenticated', t);
    end if;
  end loop;
end $$;


-- ---------- 4. A hírlevél-nézet ----------
-- Egy nézet alapesetben a TULAJDONOSA jogaival fut, vagyis megkerüli
-- az alatta lévő tábla RLS-ét. A `security_invoker` ezt megfordítja:
-- a nézet a hívó jogaival fut, tehát az anon kulccsal nem ad vissza
-- semmit. A service_role továbbra is látja, és a Supabase felületén
-- is olvasható marad.
--
-- A `security_invoker` PostgreSQL 15 óta létezik. Ha a projekt régebbi,
-- a beállítás nem megy át — ezért a jogok elvétele alább külön is
-- megtörténik, ami minden verzión működik.

do $$ begin
  execute 'alter view hirlevel_cimzettek set (security_invoker = on)';
exception when others then
  raise notice 'A security_invoker nem állítható (régebbi PostgreSQL): %', sqlerrm;
end $$;

do $$ begin
  if to_regclass('public.hirlevel_cimzettek') is not null then
    revoke all on public.hirlevel_cimzettek from anon, authenticated;
  end if;
end $$;


-- ---------- Ellenőrzés ----------
-- Ennek ÜRES eredményt kell adnia. Ha bármi szerepel benne, az a tábla
-- még védtelen:
--
--   select c.relname as vedtelen_tabla
--   from pg_class c
--   join pg_namespace n on n.oid = c.relnamespace
--   where n.nspname = 'public' and c.relkind = 'r' and c.relrowsecurity = false;
--
-- És ennek látnia kell, hogy a publikus táblákon van policy:
--
--   select tablename, policyname from pg_policies where schemaname = 'public'
--   order by tablename;
