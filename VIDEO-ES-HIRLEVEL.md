# Bemutató videó és hírlevél — lépésről lépésre

Két külön téma. Mindkettő önállóan elvégezhető, egyik sem feltétele a
másiknak. Egyikhez sem kell semmit telepítened a gépedre.

---

# A) A bemutató videó

A videó az oldal legtetején, a nyitókép **fölött** jelenik meg, és
magától elindul.

## Miért nem YouTube-ról ágyazzuk be

A YouTube-beágyazás elé a Google saját vezérlőfelületet, logót és a
végén ajánlott videókat tesz — akár a konkurenciáét. Sütiket is
elhelyez, amihez süti-hozzájárulás kellene, és lassítja az oldalt. A
saját fájl gyorsabb, és nincs rajta idegen felirat. Ezért **fájlként**
töltjük fel.

## Hogyan néz ki

A felvételed álló (telefonnal készült, 9:16). Ez így jó, nem kell
átvágni fekvőre:

- **Telefonon** a videó a teljes szélességet kitölti.
- **Asztali gépen** középre kerül, a két oldalára pedig ugyanannak a
  felvételnek az **elmosott, felnagyított** állóképe — így nem két
  fekete sáv tátong mellette. (Ezt a megoldást használja az Instagram
  és a TikTok is a webes nézetében.)

---

## 1. lépés — Vágd 15–20 másodpercre

A videó az oldal tetején fut, némán, folyamatosan ismétlődve. Ennél
hosszabbat senki nem néz végig, és csak a sávszélességet viszi.

Vágni telefonon a legegyszerűbb:

- **iPhone:** Fotók → a videó → Szerkesztés → az idősáv két végét húzd
  össze → Kész → „Mentés új klipként".
- **Android:** Google Fotók → a videó → Szerkesztés → az idősáv végeit
  húzd össze → „Másolat mentése".

Olyan szakaszt válassz, ahol van mozgás — a kamera halad, a víz
mozog, a gőz száll. Egy statikus beállítás fotónak jobb, mint videónak.

## 2. lépés — Tömörítsd 8–10 megabájt alá

A telefonból kijövő fájl gyakran 60–100 MB. Ez túl nagy. Böngészőből,
telepítés nélkül:

1. Menj a **freeconvert.com/video-compressor** oldalra.
2. **Choose Files** → válaszd ki a vágott videót.
3. Kattints a fogaskerékre (Advanced Settings) → **Compression
   Method: Target a file size** → írd be: **8 MB**.
4. **Compress Now** → ha kész, **Download**.

Így megvan a `bemutato.mp4`.

## 3. lépés — Készíts egy WebM változatot is (nem kötelező)

Ugyanaz a videó WebM formátumban kb. 30%-kal kisebb, és a legtöbb
böngésző ezt tölti le helyette. Ha kihagyod, minden működni fog, csak
kicsit lassabban.

1. **cloudconvert.com/mp4-to-webm**
2. **Select File** → a most tömörített `bemutato.mp4`.
3. **Convert** → **Download**.

Megvan a `bemutato.webm`.

## 4. lépés — Készíts poszterképet

Ez az állókép látszik, amíg a videó töltődik, és ebből készül az
asztali gép elmosott háttere is. **Enélkül a videó nem fog jól
kinézni**, úgyhogy ne hagyd ki.

A legegyszerűbb: nyisd meg a videót telefonon, állítsd meg egy szép
képkockánál, és csinálj **képernyőképet**. Utána vágd ki belőle a
videó területét (Fotók → Szerkesztés → Vágás).

Vagy: **cloudconvert.com/mp4-to-jpg** → töltsd fel a videót →
Convert → az első képkocka letölthető.

## 5. lépés — Nevezd át a három fájlt

Pontosan így, kisbetűvel, ékezet nélkül:

```
bemutato.mp4
bemutato.webm          (ha csináltál)
bemutato-poster.png
```

Ha a tömörítő `bemutato_compressed.mp4` néven adta vissza, nevezd át.
A név számít — az oldal ezeket keresi.

## 6. lépés — Töltsd fel a Codespaces-be

1. Nyisd meg a Codespace-t (github.com → a tárolód → **Code** gomb →
   **Codespaces** fül → a futó környezet neve).
2. A bal oldali fasorban keresd meg a **`public`** mappát, és kattints rá.
3. **Húzd rá** a három fájlt a `public` mappa nevére. Megjelennek a
   listában.
4. Alul a terminálba:

```bash
cd /workspaces/szelidliget
git add -A
git commit -m "Bemutato video"
git push
```

## 7. lépés — Kapcsold be a Vercelen

1. **vercel.com** → a projekted → **Settings** → **Environment
   Variables**.
2. **Key:** `NEXT_PUBLIC_BEMUTATO_VIDEO` · **Value:** `1`
3. Mindhárom környezetet hagyd bepipálva (Production, Preview,
   Development) → **Save**.
4. **Deployments** fül → a legfelső sor jobb szélén a **„…"** →
   **Redeploy** → **Redeploy**.

Ez a lépés **kötelező**: a beállítás csak újratelepítés után lép
életbe. Pár perc múlva nézd meg az oldalt telefonon és gépen is.

## Amit tudni érdemes

- **A videó némán indul.** Ez nem beállítás kérdése: a böngészők a
  hangos automatikus indítást kivétel nélkül tiltják, nincs mód
  megkerülni. A videó alatt van egy „Hang bekapcsolása" gomb annak,
  aki kéri.
