import { ChevronRightIcon, PlayIcon } from "@heroicons/react/20/solid";
import { formatDuration, youtubeThumbnail, youtubeUrl, type Video } from "@/content/videos";

/** A video card: thumbnail with duration, title, short description and a YouTube link. */
export default function VideoCard({ video, compact = false }: { video: Video; compact?: boolean }) {
  const duration = formatDuration(video.durationSeconds);

  return (
    <a
      href={youtubeUrl(video.youtubeId)}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white transition-colors hover:border-gray-300 dark:border-neutral-800 dark:bg-neutral-900/60 dark:hover:border-neutral-700"
    >
      <div className="relative aspect-video w-full overflow-hidden bg-gray-100 dark:bg-neutral-800">
        {/* eslint-disable-next-line @next/next/no-img-element -- YouTube serves its own sized thumbnails */}
        <img
          src={youtubeThumbnail(video.youtubeId)}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
        <span className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm">
            <PlayIcon aria-hidden className="ml-0.5 h-5 w-5" />
          </span>
        </span>
        {duration && (
          <span className="absolute bottom-2 right-2 rounded-md bg-black/75 px-1.5 py-0.5 text-[11px] font-medium tabular-nums text-white">
            {duration}
          </span>
        )}
      </div>

      <div className={`flex flex-1 flex-col ${compact ? "gap-1.5 p-3.5" : "gap-2 p-4"}`}>
        <h3 className={`line-clamp-2 font-medium leading-snug text-black dark:text-white ${compact ? "text-[13px]" : "text-sm"}`}>
          {video.title}
        </h3>
        {video.description && (
          <p className={`text-xs leading-5 text-gray-500 dark:text-neutral-400 ${compact ? "line-clamp-2" : "line-clamp-3"}`}>
            {video.description}
          </p>
        )}
        <div className="mt-auto flex items-center justify-between gap-2 pt-2 text-xs text-gray-500 dark:text-neutral-400">
          <span className="truncate">{video.channel}</span>
          <span className="inline-flex shrink-0 items-center gap-0.5 text-gray-600 transition-colors group-hover:text-black dark:text-neutral-300 dark:group-hover:text-white">
            YouTube
            <ChevronRightIcon aria-hidden className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </a>
  );
}
