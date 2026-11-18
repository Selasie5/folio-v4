// Server-only: limits access-code attempts per visitor.
//
// - One counter per visitor (client IP) across all side quests, so inventing slugs can't create
//   extra counters or spread guesses over many keys.
// - An attempt is reserved (counted) *before* the code is checked, in one synchronous step, so
//   simultaneous requests can't all slip past the limit while earlier checks are still running.
// - Locked-out visitors are never evicted to make room. If the table fills up with them, new
//   visitors are refused briefly (fail closed) rather than letting anyone back in.
// - A correct code clears the visitor's count.
//
// The counts live in this server instance's memory. On a platform that runs several instances
// (like Vercel), each instance keeps its own count; for one limit across all of them, back this with
// a shared store such as Upstash Redis. The visitor key relies on the platform's x-forwarded-for
// header (set by Vercel), so it's only as trustworthy as the proxy in front of the app.

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;
const MAX_TRACKED = 10_000;

const attempts = new Map<string, { count: number; resetAt: number }>();

const minutesUntil = (time: number, now: number) => Math.max(1, Math.ceil((time - now) / 60_000));

/** Drops expired entries, then (only if still full) the oldest entries that aren't locked out. */
function makeRoom(now: number): boolean {
  for (const [key, entry] of attempts) if (entry.resetAt <= now) attempts.delete(key);
  if (attempts.size < MAX_TRACKED) return true;
  for (const [key, entry] of attempts) {
    if (entry.count < MAX_ATTEMPTS) {
      attempts.delete(key);
      if (attempts.size < MAX_TRACKED) return true;
    }
  }
  return attempts.size < MAX_TRACKED;
}

/**
 * Reserves one attempt for this visitor. Returns 0 if the attempt may go ahead, or the number of
 * minutes until they may try again. Synchronous on purpose: check-and-count can't interleave.
 */
export function reserveAttempt(visitor: string, now = Date.now()): number {
  const entry = attempts.get(visitor);
  if (entry && entry.resetAt > now) {
    if (entry.count >= MAX_ATTEMPTS) return minutesUntil(entry.resetAt, now);
    entry.count += 1;
    return 0;
  }
  // New (or expired) visitor: needs a slot. If none can be freed without dropping a lockout, refuse.
  if (!attempts.has(visitor) && !makeRoom(now)) return 1;
  attempts.set(visitor, { count: 1, resetAt: now + WINDOW_MS });
  return 0;
}

/** A correct code: forget this visitor's attempts. */
export function clearAttempts(visitor: string) {
  attempts.delete(visitor);
}

/** For tests only. */
export const __limits = { MAX_ATTEMPTS, MAX_TRACKED, size: () => attempts.size, reset: () => attempts.clear() };