- Aki a telefonján bekapcsolta a „mozgás csökkentése"
  akadálymentességi beállítást (sokan szédülés miatt), annál a videó
  nem indul magától — ott az állókép és egy indítógomb jelenik meg.
- **Kivenni bármikor tudod:** a `NEXT_PUBLIC_BEMUTATO_VIDEO` értékét
  írd át `0`-ra, és telepítsd újra. A fájlokat nem kell törölni.
- **Cserélni** úgy tudod, hogy ugyanezekkel a nevekkel feltöltöd az új
  fájlokat — felülírják a régieket.

---

# B) Hírlevél

## Ami már megvan

A foglalóűrlapon van egy **külön, önkéntes** jelölőnégyzet a
hírlevélre. Ez szándékosan nincs összekötve az ÁSZF elfogadásával: a
GDPR szerint a marketing-hozzájárulás nem lehet a vásárlás feltétele,
és a kettőt nem szabad egy pipába tenni.

A feliratkozók a `hirlevel_feliratkozok` táblában gyűlnek, és van egy
`hirlevel_cimzettek` nézet, ami **csak az érvényes, vissza nem vont**
címeket adja vissza. Mindig ezt a nézetet használd, ne a táblát.

A levélküldéshez a rendszer már használ **Resend**-et (a
visszaigazolókhoz). Ugyanaz a fiók jó a hírlevélre is — nem kell új
szolgáltatást bevezetni. Az ingyenes csomag havi 3 000 levél; két
faház vendéglistájával ez évekig elég.

---

## 1. lépés — Szedd ki a címlistát

1. **supabase.com** → a projekted → bal oldalt **Table Editor**.
2. Felül a legördülőben válts **`public`** sémára, és keresd meg a
   **`hirlevel_cimzettek`** nézetet.
3. Jobb felül **Export** → **Export to CSV**. Letöltődik egy
   `hirlevel_cimzettek_rows.csv`.

## 2. lépés — Nyisd meg és igazítsd

A Resend az importáláshoz `email`, `first_name`, `last_name`
oszlopneveket vár. Nyisd meg a CSV-t (Google Táblázatok: Fájl →
Importálás → Feltöltés), és írd át az első sor fejléceit erre. Ami nem
kell, azt az oszlopot töröld.

Majd **Fájl → Letöltés → Vesszővel elválasztott értékek (.csv)**.

## 3. lépés — Hozz létre egy névjegyzéket a Resendben

1. **resend.com** → jelentkezz be ugyanazzal a fiókkal, amivel a
   visszaigazoló leveleket küldöd.
2. Bal oldalt **Audiences** → **Create Audience** → név:
   `Szelid Liget hírlevél` → **Create**.
3. Nyisd meg → **Import Contacts** → töltsd fel a CSV-t.
4. Ellenőrizd, hogy a címek száma stimmel.

## 4. lépés — Ellenőrizd a feladó domaint

Ez egyszeri lépés, és valószínűleg már megvan a visszaigazoló levelek
miatt. **Domains** menü → a `szelidliget.hu` sorban **Verified**
státusznak kell állnia. Ha nem az, a levelek spam mappába esnek.

## 5. lépés — Írd meg és küldd ki

1. Bal oldalt **Broadcasts** → **Create Broadcast**.
2. **Audience:** `Szelid Liget hírlevél`.
3. **From:** `Szelid Liget <hirlevel@szelidliget.hu>`
4. **Subject:** rövid, konkrét. „Szabad hétvégék januárban" jobb, mint
   „Hírlevél".
5. Írd meg a levelet a szerkesztőben. Tegyél bele egy **gombot** a
   foglalásra mutatva: `https://www.szelidliget.hu/#foglalas`
6. **Send Test Email** → küldd el magadnak, és nézd meg telefonon is.
7. Ha jó: **Schedule** vagy **Send Now**.

## 6. lépés — Vezesd vissza a leiratkozásokat

Pár nappal a küldés után a Resendben az **Audience → Contacts** listán
a leiratkozottak `Unsubscribed` státuszt kapnak. Ezeket írd át a
Supabase-ben is:

**Table Editor → `hirlevel_feliratkozok`** → keresd meg az adott
e-mail címet → a `leiratkozott` oszlopba `true`.

Így a következő exportban már nem fognak szerepelni. (A
`hirlevel_cimzettek` nézet ezt automatikusan figyelembe veszi.)

## Mire figyelj

- **Leiratkozó link kötelező** minden levélben. A Resend a Broadcast
  funkcióban automatikusan beteszi — ezért használd azt, és ne
  kézzel összerakott levelet. Enélkül a küldés jogsértő.
- **Soha ne küldj címlistát a „Címzett" mezőbe.** Ha a vendégek
  e-mail címei egymás számára láthatóvá válnak, az adatvédelmi
  incidens, amit be kell jelenteni. A Broadcast mindenkinek külön
  levelet küld.
- **Ütem:** havi egynél sűrűbben ne. Szezonkezdés, ünnepi ajánlat,
  egy-egy szabad hétvége — ennyi bőven elég.
- **A nyitó ajándékutalvány** jó első hírlevél-téma: 3 éj a 2 éj
  áráért, 98 000 Ft, 2027. november 30-ig.

## Ha később automatizálni akarod

A Resend Audiences API-ból a feliratkozás automatikusan átvihető, így
nem kell CSV-zni, és a leiratkozás is magától visszaíródna. Ez egy fél
napos fejlesztés, de csak akkor éri meg, ha havonta többször küldesz.
Addig a kézi export teljesen rendben van.
