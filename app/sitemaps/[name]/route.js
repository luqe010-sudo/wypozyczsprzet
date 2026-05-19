import { fetchAllSlugs } from '../../../lib/googleSheets';
import { SEO_CATEGORY_SLUGS } from '../../../lib/categories';
import { articles } from '../../../lib/articles';
import { documents } from '../../../lib/umowy-data';
import { getVoivodeshipSlugForCity } from '../../../lib/regions';

const BASE_URL = 'https://wypozycz.online';

export async function GET(request, { params }) {
  const { name } = params;
  let xml = '';

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
  } else if (name === 'blog.xml') {
    xml = generateBlogSitemap();
  } else if (name === 'umowy.xml') {
    xml = generateUmowySitemap();
  } else if (name === 'cities.xml') {
    const slugData = await fetchAllSlugs();
    xml = generateCitiesSitemap(slugData);
  } else if (name === 'voivodeships.xml') {
    const slugData = await fetchAllSlugs();
    xml = generateVoivodeshipsSitemap(slugData);
  } else {
    return new Response('Not Found', { status: 404 });
  }

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=59',
      'X-Content-Type-Options': 'nosniff',
    },
  });
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

function generateBlogSitemap() {
  const urls = articles.map(article => `
    <url>
      <loc>${BASE_URL}/blog/${article.slug}</loc>
      <lastmod>${article.date ? new Date(article.date).toISOString() : new Date().toISOString()}</lastmod>
      <changefreq>monthly</changefreq>
      <priority>0.6</priority>
    </url>`).join('');

  return wrapInUrlset(urls);
}

function generateUmowySitemap() {
  const urls = documents.map(doc => `
    <url>
      <loc>${BASE_URL}/umowy/${doc.slug}</loc>
      <lastmod>${new Date().toISOString()}</lastmod>
      <changefreq>monthly</changefreq>
      <priority>0.6</priority>
    </url>`).join('');

  return wrapInUrlset(urls);
}

function generateCitiesSitemap(slugData) {
  const citiesSet = new Set();
  slugData.forEach(item => {
    if (item.citySlug) {
      citiesSet.add(item.citySlug);
    }
  });

  const urls = Array.from(citiesSet).map(slug => `
    <url>
      <loc>${BASE_URL}/${slug}</loc>
      <lastmod>${new Date().toISOString()}</lastmod>
      <changefreq>daily</changefreq>
      <priority>0.85</priority>
    </url>`).join('');

  return wrapInUrlset(urls);
}

function generateVoivodeshipsSitemap(slugData) {
  const voivodeshipsSet = new Set();
  slugData.forEach(item => {
    if (item.citySlug) {
      const vSlug = getVoivodeshipSlugForCity(item.citySlug);
      if (vSlug) {
        voivodeshipsSet.add(vSlug);
      }
    }
  });

  const urls = Array.from(voivodeshipsSet).map(slug => `
    <url>
      <loc>${BASE_URL}/${slug}</loc>
      <lastmod>${new Date().toISOString()}</lastmod>
      <changefreq>daily</changefreq>
      <priority>0.85</priority>
    </url>`).join('');

  return wrapInUrlset(urls);
}

function wrapInUrlset(content) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${content.trim()}
</urlset>`.trim();
}
