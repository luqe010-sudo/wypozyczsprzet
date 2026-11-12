import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ChevronDown, Clock, Crosshair, MapPin, Plus, Search, ShieldCheck, Truck } from 'lucide-react';
import CategoryHubs from '../components/CategoryHubs';
import FeaturedListings from '../components/FeaturedListings';
import LatestListings from '../components/LatestListings';
import PopularEquipment from '../components/PopularEquipment';
import RentalSteps from '../components/RentalSteps';
import { ExcavatorIcon } from '../components/icons/EquipmentIcons';
import { fetchMarketplaceData, toCard } from '../lib/listings';
import { cityLinks } from '../lib/hubs';
import { SEARCH_DEFAULTS, featuredListings, findListings } from '../lib/search';
import { MIN_LISTINGS_FOR_INDEXING, SITE_NAME, SITE_URL } from '../lib/site';

export const revalidate = 3600;

export const metadata = {
  alternates: { canonical: '/' },
};

const searchField = 'relative flex min-h-12 min-w-0 items-center gap-2.5 rounded-lg border border-slate-300 bg-card px-3.5 text-sm text-foreground focus-within:border-brand-500 dark:border-slate-600';
// More than "Pokaż więcej" reveals in a few clicks; past that /szukaj is the better tool.
const LATEST_LIMIT = 48;

