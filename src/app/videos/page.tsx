import type { Metadata } from "next";
import VideoCard from "@/components/core/VideoCard";
import PageTopBar from "@/components/layout/PageTopBar";
import { getVideos } from "@/sanity/fetchVideos";

export const metadata: Metadata = {
  title: "Video Library | Selasie Sepenu",
  description: "Talks, interviews and tutorials on software engineering that Selasie Sepenu recommends.",
};

export default async function VideosPage() {
  const videos = await getVideos();

  return (
    <main className="flex w-full flex-col items-start">
      <PageTopBar href="/" label="Back home" />
      <header className="mt-8">
        <h1 className="text-2xl leading-tight text-black dark:text-neutral-100 mono">Video Library</h1>
        <p className="mt-3 max-w-[52ch] text-sm leading-6 text-gray-500 dark:text-neutral-400">
          Talks, interviews and deep dives on building software that I keep coming back to.
        </p>
      </header>
      <div className="mt-8 grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
        {videos.map((video) => (
          <VideoCard key={video.youtubeId} video={video} />
        ))}
      </div>
    </main>
  );
}
