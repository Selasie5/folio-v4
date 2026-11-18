import HomeContent from "@/components/core/HomeContent";
import { getPosts } from "@/sanity/fetchPosts";
import { getPortfolioContent } from "@/sanity/fetchPortfolio";
import { getSideQuests } from "@/sanity/fetchSideQuests";

export default async function Home() {
  const [content, posts, sideQuests] = await Promise.all([getPortfolioContent(), getPosts(), getSideQuests()]);

  return <HomeContent content={content} posts={posts} sideQuests={sideQuests} />;
}
