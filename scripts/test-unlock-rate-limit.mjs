// Tests for src/sanity/unlockRateLimit.ts. Run with: npm run test:unlock-limit
// Needs Node 22.6+ (it imports the .ts file directly with type stripping).
import assert from "node:assert/strict";

const { reserveAttempt, refundAttempt, __limits } = await import(new URL("../src/sanity/unlockRateLimit.ts", import.meta.url).href);
const now = Date.now();
const allowed = (reservation) => reservation.allowed;

// 1. Five attempts are allowed, the sixth is refused.
__limits.reset();
assert.deepEqual(Array.from({ length: 5 }, () => allowed(reserveAttempt("attacker", now))), [true, true, true, true, true]);
assert.equal(allowed(reserveAttempt("attacker", now)), false, "sixth attempt should be refused");

// 2. A flood can't evict any active counter.
__limits.reset();
for (let n = 0; n < 4; n += 1) reserveAttempt("partway", now);
for (let i = 0; i < 20_000; i += 1) reserveAttempt(`flood-${i}`, now);
assert.ok(__limits.size() <= __limits.MAX_TRACKED, "table stays bounded");
assert.equal(allowed(reserveAttempt("partway", now)), true, "fifth attempt still allowed");
assert.equal(allowed(reserveAttempt("partway", now)), false, "sixth refused: the counter survived the flood");
assert.equal(allowed(reserveAttempt("brand-new", now)), false, "full table refuses newcomers instead of evicting");

// 3. Expired entries free up room.
assert.equal(allowed(reserveAttempt("brand-new", now + __limits.WINDOW_MS + 60_000)), true, "room after the window expires");

// 4. A correct code refunds only its own attempt; earlier wrong guesses still count.
__limits.reset();
for (let n = 0; n < 4; n += 1) reserveAttempt("visitor", now);
const correct = reserveAttempt("visitor", now);
refundAttempt("visitor", correct.window);
assert.equal(allowed(reserveAttempt("visitor", now)), true, "one more attempt allowed after the refund");
assert.equal(allowed(reserveAttempt("visitor", now)), false, "but the earlier guesses weren't reset");

// 5. A slow correct check that finishes after the window rolls over can't refund the new window.
__limits.reset();
const slow = reserveAttempt("late", now); // reserved in window A
const later = now + __limits.WINDOW_MS + 1_000; // window A expires
for (let n = 0; n < 5; n += 1) reserveAttempt("late", later); // 5 wrong guesses fill window B
refundAttempt("late", slow.window); // the slow success from window A completes now
assert.equal(allowed(reserveAttempt("late", later)), false, "window B's guesses are untouched by a window-A refund");

console.log("All limiter checks passed.");
