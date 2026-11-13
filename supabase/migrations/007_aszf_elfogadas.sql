-- ============================================================
--  ÁSZF-elfogadás rögzítése
--
--  Jogszabály szerint a vásárlás előfeltétele, hogy a vendég
--  elfogadja az Általános Szerződési Feltételeket és az
--  Adatkezelési tájékoztatót. Egy jelölőnégyzet a böngészőben
--  nem bizonyíték — vita esetén azt kell tudnunk megmutatni,
--  hogy MIKOR és a dokumentum MELYIK változatát fogadták el.
--
--  Ezért két dolgot tároljunk el a foglalás mellé:
--   - az elfogadás időpontját,
--   - az ÁSZF akkor érvényes verziószámát.
--
--  Futtasd a Supabase SQL Editorában, a 006 UTÁN.
--  Ez is többször futtatható.
-- ============================================================

alter table foglalasok
  add column if not exists aszf_elfogadva timestamptz;

alter table foglalasok
  add column if not exists aszf_verzio text;

comment on column foglalasok.aszf_elfogadva is
  'Mikor fogadta el a vendég az ÁSZF-et és az adatkezelési tájékoztatót. '
  'A szerver írja, a kérés beérkezésekor. Üres érték = nincs érvényes szerződés.';

comment on column foglalasok.aszf_verzio is
  'A dokumentumok verziószáma az elfogadás pillanatában (lib/jogi.ts: ASZF_VERZIO). '
  'Ha később módosítjuk az ÁSZF-et, ebből derül ki, ki mit fogadott el.';

-- Az adatvédelmi hozzájárulás (marketing) külön kérdés: azt a
-- hirlevel_feliratkozok tábla őrzi, a 002 migrációból. A kettőt
-- szándékosan nem keverjük — a GDPR szerint a hírlevél külön,
-- önkéntes hozzájárulás, nem lehet a vásárlás feltétele.


-- ---------- Ellenőrzés ----------
--   select azonosito, aszf_elfogadva, aszf_verzio
--   from foglalasok order by letrehozva desc limit 10;
