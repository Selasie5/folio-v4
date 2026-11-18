import { videos as localVideos, type Video } from "@/content/videos";
import { sanityClient } from "./client";

const videosQuery = `*[_type == "video" && defined(youtubeId) && !(_id in path("drafts.**"))] | order(order asc){
  youtubeId,
  title,
  channel,
  description,
  durationSeconds
}`;

// Fresh on every request in dev; cached for a minute in production.
const fetchOptions =
  process.env.NODE_ENV === "production" ? { next: { revalidate: 60 } } : { cache: "no-store" as const };

// GROQ returns null for missing fields; the cards expect them to be absent.
const clean = (video: Video): Video => ({
  ...video,
  channel: video.channel ?? undefined,
  description: video.description ?? undefined,
  durationSeconds: video.durationSeconds ?? undefined,
});

/** The Video Library, edited in Sanity Studio. Falls back to src/content/videos.json if Sanity has none or fails. */
export async function getVideos(): Promise<Video[]> {
  if (sanityClient) {
    try {
      const videos = await sanityClient.fetch<Video[]>(videosQuery, {}, fetchOptions);
      if (videos.length > 0) return videos.map(clean);
    } catch (error) {
      console.error("Unable to load videos from Sanity; using the local copies.", error);
    }
  }
  return localVideos;
}
