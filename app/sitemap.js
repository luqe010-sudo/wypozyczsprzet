import { fetchAllSlugs } from '../lib/googleSheets';

const BASE_URL = 'https://wypozycz.online';

export default async function sitemap() {
  const slugs = await fetchAllSlugs();

  const listingPages = slugs.map((slug) => ({
    url: `${BASE_URL}/oferta/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.9,
  }));

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    ...listingPages,
    {
      url: `${BASE_URL}/dodaj-ogloszenie`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/kontakt`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];
}
