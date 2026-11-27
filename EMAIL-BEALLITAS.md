# foglalas@szelidliget.hu — Google Workspace beállítása

Ez az útmutató végigvezet azon, hogyan lesz a `foglalas@szelidliget.hu`
egy teljes értékű Gmail-fiók, böngészőből használva, küldéssel együtt.

**Mielőtt elkezded, olvasd el a 0. lépést.** Az a rész dönti el, hogy a
foglalási visszaigazolók továbbra is megérkeznek-e a vendégekhez.

---

## 0. lépés — A veszélyes pont: a DNS

A `szelidliget.hu` domainen MÁR fut egy levelezéssel kapcsolatos
beállítás: a **Resend**, ami a foglalási visszaigazolókat küldi ki.
Ennek saját DNS-rekordjai vannak.

Amikor a Google Workspace-t beállítod, te is DNS-rekordokat veszel fel.
Ha a kettő összeakad, a tünet nem az, hogy hibaüzenetet kapsz — hanem
az, hogy a vendégek **nem kapják meg** a visszaigazolást, vagy a
levélszemét mappában találják meg. Ez napokig észrevétlen maradhat.

Két rekordtípusnál fordulhat ez elő:

**MX** — ez mondja meg, hova érkezzen a levél. Egy névhez tartozó
MX-rekordok együtt érvényesek. A Resend általában egy **aldomainen**
(`send.szelidliget.hu`) tartja a sajátját, a Google viszont a
**gyökérre** (`szelidliget.hu`) kerül. Ha így van, nem ütköznek.

**SPF** — ez mondja meg, ki küldhet levelet a domain nevében. Ebből
**egy névhez csak EGY rekord tartozhat.** Ha már van egy SPF a
gyökéren, és felveszel mellé egy másodikat a Google-nek, akkor
**mindkettő érvénytelenné válik**. Ilyenkor nem új rekordot kell
felvenni, hanem a meglévőt kiegészíteni.

### A te zónád — 2026. november 27-én ellenőrizve

A `szelidliget.hu` zónájában ez van:

| Hosztnév | Típus | Mire mutat | Kié |
|---|---|---|---|
| `szelidliget.hu` | A | 216.198.79.1 | a weboldal (Vercel) |
| `www.szelidliget.hu` | CNAME | vercel-dns-017.com | a weboldal (Vercel) |
| `send.szelidliget.hu` | CNAME | send.forge.rmta.net | Resend |
| `rsend.szelidliget.hu` | CNAME | rsend-euw1.forge.rmta.net | Resend |
| `resend._domainkey.szelidliget.hu` | TXT | DKIM kulcs | Resend |
| `_dmarc.szelidliget.hu` | TXT | `v=DMARC1; p=none;` | közös |

**A lényeg: a gyökéren NINCS `v=spf1` rekord.** A Resend ugyanis
CNAME-alapú beállítást használ: az SPF-je és a visszaküldési címe a
`send.` és `rsend.` aldomainek mögött lakik, nem a gyökéren.

Ezért a Google SPF-jét **új rekordként** veheted fel, nem kell
összefésülni semmivel. A 4. lépésben szereplő „ha már van SPF" ág
rád nem vonatkozik.

A `_dmarc` rekord `p=none` módban van: csak figyel, nem utasít el
semmit. Ez most jó — a Google hozzáadása nem fog miatta elakadni.

### Amit még ellenőrizz

A képernyőképen az MX-rekordok szekciója nem látszott. A Rackhost
külön blokkban kezeli őket. Görgess végig a DNS zóna oldalán, és
nézd meg, van-e **MX rekordok** rész. Ha van benne bármi a
`szelidliget.hu` néven, azt a 3. lépés előtt egyeztessük.

### Amit most csinálj

Rackhost → bal oldalt **DNS zónák** → `szelidliget.hu`.

Írd ki (vagy készíts képernyőképet) **minden** rekordról, ami:

- `MX` típusú — bármelyik néven,
- `TXT` típusú és `v=spf1`-gyel kezdődik,
- `TXT` típusú és a nevében `_domainkey` szerepel (ez a DKIM),
- `TXT` típusú és a neve `_dmarc`.

Ezekhez a 3. lépésig **ne nyúlj hozzá**. A teljes listából fog
kiderülni, hogy a Google SPF-jét új rekordként vehetjük-e fel, vagy
a meglévőt kell bővíteni.

---

## 1. lépés — Workspace-fiók létrehozása

1. Nyisd meg a **workspace.google.com** oldalt, és kattints a
   **Get started / Kezdés** gombra.
2. **Cégnév:** Szekundum Kft. · **Alkalmazottak száma:** Csak én ·
   **Ország:** Magyarország.
3. Add meg a neved és egy **meglévő** e-mail címedet (ide küldi a
   Google az értesítéseket — ez lehet a Gmail-címed).
4. A kérdésre, hogy van-e domained: **Igen, van** → írd be:
   `szelidliget.hu`
5. **Felhasználónév:** `foglalas` → így lesz a cím
   `foglalas@szelidliget.hu`. Adj meg egy erős jelszót.
