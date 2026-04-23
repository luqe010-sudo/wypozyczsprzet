import './globals.css';
import Navbar from '../components/Navbar';

const publicFormUrl = process.env.NEXT_PUBLIC_FORM_URL || process.env.FORM_URL || '';
const formSheetUrl = process.env.FORM_SHEET_URL || '';
const actionUrl = publicFormUrl || formSheetUrl;
const actionLabel = publicFormUrl ? 'Dodaj ogłoszenie' : 'Arkusz zgłoszeń';

export const metadata = {
  metadataBase: new URL('https://wypozycz.online'),
  title: 'Wynajem sprzętu budowlanego - Marketplace',
  description: 'Łatwo znajdź i wypożycz sprzęt budowlany w swojej okolicy. Darmowe ogłoszenia sprzętu budowlanego.',
  keywords: 'wynajem, sprzęt budowlany, koparki, ładowarki, wypożyczalnia, wrocław, dolny śląsk',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Wynajem sprzętu budowlanego - Marketplace',
    description: 'Łatwo znajdź i wypożycz sprzęt budowlany w swojej okolicy.',
    url: 'https://wypozycz.online',
    siteName: 'WypożyczSprzęt',
    locale: 'pl_PL',
    type: 'website',
  },
  verification: {
    google: 'UTKre7BkIREzsP437M9akUdcQ5ER_pIKUPDc6TUYD5g',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="pl">
      <body>
        <Navbar actionUrl={actionUrl} actionLabel={actionLabel} />
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
