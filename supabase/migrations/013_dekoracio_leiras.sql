-- ============================================================
--  A dekorációs extrák leírásának törlése
--
--  A három dekorációnál ugyanaz a mondatpár szerepelt
--  („Virágszirmok, gyertyák és ünnepi asztalterítés…"), ami a
--  listában háromszor ismétlődött, és a telefonos egyeztetésről
--  szóló rész amúgy is ott áll az extrák alatt, egyszer.
--
--  A nevek maradnak, csak a leírás ürül ki. A weboldal a leírás
--  nélküli extrát rövidebben, egy sorban mutatja.
--
--  Futtasd a Supabase SQL Editorában, a 012 UTÁN.
--  Ez is többször futtatható.
-- ============================================================

update extrak_forditas
set leiras = null
where extra_id in (
  select id from extrak where slug in ('szuletesnap', 'evfordulo', 'lanykeres')
);


-- ---------- Ellenőrzés ----------
--   select e.slug, f.nyelv, f.nev, f.leiras
--   from extrak e join extrak_forditas f on f.extra_id = e.id
--   where e.slug in ('szuletesnap','evfordulo','lanykeres')
--   order by e.slug, f.nyelv;
