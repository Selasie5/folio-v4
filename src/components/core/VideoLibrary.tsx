import MoreLink from "@/components/core/MoreLink";
import VideoCard from "@/components/core/VideoCard";
import type { Video } from "@/content/videos";

/** How many videos the home page shows before linking to /videos. */
export const VIDEO_PREVIEW_COUNT = 3;

/** Home-page section: the first few videos as cards, with a link to the full library. */
export default function VideoLibrary({ videos }: { videos: Video[] }) {
  if (videos.length === 0) return null;

  return (
    <section className="mt-14 w-full sm:mt-16" aria-labelledby="videos-heading">
      <div className="flex items-center justify-between gap-4">
        <h2 id="videos-heading" className="text-lg text-black dark:text-neutral-100 mono">Video Library</h2>
        {videos.length > VIDEO_PREVIEW_COUNT && <MoreLink href="/videos" label="View all" />}
      </div>
      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {videos.slice(0, VIDEO_PREVIEW_COUNT).map((video) => (
          <VideoCard key={video.youtubeId} video={video} compact />
        ))}
      </div>
    </section>
  );
}
