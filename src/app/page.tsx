import HomeContent from "@/components/core/HomeContent";
import { getPosts } from "@/sanity/fetchPosts";
import { getPortfolioContent } from "@/sanity/fetchPortfolio";
import { getSideQuests } from "@/sanity/fetchSideQuests";
import { getVideos } from "@/sanity/fetchVideos";
import { getBooks } from "@/sanity/fetchBooks";
import { getLikedSongs, getNowPlaying, spotifyConfigured, timeAgo } from "@/lib/spotify";

export default async function Home() {
  const [content, posts, sideQuests, videos, books, nowPlaying, liked] = await Promise.all([getPortfolioContent(), getPosts().catch((error) => {
      console.error("Unable to load posts for the home page; showing none.", error);
      return [];
    }), getSideQuests(), getVideos(), getBooks(), spotifyConfigured ? getNowPlaying() : null, spotifyConfigured ? getLikedSongs(3) : []]);

  // Spotify: hidden until it's connected (npm run spotify:auth). The "x ago" label is computed here, on the server.
  const listening = spotifyConfigured
    ? { nowPlaying, liked, playedLabel: nowPlaying?.playedAt ? timeAgo(nowPlaying.playedAt) : undefined }
    : undefined;

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
    contacts: (content.contacts ?? []).filter((contact) => ["github", "mail"].includes(contact.label?.trim().toLowerCase())),
  };

  return <HomeContent content={homeContent} posts={posts} sideQuests={sideQuestSummaries} videos={videos} books={books} listening={listening} />;
}
