import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LikedSongRow, NowPlayingCard } from "@/components/core/Listening";
import PageTopBar from "@/components/layout/PageTopBar";
import { getLikedSongs, getNowPlaying, spotifyConfigured, timeAgo } from "@/lib/spotify";

export const metadata: Metadata = {
  title: "Liked Songs | Selasie Sepenu",
  description: "What Selasie Sepenu is listening to on Spotify, plus the songs most recently liked.",
};

export default async function MusicPage() {
  // Hidden until Spotify is connected (npm run spotify:auth).
  if (!spotifyConfigured) notFound();

  const [nowPlaying, liked] = await Promise.all([getNowPlaying(), getLikedSongs(50)]);

  return (
    <main className="flex w-full flex-col items-start">
      <PageTopBar href="/" label="Back home" />
      <header className="mt-8">
        <h1 className="text-2xl leading-tight text-black dark:text-neutral-100 mono">Liked Songs</h1>
        <p className="mt-3 max-w-[52ch] text-sm leading-6 text-gray-500 dark:text-neutral-400">
          What I&apos;m listening to, and the {liked.length > 0 ? liked.length : ""} songs I&apos;ve liked most recently on Spotify.
        </p>
      </header>

      {nowPlaying && (
        <div className="mt-8 w-full">
          <NowPlayingCard nowPlaying={nowPlaying} playedLabel={nowPlaying.playedAt ? timeAgo(nowPlaying.playedAt) : undefined} />
        </div>
      )}

      {liked.length > 0 ? (
        <ol className="focus-list mt-6 w-full divide-y divide-dotted divide-gray-300 border-y border-dotted border-gray-300 dark:divide-neutral-700 dark:border-neutral-700">
          {liked.map((song) => (
            <li key={song.track.id + song.addedAt}>
              <LikedSongRow song={song} showAlbum />
            </li>
          ))}
        </ol>
      ) : (
        <p className="mt-8 text-sm text-gray-500 dark:text-neutral-400">Liked songs couldn&apos;t be loaded right now.</p>
      )}
    </main>
  );
}
