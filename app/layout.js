import './globals.css';
import { Inter } from 'next/font/google';
import Navbar from '../components/Navbar';
import CookieConsent from '../components/CookieConsentLoader';
import ToastProvider from '../components/ToastProvider';
import Script from 'next/script';
import Link from 'next/link';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata = {
  metadataBase: new URL('https://wypozycz.online'),
  title: 'Wynajem sprzętu budowlanego i ogrodowego na Dolnym Śląsku | WypożyczSprzęt',
  description: 'Koparki, minikoparki, zagęszczarki, agregaty i narzędzia na wynajem. Kontakt bezpośrednio z wynajmującym, bez prowizji.',

  openGraph: {
    title: 'Wynajem sprzętu budowlanego i ogrodowego na Dolnym Śląsku',
    description: 'Koparki, minikoparki, zagęszczarki, agregaty i narzędzia na wynajem. Kontakt bezpośrednio z wynajmującym, bez prowizji.',
    url: '/',
    siteName: 'WypożyczSprzęt',
    images: [
      {
        url: '/header.png',
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
    <html lang="pl" suppressHydrationWarning className={`${inter.variable} ${inter.className}`}>
      <head>
        <link rel="icon" href="/favicon.png" />
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        {/* Preconnect to Supabase if used for images */}
        {process.env.NEXT_PUBLIC_SUPABASE_URL && (
          <link rel="preconnect" href={process.env.NEXT_PUBLIC_SUPABASE_URL} />
        )}
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
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
        <Navbar />
        <main className="bg-gray-50 dark:bg-slate-900 min-h-screen transition-colors">{children}</main>
        <footer className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-slate-600 dark:text-slate-400 sm:px-6 md:flex-row md:items-center md:justify-between">
            <p>&copy; {new Date().getFullYear()} WypożyczSprzęt. Serwis ogłoszeniowy, nie jest stroną umów wynajmu.</p>
            <nav aria-label="Stopka" className="flex flex-wrap gap-x-5 gap-y-2">
              <Link href="/katalog" className="hover:underline">Katalog firm</Link>
              <Link href="/blog" className="hover:underline">Poradniki</Link>
              <Link href="/umowy" className="hover:underline">Wzory umów</Link>
              <Link href="/kontakt" className="hover:underline">Kontakt</Link>
              <Link href="/regulamin" className="hover:underline">Regulamin</Link>
              <Link href="/polityka-prywatnosci" className="hover:underline">Polityka prywatności</Link>
              <a href="https://www.facebook.com/profile.php?id=61561285692729" target="_blank" rel="noopener noreferrer" className="hover:underline">Facebook</a>
            </nav>
          </div>
        </footer>
      </body>
    </html>
  );
}
