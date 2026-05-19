/**
 * Configuration and mappings for Polish Voivodeships (Województwa)
 * and their associated cities in the marketplace database.
 */

export const VOIVODESHIPS = {
  'dolnoslaskie': {
    name: 'Dolnośląskie',
    slug: 'dolnoslaskie',
    seoTitle: 'Wynajem sprzętu budowlanego Dolnośląskie | WypożyczSprzęt',
    description: 'Wynajem sprzętu budowlanego i ogrodowego w województwie dolnośląskim. Porównaj oferty lokalnych wypożyczalni z Wrocławia i całego Dolnego Śląska.'
  },
  'kujawsko-pomorskie': {
    name: 'Kujawsko-pomorskie',
    slug: 'kujawsko-pomorskie',
    seoTitle: 'Wynajem sprzętu budowlanego Kujawsko-pomorskie | WypożyczSprzęt',
    description: 'Wynajem sprzętu budowlanego i ogrodowego w województwie kujawsko-pomorskim. Najlepsze oferty lokalnego wynajmu maszyn.'
  },
  'lubelskie': {
    name: 'Lubelskie',
    slug: 'lubelskie',
    seoTitle: 'Wynajem sprzętu budowlanego Lubelskie | WypożyczSprzęt',
    description: 'Wynajem sprzętu budowlanego i ogrodowego w województwie lubelskim. Szeroki wybór maszyn budowlanych w Twoim regionie.'
  },
  'lubuskie': {
    name: 'Lubuskie',
    slug: 'lubuskie',
    seoTitle: 'Wynajem sprzętu budowlanego Lubuskie | WypożyczSprzęt',
    description: 'Wynajem maszyn budowlanych i narzędzi ogrodowych w województwie lubuskim. Sprawdź cennik i dostępność.'
  },
  'lodzkie': {
    name: 'Łódzkie',
    slug: 'lodzkie',
    seoTitle: 'Wynajem sprzętu budowlanego Łódzkie | WypożyczSprzęt',
    description: 'Agregaty, koparki, podnośniki i sprzęt ogrodowy na wynajem w województwie łódzkim. Sprawdź lokalne oferty.'
  },
  'malopolskie': {
    name: 'Małopolskie',
    slug: 'malopolskie',
    seoTitle: 'Wynajem sprzętu budowlanego Małopolskie | WypożyczSprzęt',
    description: 'Wynajem maszyn budowlanych i ogrodowych w województwie małopolskim. Bezpieczny i szybki wynajem bez pośredników.'
  },
  'mazowieckie': {
    name: 'Mazowieckie',
    slug: 'mazowieckie',
    seoTitle: 'Wynajem sprzętu budowlanego Mazowieckie | WypożyczSprzęt',
    description: 'Województwo mazowieckie - wynajem sprzętu budowlanego, koparek i elektronarzędzi. Największy wybór ofert.'
  },
  'opolskie': {
    name: 'Opolskie',
    slug: 'opolskie',
    seoTitle: 'Wynajem sprzętu budowlanego Opolskie | WypożyczSprzęt',
    description: 'Wynajem maszyn i narzędzi budowlanych w województwie opolskim. Porównaj lokalne wypożyczalnie.'
  },
  'podkarpackie': {
    name: 'Podkarpackie',
    slug: 'podkarpackie',
    seoTitle: 'Wynajem sprzętu budowlanego Podkarpackie | WypożyczSprzęt',
    description: 'Wynajem narzędzi, podnośników i koparek w województwie podkarpackim. Sprawdź oferty blisko Ciebie.'
  },
  'podlaskie': {
    name: 'Podlaskie',
    slug: 'podlaskie',
    seoTitle: 'Wynajem sprzętu budowlanego Podlaskie | WypożyczSprzęt',
    description: 'Szeroki asortyment maszyn budowlanych i ogrodowych na wynajem w województwie podlaskim. Zobacz cennik.'
  },
  'pomorskie': {
    name: 'Pomorskie',
    slug: 'pomorskie',
    seoTitle: 'Wynajem sprzętu budowlanego Pomorskie | WypożyczSprzęt',
    description: 'Wynajem sprzętu budowlanego i ogrodowego w województwie pomorskim. Wypożyczalnie blisko Trójmiasta.'
  },
  'slaskie': {
    name: 'Śląskie',
    slug: 'slaskie',
    seoTitle: 'Wynajem sprzętu budowlanego Śląskie | WypożyczSprzęt',
    description: 'Województwo śląskie - wynajem koparek, minikoparek, zagęszczarek i sprzętu ogrodowego. Sprawdź lokalnych dostawców.'
  },
  'swietokrzyskie': {
    name: 'Świętokrzyskie',
    slug: 'swietokrzyskie',
    seoTitle: 'Wynajem sprzętu budowlanego Świętokrzyskie | WypożyczSprzęt',
    description: 'Maszyny i narzędzia budowlane na wynajem w województwie świętokrzyskim. Znajdź najlepszą ofertę.'
  },
  'warminsko-mazurskie': {
    name: 'Warmińsko-mazurskie',
    slug: 'warminsko-mazurskie',
    seoTitle: 'Wynajem sprzętu budowlanego Warmińsko-Mazurskie | WypożyczSprzęt',
    description: 'Wynajem maszyn i narzędzi ogrodniczych w województwie warmińsko-mazurskim. Porównaj ceny online.'
  },
  'wielkopolskie': {
    name: 'Wielkopolskie',
    slug: 'wielkopolskie',
    seoTitle: 'Wynajem sprzętu budowlanego Wielkopolskie | WypożyczSprzęt',
    description: 'Wynajem koparek, agregatów prądotwórczych i maszyn ogrodowych w województwie wielkopolskim.'
  },
  'zachodniopomorskie': {
    name: 'Zachodniopomorskie',
    slug: 'zachodniopomorskie',
    seoTitle: 'Wynajem sprzętu budowlanego Zachodniopomorskie | WypożyczSprzęt',
    description: 'Sprawdź oferty wynajmu sprzętu budowlanego w województwie zachodniopomorskim. Bezpośredni kontakt z wypożyczalniami.'
  }
};

