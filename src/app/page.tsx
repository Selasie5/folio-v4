import HomeContent from "@/components/core/HomeContent";
import { getPosts } from "@/sanity/fetchPosts";
import { getPortfolioContent } from "@/sanity/fetchPortfolio";
import { getSideQuests } from "@/sanity/fetchSideQuests";

export default async function Home() {
  const [content, posts, sideQuests] = await Promise.all([getPortfolioContent(), getPosts(), getSideQuests()]);

  // The home list only shows summaries, so don't send every story to the browser.
  const sideQuestSummaries = sideQuests.map((quest) => ({
    slug: quest.slug,
    name: quest.name,
    tagline: quest.tagline,
    status: quest.status,
    confidential: quest.confidential,
    intro: [],
    sections: [],
  }));

  return <HomeContent content={content} posts={posts} sideQuests={sideQuestSummaries} />;
}
