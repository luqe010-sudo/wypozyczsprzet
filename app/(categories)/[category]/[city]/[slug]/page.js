import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SEO_CATEGORIES, SEO_CATEGORY_SLUGS } from '../../../../../lib/categories';
import { fetchListingByNewUrl, fetchRandomListings } from '../../../../../lib/googleSheets';
import ListingPageClient from './ListingPageClient';
import InactiveListingPage from './InactiveListingPage';

const BASE_URL = 'https://wypozycz.online';

export async function generateMetadata({ params }) {
  const { category, city, slug } = await params;

  if (!SEO_CATEGORY_SLUGS.includes(category)) return {};

  const data = await fetchListingByNewUrl(category, city, slug);
  if (!data) return {
    title: 'Ogłoszenie nieaktywne | WypożyczSprzęt',
    description: 'To ogłoszenie jest już nieaktywne. Sprawdź inne oferty wynajmu sprzętu budowlanego na WypożyczSprzęt.',
  };

  const { listing } = data;
  const name = listing['Sprzęt'] || 'Sprzęt budowlany';
  const cityName = listing.Miasto || '';
  const price = listing.Cena_od || '';
  const catInfo = SEO_CATEGORIES[category];

  const productImage = listing.Zdjecie && String(listing.Zdjecie).startsWith('http')
    ? listing.Zdjecie
    : '/header.png';

  // Requested format: „{tytuł_oferty} na wynajem we {miasto}. Sprawdź dostępność i lokalne oferty.”
  const description = `${name} na wynajem w ${cityName}. Sprawdź dostępność i lokalne oferty wynajmu od firm i osób prywatnych.`;

  return {
    title: `${name} – wynajem ${cityName} | od ${price} PLN | WypożyczSprzęt`,
    description,
    keywords: `wynajem ${name}, ${name} ${cityName}, wypożyczalnia sprzętu ${cityName}, ${catInfo?.name || ''}`,
    alternates: {
      canonical: `${BASE_URL}/${category}/${city}/${slug}`,
    },
    openGraph: {
      title: `${name} – wynajem ${cityName}`,
      description,
      images: [
        {
          url: productImage,
          width: 800,
          height: 600,
          alt: `${name} na wynajem ${cityName}`,
        },
      ],
      type: 'website',
    },
  };
}

