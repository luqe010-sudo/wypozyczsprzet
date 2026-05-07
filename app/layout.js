import './globals.css';
import Navbar from '../components/Navbar';
import CookieConsent from '../components/CookieConsent';
import ToastProvider from '../components/ToastProvider';
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
    icon: [
      { url: '/favicon.png' },
      { url: '/favicon.png', sizes: '32x32', type: 'image/png' },
    ],
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="pl" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.png" />
        <script dangerouslySetInnerHTML={{
          __html: `
            if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
              document.documentElement.classList.add('dark')
            } else {
              document.documentElement.classList.remove('dark')
            }
          `
        }} />
      </head>
      <body>
        <ToastProvider />
        <CookieConsent />
        <Navbar actionUrl={actionUrl} actionLabel={actionLabel} />
        <main className="bg-gray-50 dark:bg-slate-900 min-h-screen transition-colors">{children}</main>
        <footer className="footer bg-white dark:bg-slate-900 dark:text-gray-400 dark:border-t dark:border-slate-800 transition-colors">
          <div className="navbar-container">
            <p>
              &copy; {new Date().getFullYear()} {'Wypo\u017cyczSprz\u0119t Marketplace. Wszystkie prawa zastrze\u017cone.'}
              {' | '}
              <a href="/regulamin" className="hover:underline">Regulamin</a>
              {' | '}
              <a href="https://www.facebook.com/profile.php?id=61561285692729" target="_blank" rel="noopener noreferrer" className="hover:underline">Facebook</a>
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
