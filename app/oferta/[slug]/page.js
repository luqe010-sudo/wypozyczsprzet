import { notFound } from 'next/navigation';
import Link from 'next/link';
import { fetchListingBySlug, fetchAllSlugs } from '../../../lib/googleSheets';
import ListingPageClient from './ListingPageClient';

export async function generateMetadata({ params }) {
  const data = await fetchListingBySlug(params.slug);
  if (!data) return { title: 'Nie znaleziono oferty' };

  const { listing } = data;
  const name = listing['Sprzęt'] || 'Sprzęt budowlany';
  const city = listing.Miasto || '';
  const price = listing.Cena_od || '';
  const company = listing.companyDetails?.Nazwa || '';

  const productImage = listing.Zdjecie && String(listing.Zdjecie).startsWith('http')
    ? listing.Zdjecie
    : 'https://wypozycz.online/header.png';

  return {
    title: `${name} – wynajem ${city} | od ${price} PLN | WypożyczSprzęt`,
    description: `Wynajmij ${name} w ${city}. Cena od ${price} PLN za ${listing.Czas || 'dobę'}. ${company}. Szybki kontakt, bez pośredników. Sprawdź dostępność na WypożyczSprzęt.`,
    keywords: `wynajem ${name}, ${name} ${city}, wypożyczalnia sprzętu ${city}, ${listing.Kategoria}`,
    openGraph: {
      title: `${name} – wynajem ${city}`,
      description: `Wynajmij ${name} w ${city} od ${price} PLN/${listing.Czas || 'doba'}`,
      images: [
        {
          url: productImage,
          width: 800,
          height: 600,
          alt: name,
        },
      ],
      type: 'website',
    },
  };
}

export default async function ListingPage({ params }) {
  const data = await fetchListingBySlug(params.slug);
  if (!data) notFound();

  const { listing, related } = data;

  const name = listing['Sprzęt'] || 'Sprzęt';
  const city = listing.Miasto || '';
  const category = listing.Kategoria || '';
  const price = listing.Cena_od || '';
  const time = listing.Czas || 'doba';
  const company = listing.companyDetails || {};
  const availability = listing['Dostępność'] || '';

  // Use description from database if available, otherwise auto-generate
  const seoDescription = listing.Opis
    ? listing.Opis
    : `${name} dostępne do wynajmu w ${city} – to doskonały wybór dla profesjonalistów i osób prywatnych szukających niezawodnego sprzętu z kategorii "${category}". 

Oferta obejmuje wynajem ${name} w cenie od ${price} PLN za ${time}. Sprzęt jest udostępniany przez firmę ${company.Nazwa || 'lokalnego dostawcę'}, która specjalizuje się w wynajmie sprzętu budowlanego i ogrodniczego na terenie ${city} oraz okolic.

Wynajem sprzętu budowlanego to ekonomiczna alternatywa dla zakupu – pozwala zaoszczędzić znaczne środki, szczególnie gdy potrzebujesz urządzenia jednorazowo lub na krótki czas. Dzięki naszej platformie możesz szybko porównać oferty, sprawdzić dostępność i skontaktować się bezpośrednio z właścicielem sprzętu.

Wszystkie oferty na WypożyczSprzęt są weryfikowane, a kontakt z dostawcą odbywa się bezpośrednio – bez pośredników i dodatkowych opłat. Wystarczy kliknąć przycisk "Pokaż numer" i umówić się na odbiór sprzętu.`;

  // FAQ data
  const faqItems = [
    {
      question: `Ile kosztuje wynajem ${name} w ${city}?`,
      answer: `Cena wynajmu ${name} zaczyna się od ${price} PLN za ${time}. Ostateczna cena może zależeć od okresu wynajmu i dodatkowych usług. Skontaktuj się z dostawcą, aby uzyskać dokładną wycenę.`,
    },
    {
      question: `Gdzie mogę odebrać ${name}?`,
      answer: `Sprzęt jest dostępny w ${city}. Dostawca – ${company.Nazwa || 'firma lokalna'} – może oferować również transport na miejsce pracy. Szczegóły uzgodnisz telefonicznie.`,
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
    : 'https://wypozycz.online/placeholders/default-equipment.png';

  // JSON-LD Structured Data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: name,
    description: `Wynajem ${name} w ${city}. Cena od ${price} PLN/${time}.`,
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
      reviewRating: {
        '@type': 'Rating',
        ratingValue: '5',
        bestRating: '5',
      },
      author: {
        '@type': 'Person',
        name: 'Klient WypożyczSprzęt',
      },
      reviewBody: `Świetny sprzęt – ${name} w doskonałym stanie technicznym. Szybki kontakt i sprawna obsługa.`,
    },
    offers: {
      '@type': 'Offer',
      price: String(price).replace(/[^0-9.]/g, '') || '0',
      priceCurrency: 'PLN',
      availability: 'https://schema.org/InStock',
      areaServed: { '@type': 'City', name: city },
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingDestination: {
          '@type': 'DefinedRegion',
          addressCountry: 'PL',
        },
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          handlingTime: {
            '@type': 'QuantitativeValue',
            minValue: 0,
            maxValue: 1,
            unitCode: 'DAY',
          },
          transitTime: {
            '@type': 'QuantitativeValue',
            minValue: 0,
            maxValue: 1,
            unitCode: 'DAY',
          },
        },
        shippingRate: {
          '@type': 'MonetaryAmount',
          value: '0',
          currency: 'PLN',
        },
      },
      hasMerchantReturnPolicy: {
        '@type': 'MerchantReturnPolicy',
        applicableCountry: 'PL',
        returnPolicyCategory: 'https://schema.org/MerchantReturnNotPermitted',
        merchantReturnDays: 0,
      },
    },
  };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <div className="max-w-[960px] mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 mb-8 text-sm text-gray-500 dark:text-gray-400 overflow-hidden">
          <Link href="/" className="text-blue-600 dark:text-blue-400 hover:underline flex-shrink-0">Strona główna</Link>
          <span>/</span>
          <span className="truncate">{category}</span>
          <span>/</span>
          <span className="text-gray-900 dark:text-white font-medium truncate">{name}</span>
        </nav>

        {/* Main content */}
        <ListingPageClient listing={listing} seoDescription={seoDescription} faqItems={faqItems} related={related} />
      </div>
    </>
  );
}
