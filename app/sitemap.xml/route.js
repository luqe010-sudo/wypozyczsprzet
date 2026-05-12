const BASE_URL = 'https://wypozycz.online';

export async function GET() {
  const sitemaps = [
    'offers.xml',
    'categories.xml',
    'local-hubs.xml',
    'static-pages.xml',
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${sitemaps.map(s => `
  <sitemap>
    <loc>${BASE_URL}/sitemaps/${s}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>`).join('')}
</sitemapindex>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=59',
    },
  });
}
