/**
 * A megvásárolható ajándékutalvány paraméterei.
 *
 * Egy helyen állnak, mert három helyen kellenek: a vásárlási oldalon
 * (amit a vevő lát), a vásárlási végponton (ami az árat eldönti), és a
 * kódkiadásnál (ami a lejáratot beírja). Ha ezek elcsúsznának
 * egymástól, az árkülönbözet vitává válna.
 *
 * MÓDOSÍTÁS: ha az ajánlat változik, elég itt átírni — a már KIADOTT
 * kódokat viszont nem érinti, mert azokba a lejárat bele van írva.
 * Aki tavaly vett utalványt, a tavalyi feltételekkel váltja be.
 */
export const UTALVANY = {
  /** Hány éjszakára szól. A beváltáskor pontosan ennyinek kell lennie. */
  ejszakak: 3,
  /** A vételár forintban — és egyben a szállásdíj, amit kivált. */
  ar: 98000,
  /** Eddig váltható be. Az ÉRKEZÉS napja nem lehet ennél későbbi. */
  ervenyes_ig: '2027-12-20',
  /** Hány főre szól. Tájékoztató: a házak amúgy is két főre vannak. */
  fo: 2,
} as const;
