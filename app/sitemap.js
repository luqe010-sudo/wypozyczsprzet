import { fetchAllSlugs } from '../lib/googleSheets';
import { articles } from '../lib/articles';
import { documents } from '../lib/umowy-data';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://wypozycz.online';

export default async function sitemap() {
  const slugs = await fetchAllSlugs();

  const listingPages = slugs.map((slug) => ({
    url: `${BASE_URL}/oferta/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.9,
  }));

  const blogPages = articles.map((article) => ({
    url: `${BASE_URL}/blog/${article.slug}`,
    lastModified: new Date(article.date),
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  const documentPages = documents.map((doc) => ({
    url: `${BASE_URL}/umowy/${doc.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    ...listingPages,
    ...blogPages,
    ...documentPages,
    {
      url: `${BASE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/umowy`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/kontakt`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/regulamin`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ];
}
