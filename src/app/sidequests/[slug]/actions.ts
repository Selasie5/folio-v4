"use server";

import { setTimeout as sleep } from "node:timers/promises";
import { headers } from "next/headers";
import type { SideQuestSection } from "@/content/sidequests";
import { checkAccessCode } from "@/sanity/confidential";
import { clearFailures, lockedOutMinutes, recordFailure } from "@/sanity/unlockRateLimit";

export type UnlockResult =
  | { ok: true; intro: string[]; sections: SideQuestSection[] }
  | { ok: false; error: string };

async function visitorKey(slug: string) {
  const list = await headers();
  const ip = list.get("x-forwarded-for")?.split(",")[0]?.trim() || list.get("x-real-ip") || "unknown";
  return `${ip}:${slug}`;
}

/**
 * Checks an access code and, if it's right, returns the story. Nothing is remembered:
 * no cookie is set, so the story only stays visible while that page is open.
 */
export async function unlockSideQuest(slug: string, code: string): Promise<UnlockResult> {
  if (typeof slug !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return { ok: false, error: "That code didn’t work." };
  if (typeof code !== "string" || !code.trim() || code.length > 64) return { ok: false, error: "Enter the access code you were given." };

  // Too many wrong codes: refuse before the code is even checked.
  const key = await visitorKey(slug);
  const wait = lockedOutMinutes(key);
  if (wait > 0) {
    return { ok: false, error: `Too many attempts. Try again in ${wait} minute${wait === 1 ? "" : "s"}.` };
  }

  const story = await checkAccessCode(slug, code);
  if (!story) {
    recordFailure(key);
    // Also slow down each wrong guess.
    await sleep(800);
    return { ok: false, error: "That code didn’t work. Check it and try again." };
  }
  clearFailures(key);
  return { ok: true, intro: story.intro, sections: story.sections };
}
