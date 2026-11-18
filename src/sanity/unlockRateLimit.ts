// Server-only: limits access-code attempts per visitor.
//
// - One counter per visitor (client IP) across all side quests, so inventing slugs can't create
//   extra counters or spread guesses over many keys.
// - An attempt is reserved (counted) *before* the code is checked, in one synchronous step, so
//   simultaneous requests can't all slip past the limit while earlier checks are still running.
// - Active counters are never evicted to make room. Only expired ones are dropped; if the table is
//   still full, new visitors are refused briefly (fail closed) rather than resetting anyone's count.
// - A correct code refunds only the attempt that used it, so knowing one code can't be used to
//   reset guesses against another side quest.
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

/** Drops expired entries only. Returns whether there is room for a new visitor. */
function makeRoom(now: number): boolean {
  if (attempts.size < MAX_TRACKED) return true;
  for (const [key, entry] of attempts) if (entry.resetAt <= now) attempts.delete(key);
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
  if (entry) {
    // Expired: start a fresh window in place.
    attempts.set(visitor, { count: 1, resetAt: now + WINDOW_MS });
    return 0;
  }
  // New visitor: needs a slot. If none is free without dropping an active counter, refuse.
  if (!makeRoom(now)) return 1;
  attempts.set(visitor, { count: 1, resetAt: now + WINDOW_MS });
  return 0;
}

/** A correct code: refund the one attempt it used. Earlier wrong guesses still count. */
export function refundAttempt(visitor: string) {
  const entry = attempts.get(visitor);
  if (entry && entry.count > 0) entry.count -= 1;
}

/** For tests only. */
export const __limits = { MAX_ATTEMPTS, MAX_TRACKED, size: () => attempts.size, reset: () => attempts.clear() };
