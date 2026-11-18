"use server";

import { setTimeout as sleep } from "node:timers/promises";
import type { SideQuestSection } from "@/content/sidequests";
import { checkAccessCode } from "@/sanity/confidential";

export type UnlockResult =
  | { ok: true; intro: string[]; sections: SideQuestSection[] }
  | { ok: false; error: string };

/**
 * Checks an access code and, if it's right, returns the story. Nothing is remembered:
 * no cookie is set, so the story only stays visible while that page is open.
 */
export async function unlockSideQuest(slug: string, code: string): Promise<UnlockResult> {
  if (typeof slug !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return { ok: false, error: "That code didn’t work." };
  if (typeof code !== "string" || !code.trim() || code.length > 64) return { ok: false, error: "Enter the access code you were given." };

  const story = await checkAccessCode(slug, code);
  if (!story) {
    // Slow down guessing.
    await sleep(800);
    return { ok: false, error: "That code didn’t work. Check it and try again." };
  }
  return { ok: true, intro: story.intro, sections: story.sections };
}
