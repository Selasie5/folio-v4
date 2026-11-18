import type { LikedSong, NowPlaying, Track } from "@/lib/spotify";
import MoreLink from "@/components/core/MoreLink";

/** How many liked songs the home page shows before linking to /music. */
export const LIKED_PREVIEW_COUNT = 3;

const SpotifyIcon = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" aria-hidden className={className} fill="currentColor">
    <path d="M12 0a12 12 0 1 0 0 24 12 12 0 0 0 0-24Zm5.5 17.3a.75.75 0 0 1-1 .25c-2.86-1.75-6.46-2.14-10.7-1.17a.75.75 0 1 1-.33-1.46c4.64-1.06 8.62-.6 11.8 1.35.36.22.47.68.24 1.03Zm1.47-3.27a.94.94 0 0 1-1.29.31c-3.27-2-8.27-2.6-12.14-1.42a.94.94 0 1 1-.55-1.8c4.43-1.34 9.94-.7 13.67 1.6.44.27.58.85.31 1.3Zm.13-3.4C15.18 8.3 8.73 8.08 5 9.21a1.12 1.12 0 1 1-.65-2.15c4.29-1.3 11.42-1.05 15.92 1.62a1.12 1.12 0 0 1-1.15 1.94Z" />
  </svg>
);

/** Three bouncing bars, shown while a track is playing right now. */
const PlayingBars = () => (
  <span aria-hidden className="spotify-bars inline-flex h-3 items-end gap-[2px]">
    <span />
    <span />
    <span />
  </span>
);

function AlbumArt({ track, size }: { track: Track; size: "lg" | "sm" }) {
  const box = size === "lg" ? "h-16 w-16 rounded-md" : "h-10 w-10 rounded";
  return track.albumArt ? (
    // eslint-disable-next-line @next/next/no-img-element -- album art comes from Spotify's CDN
    <img src={track.albumArt} alt="" loading="lazy" className={`${box} shrink-0 object-cover shadow-sm ring-1 ring-black/5 dark:ring-white/10`} />
  ) : (
    <span className={`${box} flex shrink-0 items-center justify-center bg-gray-100 text-gray-400 dark:bg-neutral-800`}>
      <SpotifyIcon />
    </span>
  );
}

/** A one-line Spotify status for the header: icon (or playing bars), then the song and artist. */
export function NowPlayingStatus({ nowPlaying, playedLabel }: { nowPlaying: NowPlaying; playedLabel?: string }) {
  const { track, isPlaying } = nowPlaying;
  const when = isPlaying ? "Now playing on Spotify" : `Last played on Spotify${playedLabel ? ` · ${playedLabel}` : ""}`;
  return (
    <a
      href={track.url}
      target="_blank"
      rel="noopener noreferrer"
      title={`${when}: ${track.title} by ${track.artists}`}
      className="group mt-1 flex min-w-0 max-w-full items-center gap-1.5 text-xs leading-5 text-gray-500 transition-colors hover:text-black dark:text-neutral-400 dark:hover:text-white"
    >
      <span className="sr-only">{when}: </span>
      <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center text-[#1DB954]">
        {isPlaying ? <PlayingBars /> : <SpotifyIcon className="h-3.5 w-3.5" />}
      </span>
      <span className="truncate">
        <span className="text-gray-700 group-hover:text-black dark:text-neutral-200 dark:group-hover:text-white">{track.title}</span>
        <span aria-hidden> · </span>
        {track.artists}
      </span>
    </a>
  );
}

/** The current or most recently played track. */
export function NowPlayingCard({ nowPlaying, playedLabel }: { nowPlaying: NowPlaying; playedLabel?: string }) {
  const { track, isPlaying } = nowPlaying;
  return (
    <a
      href={track.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex w-full items-center gap-4 rounded-lg border border-gray-200 bg-white p-3 transition-colors hover:border-gray-300 dark:border-neutral-800 dark:bg-neutral-900/60 dark:hover:border-neutral-700"
    >
      <AlbumArt track={track} size="lg" />
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-[#1DB954]">
          {isPlaying ? <PlayingBars /> : <SpotifyIcon className="h-3 w-3" />}
          {isPlaying ? "Now playing" : "Last played"}
          {!isPlaying && playedLabel && <span className="font-normal normal-case tracking-normal text-gray-400 dark:text-neutral-500">· {playedLabel}</span>}
        </p>
        <p className="mt-1 truncate text-sm font-medium text-black dark:text-white">{track.title}</p>
        <p className="truncate text-xs leading-5 text-gray-500 dark:text-neutral-400">{track.artists}</p>
      </div>
    </a>
  );
}

/** A liked song as a list row. */
export function LikedSongRow({ song, showAlbum = false }: { song: LikedSong; showAlbum?: boolean }) {
  const { track } = song;
  return (
    <a href={track.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 py-2.5">
      <AlbumArt track={track} size="sm" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm leading-5 text-black dark:text-white">{track.title}</p>
        <p className="truncate text-xs leading-5 text-gray-500 dark:text-neutral-400">
          {track.artists}
          {showAlbum && <span className="hidden sm:inline"> · {track.album}</span>}
        </p>
      </div>
      <span className="shrink-0 text-xs tabular-nums text-gray-400 dark:text-neutral-500">
        {Math.floor(track.durationMs / 60_000)}:{String(Math.floor((track.durationMs % 60_000) / 1000)).padStart(2, "0")}
      </span>
    </a>
  );
}

/** Home-page section: a few recently liked songs, linking to the full list on /music.
 *  (The now playing / last played card sits under the intro instead.) */
export default function Listening({ liked }: { liked: LikedSong[] }) {
  if (liked.length === 0) return null;

  return (
    <section className="mt-14 w-full sm:mt-16" aria-labelledby="liked-heading">
      <div className="flex items-center justify-between gap-4">
        <h2 id="liked-heading" className="text-lg text-black dark:text-neutral-100 mono">Liked Songs</h2>
        {liked.length > 0 && <MoreLink href="/music" label="View all" />}
      </div>
      <ul className="focus-list mt-5 w-full divide-y divide-dotted divide-gray-300 border-y border-dotted border-gray-300 dark:divide-neutral-700 dark:border-neutral-700">
        {liked.slice(0, LIKED_PREVIEW_COUNT).map((song) => (
          <li key={song.track.id + song.addedAt}>
            <LikedSongRow song={song} />
          </li>
        ))}
      </ul>
    </section>
  );
}
