-- ============================================================
--  Dekorációs extrák — fix ár, és az eljegyzés átnevezése
--
--  Eddig ez a három tétel „ár kérésre” volt (ar = 0). Mostantól
--  mindhárom 9 900 Ft, tehát online kifizethető a foglalással együtt.
--
--  A „Lánykérős bekészítés” helyett „Eljegyzési dekoráció”. A slug
--  (`lanykeres`) marad, mert arra hivatkoznak a korábbi foglalások és
--  a fotók mappaneve is — csak a megjelenő nevet írjuk át.
--
--  Futtasd a Supabase SQL Editorában, a 009 UTÁN.
--  Ez is többször futtatható.
-- ============================================================

update extrak
set ar = 9900, ejszakankent = false, aktiv = true
where slug in ('szuletesnap', 'evfordulo', 'lanykeres');


-- ---------- Nevek és leírások ----------

insert into extrak_forditas (extra_id, nyelv, nev, leiras)
select id, 'hu', 'Születésnapi dekoráció',
  'Virágszirmok, gyertyák, léggömbök és ünnepi asztalterítés az érkezésetekre. Torta, csokoládé, virág és egyéb kívánság telefonon egyeztetve.'
from extrak where slug = 'szuletesnap'
on conflict (extra_id, nyelv) do update set nev = excluded.nev, leiras = excluded.leiras;

insert into extrak_forditas (extra_id, nyelv, nev, leiras)
select id, 'en', 'Birthday decoration',
  'Rose petals, candles, balloons and a festive table setting waiting on arrival. Cake, chocolate, flowers and other requests can be arranged by phone.'
from extrak where slug = 'szuletesnap'
on conflict (extra_id, nyelv) do update set nev = excluded.nev, leiras = excluded.leiras;

insert into extrak_forditas (extra_id, nyelv, nev, leiras)
select id, 'hu', 'Házassági évfordulós dekoráció',
  'Virágszirmok, gyertyák és ünnepi asztalterítés az érkezésetekre. Torta, csokoládé, virág és egyéb kívánság telefonon egyeztetve.'
from extrak where slug = 'evfordulo'
on conflict (extra_id, nyelv) do update set nev = excluded.nev, leiras = excluded.leiras;

insert into extrak_forditas (extra_id, nyelv, nev, leiras)
select id, 'en', 'Anniversary decoration',
  'Rose petals, candles and a festive table setting waiting on arrival. Cake, chocolate, flowers and other requests can be arranged by phone.'
from extrak where slug = 'evfordulo'
on conflict (extra_id, nyelv) do update set nev = excluded.nev, leiras = excluded.leiras;

-- A slug marad `lanykeres`, csak a név lesz „Eljegyzési dekoráció”.
insert into extrak_forditas (extra_id, nyelv, nev, leiras)
select id, 'hu', 'Eljegyzési dekoráció',
  'Virágszirmok, gyertyák és ünnepi asztalterítés az érkezésetekre. Torta, csokoládé, virág és egyéb kívánság telefonon egyeztetve.'
from extrak where slug = 'lanykeres'
on conflict (extra_id, nyelv) do update set nev = excluded.nev, leiras = excluded.leiras;

insert into extrak_forditas (extra_id, nyelv, nev, leiras)
select id, 'en', 'Engagement decoration',
  'Rose petals, candles and a festive table setting waiting on arrival. Cake, chocolate, flowers and other requests can be arranged by phone.'
from extrak where slug = 'lanykeres'
on conflict (extra_id, nyelv) do update set nev = excluded.nev, leiras = excluded.leiras;


-- ---------- Ellenőrzés ----------
--   select e.slug, e.ar, f.nev
--   from extrak e join extrak_forditas f on f.extra_id = e.id and f.nyelv = 'hu'
--   where e.aktiv order by e.slug;