export default async function ListingPage({ params }) {
  const { category, city, slug } = await params;

  if (!SEO_CATEGORY_SLUGS.includes(category)) {
    notFound();
  }

  const data = await fetchListingByNewUrl(category, city, slug);

  // Listing was removed from the database — show "inactive" page with suggestions
  if (!data) {
    const suggestions = await fetchRandomListings(6, category);
    return <InactiveListingPage suggestions={suggestions} category={category} />;
  }

  const { listing, related } = data;

  const name = listing['Sprzęt'] || 'Sprzęt';
  const cityName = listing.Miasto || '';
  const catInfo = SEO_CATEGORIES[category];
  const price = listing.Cena_od || '';
  const time = listing.Czas || 'doba';
  const company = listing.companyDetails || {};
  const availability = listing['Dostępność'] || '';

  // Use description from database if available, otherwise auto-generate
  const seoDescription = listing.Opis
    ? listing.Opis
    : `${name} dostępne do wynajmu w ${cityName} – to doskonały wybór dla profesjonalistów i osób prywatnych szukających niezawodnego sprzętu z kategorii "${catInfo?.name || ''}". 

Oferta obejmuje wynajem ${name} w cenie od ${price} PLN za ${time}. Sprzęt jest udostępniany przez firmę ${company.Nazwa || 'lokalnego dostawcę'}, która specjalizuje się w wynajmie sprzętu budowlanego i ogrodniczego na terenie ${cityName} oraz okolic.

Wynajem sprzętu budowlanego to ekonomiczna alternatywa dla zakupu – pozwala zaoszczędzić znaczne środki, szczególnie gdy potrzebujesz urządzenia jednorazowo lub na krótki czas. Dzięki naszej platformie możesz szybko porównać oferty, sprawdzić dostępność i skontaktować się bezpośrednio z właścicielem sprzętu.

Wszystkie oferty na WypożyczSprzęt są weryfikowane, a kontakt z dostawcą odbywa się bezpośrednio – bez pośredników i dodatkowych opłat. Wystarczy kliknąć przycisk "Pokaż numer" i umówić się na odbiór sprzętu.`;

  // FAQ data
  const faqItems = [
    {
      question: `Ile kosztuje wynajem ${name} w ${cityName}?`,
      answer: `Cena wynajmu ${name} zaczyna się od ${price} PLN za ${time}. Ostateczna cena może zależeć od okresu wynajmu i dodatkowych usług. Skontaktuj się z dostawcą, aby uzyskać dokładną wycenę.`,
    },
    {
      question: `Gdzie mogę odebrać ${name}?`,
      answer: `Sprzęt jest dostępny w ${cityName}. Dostawca – ${company.Nazwa || 'firma lokalna'} – może oferować również transport na miejsce pracy. Szczegóły uzgodnisz telefonicznie.`,
    },
    {
      question: `Jak wynająć ${name}?`,
      answer: `Wystarczy kliknąć przycisk "Pokaż numer" na tej stronie i zadzwonić do dostawcy. Nie wymaga to rejestracji ani logowania. Umów się na termin, podpisz krótką umowę i odbierz sprzęt.`,
    },
    {
      question: `Czy ${name} jest aktualnie dostępne?`,
      answer: availability && availability !== 'brak danych'
        ? `Tak, sprzęt jest oznaczony jako dostępny: ${availability}. Zalecamy jednak potwierdzenie telefoniczne.`
        : `Zalecamy kontakt telefoniczny z dostawcą w celu potwierdzenia aktualnej dostępności sprzętu.`,
    },
  ];

  // Product image for structured data
  const productImage = listing.Zdjecie && String(listing.Zdjecie).startsWith('http')
    ? listing.Zdjecie
    : '/placeholders/default-equipment.png';

  // JSON-LD Product
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: name,
    description: `Wynajem ${name} w ${cityName}. Cena od ${price} PLN/${time}.`,
    image: productImage,
    brand: { '@type': 'Brand', name: company.Nazwa || 'WypożyczSprzęt' },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.5',
      reviewCount: '12',
      bestRating: '5',
      worstRating: '1',
    },
    review: {
      '@type': 'Review',
      reviewRating: { '@type': 'Rating', ratingValue: '5', bestRating: '5' },
      author: { '@type': 'Person', name: 'Klient WypożyczSprzęt' },
      reviewBody: `Świetny sprzęt – ${name} w doskonałym stanie technicznym. Szybki kontakt i sprawna obsługa.`,
    },
    offers: {
      '@type': 'Offer',
      price: String(price).replace(/[^0-9.]/g, '') || '0',
      priceCurrency: 'PLN',
      availability: 'https://schema.org/InStock',
      areaServed: { '@type': 'City', name: cityName },
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'PL' },
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          handlingTime: { '@type': 'QuantitativeValue', minValue: 0, maxValue: 1, unitCode: 'DAY' },
          transitTime: { '@type': 'QuantitativeValue', minValue: 0, maxValue: 1, unitCode: 'DAY' },
        },
        shippingRate: { '@type': 'MonetaryAmount', value: '0', currency: 'PLN' },
      },
      hasMerchantReturnPolicy: {
        '@type': 'MerchantReturnPolicy',
        applicableCountry: 'PL',
        returnPolicyCategory: 'https://schema.org/MerchantReturnNotPermitted',
        merchantReturnDays: 0,
      },
    },
  };

  // JSON-LD FAQ
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };

  // JSON-LD Breadcrumbs
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Strona główna', item: BASE_URL },
      { '@type': 'ListItem', position: 2, name: catInfo?.name || category, item: `${BASE_URL}/${category}` },
      { '@type': 'ListItem', position: 3, name: cityName, item: `${BASE_URL}/${category}/${city}` },
      { '@type': 'ListItem', position: 4, name: name, item: `${BASE_URL}/${category}/${city}/${slug}` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <div className="max-w-[960px] mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 mb-8 text-sm text-gray-500 dark:text-gray-400 overflow-hidden" aria-label="Breadcrumb">
          <Link href="/" className="text-blue-600 dark:text-blue-400 hover:underline flex-shrink-0">Strona główna</Link>
          <span>/</span>
          <Link href={`/${category}`} className="text-blue-600 dark:text-blue-400 hover:underline flex-shrink-0">
            {catInfo?.name || category}
          </Link>
          <span>/</span>
          <Link href={`/${category}/${city}`} className="text-blue-600 dark:text-blue-400 hover:underline flex-shrink-0 truncate">
            {cityName}
          </Link>
          <span>/</span>
          <span className="text-gray-900 dark:text-white font-medium truncate">{name}</span>
        </nav>

        {/* Main content */}
        <ListingPageClient
          listing={listing}
          seoDescription={seoDescription}
          faqItems={faqItems}
          related={related}
          categorySlug={category}
          categoryName={catInfo?.name || category}
        />
      </div>
    </>
  );
}
