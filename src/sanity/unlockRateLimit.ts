// Server-only: limits access-code attempts per visitor.
//
// - One counter per visitor (client IP) across all side quests, so inventing slugs can't create
//   extra counters or spread guesses over many keys.
// - An attempt is reserved (counted) *before* the code is checked, in one synchronous step, so
//   simultaneous requests can't all slip past the limit while earlier checks are still running.
// - Active counters are never evicted to make room. Only expired ones are dropped; if the table is
//   still full, new visitors are refused briefly (fail closed) rather than resetting anyone's count.
// - A correct code refunds only the attempt that used it, so knowing one code can't be used to
//   reset guesses against another side quest. The refund applies only to the window the attempt was
//   reserved in, so a slow check that finishes after the window rolls over can't erase newer guesses.
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

/** The outcome of reserving an attempt: allowed (with the window it was counted in), or refused. */
export type Reservation = { allowed: true; window: number } | { allowed: false; waitMinutes: number };

/**
 * Reserves one attempt for this visitor. Synchronous on purpose: check-and-count can't interleave.
 * The returned window identifies the counting window, for refundAttempt.
 */
export function reserveAttempt(visitor: string, now = Date.now()): Reservation {
  const entry = attempts.get(visitor);
  if (entry && entry.resetAt > now) {
    if (entry.count >= MAX_ATTEMPTS) return { allowed: false, waitMinutes: minutesUntil(entry.resetAt, now) };
    entry.count += 1;
    return { allowed: true, window: entry.resetAt };
  }
  // Expired visitors restart in place; new visitors need a free slot without dropping an active counter.
  if (!entry && !makeRoom(now)) return { allowed: false, waitMinutes: 1 };
  const resetAt = now + WINDOW_MS;
  attempts.set(visitor, { count: 1, resetAt });
  return { allowed: true, window: resetAt };
}

/**
 * A correct code: refund the one attempt it used, but only within the window it was reserved in.
 * Earlier wrong guesses still count, and a newer window is never touched.
 */
export function refundAttempt(visitor: string, window: number) {
  const entry = attempts.get(visitor);
  if (entry && entry.resetAt === window && entry.count > 0) entry.count -= 1;
}

/** For tests only. */
export const __limits = { MAX_ATTEMPTS, MAX_TRACKED, WINDOW_MS, size: () => attempts.size, reset: () => attempts.clear() };
