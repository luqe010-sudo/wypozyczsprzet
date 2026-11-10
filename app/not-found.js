import Link from 'next/link';

export const metadata = {
  title: 'Nie znaleziono strony | wypozycz.online',
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center">
      <h1 className="mb-2 text-2xl font-bold text-slate-900 dark:text-white">Nie ma takiej strony</h1>
      <p className="mb-6 text-slate-600 dark:text-slate-400">Adres jest błędny albo strona została usunięta.</p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link href="/" className="flex h-11 items-center rounded-lg bg-market-yellow px-5 text-sm font-semibold text-market-navy hover:bg-amber-300">
          Szukaj sprzętu
        </Link>
        <Link href="/katalog" className="flex h-11 items-center rounded-lg border border-slate-300 px-5 text-sm font-medium text-slate-800 dark:border-slate-600 dark:text-slate-200">
          Katalog firm
        </Link>
      </div>
    </div>
  );
}
