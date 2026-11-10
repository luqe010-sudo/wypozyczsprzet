import './globals.css';
import { Inter } from 'next/font/google';
import Navbar from '../components/Navbar';
import SiteBrand from '../components/SiteBrand';
import CookieConsent from '../components/CookieConsentLoader';
import ToastProvider from '../components/ToastProvider';
import Script from 'next/script';
import Link from 'next/link';
import { SITE_URL } from '../lib/site';

const inter = Inter({ 
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'Wynajem i wypożyczalnia sprzętu budowlanego – Dolny Śląsk | wypozycz.online',
  description: 'Koparki, minikoparki, zagęszczarki, agregaty i narzędzia na wynajem. Kontakt bezpośrednio z wynajmującym, bez prowizji.',

  openGraph: {
    title: 'Wynajem sprzętu budowlanego i ogrodowego na Dolnym Śląsku',
    description: 'Koparki, minikoparki, zagęszczarki, agregaty i narzędzia na wynajem. Kontakt bezpośrednio z wynajmującym, bez prowizji.',
    siteName: 'wypozycz.online',
    images: [
      {
        url: '/header.webp',
        width: 1774,
        height: 887,
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
    <html lang="pl" suppressHydrationWarning className={`${inter.variable} ${inter.className}`}>
      <head>
        <link rel="preconnect" href="https://res.cloudinary.com" />
        {/* Preconnect to Supabase if used for images */}
        {process.env.NEXT_PUBLIC_SUPABASE_URL && (
          <link rel="preconnect" href={process.env.NEXT_PUBLIC_SUPABASE_URL} />
        )}
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              if (localStorage.theme === 'dark') {
                document.documentElement.classList.add('dark')
              } else {
                document.documentElement.classList.remove('dark')
              }
            `
          }}
        />
      </head>
      <body>
        <ToastProvider />
        <CookieConsent />
        <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-3 focus:z-[100] focus:rounded-md focus:bg-card focus:px-4 focus:py-2">Przejdź do treści</a>
        <Navbar />
        <main id="main-content" className="min-h-screen scroll-mt-16 bg-background">{children}</main>
        <footer className="border-t border-white/10 bg-market-navy text-slate-300">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <SiteBrand />
              <nav aria-label="Stopka" className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
                <Link href="/katalog" className="hover:underline">Katalog firm</Link>
                <Link href="/blog" className="hover:underline">Poradniki</Link>
                <Link href="/umowy" className="hover:underline">Wzory umów</Link>
                <Link href="/kontakt" className="hover:underline">Kontakt</Link>
                <Link href="/regulamin" className="hover:underline">Regulamin</Link>
                <Link href="/polityka-prywatnosci" className="hover:underline">Polityka prywatności</Link>
                <a href="https://www.facebook.com/profile.php?id=61561285692729" target="_blank" rel="noopener noreferrer" className="hover:underline">Facebook</a>
              </nav>
            </div>
            <p className="mt-6 border-t border-white/10 pt-5 text-xs text-slate-400">&copy; {new Date().getFullYear()} wypozycz.online. Umowy wynajmu zawierasz bezpośrednio z wynajmującym.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
