import './globals.css';

const publicFormUrl = process.env.NEXT_PUBLIC_FORM_URL || process.env.FORM_URL || '';
const formSheetUrl = process.env.FORM_SHEET_URL || '';
const actionUrl = publicFormUrl || formSheetUrl;
const actionLabel = publicFormUrl ? 'Dodaj og\u0142oszenie' : 'Arkusz zg\u0142osze\u0144';

export const metadata = {
  title: 'Wynajem sprz\u0119tu budowlanego - Marketplace',
  description: '\u0141atwo znajd\u017a i wypo\u017cycz sprz\u0119t budowlany w swojej okolicy.',
  keywords: 'wynajem, sprz\u0119t budowlany, koparki, \u0142adowarki, wypo\u017cyczalnia',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pl">
      <body>
        <nav className="navbar">
          <div className="navbar-container">
            <a href="/" className="logo">
              {'Wypo\u017cycz'}<span>{'Sprz\u0119t'}</span>
            </a>
            <div className="nav-links">
              <a href="/">{'Strona główna'}</a>
              <a href="/kontakt">{'Kontakt'}</a>
              {actionUrl ? (
                <a
                  href="/dodaj-ogloszenie"
                  className="btn-primary"
                >
                  {actionLabel}
                </a>
              ) : (
                <span
                  className="btn-primary"
                  style={{ opacity: 0.6, cursor: 'not-allowed' }}
                  aria-disabled="true"
                >
                  {'Formularz niedost\u0119pny'}
                </span>
              )}
            </div>
          </div>
        </nav>
        <main>{children}</main>
        <footer className="footer">
          <div className="navbar-container">
            <p>
              &copy; {new Date().getFullYear()} {'Wypo\u017cyczSprz\u0119t Marketplace. Wszystkie prawa zastrze\u017cone.'}
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
