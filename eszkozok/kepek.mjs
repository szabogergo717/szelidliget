/**
 * Képelőkészítő — a nyers fotókból weboldalra kész képeket csinál.
 *
 * MIÉRT KELL EZ
 * Egy fényképezőgépből kijövő fotó 8–20 MB. A weboldalon ennek a
 * minőségének a töredéke is tökéletesen kinéz, viszont a vendég
 * telefonján a nagy fájl 10–20 másodpercig töltődne. Ez a szkript
 * mindegyik képből több méretet készít modern formátumban (WebP),
 * és a weboldal utána mindig a képernyőhöz illőt adja.
 *
 * HOGYAN HASZNÁLD (Codespaces-ben, böngészőből)
 *
 *   1. Csinálj a projekt gyökerében egy `eredeti` mappát.
 *   2. Azon belül annyi almappát, ahány helyre képet akarsz tenni —
 *      a mappanevek listája a README „A fotók feltöltése" fejezetében van.
 *   3. Futtasd:  npm run kepek
 *
 * A MAPPA NEVE DÖNTI EL, HOVA KERÜL A KÉP. Például:
 *
 *   eredeti/hero/             → a nyitóképernyő háttere
 *   eredeti/fuge/             → a Füge ház
 *   eredeti/kornyek/csonakazas/  → a „Csónakázás" programleírás
 *
 * Amelyik mappa nincs meg vagy üres, azt a weboldal egyszerűen nem
 * mutatja — nem hiba, nem kell mindet feltölteni egyszerre.
 *
 * Az eredeti fájlok NEM kerülnek fel a GitHubra (a .gitignore kizárja
 * az `eredeti` mappát) — csak a belőlük készült, kis méretű változatok.
 *
 * A képek sorrendje a fájlnév szerinti ábécésorrend. Ha adott sorrendet
 * szeretnél, nevezd el őket így: 01-terasz.jpg, 02-jakuzzi.jpg, …
 */

