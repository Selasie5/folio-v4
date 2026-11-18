import HomeContent from "@/components/core/HomeContent";
import { getPosts } from "@/content/devto";
import { getPortfolioContent } from "@/sanity/fetchPortfolio";

export default async function Home() {
  const [content, posts] = await Promise.all([getPortfolioContent(), getPosts()]);

  return <HomeContent content={content} posts={posts} />;
}
