import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Check, ChevronDown, HardHat, MapPin, PhoneCall, Search, Wrench } from 'lucide-react';
import BrowseListings from '../components/browse/BrowseListings';
import CategoryHubs from '../components/CategoryHubs';
import { fetchMarketplaceData, toCard } from '../lib/listings';
import { SEO_CATEGORY_SLUGS } from '../lib/categories';
import { cityLinks } from '../lib/hubs';
import { offersLabel } from '../lib/format';
import { MIN_LISTINGS_FOR_INDEXING, SITE_NAME, SITE_URL } from '../lib/site';

export const revalidate = 3600;

export const metadata = {
  alternates: { canonical: '/' },
};

const HOW_IT_WORKS = [
  { icon: Search, title: 'Znajdź sprzęt', text: 'Wpisz, czego potrzebujesz, i wybierz miejscowość. Wyniki ułożymy od najbliższych.' },
  { icon: PhoneCall, title: 'Skontaktuj się', text: 'Zadzwoń albo wyślij zapytanie z terminem. Rozmawiasz bezpośrednio z wynajmującym.' },
  { icon: Check, title: 'Ustal warunki', text: 'Cenę, kaucję i transport uzgadniasz z firmą. Serwis nie pobiera prowizji od wynajmu.' },
];

const BENEFITS = [
  { icon: MapPin, title: 'Wynajem lokalnie', text: 'Sprzęt blisko Twojej inwestycji' },
  { icon: Wrench, title: 'Różne rodzaje sprzętu', text: 'Maszyny, narzędzia i sprzęt ogrodowy' },
  { icon: PhoneCall, title: 'Bezpośredni kontakt', text: 'Zadzwoń lub wyślij zapytanie' },
  { icon: HardHat, title: 'Wynajem bez prowizji', text: 'Warunki ustalasz z wynajmującym' },
];

const FAQ = [
  {
    question: 'Czy korzystanie z serwisu jest płatne?',
    answer: 'Nie. Wyszukiwanie ofert i kontakt z wynajmującym są bezpłatne, bez rejestracji i bez prowizji od wynajmu.',
  },
  {
    question: 'Kto odpowiada za sprzęt i umowę?',
    answer: 'Umowę zawierasz bezpośrednio z wynajmującym. Serwis tylko publikuje ogłoszenia, nie jest stroną umowy.',
  },
  {
    question: 'Skąd pochodzą ogłoszenia?',
    answer: 'Część dodają sami wynajmujący, a część zebraliśmy ze źródeł publicznych. Przy ogłoszeniach niepotwierdzonych przez firmę znajdziesz taką informację, dlatego warunki zawsze ustal bezpośrednio.',
  },
  {
    question: 'Na co uważać przy wynajmie?',
    answer: 'Sprawdź stan sprzętu przy odbiorze, spisz protokół i ustal kaucję na piśmie.',
    link: { href: '/umowy', label: 'Pobierz bezpłatne wzory umów' },
  },
];

