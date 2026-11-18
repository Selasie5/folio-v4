// Server-only: limits access-code attempts per visitor and side quest.
//
// An attempt is reserved (counted) *before* the code is checked, in one synchronous step, so
// simultaneous requests can't all slip past the limit while earlier checks are still running.
// A correct code clears the count.
//
// The counts live in this server instance's memory. That caps guessing on a single server, but on
// a platform that runs several instances (like Vercel), each instance keeps its own count. For one
// limit across all instances, back this with a shared store such as Upstash Redis. The visitor key
// relies on the platform's x-forwarded-for header (set by Vercel), so it's only as trustworthy as
// the proxy in front of the app.

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;
const MAX_TRACKED = 10_000;

const attempts = new Map<string, { count: number; resetAt: number }>();

function prune(now: number) {
  for (const [key, entry] of attempts) if (entry.resetAt <= now) attempts.delete(key);
  // Bound memory even under a flood of distinct keys: drop the oldest entries.
  while (attempts.size > MAX_TRACKED) attempts.delete(attempts.keys().next().value!);
}

/**
 * Reserves one attempt for this visitor. Returns 0 if the attempt may go ahead, or the number of
 * minutes until they may try again. Synchronous on purpose: check-and-count can't interleave.
 */
export function reserveAttempt(key: string, now = Date.now()): number {
  prune(now);
  const entry = attempts.get(key);
  if (!entry || entry.resetAt <= now) {
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return 0;
  }
  if (entry.count >= MAX_ATTEMPTS) return Math.ceil((entry.resetAt - now) / 60_000);
  entry.count += 1;
  return 0;
}

/** A correct code: forget this visitor's attempts. */
export function clearAttempts(key: string) {
  attempts.delete(key);
}
