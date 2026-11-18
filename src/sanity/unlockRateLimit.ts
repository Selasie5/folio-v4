// Server-only: limits wrong access-code attempts per visitor and side quest.
//
// The counts live in this server instance's memory. That caps guessing well on a single server,
// but on a platform that runs several instances (like Vercel), each instance keeps its own count.
// For a limit shared across all instances, back this with a shared store such as Upstash Redis.

const MAX_FAILURES = 5;
const WINDOW_MS = 15 * 60 * 1000;
const MAX_TRACKED = 10_000;

const failures = new Map<string, { count: number; resetAt: number }>();

function prune(now: number) {
  for (const [key, entry] of failures) if (entry.resetAt <= now) failures.delete(key);
  // Bound memory even under a flood of distinct keys: drop the oldest entries.
  while (failures.size > MAX_TRACKED) failures.delete(failures.keys().next().value!);
}

/** Minutes until this visitor may try again, or 0 if they're allowed to try now. */
export function lockedOutMinutes(key: string, now = Date.now()): number {
  const entry = failures.get(key);
  if (!entry || entry.resetAt <= now || entry.count < MAX_FAILURES) return 0;
  return Math.ceil((entry.resetAt - now) / 60_000);
}

export function recordFailure(key: string, now = Date.now()) {
  prune(now);
  const entry = failures.get(key);
  if (!entry || entry.resetAt <= now) failures.set(key, { count: 1, resetAt: now + WINDOW_MS });
  else entry.count += 1;
}

export function clearFailures(key: string) {
  failures.delete(key);
}