export default async function Home() {
  const { listings, filters } = await fetchMarketplaceData();

  const categoryCounts = {};
  SEO_CATEGORY_SLUGS.forEach((slug) => {
    categoryCounts[slug] = listings.filter((l) => l.seoCategory === slug).length;
  });

  const popularCities = cityLinks(listings, { minListings: MIN_LISTINGS_FOR_INDEXING });

  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    description: 'Ogłoszenia wynajmu sprzętu budowlanego i ogrodowego, głównie na Dolnym Śląsku.',
    inLanguage: 'pl-PL',
  };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <BrowseListings
        listings={listings.map(toCard)}
        allCities={filters.cities}
        searchIntro={(
          <>
            <div className="home-hero-photo" aria-hidden="true">
              <Image src="/header.png" alt="" fill preload sizes="100vw" quality={75} className="object-cover object-[88%_center] lg:object-[center_58%]" />
            </div>
            <div className="relative max-w-xl pb-28 pt-10 sm:pb-36 sm:pt-14 lg:max-w-[41rem] lg:pb-9 lg:pt-16">
              <p className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-slate-950/55 px-3 py-1.5 text-xs font-semibold text-white">
                <MapPin size={14} className="text-amber-400" aria-hidden="true" /> Dolny Śląsk
              </p>
              <h1 className="text-[clamp(2rem,5vw,3.8rem)] font-extrabold leading-[1.06] tracking-[-0.045em] text-white">
                Wynajmij maszyny, sprzęt i narzędzia <span className="block text-amber-400">w swojej okolicy</span>
              </h1>
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-200 sm:text-base">
                {listings.length > 0 && <>{offersLabel(listings.length)} w {filters.cities.length} {filters.cities.length === 1 ? 'miejscowości' : 'miejscowościach'}. </>}
                Skontaktuj się bezpośrednio z wynajmującym i ustal warunki.
              </p>
            </div>
          </>
        )}
        beforeResults={(
          <>
            <div className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
              <ul className="mx-auto grid max-w-7xl grid-cols-2 gap-x-4 gap-y-5 px-4 py-5 sm:px-6 lg:grid-cols-4">
                {BENEFITS.map(({ icon: Icon, title, text }) => (
                  <li key={title} className="flex items-start gap-2.5">
                    <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-amber-100 text-amber-900 dark:bg-amber-400/15 dark:text-amber-300"><Icon size={18} aria-hidden="true" /></span>
                    <div>
                      <p className="text-sm font-bold leading-snug text-slate-900 dark:text-white">{title}</p>
                      <p className="mt-0.5 text-xs leading-snug text-slate-600 dark:text-slate-400">{text}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <CategoryHubs categoryCounts={categoryCounts} />
          </>
        )}
      />


      {popularCities.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-10 sm:px-6">
          <h2 className="mb-3 text-lg font-semibold text-slate-900 dark:text-white">Najwięcej ofert w miejscowościach</h2>
          <ul className="flex flex-wrap gap-2">
            {popularCities.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="inline-flex min-h-[40px] items-center rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-800 hover:border-slate-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section id="jak-to-dziala" className="mx-auto max-w-7xl scroll-mt-20 px-4 pb-10 sm:px-6">
        <h2 className="market-heading mb-5">Jak to działa?</h2>
        <ol className="grid gap-3 md:grid-cols-3">
          {HOW_IT_WORKS.map(({ icon: Icon, title, text }, index) => (
            <li key={title} className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
              <div className="mb-4 flex items-center justify-between">
                <span className="grid size-10 place-items-center rounded-lg bg-amber-100 text-amber-900 dark:bg-amber-400/15 dark:text-amber-300"><Icon size={20} aria-hidden="true" /></span>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Krok {index + 1}</span>
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white">{title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-10 sm:px-6">
        <h2 className="market-heading mb-5">Najczęstsze pytania</h2>
        <div className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white px-5 dark:divide-slate-700 dark:border-slate-700 dark:bg-slate-800">
          {FAQ.map((item) => (
            <details key={item.question} className="group py-3">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-2 text-sm font-semibold text-slate-900 marker:hidden dark:text-white">
                {item.question}<ChevronDown size={17} className="shrink-0 text-slate-500 group-open:rotate-180 dark:text-slate-400" aria-hidden="true" />
              </summary>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                {item.answer}
                {item.link && (
                  <>
                    {' '}
                    <Link href={item.link.href} className="font-medium text-brand-600 underline dark:text-brand-400">{item.link.label}</Link>.
                  </>
                )}
              </p>
            </details>
          ))}
        </div>
      </section>

      <section id="dla-wynajmujacych" className="mx-auto max-w-7xl scroll-mt-20 px-4 pb-12 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-5 rounded-2xl bg-slate-950 p-6 sm:p-9 md:flex-row md:items-center">
          <div className="max-w-xl">
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-amber-400">Dla wynajmujących</p>
            <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">Masz sprzęt na wynajem?</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">Dodaj ogłoszenie za darmo. Zapytania klientów trafią bezpośrednio do Ciebie.</p>
          </div>
          <Link href="/dashboard" className="market-action shrink-0">
            Dodaj ogłoszenie <ArrowRight size={17} aria-hidden="true" />
          </Link>
        </div>
      </section>
    </>
  );
}
