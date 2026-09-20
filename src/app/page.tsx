import HomeContent from "@/components/core/HomeContent";
import { getPortfolioContent } from "@/sanity/fetchPortfolio";

export default async function Home() {
  const content = await getPortfolioContent();

  return <HomeContent content={content} />;
}
