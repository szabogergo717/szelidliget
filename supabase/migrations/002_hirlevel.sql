-- ============================================================
--  Hírlevél-feliratkozás
--
--  Futtasd le a Supabase SQL Editorában, a 001-es séma UTÁN.
--  Ez is többször futtatható.
--
--  MIÉRT KÜLÖN TÁBLA?
--  A foglaláskor megadott e-mail cím a SZERZŐDÉS teljesítéséhez kell
--  (visszaigazolás, számla, érkezési tájékoztató). Marketinghez a GDPR
--  külön, önkéntes és bizonyítható hozzájárulást kíván.
--
--  Ezért a feliratkozás külön sorban él, és eltároljuk, MIKOR és
--  HONNAN adta a hozzájárulást. Ha valaha kérdés merül fel, ez a
--  bizonyíték. A foglalások törlése nem törli a feliratkozást, és
--  a leiratkozás nem törli a foglalást.
-- ============================================================

create table if not exists hirlevel_feliratkozok (
  id            uuid primary key default gen_random_uuid(),
  email         text not null,
  nev           text,
  nyelv         text not null default 'hu' check (nyelv in ('hu','en')),

  -- A hozzájárulás bizonyítéka
  hozzajarult   boolean not null default true,
  hozzajarulas_ideje timestamptz not null default now(),
  forras        text not null default 'foglalas',  -- honnan iratkozott fel

  -- Leiratkozás
  leiratkozott       boolean not null default false,
  leiratkozas_ideje  timestamptz,

  letrehozva    timestamptz not null default now()
);

-- Egy e-mail cím egyszer szerepeljen. Az újbóli feliratkozás a meglévő
-- sort frissíti, nem hoz létre másodikat.
create unique index if not exists hirlevel_email_idx
  on hirlevel_feliratkozok (lower(email));

alter table hirlevel_feliratkozok enable row level security;
-- Szándékosan nincs policy: a listához csak a szerveroldali kód fér hozzá.


-- ---------- Nézet a kiküldéshez ----------
-- Csak azok, akik feliratkoztak és nem iratkoztak le.
create or replace view hirlevel_cimzettek as
  select email, nev, nyelv, hozzajarulas_ideje
  from hirlevel_feliratkozok
  where hozzajarult = true and leiratkozott = false;
