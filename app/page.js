import Marketplace from '../components/Marketplace';
import { fetchMarketplaceData } from '../lib/googleSheets';

export default async function Home() {
  const data = await fetchMarketplaceData();

  return (
    <Marketplace initialData={data} />
  );
}