import { mkdir, readdir, writeFile, rm, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

let sharp;
try {
  sharp = (await import('sharp')).default;
} catch {
  console.error(
    '\nHiányzik a képfeldolgozó csomag. Futtasd ezt egyszer:\n\n' +
      '  npm install\n'
  );
  process.exit(1);
}

// ---------- beállítások ----------

/**
 * A méretek, amiket előállítunk. A böngésző ezek közül választ.
 * A 2000 a nyitóképernyő és a nagyított nézet miatt kell: ott a kép
 * a teljes képernyőt kitölti.
 */
const MERETEK = [480, 960, 1600, 2000];

/** WebP tömörítés. 78 körül már nem látszik a veszteség fotóknál. */
const MINOSEG = 78;

/**
 * A csoportok megnevezése. Csak azoknak kell ide sor, amelyeknek a
 * neve megjelenik a weboldalon (a galéria fülein). A többi mappa is
 * működik enélkül — a nevéből lesz a megnevezés.
 */
const NEVEK = {
  hero: { hu: 'Nyitókép', en: 'Cover' },
  fuge: { hu: 'Füge', en: 'Füge' },
  mandula: { hu: 'Mandula', en: 'Mandula' },
  liget: { hu: 'A liget', en: 'The grove' },
  kiemelt: { hu: 'Kiemelt szolgáltatások', en: 'Highlights' },
  lakoter: { hu: 'Lakótér', en: 'Living space' },
  konyha: { hu: 'Konyha', en: 'Kitchen' },
  biztositunk: { hu: 'Amit biztosítunk', en: 'Included for you' },
};

/**
 * Ezek a csoportok a galéria („Nézz körül") szakaszban kapnak fület.
 * A többi kép a saját helyén jelenik meg, a galériában nem.
 */
const GALERIABA = ['fuge', 'mandula', 'liget'];

const BEMENET = 'eredeti';
const KIMENET = path.join('public', 'kepek');
const LEIRO = path.join('lib', 'galeriaAdat.json');

const KEPKITERJESZTESEK = new Set([
  '.jpg', '.jpeg', '.png', '.webp', '.tif', '.tiff', '.heic', '.heif', '.avif',
]);

/** Ennél mélyebbre nem megyünk a mappákban. */
const MAX_MELYSEG = 2;

// ---------- segédek ----------

/** Fájlnévből olvasható megnevezés: '02-nagy_terasz.jpg' → 'nagy terasz' */
function olvashatoNev(fajl) {
  return path
    .basename(fajl, path.extname(fajl))
    .replace(/^\d+[-_\s]*/, '')
    .replace(/[-_]+/g, ' ')
    .trim();
}

const EKEZETEK = { á:'a', é:'e', í:'i', ó:'o', ö:'o', ő:'o', ú:'u', ü:'u', ű:'u' };

/** Biztonságos, ékezetmentes név a weboldalra. */
function tisztaNev(szoveg) {
  return szoveg
    .toLowerCase()
    .replace(/[áéíóöőúüű]/g, (c) => EKEZETEK[c] ?? c)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Mappanév → csoportkulcs. Itt az aláhúzás MEGMARAD, mert az extrák
 * mappanevének pontosan egyeznie kell az adatbázisbeli azonosítóval
 * (pl. `gourmet_reggeli`) — különben nem találnánk meg a képét.
 */
function tisztaKulcs(szoveg) {
  return szoveg
    .toLowerCase()
    .replace(/[áéíóöőúüű]/g, (c) => EKEZETEK[c] ?? c)
    .replace(/[^a-z0-9_]+/g, '-')
    .replace(/^[-_]+|[-_]+$/g, '');
}

function fajlAlap(fajl) {
  return tisztaNev(path.basename(fajl, path.extname(fajl)));
}

function mb(bajt) {
  return (bajt / 1024 / 1024).toFixed(1) + ' MB';
}

/** Csoportnévből olvasható cím, ha nincs külön megadva. */
function csoportCime(kulcs) {
  if (NEVEK[kulcs]) return NEVEK[kulcs];
  const utolso = kulcs.split('/').pop() ?? kulcs;
  const szep = utolso.replace(/[-_]+/g, ' ');
  const nagybetus = szep.charAt(0).toUpperCase() + szep.slice(1);
  return { hu: nagybetus, en: nagybetus };
}

// ---------- a munka ----------

/**
 * Végigjárja az `eredeti` mappát, és összeszedi, melyik almappában
 * vannak képek. Egy almappa = egy csoport.
 */
async function csoportokKeresese(mappa, elotag = '', melyseg = 0) {
  const talalt = [];
  let bejegyzesek;
  try {
    bejegyzesek = await readdir(mappa, { withFileTypes: true });
  } catch {
    return talalt;
  }

  const kepek = bejegyzesek
    .filter((b) => b.isFile() && KEPKITERJESZTESEK.has(path.extname(b.name).toLowerCase()))
    .map((b) => b.name)
    .sort((a, b) => a.localeCompare(b, 'hu'));

  if (kepek.length && elotag) {
    talalt.push({ kulcs: elotag, mappa, fajlok: kepek });
  } else if (kepek.length && !elotag) {
    console.log(
      '  ⚠ Közvetlenül az "eredeti" mappában is vannak képek. Ezeket kihagyom —\n' +
        '    tedd őket almappába (pl. eredeti/liget/), hogy tudjam, hova valók.'
    );
  }

  if (melyseg < MAX_MELYSEG) {
    for (const b of bejegyzesek.filter((x) => x.isDirectory())) {
      const ujKulcs = elotag ? `${elotag}/${tisztaKulcs(b.name)}` : tisztaKulcs(b.name);
      talalt.push(
        ...(await csoportokKeresese(path.join(mappa, b.name), ujKulcs, melyseg + 1))
      );
    }
  }

  return talalt;
}

async function csoportFeldolgozas({ kulcs, mappa, fajlok }) {
  const kimenetiMappa = path.join(KIMENET, kulcs);
  await mkdir(kimenetiMappa, { recursive: true });

  const kepek = [];
  let eredetiMeret = 0;
  let ujMeret = 0;
  const hasznaltNevek = new Set();

  for (const fajl of fajlok) {
    const utvonal = path.join(mappa, fajl);

    let adat;
    try {
      adat = await sharp(utvonal, { failOn: 'none' }).rotate().metadata();
    } catch (e) {
      console.log(`  ⚠ ${fajl}: nem sikerült megnyitni, kihagyom (${e.message})`);
      continue;
    }

    if (!adat.width || !adat.height) {
      console.log(`  ⚠ ${fajl}: nem olvasható a mérete, kihagyom`);
      continue;
    }

    // Az EXIF elfordítás után a szélesség és magasság helyet cserélhet.
    const fekvo = (adat.orientation ?? 1) < 5;
    const szeles = fekvo ? adat.width : adat.height;
    const magas = fekvo ? adat.height : adat.width;

    // Egyedi név, hogy két azonos nevű fotó ne írja felül egymást.
    const alap = fajlAlap(fajl) || 'kep';
    let nev = alap;
    let n = 2;
    while (hasznaltNevek.has(nev)) nev = `${alap}-${n++}`;
    hasznaltNevek.add(nev);

    // A sharp nem mindig adja meg a fájlméretet, ezért a lemezről kérdezzük.
    try {
      eredetiMeret += (await stat(utvonal)).size;
    } catch {
      /* a méret csak tájékoztató adat, nem állítjuk meg miatta a futást */
    }

    const valtozatok = [];
    for (const meret of MERETEK) {
      // Fölnagyítani nincs értelme: a kicsi képből nem lesz nagyobb részlet.
      if (meret > szeles) continue;
      const kimeneti = path.join(kimenetiMappa, `${nev}-${meret}.webp`);
      const eredmeny = await sharp(utvonal, { failOn: 'none' })
        .rotate()
        .resize({ width: meret, withoutEnlargement: true })
        .webp({ quality: MINOSEG })
        .toFile(kimeneti);
      ujMeret += eredmeny.size;
      valtozatok.push({ szelesseg: meret, fajl: `/kepek/${kulcs}/${nev}-${meret}.webp` });
    }

    // Ha a kép minden méretnél kisebb volt, legalább egy változat kell.
    if (!valtozatok.length) {
      const kimeneti = path.join(kimenetiMappa, `${nev}-${szeles}.webp`);
      const eredmeny = await sharp(utvonal, { failOn: 'none' })
        .rotate()
        .webp({ quality: MINOSEG })
        .toFile(kimeneti);
      ujMeret += eredmeny.size;
      valtozatok.push({ szelesseg: szeles, fajl: `/kepek/${kulcs}/${nev}-${szeles}.webp` });
    }

    kepek.push({
      nev,
      leiras: olvashatoNev(fajl),
      szelesseg: szeles,
      magassag: magas,
      valtozatok,
    });
  }

  return { kepek, eredetiMeret, ujMeret };
}

async function main() {
  if (!existsSync(BEMENET)) {
    console.error(
      `\nNincs "${BEMENET}" mappa.\n\n` +
        'Csinálj egyet a projekt gyökerében, és tedd bele a képeket\n' +
        'almappákba. A mappanevek listája a README\n' +
        '„A fotók feltöltése" fejezetében van.\n'
    );
    process.exit(1);
  }

  console.log('Képek keresése…');
  const csoportok = await csoportokKeresese(BEMENET);

  if (!csoportok.length) {
    console.error(
      `\nNem találtam képet az "${BEMENET}" mappa almappáiban.\n` +
        'Ellenőrizd, hogy a fotók almappában vannak-e (pl. eredeti/fuge/).\n'
    );
    process.exit(1);
  }

  // Tiszta lap: a korábbi futtatás képei törlődnek, hogy ne maradjon
  // olyan fájl, ami már nincs az eredetik között.
  if (existsSync(KIMENET)) await rm(KIMENET, { recursive: true, force: true });
  await mkdir(KIMENET, { recursive: true });

  const leiro = { keszult: new Date().toISOString().slice(0, 10), csoportok: [] };
  let osszEredeti = 0;
  let osszUj = 0;

  for (const csoport of csoportok.sort((a, b) => a.kulcs.localeCompare(b.kulcs))) {
    const { kepek, eredetiMeret, ujMeret } = await csoportFeldolgozas(csoport);
    osszEredeti += eredetiMeret;
    osszUj += ujMeret;
    if (!kepek.length) continue;

    leiro.csoportok.push({
      kulcs: csoport.kulcs,
      cim: csoportCime(csoport.kulcs),
      galeriaban: GALERIABA.includes(csoport.kulcs),
      kepek,
    });
    console.log(`  ${csoport.kulcs}: ${kepek.length} kép`);
  }

  await writeFile(LEIRO, JSON.stringify(leiro, null, 2) + '\n', 'utf8');

  const db = leiro.csoportok.reduce((o, c) => o + c.kepek.length, 0);
  console.log('\n────────────────────────────────');
  console.log(`Kész: ${db} kép, ${leiro.csoportok.length} helyre.`);
  console.log(`Eredeti méret:  ${mb(osszEredeti)}`);
  console.log(`Weboldalra:     ${mb(osszUj)}`);
  console.log('');
  console.log('A képek a public/kepek mappába kerültek, a leíró a lib/galeriaAdat.json fájlba.');
  console.log('Most már mentheted:  git add -A && git commit -m "Fotok" && git push');
}

main().catch((e) => {
  console.error('\nHiba a feldolgozás közben:', e.message);
  process.exit(1);
});
