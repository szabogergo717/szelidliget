import Link from 'next/link';
import Image from 'next/image';

/**
 * A bejelentkezés után látható oldalak kerete: menüsáv és kilépés.
 * A belépőoldal NEM ezt használja, ezért ott nem jelenik meg a menü.
 */
export default function VedettLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin">
      <header className="admin-fejlec">
        <div className="admin-fejlec-belso">
          <Link href="/admin" className="admin-marka">
            <Image src="/logo-mark.png" alt="" width={100} height={58} />
            <span>ADMIN</span>
          </Link>
          <nav>
            <Link href="/admin">Foglalások</Link>
            <Link href="/admin/naptar">Naptár</Link>
            <Link href="/admin/hirlevel">Hírlevél</Link>
            <Link href="/" target="_blank" rel="noreferrer">Weboldal ↗</Link>
          </nav>
          <a href="/admin/kilepes" className="admin-kilep">Kilépés</a>
        </div>
      </header>
      <main className="admin-torzs">{children}</main>
    </div>
  );
}
