import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Building2, Inbox, MapPin, PackagePlus } from 'lucide-react';

export const metadata = {
  title: 'Dla wynajmujących | wypozycz.online',
  description: 'Dodaj sprzęt do wypozycz.online i odbieraj zapytania od klientów z Twojej okolicy.',
  alternates: { canonical: '/dla-wynajmujacych' },
};

const benefits = [
  { icon: MapPin, title: 'Klienci z Twojej okolicy', text: 'Oferty pojawiają się w wyszukiwarce i na mapie według lokalizacji sprzętu.' },
  { icon: Inbox, title: 'Bezpośrednie zapytania', text: 'Klienci dzwonią lub przesyłają kontakt i planowany termin. Warunki uzgadniacie między sobą.' },
  { icon: PackagePlus, title: 'Zarządzanie ofertami', text: 'W panelu możesz zmienić cenę i opis, dodać zdjęcia lub wstrzymać ogłoszenie.' },
];

export default function ProviderPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
      <header className="relative isolate overflow-hidden rounded-xl bg-market-navy p-6 text-white sm:p-10">
        <Image src="/hero-minikoparka.webp" alt="" fill sizes="(max-width: 1280px) 100vw, 1280px" className="-z-20 object-cover object-[center_60%]" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-market-navy via-market-navy/90 to-market-navy/35" aria-hidden="true" />
        <p className="mb-2 flex items-center gap-2 text-sm font-bold text-market-yellow"><Building2 size={18} aria-hidden="true" /> Dla wynajmujących</p>
        <h1 className="max-w-lg text-3xl font-extrabold tracking-tight sm:text-4xl">Wynajmujesz sprzęt? Dotrzyj do klientów w swojej okolicy.</h1>
        <p className="mt-3 max-w-md text-sm text-slate-200 sm:text-base">Dodaj ogłoszenie bezpłatnie i odbieraj zapytania bezpośrednio od osób szukających Twojego sprzętu.</p>
        <Link href="/dashboard/ogloszenia#dodaj" className="market-action mt-5">Dodaj ogłoszenie <ArrowRight size={17} aria-hidden="true" /></Link>
      </header>
      <ul className="grid gap-3 md:grid-cols-3">
        {benefits.map(({ icon: Icon, title, text }) => (
          <li key={title} className="listing-panel">
            <Icon className="mb-2 text-brand-600 dark:text-brand-400" size={22} aria-hidden="true" />
            <h2 className="font-bold">{title}</h2>
            <p className="mt-1 text-sm leading-relaxed text-muted">{text}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
