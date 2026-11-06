import {
  fetchAllCompanies,
  getPrimaryCitySlug,
  voivodeshipSlug,
  slugify,
} from '../../../lib/supabaseDirectory';
import { SITE_URL } from '../../../lib/site';

/**
 * Generates a sitemap XML for all /katalog/* pages.
 * Includes the catalog and the canonical URL for each company.
 */
export async function GET() {
  const companies = await fetchAllCompanies();

  const urls = [];

  // Main catalog page
  urls.push({
    loc: `${SITE_URL}/katalog`,
    priority: '0.8',
    changefreq: 'weekly',
  });

  for (const company of companies) {
    const compSlug = company.slug || slugify(company.name);
    const primaryCity = getPrimaryCitySlug(company);
    const places = primaryCity
      ? [primaryCity]
      : [...new Set((company.branches || []).filter((branch) => branch.voivodeship).map((branch) => `woj/${voivodeshipSlug(branch.voivodeship)}`))];
    for (const place of places) {
      urls.push({
        loc: `${SITE_URL}/katalog/${place}/${encodeURIComponent(compSlug)}`,
        priority: '0.7',
        changefreq: 'monthly',
        lastmod: company.updated_at || company.created_at || undefined,
      });
    }
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>${
      u.lastmod ? `\n    <lastmod>${new Date(u.lastmod).toISOString().split('T')[0]}</lastmod>` : ''
    }
  </url>`
  )
  .join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
