import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import RentalSteps from '../../components/RentalSteps';

export const metadata = {
  title: 'Jak wynająć sprzęt | wypozycz.online',
  description: 'Znajdź maszynę, skontaktuj się z wynajmującym i ustal warunki wynajmu sprzętu.',
  alternates: { canonical: '/jak-to-dziala' },
};

export default function HowItWorksPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
      <header className="rounded-xl bg-market-navy p-6 text-white sm:p-8">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Jak to działa?</h1>
        <p className="mt-2 max-w-xl text-slate-200">Od znalezienia sprzętu do kontaktu z wynajmującym. Korzystanie z wyszukiwarki i wysłanie zapytania są bezpłatne.</p>
      </header>
      <RentalSteps />
      <div className="flex flex-wrap items-center gap-4">
        <Link href="/szukaj" className="market-action">Znajdź sprzęt <ArrowRight size={17} aria-hidden="true" /></Link>
        <Link href="/umowy" className="inline-flex min-h-11 items-center text-sm font-semibold text-brand-600 hover:underline dark:text-brand-400">Wzory umów wynajmu</Link>
      </div>
    </div>
  );
}
