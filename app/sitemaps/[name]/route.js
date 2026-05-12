import { fetchAllSlugs } from '../../../lib/googleSheets';
import { SEO_CATEGORY_SLUGS } from '../../../lib/categories';
import { articles } from '../../../lib/articles';
import { documents } from '../../../lib/umowy-data';

const BASE_URL = 'https://wypozycz.online';

export async function GET(request, { params }) {
  const { name } = params;
  let xml = '';

  const headers = {
    'Content-Type': 'application/xml',
    'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=59',
  };

  if (name === 'categories.xml') {
    xml = generateCategoriesSitemap();
  } else if (name === 'offers.xml') {
    const slugData = await fetchAllSlugs();
    xml = generateOffersSitemap(slugData);
  } else if (name === 'local-hubs.xml') {
    const slugData = await fetchAllSlugs();
    xml = generateLocalHubsSitemap(slugData);
  } else if (name === 'static-pages.xml') {
    xml = generateStaticSitemap();
  } else {
    return new Response('Not Found', { status: 404 });
  }

  return new Response(xml, { headers });
}

function generateCategoriesSitemap() {
  const urls = SEO_CATEGORY_SLUGS.map(slug => `
    <url>
      <loc>${BASE_URL}/${slug}</loc>
      <lastmod>${new Date().toISOString()}</lastmod>
      <changefreq>daily</changefreq>
      <priority>0.9</priority>
    </url>`).join('');

  return wrapInUrlset(urls);
}

function generateOffersSitemap(slugData) {
  const urls = slugData.map(item => `
    <url>
      <loc>${BASE_URL}/${item.seoCategory}/${item.citySlug}/${item.slug}</loc>
      <lastmod>${new Date().toISOString()}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>0.8</priority>
    </url>`).join('');

  return wrapInUrlset(urls);
}

function generateLocalHubsSitemap(slugData) {
  const localHubsSet = new Set();
  slugData.forEach(item => {
    if (item.seoCategory && item.citySlug) {
      localHubsSet.add(`${item.seoCategory}/${item.citySlug}`);
    }
  });

  const urls = Array.from(localHubsSet).map(path => `
    <url>
      <loc>${BASE_URL}/${path}</loc>
      <lastmod>${new Date().toISOString()}</lastmod>
      <changefreq>daily</changefreq>
      <priority>0.85</priority>
    </url>`).join('');

  return wrapInUrlset(urls);
}

function generateStaticSitemap() {
  const staticUrls = [
    '',
    '/kontakt',
    '/regulamin',
    '/blog',
    '/umowy',
  ];

  const urls = staticUrls.map(path => `
    <url>
      <loc>${BASE_URL}${path}</loc>
      <lastmod>${new Date().toISOString()}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>${path === '' ? '1.0' : '0.5'}</priority>
    </url>`).join('');

  return wrapInUrlset(urls);
}

function wrapInUrlset(content) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${content}
</urlset>`;
}
