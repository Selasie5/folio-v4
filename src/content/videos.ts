import videosData from "./videos.json";

/** A YouTube video in the Video Library. */
export interface Video {
  youtubeId: string;
  title: string;
  channel?: string;
  description?: string;
  durationSeconds?: number;
}

// Local copies, used only if Sanity can't be reached. Kept as JSON so scripts/seed-videos.mjs can read them.
export const videos: Video[] = videosData;

export const youtubeUrl = (id: string) => `https://www.youtube.com/watch?v=${id}`;
// hqdefault exists for every video (maxresdefault doesn't always).
export const youtubeThumbnail = (id: string) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;

/** 37:05 or 1:41:20 */
export function formatDuration(totalSeconds?: number) {
  if (!totalSeconds || !Number.isFinite(totalSeconds) || totalSeconds <= 0) return null;
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = String(Math.floor(totalSeconds % 60)).padStart(2, "0");
  return hours ? `${hours}:${String(minutes).padStart(2, "0")}:${seconds}` : `${minutes}:${seconds}`;
}
