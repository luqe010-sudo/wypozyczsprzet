import Marketplace from '../components/Marketplace';
import CategoryHubs from '../components/CategoryHubs';
import { fetchMarketplaceData } from '../lib/googleSheets';
import { SEO_CATEGORY_SLUGS } from '../lib/categories';

export default async function Home() {
  const data = await fetchMarketplaceData();

  // Count offers per SEO category
  const categoryCounts = {};
  SEO_CATEGORY_SLUGS.forEach((slug) => {
    categoryCounts[slug] = data.listings.filter((l) => l.seoCategory === slug).length;
  });

  return (
    <>
      <Marketplace initialData={data} />
      <CategoryHubs categoryCounts={categoryCounts} />
    </>
  );
}
