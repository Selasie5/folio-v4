"use server";

import { setTimeout as sleep } from "node:timers/promises";
import { cookies } from "next/headers";
import { ACCESS_DAYS, accessCookieName, checkAccessCode } from "@/sanity/confidential";

export interface UnlockState {
  error?: string;
  unlocked?: boolean;
}

export async function unlockSideQuest(slug: string, _previous: UnlockState, formData: FormData): Promise<UnlockState> {
  const code = String(formData.get("code") ?? "");
  if (!code.trim()) return { error: "Enter the access code you were given." };
  if (!/^[a-z0-9-]+$/.test(slug) || code.length > 64) return { error: "That code didn’t work." };

  const cookieValue = await checkAccessCode(slug, code);
  if (!cookieValue) {
    // Slow down guessing.
    await sleep(800);
    return { error: "That code didn’t work. Check it and try again." };
  }

  (await cookies()).set(accessCookieName(slug), cookieValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: `/sidequests/${slug}`,
    maxAge: ACCESS_DAYS * 24 * 60 * 60,
  });
  return { unlocked: true };
}