const BENEFITS = [
  { icon: MapPin, title: 'Sprzęt od lokalnych firm', text: 'Wypożyczalnie w Twojej okolicy' },
  { icon: Truck, title: 'Wygodny wynajem', text: 'Szybki kontakt z wynajmującym' },
  { icon: ShieldCheck, title: 'Bez pośredników', text: 'Umowę zawierasz bezpośrednio z firmą' },
  { icon: Clock, title: 'Szeroki wybór sprzętu', text: 'Maszyny budowlane, ogrodowe i narzędzia' },
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
  const popularCities = cityLinks(listings, { minListings: MIN_LISTINGS_FOR_INDEXING }).slice(0, 12);
  const featured = featuredListings(listings).map(toCard);
  // Featured offers already have their own strip right above this list.
  const latest = findListings(listings.filter((listing) => !listing.isFeatured), SEARCH_DEFAULTS, null).slice(0, LATEST_LIMIT).map(toCard);

  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    // Names used on the site before the brand was unified, so Google ties them to this site.
    alternateName: ['Wypożycz Online', 'WypożyczSprzęt'],
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

      <section className="relative isolate" aria-labelledby="home-title">
        <div className="home-hero-photo" aria-hidden="true">
          <Image src="/header.webp" alt="" fill preload sizes="(max-width: 1023px) 100vw, 70vw" className="object-cover object-[100%_50%] lg:object-[100%_0%]" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 pt-7 sm:px-6 lg:pt-20">
          <div className="pb-48 lg:pb-28">
            <h1 id="home-title" className="text-[clamp(2.25rem,5vw,4rem)] font-extrabold leading-[1.05] tracking-[-0.04em] text-market-navy dark:text-white">
              Sprzęt do wynajęcia.<span className="block text-market-yellow">Blisko Ciebie.</span>
            </h1>
            <p className="mt-3 flex items-center gap-2 text-sm font-medium text-slate-800 dark:text-slate-200 sm:text-lg lg:mt-5">
              <ShieldCheck size={24} className="shrink-0 text-amber-500" aria-hidden="true" /> Bez pośredników i prowizji
            </p>
          </div>
          <form action="/szukaj" method="get" role="search" aria-label="Wyszukiwarka sprzętu" className="grid gap-2.5 rounded-2xl border border-border bg-card p-3 shadow-xl sm:grid-cols-2 lg:grid-cols-[1.35fr_1fr_0.85fr_auto]">
            <label className={searchField}>
              <Search size={19} className="shrink-0" aria-hidden="true" />
              <span className="sr-only">Szukany sprzęt</span>
              <input name="q" type="search" maxLength={120} placeholder="Jakiego sprzętu szukasz?" className="h-12 w-full min-w-0 bg-transparent placeholder:text-slate-600 focus:outline-none dark:placeholder:text-slate-400" />
            </label>
            <label className={searchField}>
              <MapPin size={19} className="shrink-0" aria-hidden="true" />
              <span className="sr-only">Miejscowość</span>
              <input name="city" list="home-cities" maxLength={80} placeholder="Wpisz miejscowość" className="h-12 w-full min-w-0 bg-transparent placeholder:text-slate-600 focus:outline-none dark:placeholder:text-slate-400" />
            </label>
            <datalist id="home-cities">
              {filters.cities.map((city) => <option key={city} value={city} />)}
            </datalist>
            <label className={searchField}>
              <Crosshair size={18} className="shrink-0" aria-hidden="true" />
              <span className="sr-only">Promień wyszukiwania</span>
              <select name="radius" defaultValue="25" className="h-12 w-full min-w-0 appearance-none bg-transparent pr-6 font-medium focus:outline-none [&>option]:bg-card">
                <option value="0">Tylko miejscowość</option>
                {[10, 25, 50, 100].map((distance) => <option key={distance} value={distance}>Promień {distance} km</option>)}
              </select>
              <ChevronDown size={17} className="pointer-events-none absolute right-3" aria-hidden="true" />
            </label>
            <button className="market-action min-h-12 px-8 text-base" type="submit"><Search size={19} aria-hidden="true" /> Szukaj sprzętu</button>
          </form>
        </div>
      </section>

      <PopularEquipment />

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <ul className="grid grid-cols-2 gap-4 border-b border-border py-5 lg:grid-cols-4 lg:gap-0 lg:divide-x lg:divide-border">
          {BENEFITS.map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex items-center gap-3 lg:px-5 lg:first:pl-0">
              <Icon size={28} strokeWidth={1.75} className="shrink-0 text-amber-500" aria-hidden="true" />
              <div>
                <p className="text-xs font-bold leading-snug sm:text-sm">{title}</p>
                <p className="mt-0.5 hidden text-xs leading-snug text-slate-600 dark:text-slate-400 sm:block">{text}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <FeaturedListings listings={featured} className="mx-auto max-w-7xl px-4 pt-7 sm:px-6" />

      <section className="mx-auto max-w-7xl px-4 pb-8 pt-7 sm:px-6" aria-labelledby="home-offers">
        {latest.length > 0 ? (
          <LatestListings listings={latest} />
        ) : (
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 id="home-offers" className="market-heading mb-3">Najnowsze ogłoszenia</h2>
            <p>W tej chwili nie ma opublikowanych ofert. Sprawdź firmy, które wynajmują sprzęt w Twojej okolicy.</p>
            <Link href="/katalog" className="mt-3 inline-flex min-h-11 items-center gap-2 font-semibold hover:underline">Otwórz katalog firm <ArrowRight size={16} aria-hidden="true" /></Link>
          </div>
        )}
      </section>

      <section id="dla-wynajmujacych" className="mx-auto max-w-7xl scroll-mt-20 px-4 pb-8 sm:px-6">
        <div className="relative isolate flex flex-col items-start justify-between gap-5 overflow-hidden rounded-2xl bg-market-navy p-6 sm:px-8 md:flex-row md:items-center">
          <Image src="/header.webp" alt="" fill sizes="(max-width: 1280px) 100vw, 1280px" className="-z-20 object-cover object-[50%_30%] opacity-25" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-market-navy via-market-navy/90 to-market-navy/40" aria-hidden="true" />
          <div className="flex items-center gap-5">
            <ExcavatorIcon size={56} strokeWidth={1.4} className="hidden shrink-0 text-market-yellow sm:block" />
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">Masz sprzęt? <span className="text-market-yellow">Dodaj ofertę za darmo.</span></h2>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-200 sm:text-base">Dotrzyj do klientów w swojej okolicy i wynajmuj bez prowizji.</p>
            </div>
          </div>
          <Link href="/dashboard/ogloszenia#dodaj" className="market-action min-h-12 shrink-0 px-6">
            <Plus size={18} aria-hidden="true" /> Dodaj ogłoszenie
          </Link>
        </div>
      </section>

      <CategoryHubs listings={listings} />

      {popularCities.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-10 pt-8 sm:px-6">
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
        <RentalSteps />
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

    </>
  );
}