6. Bankkártya megadása. A Google általában ad egy próbaidőszakot;
   a pontos árat és a próbaidő hosszát a felület írja ki.

Ezután a Google átvisz egy beállítási varázslóba. Ott áll meg a
folyamat addig, amíg a DNS-rekordokat fel nem veszed.

---

## 2. lépés — A domain igazolása (ez biztonságos)

A Google ad egy **TXT** rekordot, ami így kezdődik:
`google-site-verification=...`

Ez csak hozzáad egy rekordot, semmit nem ír felül — ezt nyugodtan
felveheted.

Rackhost → **DNS zónák** → `szelidliget.hu` → **Új rekord**:

| Mező | Érték |
|---|---|
| Típus | TXT |
| Hosztnév | `szelidliget.hu` |
| Érték | amit a Google kiírt, teljes egészében |
| TTL | 3600 |

**A hosztnévnél a teljes nevet írd be**, ne `@`-ot: a Rackhost így
kezeli, ahogy a meglévő rekordjaidnál is látszik
(`_dmarc.szelidliget.hu`, `send.szelidliget.hu`).

Mentés után menj vissza a Google varázslójába, és kattints a
**Verify / Igazolás** gombra. Ha nem sikerül elsőre, várj 10–15 percet
és próbáld újra — a DNS terjedése időbe telik.

---

## 3. lépés — MX-rekordok (itt állj meg, ha bizonytalan vagy)

Ez az a lépés, ami **átirányítja a domainre érkező leveleket** a
Google-höz. Csak akkor csináld, ha a 0. lépésben kigyűjtött listában
a gyökéren (`@`) **nincs** más MX-rekord, vagy ha tudod, hogy az
törölhető.

A Google egyetlen rekordot kér:

| Mező | Érték |
|---|---|
| Típus | MX |
| Hosztnév | `szelidliget.hu` |
| Érték / Cél | `smtp.google.com` |
| Prioritás | `1` |
| TTL | alapérték |

Ha a Google varázslója ehelyett öt rekordot mutat (`ASPMX.L.GOOGLE.COM`
és társai), vedd fel azokat — az is működik, csak régebbi forma.

**A `send.szelidliget.hu` néven lévő MX-rekordot NE töröld.** Az a
Resendé, a visszaigazoló levelek kiküldéséhez kell.

---

## 4. lépés — SPF

Nézd meg a 0. lépésben kigyűjtött listát.

**Ha a gyökéren (`@`) NINCS `v=spf1` kezdetű TXT rekord**, vegyél fel
egy újat:

```
v=spf1 include:_spf.google.com ~all
```

**Ha a gyökéren MÁR VAN egy `v=spf1` kezdetű rekord**, akkor azt
**szerkeszd**, ne vegyél fel másodikat. A Google részét az `include`
elemek közé kell beszúrni, a lezáró `~all` elé. Például ha most ez áll
ott:

```
v=spf1 include:amazonses.com ~all
```

akkor ebből ez lesz:

```
v=spf1 include:amazonses.com include:_spf.google.com ~all
```

Egyetlen rekord, két `include`. **Két külön SPF rekord mindkettőt
elrontja.**

---

## 5. lépés — DKIM a Google-nek

A Workspace admin felületén (admin.google.com):
**Apps → Google Workspace → Gmail → Authenticate email**

Itt generálj egy kulcsot, és vedd fel a kapott TXT rekordot a
Rackhostnál. A neve jellemzően `google._domainkey`.

Ez nem ütközik a Resend DKIM-jével, mert az más néven van
(`resend._domainkey` vagy hasonló). Mindkettő elfér egymás mellett.

---

## 6. lépés — Ellenőrzés

Ezt a hármat nézd meg, mielőtt késznek tekinted:

1. **Érkezés:** küldj egy levelet egy másik fiókodból a
   `foglalas@szelidliget.hu` címre. Meg kell érkeznie a Workspace
   postafiókba (gmail.com-on bejelentkezve a `foglalas@` fiókkal).

2. **Küldés:** válaszolj rá onnan. A válasznak `foglalas@szelidliget.hu`
   feladóval kell megérkeznie, és **nem** a levélszemét mappába.

3. **A visszaigazolók TOVÁBBRA IS mennek:** ez a legfontosabb.
   Indíts egy próbafoglalást a weboldalon a saját címeddel, és
   nézd meg, megérkezik-e a visszaigazoló levél — és hogy a
   beérkezettek között, nem a spamben.

Ha a harmadik nem jön meg, vagy spambe esik, az SPF-et nézd meg
először: nagy eséllyel két `v=spf1` rekord van a gyökéren.

---

## Mi változik a weboldalon

Semmi. A `foglalas@szelidliget.hu` eddig is szerepelt mindenhol
kapcsolatként — ettől a beállítástól lesz mögötte valódi postafiók.
A visszaigazoló leveleket továbbra is a Resend küldi, nem a Google:
a kettőnek külön dolga van, és ez így helyes.
