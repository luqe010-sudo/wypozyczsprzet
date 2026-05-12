import { fetchAllSlugs } from '../lib/googleSheets';
import { articles } from '../lib/articles';
import { documents } from '../lib/umowy-data';
import { SEO_CATEGORY_SLUGS } from '../lib/categories';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://wypozycz.online';

export default async function sitemap() {
  const slugData = await fetchAllSlugs();

  // Category hub pages (highest priority after home)
  const categoryPages = SEO_CATEGORY_SLUGS.map((slug) => ({
    url: `${BASE_URL}/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.95,
  }));

  // Local hub pages (Category + City)
  const localHubsSet = new Set();
  slugData.forEach(item => {
    if (item.seoCategory && item.citySlug) {
      localHubsSet.add(`${item.seoCategory}/${item.citySlug}`);
    }
  });

  const localHubPages = Array.from(localHubsSet).map(path => ({
    url: `${BASE_URL}/${path}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.9,
  }));

  // Listing pages with new URL structure: /{category}/{city}/{slug}
  const listingPages = slugData.map((item) => ({
    url: `${BASE_URL}/${item.seoCategory}/${item.citySlug}/${item.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
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
    ...categoryPages,
    ...localHubPages,
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