// Map of lowercased city names to their corresponding voivodeship slug
export const CITY_TO_VOIVODESHIP = {
  'wroclaw': 'dolnoslaskie',
  'bielawa': 'dolnoslaskie',
  'bozkow': 'dolnoslaskie',
  'brzeszcze': 'malopolskie',
  'bystrzyca klodzka': 'dolnoslaskie',
  'dobroszyce': 'dolnoslaskie',
  'dzierzoniow': 'dolnoslaskie',
  'gniewomierz': 'dolnoslaskie',
  'kamieniec wroclawski': 'dolnoslaskie',
  'kobierzyce': 'dolnoslaskie',
  'klodzko': 'dolnoslaskie',
  'lubliniec': 'slaskie',
  'ladek zdroj': 'dolnoslaskie',
  'olawa': 'dolnoslaskie',
  'skalka': 'dolnoslaskie',
  'sobotka': 'dolnoslaskie',
  'srebrna gora': 'dolnoslaskie',
  'stary wielislaw': 'dolnoslaskie',
  'stradomia wierzchnia': 'dolnoslaskie',
  'stronie slaskie': 'dolnoslaskie',
  'trzebnica': 'dolnoslaskie'
};

/**
 * Get voivodeship slug by clean city slug or name.
 * Normalizes input to match mapping keys.
 */
export function getVoivodeshipSlugForCity(city) {
  if (!city) return null;
  const normalized = city
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ł/g, 'l')
    .replace(/ń/g, 'n')
    .replace(/ś/g, 's')
    .replace(/[źż]/g, 'z')
    .replace(/ć/g, 'c')
    .replace(/ę/g, 'e')
    .replace(/ó/g, 'o')
    .replace(/ą/g, 'a')
    .trim();
  return CITY_TO_VOIVODESHIP[normalized] || null;
}

/**
 * Returns true if the given slug is a valid Polish voivodeship.
 */
export function isVoivodeshipSlug(slug) {
  return !!VOIVODESHIPS[slug];
}

/**
 * Get voivodeship details by its slug.
 */
export function getVoivodeship(slug) {
  return VOIVODESHIPS[slug] || null;
}

/**
 * Get all cities belonging to a voivodeship from a list of listings/cities.
 */
export function getCitiesInVoivodeship(voivodeshipSlug, allCities) {
  return allCities.filter(city => getVoivodeshipSlugForCity(city) === voivodeshipSlug);
}
