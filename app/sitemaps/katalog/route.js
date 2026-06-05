import {
  fetchAllCompanies,
  citySlug,
  voivodeshipSlug,
  slugify,
} from '../../../lib/supabaseDirectory';

/**
 * Generates a sitemap XML for all /katalog/* pages.
 * Includes:
 *  - /katalog (main listing)
 *  - /katalog/[city]/[companySlug] (city variants)
 *  - /katalog/woj/[voivodeship]/[companySlug] (voivodeship variants)
 */
export async function GET() {
  const BASE = 'https://wypozycz.online';
  const companies = await fetchAllCompanies();

  const urls = [];

  // Main catalog page
  urls.push({
    loc: `${BASE}/katalog`,
    priority: '0.8',
    changefreq: 'weekly',
  });

  for (const company of companies) {
    const compSlug = company.slug || slugify(company.name);
    const seenCities = new Set();
    const seenVoivodeships = new Set();

    for (const branch of company.branches || []) {
      // City variants
      if (branch.city) {
        const cSlug = citySlug(branch.city);
        if (!seenCities.has(cSlug)) {
          seenCities.add(cSlug);
          urls.push({
            loc: `${BASE}/katalog/${cSlug}/${compSlug}`,
            priority: '0.7',
            changefreq: 'monthly',
            lastmod: company.updated_at || company.created_at || undefined,
          });
        }
      }

      // Voivodeship variants
      if (branch.voivodeship) {
        const vSlug = voivodeshipSlug(branch.voivodeship);
        if (!seenVoivodeships.has(vSlug)) {
          seenVoivodeships.add(vSlug);
          urls.push({
            loc: `${BASE}/katalog/woj/${vSlug}/${compSlug}`,
            priority: '0.6',
            changefreq: 'monthly',
            lastmod: company.updated_at || company.created_at || undefined,
          });
        }
      }
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
