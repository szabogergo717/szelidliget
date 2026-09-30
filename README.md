# Szelid Liget — foglalási rendszer

**Ez az útmutató feltételezi, hogy nem vagy programozó, és hogy nincs
rendszergazdai jogod a gépeden.** Semmit nem kell telepítened — az egész
elvégezhető böngészőből. Minden lépésnél leírom, mit kell csinálni, mit
fogsz látni, és miről tudod, hogy sikerült.

A két faház: **Füge** (2–4 fő) és **Mandula** (2–6 fő).

---

## Tartalomjegyzék

- [Mielőtt belekezdesz](#mielott-belekezdesz)
- [Szótár — mi mire való](#szotar)
- [A sorrend számít](#a-sorrend-szamit)
- [1. lépés — SimplePay szerződés elindítása](#1-lepes)
- [2. lépés — GitHub-fiók és a projekt feltöltése](#2-lepes)
- [3. lépés — Supabase (az adatbázis)](#3-lepes)
- [4. lépés — Vercel (az oldal közzététele)](#4-lepes)
- [5. lépés — Az árak felvitele](#5-lepes)
- [6. lépés — Resend (az e-mailek)](#6-lepes)
- [6.5 — Érkezés előtti emlékeztető](#emlekezteto)
- [7. lépés — A domain rákötése](#7-lepes)
- [8. lépés — Ha szerkesztened kell: Codespaces](#8-lepes)
- [9. lépés — SimplePay összekötése](#9-lepes)
- [10. lépés — Tesztelés élesítés előtt](#10-lepes)
- [11. lépés — Élesítés](#11-lepes)
- [Admin felület](#admin)
- [Hírlevél](#hirlevel)
- [Háttérvideó a főoldalra (opcionális)](#hattervideo)
- [Ha valami nem működik](#ha-valami-nem-mukodik)
- [Mi van kész és mi nincs](#mi-van-kesz)
- [Négy dolog a rendszerről](#negy-dolog)
- [Arculat és logófájlok](#arculat)

---

<a name="mielott-belekezdesz"></a>
## Mielőtt belekezdesz

### Rendszergazdai jog nélkül is megy

Ez a rendszer **nem a te gépeden fog futni**, hanem az interneten, egy
Vercel nevű szolgáltatónál. A gépedre semmit nem kell telepítened:

| Amit csinálni fogsz | Hol |
|---|---|
| A kód tárolása | github.com — böngésző |
| Az adatbázis | supabase.com — böngésző |
| Az oldal futtatása | vercel.com — böngésző |
| E-mailek | resend.com — böngésző |
| Ha kódot kell szerkeszteni | GitHub Codespaces — böngésző |

Elég egy böngésző (Chrome, Edge, Firefox) és egy e-mail cím.

### Mire lesz szükséged

| Mi | Miért | Megvan? |
|---|---|---|
| Böngésző és e-mail cím | A regisztrációkhoz | ✓ |
| `szelidliget.hu` domain | Az oldal címe | ✓ |
| Hozzáférés a domain DNS-beállításaihoz | Ott, ahol vetted | ellenőrizd |
| Vállalkozás + bankszámla | A SimplePay szerződéshez | — |

> **Egy dolgot előre ellenőrizz:** be tudsz-e lépni oda, ahol a
> `szelidliget.hu` domaint regisztráltad, és látod-e ott a „DNS beállítások"
> menüpontot. Erre a 6. és 7. lépésben lesz szükség. Ha nem, kérd el a
> hozzáférést attól, aki a domaint intézte.

### Mennyi időt vegyél rá

- **Aktív munka:** nagyjából 3–4 óra, szétszórva több napra
- **Várakozás:** a SimplePay szerződés hetekig is eltarthat, ezt nem lehet siettetni

### Havi költségek

| Szolgáltatás | Ingyenes keret | Ha túlléped |
|---|---|---|
| Supabase (adatbázis) | Bőven elég két faházhoz | kb. 25 USD/hó |
| Vercel (az oldal futtatása) | Elég ekkora oldalhoz | kb. 20 USD/hó |
| Resend (e-mail) | 3000 e-mail/hó | kb. 20 USD/hó |
| GitHub + Codespaces | 120 core-óra/hó | csak ha bankkártyát adsz meg |
| SimplePay | — | tranzakciónkénti díj, a szerződésben |

Kezdetben tehát a SimplePay tranzakciós díján kívül nincs havi költséged.

> **Ne adj meg bankkártyát egyiknél sem.** Fizetési mód nélkül ezek a
> szolgáltatások a keret elérésekor **leállnak, nem terhelnek**. Ez a
> biztonságos alapállapot: nem érhet meglepetés-számla.

### Egy fontos dolog előre

Sehol nem kell kódot írnod. Fájlokat fogsz feltölteni, weboldalakon
regisztrálni, és értékeket bemásolni egyik helyről a másikra.

---

<a name="szotar"></a>
## Szótár — mi mire való

Öt szolgáltatást fogsz összekötni. Így oszlik meg köztük a munka:

**GitHub** — itt tárolódik maga a kód. Olyan, mint egy felhős mappa, ami
minden változást megjegyez. A Vercel innen veszi el a kódot.

**Supabase** — az adatbázis. Itt tárolódik, hogy melyik ház mikor foglalt,
ki foglalta, mennyit fizetett. Olyan, mint egy nagyon okos Excel-tábla,
amihez a weboldal hozzáfér.

**Vercel** — ez futtatja a weboldalt. Ez a „tárhely". A GitHubról veszi
a kódot, és kiszolgálja a látogatóknak.

**SimplePay** — a bankkártyás fizetés, az OTP Mobil szolgáltatása. A vendég
az ő oldalukon adja meg a kártyaadatait, hozzád azok soha nem jutnak el.

**Resend** — ez küldi az e-maileket: a visszaigazolást, a számlaértesítőt.

**Codespaces** — egy teljes fejlesztői környezet a böngészőben, a GitHubtól.
Csak akkor lesz rá szükséged, ha kódot akarsz szerkeszteni vagy tesztet
futtatni. Telepítést nem igényel.

**DNS** — a telefonkönyv, ami megmondja az internetnek, hogy a
`szelidliget.hu` melyik szerverhez tartozik. Ott állítod, ahol a domaint vetted.

---

<a name="a-sorrend-szamit"></a>
## A sorrend számít

**Az 1. lépéssel kezdj, még ma.** A SimplePay szerződés hetekig tart, és amíg
nincs meg, addig nem tudsz valódi pénzt fogadni. Minden más közben elkészülhet.

A 2–4. lépés után az oldal már fent lesz az interneten, egy ideiglenes
címen. A 7. lépésben kerül rá a saját domained.

---

<a name="1-lepes"></a>
## 1. lépés — SimplePay szerződés elindítása

**Mit csinálsz:** elindítod a bankkártyás fizetés szerződéskötését.
**Mennyi idő:** 30 perc kitöltés, utána hetek várakozás.

1. Menj a **simplepay.hu** oldalra.
2. Keresd meg a „Csatlakozás" vagy „Ajánlatkérés" menüpontot.
3. Töltsd ki az űrlapot. Ami kérdés lesz, és a válasz:
   - **Weboldal címe:** `https://www.szelidliget.hu`
   - **Mit árulsz:** szálláshely-szolgáltatás, faház kiadás
   - **Várható havi forgalom:** becsüld meg — pl. 10 foglalás × 100 000 Ft
   - **Deviza:** HUF (forint)
4. Küldd el, és várd a visszajelzésüket.

**Amit vissza fogsz kapni (őrizd meg!):**
- egy **MERCHANT** azonosítót (rövid betűsor)
- egy **SECRET KEY**-t (hosszú, véletlenszerű karaktersor)

> ⚠ A SECRET KEY olyan, mint egy bankkártya PIN-kódja. Soha ne küldd el
> e-mailben, ne írd be chatbe, ne tedd fel a GitHubra. Ha mégis kikerül,
> szólj a SimplePaynek, és kérj újat — ez ingyenes.

**Addig is tudsz dolgozni:** a rendszer tartalmaz teszt-hozzáférést, amivel
kipróbálhatod az egészet valódi pénz nélkül.

✅ **Kész, ha:** elküldted az ajánlatkérést.

---

<a name="2-lepes"></a>
## 2. lépés — GitHub-fiók és a projekt feltöltése

**Mit csinálsz:** feltöltöd a kódot egy felhős tárolóba, böngészőből.
**Mennyi idő:** 25 perc.

### 2.1 — A zip kicsomagolása

1. Csomagold ki a `szelidliget-projekt.zip` fájlt egy mappába (pl. a
   Letöltések közé). Ehhez nem kell rendszergazdai jog — a Windows és a Mac
   is tud zipet bontani magától.
2. Nyisd meg a kicsomagolt `szelidliget` mappát. Ilyen fájlokat kell látnod:
   `app`, `lib`, `public`, `supabase`, `tests`, `README.md`, `package.json`.

### 2.2 — Regisztráció

1. Menj a **github.com** oldalra → **Sign up**.
2. Add meg az e-mail címed, válassz jelszót és felhasználónevet.
3. Erősítsd meg az e-mail címed a kapott levélben.

### 2.3 — Új tároló létrehozása

1. Jobb fent a **+** jel → **New repository**.
2. **Repository name:** `szelidliget`
3. Válaszd a **Private** opciót.
4. Ne pipálj be semmit az „Initialize this repository" résznél.
5. **Create repository**.

### 2.4 — A fájlok feltöltése

> ⚠ **A GitHub webes feltöltője megbízhatatlan, ha mappákat húzol bele.**
> Gyakran „ellapítja" a szerkezetet: a mélyebben lévő fájlokat (pl. az
> `app/api/foglalas/route.ts`-t) a gyökérbe rakja, mappák nélkül. Ilyenkor
> a Vercel később ezt a hibát adja:
> `Couldn't find any 'pages' or 'app' directory`.
>
> **Ezért a Codespaces-es utat javaslom** (2.4/B). Ott a zip kicsomagolása
> megőrzi a szerkezetet, és az egész 5 perc.

#### 2.4/A — Húzogatós feltöltés (gyors, de hibázhat)

1. Keresd meg a linket: **„uploading an existing file"** (a szöveg közepén,
   kék betűvel). Kattints rá.
2. Nyisd meg egy külön ablakban a kicsomagolt `szelidliget` mappát.
3. **Jelöld ki a mappa teljes tartalmát** (Ctrl+A / Cmd+A), és **húzd át**
   a böngészőablakba, a szaggatott vonallal jelölt területre.
4. Várd meg, míg mind feltöltődik.
5. Alul a **Commit changes** mezőbe írj valamit, pl. `Elso feltoltes`.
6. **Commit changes** gomb.

Utána **feltétlenül ellenőrizd a 2.5 pontot.** Ha az `app` mappa nem jelent
meg, vagy `route.ts` fájlokat látsz a gyökérben, akkor a szerkezet elveszett
— menj a 2.4/B pontra.

#### 2.4/B — Codespaces (megbízható, ezt javaslom)

Ez akkor is működik, ha a tárolód már össze van zavarva egy elrontott
feltöltéstől — mindent kitakarít és újraépít.

**Ha a tárolód még teljesen üres**, előbb hozz létre benne egy fájlt,
különben nem indul a Codespace: **Add file → Create new file**, a név
legyen `ideiglenes.txt`, írj bele egy betűt, majd **Commit changes**.

1. A tárolód főoldalán: zöld **Code** gomb → **Codespaces** fül →
   **Create codespace on main**. Az indulás 1–2 perc.
2. Megjelenik egy VS Code a böngészőben. Bal oldalt a fájllista.
3. **Húzd bele a `szelidliget-projekt.zip` fájlt** a bal oldali fájllistába
   (a gépedről, egyenesen a böngészőbe). Várd meg, míg megjelenik a listában.
4. Alul a terminálba (ha nem látszik: **Terminal → New Terminal**) másold be
   **soronként** ezeket, mindegyik után Enter:

```bash
find . -maxdepth 1 ! -name '.' ! -name '.git' ! -name '*.zip' -exec rm -rf {} +
```

```bash
unzip -q -o szelidliget-projekt.zip
```

```bash
mv szelidliget/.gitignore szelidliget/.env.example . && mv szelidliget/* . && rmdir szelidliget && rm szelidliget-projekt.zip
```

> **Mit csinálnak?** Az első kitakarítja a tároló tartalmát (a `.git`
> mappát és a zipet meghagyja). A második kicsomagolja a zipet. A harmadik
> feljebb mozgatja a fájlokat a helyes szintre, és kitörli a zipet.

5. Ellenőrizd: írd be a terminálba `ls`, és ezt kell látnod:

```
README.md  app  demo  lib  next.config.mjs  package.json  public  supabase  tests  tsconfig.json
```

6. Most mentsd el: a terminálba soronként:

```bash
git add -A
```

```bash
git commit -m "Projekt feltoltes"
```

```bash
git push
```

7. **Állítsd le a Codespace-t**, hogy ne fogyassza a keretet: bal lent a
   Codespaces menüben → **Stop Current Codespace**.

### 2.5 — Ellenőrzés

Frissítsd az oldalt. Ezt kell látnod:

```
app/        lib/        public/     supabase/   tests/
.env.example   .gitignore   README.md   package.json   ...
```

> ⚠ **Nézd meg, hogy NINCS-E a listában `.env.local` nevű fájl.** Ebben a
> böngészős útban nem is jöhet létre, de ha valamiért mégis ott van, töröld
> azonnal (a fájlra kattintva a kuka ikonnal), mert titkos kulcsok lennének
> benne.

**Nyisd meg az `app` mappát is**, és ellenőrizd, hogy benne van-e:

```
app/api/foglalas/route.ts
app/api/simplepay/ipn/route.ts
app/api/szabad-napok/route.ts
```

> ⚠ Ha `route.ts` fájlokat látsz a **gyökérben**, `app` mappa nélkül, akkor
> a feltöltés ellapította a szerkezetet. Ezzel a Vercel nem fog lefordulni.
> Menj vissza a **2.4/B** pontra (Codespaces) — az kitakarítja és helyreállítja.

✅ **Kész, ha:** az `app` mappa megvan a három `route.ts` fájllal, és nincs
`.env.local` a listában.

---

<a name="3-lepes"></a>
## 3. lépés — Supabase (az adatbázis)

**Mit csinálsz:** létrehozod az adatbázist, ahol a foglalások tárolódnak.
**Mennyi idő:** 20 perc.

### 3.1 — Regisztráció és projekt

1. Menj a **supabase.com** oldalra → **Start your project**.
2. Regisztrálj — a **Continue with GitHub** a legegyszerűbb, mert már van fiókod.
3. **New Project** gomb. Töltsd ki:
   - **Name:** `szelidliget`
   - **Database Password:** kattints a **Generate a password** gombra,
     és **mentsd el egy biztonságos helyre**. Erre ritkán lesz szükség,
     de ha elveszik, nem lehet visszaállítani.
   - **Region:** `Central EU (Frankfurt)` — ez a legközelebbi, ez a leggyorsabb
4. **Create new project**. A létrehozás 2–3 percig tart.

### 3.2 — A táblák létrehozása

Most létrehozod a „fiókokat", ahová az adatok kerülnek.

1. A Supabase bal oldali menüjében kattints a **SQL Editor** ikonra.
2. **New query** gomb.
3. **Egy másik böngészőfülön** nyisd meg a GitHubon a projektedet, és menj
   ide: `supabase` mappa → `migrations` mappa → `001_foglalas_sema.sql`.
4. Jobb fent kattints a **Raw** gombra. Most a nyers szöveget látod.
5. Jelöld ki az egészet (Ctrl+A / Cmd+A), másold ki (Ctrl+C / Cmd+C).
6. Menj vissza a Supabase fülre, és illeszd be a SQL Editorba (Ctrl+V / Cmd+V).
7. Kattints a **Run** gombra (vagy Ctrl+Enter).

✅ **Kész, ha:** zöld **Success** üzenetet látsz.

**Ellenőrzés:** bal oldalt kattints a **Table Editor**-ra. Látnod kell egy
`hazak` táblát, benne két sorral: **Füge** és **Mandula**.

> Ez az SQL **többször is futtatható** — ha kétszer nyomod meg a Run gombot,
> vagy egy korábbi futtatás félbeszakadt, nyugodtan futtasd le újra.
> Nem hoz létre duplikált adatot, és nem ír felül semmit.
>
> Ha „NOTICE: policy ... does not exist, skipping" üzeneteket látsz, az
> **nem hiba** — ezek csak tájékoztató üzenetek. Csak az „ERROR" számít.

### 3.2/b — A másik két SQL fájl

Ugyanezt a hét lépést **még kétszer** el kell végezned, a `migrations`
mappa másik két fájljával, **ebben a sorrendben**:

| Sorrend | Fájl | Mit csinál |
|---|---|---|
| 2. | `002_hirlevel.sql` | a hírlevél-feliratkozók táblája |
| 3. | `003_arak_extrak_fizetes.sql` | a végleges árak, a hat extra és az utalásos fizetés |

Mindhárom fájl **többször is futtatható**, tehát ha elbizonytalanodsz,
nyugodtan futtasd le újra.

✅ **Ellenőrzés a 003 után:** SQL Editor → New query → futtasd le ezt:

```sql
select slug, nev, max_fo, alap_ar, min_ejszaka from hazak order by slug;
```

Két sort kell kapnod: **Füge** és **Mandula**, mindkettő **2 fő**,
**49 000 Ft**, **2 éjszaka** minimum.

### Ha hibát kapsz

**`ERROR: 42710: type "foglalas_statusz" already exists`**

Ez a régi sémafájllal fordulhatott elő, ha egy korábbi futtatás félbeszakadt.
Megoldás: töltsd le a projekt **legújabb változatát**, és onnan másold be
a `001_foglalas_sema.sql` fájlt — az új változat többször is futtatható.

Ha teljesen tiszta lappal akarsz indulni (és **még nincs valódi vendégfoglalás**
az adatbázisban):

1. SQL Editor → New query
2. Másold be a `supabase/migrations/000_TORLES_tiszta_lap.sql` tartalmát
3. **Run** — ez mindent töröl
4. Új query, és futtasd le a `001_foglalas_sema.sql`-t elölről

> ⚠ A törlő szkript **minden adatot töröl**, foglalásokat és vendégadatot is.
> Csak addig használd, amíg tesztadatok vannak a rendszerben.

### 3.3 — A három kulcs kimásolása

1. Bal oldalt lent: **Project Settings** (fogaskerék) → **API**.
2. Három értéket kell kimásolnod. Nyiss egy Jegyzettömböt, és másold be
   mindhármat — a következő lépésben kelleni fognak:

| Amit keresel | Hogy néz ki |
|---|---|
| **Project URL** | `https://abcdefgh.supabase.co` |
| **anon public** kulcs | hosszú, `eyJ...` kezdetű |
| **service_role** kulcs | szintén `eyJ...`, de „secret"-ként jelölve |

> ⚠ A **service_role** kulcs a legveszélyesebb dolog ebben a projektben.
> Aki megszerzi, az minden vendégadatot és foglalást lát. Soha ne oszd meg
> senkivel, és ne tedd fel a GitHubra. Csak a Vercel beállításaiba kerül,
> ahol titkosítva tárolják.

✅ **Kész, ha:** mindhárom érték megvan a jegyzeteidben.

---

<a name="4-lepes"></a>
## 4. lépés — Vercel (az oldal közzététele)

**Mit csinálsz:** élesíted az oldalt egy ideiglenes címen.
**Mennyi idő:** 20 perc. **Ez a jutalomlépés** — a végén lesz működő címed.

1. **vercel.com** → **Sign Up** → **Continue with GitHub**.
2. Engedélyezd, hogy a Vercel lássa a tárolóidat.
3. **Add New** → **Project**.
4. A listában keresd meg a `szelidliget` tárolót → **Import**.
5. **Ne kattints még a Deploy-ra!** Előbb a beállítások.

### A kulcsok felvitele

Nyisd le az **Environment Variables** részt. Itt egyesével fel kell venned
a kulcsokat. Minden sornál: a bal mezőbe a **Name**, a jobb mezőbe a
**Value**, majd **Add**.

| Name | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | a Supabase Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | az anon kulcs |
| `SUPABASE_SERVICE_ROLE_KEY` | a service_role kulcs |
| `SIMPLEPAY_MERCHANT` | `PUBLICTESTHUF` |
| `SIMPLEPAY_SECRET_KEY` | `FxDa5w314kLlNseq2sKuVwaqZshZT5d6` |
| `SIMPLEPAY_SANDBOX` | `true` |
| `NEXT_PUBLIC_OLDAL_URL` | `https://www.szelidliget.hu` |

Ezek kellenek az induláshoz. A következő táblázat sorai **ráérnek később**
is — az oldal nélkülük is elindul, csak az adott rész marad üresen.
Bármikor hozzáadhatod őket a Vercelen (**Settings → Environment Variables**),
utána **Redeploy**.

| Name | Value | Mire kell |
|---|---|---|
| `NEXT_PUBLIC_ADOSZAM` | a Szekundum Kft. adószáma | lábléc, impresszum |
| `NEXT_PUBLIC_SZEKHELY` | a cég székhelye | lábléc, impresszum |
| `NEXT_PUBLIC_TELEFON` | pl. `+36 30 123 4567` | kapcsolat rovat |
| `NEXT_PUBLIC_FACEBOOK` | a Facebook-oldal címe | közösségi linkek |
| `NEXT_PUBLIC_INSTAGRAM` | az Instagram-oldal címe | közösségi linkek |
| `NEXT_PUBLIC_TIKTOK` | a TikTok-oldal címe | közösségi linkek |
| `UTALAS_KEDVEZMENYEZETT` | a számlatulajdonos neve | utalásos fizetés e-mailje |
| `UTALAS_SZAMLASZAM` | a bankszámlaszám | utalásos fizetés e-mailje |
| `UTALAS_IBAN` | az IBAN (külföldi vendégeknek) | utalásos fizetés e-mailje |
| `UTALAS_HATARIDO_NAP` | pl. `3` — hány napja van utalni | utalásos fizetés e-mailje |
| `CRON_SECRET` | egy általad kitalált hosszú jelszó | az érkezés előtti emlékeztető |
| `ADMIN_JELSZO` | az admin felület jelszava | admin belépés |
| `ADMIN_SESSION_TITOK` | egy másik hosszú, kitalált jelszó | az admin munkamenet aláírása |

> **Az utalásos sorok nélkül** a vendég még tud utalásos fizetést
> választani, de az e-mailben nem lesz számlaszám. Amint megvannak az
> adatok, vidd fel őket, és onnantól automatikusan mennek.

> **A `CRON_SECRET`, `ADMIN_SESSION_TITOK` és `ADMIN_JELSZO` értékét te találod ki.**
> Legyen hosszú és kitalálhatatlan — pl. három-négy véletlen szó egybeírva,
> számokkal megtűzdelve. Mentsd el őket a jegyzeteid közé.

A SimplePay soroknál most a **nyilvános teszt-adatokat** vitted fel. Ezekkel
próbálhatod ki a fizetést valódi pénz nélkül. Az éles adatokra a 9. lépésben
váltasz.

A Resend kulcsát a 6. lépésben adjuk hozzá.

6. Most kattints a **Deploy** gombra. 1–2 percig tart.

✅ **Kész, ha:** konfettit látsz, és kapsz egy címet
(`szelidliget-valami.vercel.app`).

### Ellenőrzés

Nyisd meg ezt a böngészőben (a saját címeddel):

```
https://szelidliget-valami.vercel.app/api/szabad-napok?haz=fuge&tol=2026-10-01&ig=2026-12-31
```

Ha ezt látod, **minden összeköttetés működik**:

```json
{"haz":"fuge","tol":"2026-10-01","ig":"2026-12-31","foglalt_napok":[]}
```

Az üres lista azt jelenti: még nincs foglalás. Pontosan ez a helyes.

> **A főoldalnak most már a valódi weboldalt kell mutatnia.** Ha még
> 404-et látsz, a legutóbbi kódfrissítés nem jutott fel a GitHubra —
> ellenőrizd, hogy a tárolódban ott van-e az `app/page.tsx` fájl.

> **Ha a fenti cím `{"hiba":"A naptár most nem érhető el."}` üzenetet ad**,
> az azt jelenti, hogy a Supabase-kulcsok nem jók vagy hiányoznak.
> Ellenőrizd őket a **Settings → Environment Variables** alatt, és
> **Redeploy** után próbáld újra.

---

<a name="5-lepes"></a>
## 5. lépés — Az árak felvitele

**Mit csinálsz:** beállítod a szezonális árakat.
**Mennyi idő:** 15 perc. Ez is teljesen böngészőből megy.

> **Ezt a lépést kihagyhatod, ha egyelőre egységes árral indulsz.**
> A `003_arak_extrak_fizetes.sql` már beállította az alapárat
> (mindkét ház **49 000 Ft/éj, 2 fő, min. 2 éjszaka**) és a hat extrát.
> Ez a lépés csak akkor kell, ha **szezononként eltérő** árat szeretnél.

Az alapár mindig érvényes, kivéve azokat az időszakokat, amikre itt külön
árat adsz meg.

1. Supabase → **SQL Editor** → **New query**.
2. Másold be ezt, **átírva a saját dátumaidra és áraidra**:

```sql
-- FŐSZEZON (nyár) — Füge
insert into arazas (haz_id, kezdet, veg, ar, min_ejszaka, megnevezes, prioritas)
select id, '2026-06-15', '2026-08-31', 55000, 3, 'Főszezon', 1
from hazak where slug = 'fuge';

-- FŐSZEZON (nyár) — Mandula
insert into arazas (haz_id, kezdet, veg, ar, min_ejszaka, megnevezes, prioritas)
select id, '2026-06-15', '2026-08-31', 62000, 3, 'Főszezon', 1
from hazak where slug = 'mandula';

-- SZILVESZTER
insert into arazas (haz_id, kezdet, veg, ar, min_ejszaka, megnevezes, prioritas)
select id, '2026-12-29', '2027-01-02', 89000, 4, 'Szilveszter', 10
from hazak where slug = 'fuge';

insert into arazas (haz_id, kezdet, veg, ar, min_ejszaka, megnevezes, prioritas)
select id, '2026-12-29', '2027-01-02', 98000, 4, 'Szilveszter', 10
from hazak where slug = 'mandula';
```

3. **Run**.

**Mit jelentenek a mezők:**

| Mező | Jelentése |
|---|---|
| `kezdet`, `veg` | Az időszak, amikor ez az ár érvényes |
| `ar` | Forint / éjszaka |
| `min_ejszaka` | Ennyi éjszakánál rövidebbre nem lehet foglalni |
| `megnevezes` | Csak neked, hogy tudd, mi ez |
| `prioritas` | **Ha két időszak átfedi egymást, a nagyobb szám nyer.** |

A `prioritas` a trükkös. Példa: a főszezon júniustól augusztusig tart (1-es
prioritás), a szilveszter december végén (10-es). Ha egy ünnepi ár beleesne
a főszezonba, a nagyobb prioritás miatt az ünnepi ár érvényesül — nem kell
kettévágnod a főszezont.

### Az extrák

Az extrák már benne vannak az adatbázisban a `003`-as SQL futtatása óta:

| Extra | Ár |
|---|---|
| Lovaskocsikázás | 35 000 Ft |
| Gourmet reggeli kosár | 19 900 Ft |
| Sajttál borozáshoz | 11 900 Ft |
| Születésnapi bekészítés | ár kérésre |
| Házassági évforduló bekészítés | ár kérésre |
| Leánykérés bekészítés | ár kérésre |

Az „ár kérésre" azt jelenti, hogy az adatbázisban **0 Ft** szerepel. Az
űrlapon ilyenkor nem összeg látszik, hanem az „Ár kérésre" felirat, és a
végösszeghez nem ad hozzá semmit — a vendég megjelöli, ti pedig e-mailben
egyeztettek róla.

**Ha árat adnál egy ilyen extrának**, elég ennyi (SQL Editor → New query):

```sql
update extrak set ar = 15000 where slug = 'szuletesnap';
```

**Ha új extrát vennél fel**, a minta:

```sql
insert into extrak (slug, ar, ejszakankent, aktiv)
values ('kenyezteto', 24000, false, true);

insert into extrak_forditas (extra_id, nyelv, nev, leiras)
select id, 'hu', 'Kényeztető csomag', 'Fürdőköntös, illóolajok, pezsgő.'
from extrak where slug = 'kenyezteto';

insert into extrak_forditas (extra_id, nyelv, nev, leiras)
select id, 'en', 'Pamper package', 'Bathrobes, essential oils, sparkling wine.'
from extrak where slug = 'kenyezteto';
```

Az `ejszakankent` mező dönti el, hogy az ár éjszakánként szorzódik-e
(`true`) vagy egyszer számít (`false`).

**Ha el akarsz rejteni egy extrát** anélkül, hogy törölnéd:

```sql
update extrak set aktiv = false where slug = 'kenyezteto';
```

✅ **Kész, ha:** a Table Editorban az `arazas` és `extrak` táblákban ott
vannak a soraid.

---

<a name="6-lepes"></a>
## 6. lépés — Resend (az e-mailek)

**Mit csinálsz:** beállítod, hogy a visszaigazoló e-mailek kimenjenek.
**Mennyi idő:** 20 perc + várakozás a DNS-re.

### 6.1 — Regisztráció

1. Menj a **resend.com** oldalra, regisztrálj.
2. Bal oldalt: **Domains** → **Add Domain**.
3. Írd be: `szelidliget.hu` → **Add**.

### 6.2 — A DNS rekordok

Most kapsz 3–4 sornyi adatot. Ezeket oda kell felvinned, ahol a domaint
regisztráltad.

A Resend képernyőjén valami ilyet látsz:

| Type | Name | Value |
|---|---|---|
| MX | send | feedback-smtp.eu-west-1.amazonses.com |
| TXT | send | v=spf1 include:amazonses.com ~all |
| TXT | resend._domainkey | p=MIGfMA0GCSq... |

1. Lépj be a domain-szolgáltatód felületére.
2. Keresd a **DNS beállítások** / **DNS kezelő** menüpontot.
3. Vidd fel egyesével a rekordokat. **Pontosan másold** — egy elgépelt
   karakter miatt nem fog működni.
4. Mentés.

### 6.3 — Várakozás és ellenőrzés

A DNS-terjedés 10 perctől néhány óráig tart. A Resend oldalán a domain
mellett **„Verified"** felirat fog megjelenni, ha kész.

> **Miért fontos ez?** DNS-beállítás nélkül is elmennek az e-mailek, de a
> Gmail és a többiek **spam mappába teszik** őket. A vendég azt fogja hinni,
> hogy nem kapott visszaigazolást.

### 6.4 — Az API kulcs

1. Resend → **API Keys** → **Create API Key**.
2. Név: `szelidliget`, jogosultság: **Sending access**.
3. Másold ki a kulcsot (`re_` kezdetű) — **csak egyszer mutatja meg**.
4. Menj a **Vercel** → a projekted → **Settings** → **Environment Variables**,
   és vedd fel ezt a kettőt:

| Name | Value |
|---|---|
| `RESEND_API_KEY` | a most kimásolt `re_...` kulcs |
| `EMAIL_FELADO` | `Szelid Liget <foglalas@szelidliget.hu>` |

5. **Fontos:** menj a **Deployments** fülre, a legfelső sor jobb szélén
   **…** → **Redeploy**. Új kulcs csak újratelepítés után lép életbe.

✅ **Kész, ha:** a domain „Verified", és a két érték fent van a Verceln.

---

<a name="emlekezteto"></a>
## 6.5 — Érkezés előtti emlékeztető

**Mit csinálsz:** semmit — csak ellenőrzöd. **Mennyi idő:** 2 perc.

A rendszer **naponta reggel 9-kor** megnézi, kinek van 3 nap múlva
érkezése, és küld neki egy emlékeztető e-mailt (érkezési idő, cím,
útvonal, házirend). Mindenki **csak egyszer** kapja meg.

Ehhez nem kell beállítanod semmit: a projektben lévő `vercel.json` fájl
mondja meg a Vercelnek, hogy ezt futtassa. Két dolog kell hozzá:

1. a `CRON_SECRET` környezeti változó (a 4. lépésben vitted fel), és
2. hogy a Resend már működjön (6. lépés).

**Ellenőrzés:** Vercel → a projekted → **Settings** → **Cron Jobs**.
Ott kell látnod egy sort: `/api/feladat/emlekezteto`, napi 9:00.

> A Vercel ingyenes csomagja **napi egy** időzített futást enged
> projektenként. Ez pontosan egy — tehát belefér.

**Ha az időpontot át akarod írni**, a `vercel.json` fájlban a
`"schedule": "0 9 * * *"` sor az. Az első szám a perc, a második az óra
(UTC szerint). Például `"0 6 * * *"` = reggel 8 magyar idő szerint nyáron.

---

<a name="7-lepes"></a>
## 7. lépés — A domain rákötése

**Mennyi idő:** 15 perc + DNS-várakozás.

1. Vercel → a projekted → **Settings** → **Domains**.
2. Írd be: `szelidliget.hu` → **Add**.
3. Írd be azt is: `www.szelidliget.hu` → **Add**.
4. A Vercel képernyőjén megjelenik, milyen DNS rekordot kell felvenned.
   Jellemzően így néz ki:

| Type | Name | Value |
|---|---|---|
| A | @ | `76.76.21.21` |
| CNAME | www | `cname.vercel-dns.com` (vagy hasonló) |

> **Mindig azt az értéket használd, amit a Vercel a saját képernyőjén ír ki.**
> Az A rekord IP-je állandó, de a CNAME értéke projektenként eltérhet
> (pl. `cname.vercel-dns-0.com`). A fenti táblázat csak azért van itt, hogy
> tudd, körülbelül mit fogsz látni.

5. Vidd fel ezeket a domain-szolgáltatódnál, ugyanott, ahol a Resend
   rekordokat is felvitted.

A terjedés pár perctől 24 óráig tart. A Vercel oldalán zöld pipa jelzi,
ha kész.

✅ **Kész, ha:** a **www.szelidliget.hu** megnyílik a böngészőben.

---

<a name="8-lepes"></a>
## 8. lépés — Ha szerkesztened kell: Codespaces

**Ezt a lépést nyugodtan kihagyhatod**, amíg nem akarsz kódot módosítani
vagy tesztet futtatni. Akkor térj vissza ide, ha kell.

A Codespaces egy teljes fejlesztői környezet a böngészőben. Telepítést nem
igényel, és minden benne van, amire szükség lehet.

### Az indítása

1. Menj a GitHubon a `szelidliget` tárolódhoz.
2. Zöld **Code** gomb → **Codespaces** fül → **Create codespace on main**.
3. Az első indítás 1–2 perc. Utána egy VS Code jelenik meg a böngészőben.

### Amit csinálhatsz benne

Alul van egy terminál (ha nem, a felső menüben **Terminal → New Terminal**).

**Az árszámítás tesztelése** — ez ellenőrzi, hogy a pénzügyi számítások jók:

```
npm install
npm test
```

Az `npm install` egyszer kell, 1–3 percig tart. A `npm test` végén ezt kell
látnod: `# pass 15` és `# fail 0`.

**A módosítások mentése:** ha szerkesztesz egy fájlt, bal oldalt a
forráskezelő ikonnál (elágazás alakú) beírsz egy rövid leírást, és
rákattintasz a **Commit** majd **Sync / Push** gombra. A Vercel ezt
automatikusan észreveszi, és újratelepíti az oldalt.

### A keret

Havi 120 core-óra jár ingyen. A legkisebb (2 magos) gépen ez kb. 60 óra
tényleges használat — bőven elég alkalmi szerkesztéshez.

> **Fontos:** ha nem használod, **állítsd le**. Bal lent a Codespaces
> menüben: **Stop Current Codespace**. Különben tovább számolja az órákat.
> Ha elfogy a keret, egyszerűen leáll — bankkártya nélkül nem terhel.

---

<a name="9-lepes"></a>
## 9. lépés — SimplePay összekötése

**Ezt csak akkor csináld, ha megjött a SimplePay szerződés.**

### 9.1 — Az IPN cím megadása

Az „IPN" az az üzenet, amit a SimplePay küld a rendszerednek, amikor valaki
fizetett. **Enélkül a foglalások örökre „függőben" maradnának**, mert a
rendszer nem tudná meg, hogy megjött a pénz.

1. Lépj be a SimplePay kereskedői fiókodba.
2. Keresd az **IPN URL** vagy **Értesítési cím** beállítást.
3. Írd be pontosan ezt:

```
https://www.szelidliget.hu/api/simplepay/ipn
```

### 9.2 — A végpontok ellenőrzése

> ⚠ **Ezt kérd meg valakit, aki ért hozzá.** A `lib/simplepay.ts` fájl
> elején van két webcím (sandbox és éles). Ezeket a SimplePay időnként
> változtatja. Ha elavult, a fizetés némán elszáll. A kereskedői
> dokumentációban ellenőrizhető.

### 9.3 — Élesre váltás

A Vercelen (**Settings → Environment Variables**) írd át a három SimplePay
értéket. Mindegyiknél a ceruza ikonnal szerkesztheted:

| Name | Új érték |
|---|---|
| `SIMPLEPAY_MERCHANT` | az éles MERCHANT azonosítód |
| `SIMPLEPAY_SECRET_KEY` | az éles SECRET KEY |
| `SIMPLEPAY_SANDBOX` | `false` |

Utána: **Deployments** → a legfelső sor jobb szélén **…** → **Redeploy**.
A változások csak újratelepítés után lépnek életbe.

✅ **Kész, ha:** az IPN cím be van állítva, és az éles kulcsok fent vannak.

---

<a name="10-lepes"></a>
## 10. lépés — Tesztelés élesítés előtt

**Ne hagyd ki.** Itt derül ki, ha valami félre van kötve — jobb most,
mint egy valódi vendégnél.

Amíg `SIMPLEPAY_SANDBOX=true`, valódi pénz nem mozdul. A tesztkártyaszámokat
a SimplePay dokumentációjában találod.

### A lista

- [ ] **Sikeres fizetés.** Foglalj le egy időszakot, fizess tesztkártyával.
  → A Supabase `foglalasok` táblájában a státusz `kifizetve` lesz.
  → Megérkezik a visszaigazoló e-mail.

- [ ] **Megszakított fizetés.** Indíts foglalást, majd a fizetőoldalon
  kattints a Mégse gombra.
  → A foglalás **nem** marad `kifizetve` állapotban.

- [ ] **Dupla foglalás.** Próbáld ugyanarra a házra, ugyanarra az időszakra
  kétszer lefoglalni.
  → A második hibaüzenetet kap, nem jön létre.

- [ ] **Dupla e-mail.** Fizess ki egy foglalást, és nézd meg a postafiókod.
  → **Csak egy** visszaigazoló érkezik, nem kettő.

- [ ] **Angol nyelv.** Foglalj angol nyelvet választva.
  → Az e-mail angolul érkezik.

- [ ] **Minimum éjszaka.** Próbálj 1 éjszakát foglalni.
  → Hibaüzenetet kapsz.

- [ ] **Múltbeli dátum.** Próbálj tegnapra foglalni.
  → Hibaüzenetet kapsz.

### Amit a Supabase-ban ellenőrizhetsz

Table Editor → `foglalasok` tábla: itt látod az összes foglalást és
a státuszukat. A `fizetesek` táblában minden fizetési kísérlet nyoma megvan,
az `email_naplo`-ban pedig hogy ment-e ki e-mail.

> **Az első négy pont közül a 3. és 4. már le van tesztelve** valódi
> adatbázison (a túlfoglalás-védelem és az ismételt értesítés kezelése).
> Azért szerepelnek mégis a listán, mert éles környezetben, a te
> beállításaiddal is látni akarod őket működni.

---

<a name="11-lepes"></a>
## 11. lépés — Élesítés

Mielőtt az első valódi vendég foglalna:

### Jogi dokumentumok

Négy jogi oldal **már fent van** az oldalon, magyarul és angolul is
(a lábléc linkjei):

| Oldal | Cím | Állapot |
|---|---|---|
| ÁSZF | `/aszf` | **vázlat** |
| Adatvédelmi tájékoztató | `/adatvedelem` | **vázlat** |
| Házirend | `/hazirend` | **vázlat** |
| Impresszum | `/impresszum` | vázlat, a cégadatokat a környezeti változókból veszi |

> ⚠ **Ezek vázlatok, nem ügyvédi munka.** A saját adataitokkal,
> a megbeszélt lemondási szabályokkal és a SimplePay által előírt
> adattovábbítási nyilatkozattal készültek — de **élesítés előtt
> nézesd át őket ügyvéddel**. Különösen a lemondási és visszatérítési
> feltételeket, mert azok pénzügyi kötelezettséget jelentenek.

A szövegük a `lib/jogi.ts` fájlban van, és a 8. lépés (Codespaces)
szerint bármikor átírható.

- [ ] Ügyvédi átnézés megtörtént
- [ ] A cégadatok (adószám, székhely) fel vannak véve a Vercelen
- [ ] A lemondási szabály a valós gyakorlatotokat írja le

### Szakmai átnézés

> **Ezt komolyan javaslom.** Kérj meg egy tapasztalt fejlesztőt, hogy
> nézze át a kódot élesítés előtt — pár óra díjazásért. Nem azért, mert
> hibás, hanem mert pénzt és személyes adatot kezel, és egy negyedik szem
> olcsóbb, mint egy incidens.

Konkrétan ezt a hármat kérd, hogy nézze meg:

1. **Az IPN aláírás-ellenőrzés és a nyugtázás** — helyes-e
   (`app/api/simplepay/ipn/route.ts`)
2. **A service_role kulcs** — tényleg sehol nem szivárog-e a böngészőbe
3. **A Supabase RLS szabályok** — valódi adatokon kipróbálva

Meghívhatod a GitHub-tárolóhoz: **Settings → Collaborators → Add people**.

### Első hetek

- Az első pár foglalást kísérd figyelemmel: jött-e e-mail, jó-e az összeg
- Nézd meg naponta a Supabase `foglalasok` tábláját
- Tartsd a SimplePay ügyfélszolgálat elérhetőségét kéznél

---

<a name="ha-valami-nem-mukodik"></a>
## Ha valami nem működik

### `ERROR: 42710: type "..." already exists` a séma futtatásakor

A séma egy része már lefutott korábban. Az útmutató 3.2 pontjának végén
(„Ha hibát kapsz") ott a megoldás. Röviden: a projekt legújabb változatában
lévő sémafájl többször is futtatható, azzal próbáld újra.

### A GitHubon egy `szelidliget` mappa van a fájlok helyett

A mappát húztad át, nem a tartalmát. Töröld a mappát (rákattintva
a **…** menüben **Delete directory**), és töltsd fel újra — előbb nyisd meg
a mappát, jelöld ki a benne lévő fájlokat, és azokat húzd át.

### „Hiányzik a NEXT_PUBLIC_SUPABASE_URL"

Nem vitted fel az összes kulcsot a Vercelre, vagy elgépelted a nevet.
A **Settings → Environment Variables** listában ellenőrizd mind a hetet,
és **Redeploy** után nézd meg újra.

### `Couldn't find any 'pages' or 'app' directory` a Vercelen

A feltöltés ellapította a mappaszerkezetet: az `app` mappa nem jutott fel,
a `route.ts` fájlok a gyökérbe kerültek. **Két eset van:**

**Ha a GitHubon egy `szelidliget` nevű mappa van, és abban a fájlok:**
a szerkezet jó, csak egy szinttel lejjebb. Nem kell újratölteni —
Vercel → **Settings** → **General** → **Root Directory** → **Edit** →
írd be: `szelidliget` → **Save**, majd **Deployments** → **…** → **Redeploy**.

**Ha nincs `app` mappa, és `route.ts` fájlok vannak a gyökérben:**
a szerkezet elveszett. Javítsd a **2.4/B** pont (Codespaces) szerint —
az kitakarítja a tárolót és helyesen építi újra.

### A Vercel „Build failed" hibát ír

Kattints a hibás telepítésre, és nézd meg a naplót. A leggyakoribb ok, hogy
a feltöltésnél kimaradt egy fájl. Ellenőrizd a GitHubon, hogy megvan-e
mind: `app`, `lib`, `public`, `supabase`, `package.json`, `tsconfig.json`,
`next.config.mjs`.

### A fizetés lemegy, de a foglalás „függőben" marad

Az IPN nincs jól beállítva. Ellenőrizd:
- a SimplePay fiókban a cím pontosan
  `https://www.szelidliget.hu/api/simplepay/ipn`
- a Vercel → **Logs** fülén látszik-e, hogy megérkezett-e az értesítés

### Nem érkeznek e-mailek

- A Resendben „Verified" a domain?
- A `RESEND_API_KEY` fent van a Verceln, és volt utána **Redeploy**?
- Nézd meg a Supabase `email_naplo` tábláját: ha ott van sor `sikeres = false`
  értékkel, a `hiba` oszlopban ott az ok.

### Véletlenül feltöltöttem a kulcsokat a GitHubra

1. **Azonnal cseréld le mindet:**
   - Supabase: Project Settings → API → a kulcsok mellett újragenerálás
   - Resend: töröld a kulcsot, hozz létre újat
   - SimplePay: hívd fel őket, kérj újat
2. Utána vidd fel az új értékeket a Vercelre, és **Redeploy**.

A csere ingyenes és gyors. A kikerült kulcs kockázata nem.

### Elfogyott a Codespaces keretem

Havonta újraindul. Addig is minden más működik — a Codespaces csak a
szerkesztéshez kell, az oldal futásához nem.

---

<a name="mi-van-kesz"></a>
## Mi van kész és mi nincs

**Kész, tesztelt:**
- Adatbázis, adatbázis-szintű túlfoglalás-védelemmel
- Árszámítás (szezonális árak, minimum éjszaka, extrák) — 15 teszt fedi
- Foglaltság-ellenőrzés és publikus naptár
- SimplePay fizetésindítás, IPN fogadás és hitelesítés
- Foglalás rögzítése, visszaigazoló e-mail magyarul és angolul
- **A weboldal felülete**, magyarul (`/`) és angolul (`/en`)
- **Működő foglalóűrlap** élő árszámítással
- **Fizetés utáni oldalak** (siker, hiba, megszakítva, lejárt)
- Oldaltérkép és robots.txt a keresőknek
- **Admin felület** jelszóval: foglaláslista, naptár, státuszkezelés
- **Hírlevél-hozzájárulás** GDPR-helyesen, külön listával
- **Banki átutalásos fizetés** a bankkártya mellett
- **Számlázási adatok** bekérése a foglalásnál
- **Érkezés előtti emlékeztető** e-mail, naponta automatikusan
- **Google Maps térkép** kattintásra töltődő módon (nem kell sütibanner)
- **Jogi oldalak** (ÁSZF, adatvédelem, házirend, impresszum) — vázlat szinten
- **Környék rovat** 12 programajánlóval, két nyelven

**Még hátravan:**
- **Számlázz.hu integráció** — a számla most kézzel készül. A beépítéshez
  Számlázz.hu Agent-kulcs kell; ez egy külön, nagyjából egynapos munka,
  amit a kulcs megérkezése után tudunk megcsinálni.
- Booking.com / Szallas.hu szinkron
- Lejárt, kifizetetlen foglalások automatikus felszabadítása
- **Valódi fotók a faházakról** — most növénymotívumok állnak a helyükön.
  Amint megvannak a képek, a `public/kepek` mappába kerülnek.
- **A jogi szövegek ügyvédi átnézése** (lásd a 11. lépést)

---

<a name="negy-dolog"></a>
## Négy dolog, amit érdemes tudnod a rendszerről

Nem kell értened a kódot, de ezek magyarázzák, miért megbízható:

**1. Az árat mindig a szerver számolja.**
A böngészőből csak a dátum, a ház és a létszám érkezik. Ha valaki átírja
a saját böngészőjében az összeget, az nem számít — a rendszer újraszámolja.

**2. A fizetést csak az IPN igazolja.**
A „sikeres fizetés" oldalt bárki megnyithatja a böngészőjében. Ezért
a rendszer csak a SimplePay szervertől jövő, aláírt üzenetet fogadja el
bizonyítéknak.

**3. A túlfoglalást az adatbázis akadályozza meg.**
Nem a program logikája, hanem maga az adatbázis: két átfedő foglalás
fizikailag nem tud létrejönni, akkor sem, ha ketten ugyanabban a
másodpercben foglalnak.

**4. A vendégadat nem publikus.**
A naptár csak dátumokat ad ki. Nevet, e-mailt, összeget a weboldal
látogatói semmilyen módon nem érhetnek el.

---

---

---

<a name="admin"></a>
## Admin felület

A foglalásokat a `www.szelidliget.hu/admin` címen kezeled, jelszóval védve.

### Beállítás (egyszer)

**1. Futtasd le a hírlevél-táblát** (ha még nem tetted): Supabase →
SQL Editor → New query → másold be a
`supabase/migrations/002_hirlevel.sql` tartalmát → **Run**.

**2. Vegyél fel két beállítást a Vercelen** (Settings → Environment
Variables):

| Name | Value |
|---|---|
| `ADMIN_JELSZO` | egy hosszú, erős jelszó (legalább 12 karakter) |
| `ADMIN_SESSION_TITOK` | egy másik hosszú, véletlen karaktersor (legalább 24) |

> ⚠ **Ez a jelszó védi az összes vendégadatot.** Ne olyat használj, amit
> máshol is. Jelszókezelővel generálj egyet, és ott is tárold.
> Ha nem adsz meg jelszót, az admin felületre **senki** nem tud belépni.
>
> A `ADMIN_SESSION_TITOK` a munkamenet aláírásához kell. Ha megváltoztatod,
> mindenki kiléptetve lesz — ez a leggyorsabb módja annak, hogy kizárj
> valakit, ha a jelszó kiszivárgott.

**3. Deployments → … → Redeploy**, majd nyisd meg a `/admin` címet.

### Mit tudsz vele

| Oldal | Mire jó |
|---|---|
| **Foglalások** | Lista szűrőkkel (közelgő, fizetésre vár, lemondott, összes), keresés név, e-mail, telefon vagy azonosító szerint. Felül: hány közelgő foglalás van, hány vár fizetésre, hány érkezik ma, és az idei bevétel. |
| **Egy foglalás** | Vendégadatok, tételes összeg, fizetési kísérletek, kiküldött e-mailek naplója, státusz módosítása, belső megjegyzés. |
| **Naptár** | Havi nézet mindkét házra. Zölddel a kifizetett, sárgával a fizetésre váró foglalás, szürkével a lezárt időszak. Egy napra kattintva a foglalás részleteihez jutsz. Innen zárhatsz le időszakot karbantartásra vagy saját használatra. |
| **Hírlevél** | A feliratkozók listája (lásd lent). |

### Fontos tudnivalók

- **A lemondás felszabadítja az időszakot**, és a weboldal naptárában újra
  foglalhatóvá teszi. Pénzt nem térít vissza — azt a SimplePay felületén
  kell elindítani.
- **A belső megjegyzést a vendég nem látja.** Csak neked szól.
- **A munkamenet 12 óra után lejár**, utána újra be kell lépni.
- Az admin oldalak `robots.txt`-ben tiltva vannak, tehát nem kerülnek
  keresőbe.

---

<a name="hirlevel"></a>
## Hírlevél

### A legfontosabb szabály

**A foglalók listája nem hírlevéllista.** Aki lefoglalt egy házat, a
*szolgáltatáshoz* adta meg az e-mail címét (visszaigazolás, számla,
érkezési tájékoztató). Marketinghez a GDPR külön, önkéntes és
bizonyítható hozzájárulást kíván. Ha a foglalók listájára küldesz
hírlevelet, az jogsértés.

### Hogyan oldja meg a rendszer

A foglalóűrlapon van egy **külön, alapból üres jelölőnégyzet**. Csak aki
ezt bepipálja, kerül a hírlevéllistára — és a rendszer eltárolja, mikor
és honnan adta a hozzájárulást. Ez a bizonyíték, ha valaha kérdés merül fel.

A feliratkozókat az **Admin → Hírlevél** oldalon látod.

### A kiküldés

A Resend **Audiences** és **Broadcasts** funkciója erre való: a
leiratkozást automatikusan kezeli, és minden levélbe leiratkozó linket
tesz. Külön szolgáltatóra nincs szükség.

1. Resend → **Audiences** → hozz létre egy közönséget (pl. „Szelid Liget")
2. Az admin felület listájából másold át a címeket (vagy exportáld a
   Supabase-ből CSV-be és importáld)
3. Resend → **Broadcasts** → írd meg a levelet, és küldd ki

> **Tipp:** évente néhány levél bőven elég egy szálláshelynél — szabad
> időpontok a szezon előtt, esetleg egy téli ajánlat. A túl gyakori
> levél leiratkozáshoz vezet.

<a name="hattervideo"></a>
## Háttérvideó a főoldalra (opcionális)

A nyitóképernyőn a nagy logó mögé tehető egy néma, végtelenített videó.
A kód készen áll rá, **alapból kikapcsolva** — addig a letisztult,
krémszínű változat látszik.

### Miért ne YouTube-beágyazás?

Kérdés szokott lenni, hogy YouTube-videót lehet-e háttérnek. Technikailag
igen, de itt nem javaslom:

- **Süti és GDPR.** A YouTube beágyazás sütiket helyez el, ezért
  süti-hozzájárulás kellene hozzá — vagy a látogató először egy
  „fogadd el" ablakot lát a főoldalon, nem a ligetet.
- **Márka és kezelőszervek.** Nehezen tüntethető el a YouTube logója,
  a felugró ajánlott videók és a lejátszósáv.
- **Lassabb.** Egy egész lejátszót tölt be egy háttérvideóhoz.

Helyette egy rövid, saját videófájl a jó megoldás: nincs süti, nincs
idegen márka, és gyorsabb is.

### Milyen videó kell?

| Tulajdonság | Ajánlás | Miért |
|---|---|---|
| Hossz | 6–12 másodperc | Észrevétlenül ismétlődik |
| Felbontás | 1920×1080 | Ennél nagyobb felesleges |
| Fájlméret | **5 MB alatt** | Mobilneten is gyorsan induljon |
| Hang | **nincs** | A böngésző csak néma videót indít el magától |
| Tartalom | lassú mozgás (víz, lombok, füst a dézsából) | Gyors vágás a szöveg olvasását zavarja |

A videót bármely videószerkesztőben rövidre lehet vágni és tömöríteni
(pl. a HandBrake nevű ingyenes programmal, „Web" előbeállítással).

### Bekapcsolás, három lépés

1. **Tedd be a fájlokat** a Codespace-ben a `public` mappába, pontosan
   ezekkel a nevekkel:
   - `hero.mp4` — maga a videó
   - `hero-poster.jpg` — egy állókép a videóból (ez látszik, amíg a
     videó töltődik, és ez marad annak, aki kikapcsolta a mozgást a
     rendszerében)

   Állóképet a videó első kockájából így készíthetsz a Codespace
   termináljában:

   ```bash
   ffmpeg -i public/hero.mp4 -vframes 1 -q:v 4 public/hero-poster.jpg
   ```

2. **Mentsd és töltsd fel:**

   ```bash
   git add -A
   git commit -m "Hattervideo"
   git push
   ```

3. **Kapcsold be a Vercelen:** Settings → Environment Variables → **Add**

   | Name | Value |
   |---|---|
   | `NEXT_PUBLIC_HERO_VIDEO` | `1` |

   Majd Deployments → **…** → **Redeploy**.

Kikapcsolni ugyanitt lehet: állítsd az értéket `0`-ra (vagy töröld), és
Redeploy.

### Amiről a kód gondoskodik

- A videó **néma és végtelenített**, ezért a böngészők engedik magától elindulni.
- Telefonon nem nyílik teljes képernyőre (`playsInline`).
- A videó fölé sötét fátyol kerül, és a logó világos változatára vált —
  enélkül a jel vékony vonalai elvesznének a mozgó képen.
- Aki a rendszerében **kikapcsolta a mozgást** (akadálymentesítési
  beállítás), annak csak az állókép jelenik meg.
- Ha a `NEXT_PUBLIC_HERO_VIDEO` nincs bekapcsolva, a videó **le sem
  töltődik** — nem fogyaszt adatot feleslegesen.

<a name="arculat"></a>
## Arculat és logófájlok

A paletta közvetlenül a logóból van mintavételezve:

| Szerep | Hex | Hol |
|---|---|---|
| Okker (kiemelés) | `#a97231` | gombok, címkék, növénymotívumok |
| Pala (szöveg) | `#3e4250` | szövegtörzs, sötét szakaszok |
| Víz (kék) | `#3b7ea0` | hullámmotívum, fizetés gomb |
| Krém (háttér) | `#fefcf5` | oldal háttere |

Betűk: **Jost** (címek, címkék — a logó betűzésének nagy térközét követi)
és **Source Serif 4** (szövegtörzs).

Logófájlok a `public/` mappában:

- `logo.png` — teljes embléma, krém háttérrel
- `logo-transparent.png` — teljes embléma, átlátszó háttérrel (ez megy az e-mailekbe)
- `logo-mark.png` — csak a jel, felirat nélkül (fejléc)
- `logo-mark-light.png` — világos változat sötét háttérhez (lábléc)
- `logo-light.png` — a teljes embléma világos változata (háttérvideó fölé)

A `demo/szelidliget-demo.html` egyetlen önálló fájl: a logók bele vannak
ágyazva, tehát bárhol megnyitható, tárhely és telepítés nélkül is. Ezt
küldheted bárkinek megmutatni.

---

## Fejlesztőnek

Ha fejlesztő olvassa: Next.js 14 (App Router) + Supabase (Postgres, RLS)
+ SimplePay v2.1 + Resend.

```bash
npm install
cp .env.example .env.local   # töltsd ki
npm run dev                  # http://localhost:3000
npm test                     # árszámítás, 15 teszt
```

A túlfoglalás elleni védelem egy `btree_gist` exclusion constraint a
`foglalasok` táblán (`daterange(erkezes, tavozas, '[)')`), nem alkalmazás-
szintű ellenőrzés. Az IPN feldolgozása idempotens. Az árszámítás tiszta
függvényekben van (`lib/pricing.ts`), a `foglalasok` / `vendegek` /
`fizetesek` táblákra szándékosan nincs RLS policy — csak a service_role
éri el őket szerveroldalról.
