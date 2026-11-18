// Server-only: reads your Spotify listening with a long-lived refresh token.
// Needs SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET and SPOTIFY_REFRESH_TOKEN (see `npm run spotify:auth`).
// Never import this from a client component.

export interface Track {
  id: string;
  title: string;
  artists: string;
  album: string;
  albumArt: string | null;
  url: string;
  durationMs: number;
}

export interface NowPlaying {
  track: Track;
  /** True while the track is playing right now; false for the most recently played one. */
  isPlaying: boolean;
  /** When it was last played (only when not playing now). */
  playedAt?: string;
}

export interface LikedSong {
  track: Track;
  addedAt: string;
}

const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN;

/** False until the Spotify keys are set; the Listening section stays hidden until then. */
export const spotifyConfigured = Boolean(clientId && clientSecret && refreshToken);

// Caching in production: "now playing" refreshes every 30 seconds, liked songs every 10 minutes.
const live = process.env.NODE_ENV === "production" ? { next: { revalidate: 30 } } : { cache: "no-store" as const };
const slow = process.env.NODE_ENV === "production" ? { next: { revalidate: 600 } } : { cache: "no-store" as const };

let cachedToken: { value: string; expiresAt: number } | null = null;

async function accessToken(): Promise<string | null> {
  if (!spotifyConfigured) return null;
  if (cachedToken && cachedToken.expiresAt > Date.now() + 30_000) return cachedToken.value;
  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ grant_type: "refresh_token", refresh_token: refreshToken! }),
    cache: "no-store",
  });
  if (!response.ok) {
    console.error(`Spotify token refresh failed (${response.status}).`);
    return null;
  }
  const data = (await response.json()) as { access_token: string; expires_in: number };
  cachedToken = { value: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 };
  return data.access_token;
}

async function spotify<T>(path: string, options: RequestInit): Promise<T | null> {
  const token = await accessToken();
  if (!token) return null;
  const response = await fetch(`https://api.spotify.com/v1${path}`, { ...options, headers: { Authorization: `Bearer ${token}` } });
  // 204 means "nothing playing right now".
  if (response.status === 204 || !response.ok) return null;
  return (await response.json()) as T;
}

interface SpotifyTrack {
  id: string;
  name: string;
  duration_ms: number;
  external_urls: { spotify: string };
  artists: { name: string }[];
  album: { name: string; images: { url: string; width: number }[] };
}

function toTrack(track: SpotifyTrack): Track {
  // Spotify lists images largest first; pick the smallest one that's still at least 300px wide.
  const images = [...(track.album.images ?? [])].sort((a, b) => a.width - b.width);
  const art = images.find((image) => image.width >= 300) ?? images[images.length - 1];
  return {
    id: track.id,
    title: track.name,
    artists: track.artists.map((artist) => artist.name).join(", "),
    album: track.album.name,
    albumArt: art?.url ?? null,
    url: track.external_urls.spotify,
    durationMs: track.duration_ms,
  };
}

/** What's playing right now, or else the most recently played track. Null if unavailable. */
export async function getNowPlaying(): Promise<NowPlaying | null> {
  try {
    const current = await spotify<{ is_playing: boolean; currently_playing_type: string; item: SpotifyTrack | null }>(
      "/me/player/currently-playing",
      live,
    );
    if (current?.is_playing && current.item && current.currently_playing_type === "track") {
      return { track: toTrack(current.item), isPlaying: true };
    }
    const recent = await spotify<{ items: { track: SpotifyTrack; played_at: string }[] }>("/me/player/recently-played?limit=1", live);
    const last = recent?.items?.[0];
    return last ? { track: toTrack(last.track), isPlaying: false, playedAt: last.played_at } : null;
  } catch (error) {
    console.error("Unable to load Spotify playback.", error);
    return null;
  }
}

/** Your Liked Songs, most recently liked first (Spotify allows up to 50 per request). */
export async function getLikedSongs(limit = 50): Promise<LikedSong[]> {
  try {
    const liked = await spotify<{ items: { track: SpotifyTrack | null; added_at: string }[] }>(
      `/me/tracks?limit=${Math.min(Math.max(limit, 1), 50)}`,
      slow,
    );
    return (liked?.items ?? [])
      .filter((item): item is { track: SpotifyTrack; added_at: string } => Boolean(item.track?.id))
      .map((item) => ({ track: toTrack(item.track), addedAt: item.added_at }));
  } catch (error) {
    console.error("Unable to load Spotify liked songs.", error);
    return [];
  }
}

/** "3 hours ago", "2 days ago". */
export function timeAgo(iso: string, now = Date.now()) {
  const seconds = Math.round((new Date(iso).getTime() - now) / 1000);
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 31_536_000],
    ["month", 2_592_000],
    ["week", 604_800],
    ["day", 86_400],
    ["hour", 3_600],
    ["minute", 60],
  ];
  const format = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  for (const [unit, size] of units) if (Math.abs(seconds) >= size) return format.format(Math.round(seconds / size), unit);
  return "just now";
}
