import Image from 'next/image';
import Link from 'next/link';
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
  { title: 'Znajdź sprzęt', text: 'Wpisz, czego potrzebujesz, i wybierz miejscowość. Wyniki ułożymy od najbliższych.' },
  { title: 'Skontaktuj się', text: 'Zadzwoń albo wyślij zapytanie z terminem. Rozmawiasz bezpośrednio z wynajmującym.' },
  { title: 'Ustal warunki', text: 'Cenę, kaucję i transport uzgadniasz z firmą. Serwis nie pobiera prowizji od wynajmu.' },
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

      <section className="relative overflow-hidden bg-slate-900">
        <Image src="/header.png" alt="" fill priority sizes="100vw" quality={65} className="object-cover object-center opacity-40" />
        <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-7 sm:px-6 md:pb-20 md:pt-12">
          <h1 className="max-w-3xl text-2xl font-bold leading-tight text-white md:text-4xl">
            Wynajem sprzętu budowlanego i ogrodowego na Dolnym Śląsku
          </h1>
          <p className="mt-2 text-sm text-slate-200 md:text-lg">
            {offersLabel(listings.length)} w {filters.cities.length} {filters.cities.length === 1 ? 'miejscowości' : 'miejscowościach'}. Kontakt bezpośrednio z wynajmującym, bez prowizji.
          </p>
        </div>
      </section>

      <div className="mx-auto -mt-10 max-w-7xl px-4 pb-10 sm:px-6">
        <BrowseListings listings={listings.map(toCard)} allCities={filters.cities} />
      </div>

      <CategoryHubs categoryCounts={categoryCounts} />

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

      <section className="border-y border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-800/40">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
          <h2 className="mb-5 text-lg font-semibold text-slate-900 dark:text-white">Jak to działa</h2>
          <ol className="grid gap-6 md:grid-cols-3">
            {HOW_IT_WORKS.map((step, index) => (
              <li key={step.title}>
                <p className="mb-1 text-sm font-semibold text-brand-600 dark:text-brand-400">Krok {index + 1}</p>
                <h3 className="mb-1 font-semibold text-slate-900 dark:text-white">{step.title}</h3>
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Najczęstsze pytania</h2>
        <div className="divide-y divide-slate-200 dark:divide-slate-700">
          {FAQ.map((item) => (
            <details key={item.question} className="group py-3">
              <summary className="cursor-pointer list-none py-1 font-medium text-slate-900 marker:hidden dark:text-white">{item.question}</summary>
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

      <section className="bg-slate-900">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-4 px-4 py-10 sm:px-6 md:flex-row md:items-center">
          <div>
            <h2 className="text-xl font-semibold text-white">Masz sprzęt na wynajem?</h2>
            <p className="mt-1 text-slate-300">Dodaj ogłoszenie za darmo. Zapytania klientów trafią bezpośrednio do Ciebie.</p>
          </div>
          <Link href="/dashboard" className="flex h-12 flex-shrink-0 items-center rounded-lg bg-brand-600 px-6 font-semibold text-white hover:bg-brand-700">
            Dodaj ogłoszenie
          </Link>
        </div>
      </section>
    </>
  );
}
