import type { Metadata } from 'next';
import './admin.css';

/**
 * Az admin terület külső kerete.
 *
 * Szándékosan CSAK a stílust és a metaadatot adja. A menüsáv és a
 * kilépés gomb a `(vedett)` csoport elrendezésében van, mert azokat
 * nem szabad látnia annak, aki még nem lépett be. Korábban itt voltak,
 * és a belépőoldalon is megjelentek — ezt javítottuk.
 */
export const metadata: Metadata = {
  title: 'Adminisztráció — Szelid Liget',
  // Vendégadatot tartalmaz: semmiképp ne kerüljön keresőbe.
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminKeret({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
