import './globals.css';
import Navbar from '../components/Navbar';
import CookieConsent from '../components/CookieConsent';
import Script from 'next/script';

const publicFormUrl = process.env.NEXT_PUBLIC_FORM_URL || process.env.FORM_URL || '';
const formSheetUrl = process.env.FORM_SHEET_URL || '';
const actionUrl = publicFormUrl || formSheetUrl;
const actionLabel = publicFormUrl ? 'Dodaj ogłoszenie' : 'Arkusz zgłoszeń';

export const metadata = {
  metadataBase: new URL('https://wypozycz.online'),
  title: 'Wynajem sprzętu budowlanego w jednym miejscu',
  description: 'Znajdź koparki, minikoparki i sprzęt budowlany lokalnie. Porównaj oferty bez dzwonienia po firmach.',
  keywords: 'wynajem, sprzęt budowlany, koparki, ładowarki, wypożyczalnia, wrocław, dolny śląsk, z operatorem, cena, usługi koparką',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Wynajem sprzętu budowlanego w jednym miejscu',
    description: 'Znajdź koparki, minikoparki i sprzęt budowlany lokalnie. Porównaj oferty bez dzwonienia po firmach.',
    url: 'https://wypozycz.online',
    siteName: 'WypożyczSprzęt',
    images: [
      {
        url: 'https://wypozycz.online/header.png',
        width: 1200,
        height: 630,
        alt: 'Wynajem sprzętu budowlanego',
      },
    ],
    locale: 'pl_PL',
    type: 'website',
  },
  verification: {
    google: 'UTKre7BkIREzsP437M9akUdcQ5ER_plKUPDc6TUYD5g',
  },
  icons: {
    icon: '/icon.png',
    shortcut: '/favicon.png',
    apple: '/icon.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="pl">
      <body>
        <CookieConsent />
        <Navbar actionUrl={actionUrl} actionLabel={actionLabel} />
        <main>{children}</main>
        <footer className="footer">
          <div className="navbar-container">
            <p>
              &copy; {new Date().getFullYear()} {'Wypo\u017cyczSprz\u0119t Marketplace. Wszystkie prawa zastrze\u017cone.'}
              {' | '}
              <a href="/regulamin" className="hover:underline" style={{ color: 'inherit' }}>Regulamin</a>
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
