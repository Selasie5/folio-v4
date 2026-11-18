"use server";

import { setTimeout as sleep } from "node:timers/promises";
import { cookies } from "next/headers";
import type { SideQuestSection } from "@/content/sidequests";
import { ACCESS_DAYS, accessCookieName, checkAccessCode } from "@/sanity/confidential";

export type UnlockResult =
  | { ok: true; intro: string[]; sections: SideQuestSection[] }
  | { ok: false; error: string };

/** Checks an access code; on success sets the unlock cookie and returns the story. */
export async function unlockSideQuest(slug: string, code: string): Promise<UnlockResult> {
  if (typeof slug !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return { ok: false, error: "That code didn’t work." };
  if (typeof code !== "string" || !code.trim() || code.length > 64) return { ok: false, error: "Enter the access code you were given." };

  const unlocked = await checkAccessCode(slug, code);
  if (!unlocked) {
    // Slow down guessing.
    await sleep(800);
    return { ok: false, error: "That code didn’t work. Check it and try again." };
  }

  (await cookies()).set(accessCookieName(slug), unlocked.cookieValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: `/sidequests/${slug}`,
    maxAge: ACCESS_DAYS * 24 * 60 * 60,
  });
  return { ok: true, intro: unlocked.intro, sections: unlocked.sections };
}
