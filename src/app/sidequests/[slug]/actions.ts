"use server";

import { setTimeout as sleep } from "node:timers/promises";
import { headers } from "next/headers";
import type { SideQuestSection } from "@/content/sidequests";
import { checkAccessCode } from "@/sanity/confidential";
import { refundAttempt, reserveAttempt } from "@/sanity/unlockRateLimit";

export type UnlockResult =
  | { ok: true; intro: string[]; sections: SideQuestSection[] }
  | { ok: false; error: string };

// One counter per visitor across every side quest, so trying many slugs doesn’t buy extra guesses.
async function visitorKey() {
  const list = await headers();
  return list.get("x-forwarded-for")?.split(",")[0]?.trim() || list.get("x-real-ip") || "unknown";
}

/**
 * Checks an access code and, if it's right, returns the story. Nothing is remembered:
 * no cookie is set, so the story only stays visible while that page is open.
 */
export async function unlockSideQuest(slug: string, code: string): Promise<UnlockResult> {
  if (typeof slug !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return { ok: false, error: "That code didn’t work." };
  if (typeof code !== "string" || !code.trim() || code.length > 64) return { ok: false, error: "Enter the access code you were given." };

  // Reserve this attempt before the code is checked; refuse once the limit is reached.
  const key = await visitorKey();
  const reservation = reserveAttempt(key);
  if (!reservation.allowed) {
    const wait = reservation.waitMinutes;
    return { ok: false, error: `Too many attempts. Try again in ${wait} minute${wait === 1 ? "" : "s"}.` };
  }

  const story = await checkAccessCode(slug, code);
  if (!story) {
    // Also slow down each wrong guess.
    await sleep(800);
    return { ok: false, error: "That code didn’t work. Check it and try again." };
  }
  // Refund only this attempt, in the window it was counted in; earlier wrong guesses keep counting.
  refundAttempt(key, reservation.window);
  return { ok: true, intro: story.intro, sections: story.sections };
}
