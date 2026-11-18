import HomeContent from "@/components/core/HomeContent";
import { getPosts } from "@/sanity/fetchPosts";
import { getPortfolioContent } from "@/sanity/fetchPortfolio";
import { getSideQuests } from "@/sanity/fetchSideQuests";
import { getVideos } from "@/sanity/fetchVideos";

export default async function Home() {
  const [content, posts, sideQuests, videos] = await Promise.all([getPortfolioContent(), getPosts(), getSideQuests(), getVideos()]);

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

  // Let's Connect only uses GitHub and email; don't send the other contact links to the browser.
  const homeContent = {
    ...content,
    contacts: (content.contacts ?? []).filter((contact) => contact.label === "github" || contact.label === "mail"),
  };

  return <HomeContent content={homeContent} posts={posts} sideQuests={sideQuestSummaries} videos={videos} />;
}
