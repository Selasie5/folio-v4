// Server-only: reads confidential side quest content and checks access.
// Never import this from a client component — it uses SANITY_API_READ_TOKEN.
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { createClient } from "@sanity/client";
import type { SideQuestSection } from "@/content/sidequests";
import { sanityApiVersion, sanityDataset, sanityProjectId } from "./env";

/** How long an unlocked side quest stays unlocked in that browser. */
export const ACCESS_DAYS = 7;

const readToken = process.env.SANITY_API_READ_TOKEN;

const privateClient =
  sanityProjectId && readToken
    ? createClient({ projectId: sanityProjectId, dataset: sanityDataset, apiVersion: sanityApiVersion, token: readToken, useCdn: false })
    : null;

/** False until SANITY_API_READ_TOKEN is set, in which case nobody can unlock anything. */
export const confidentialAccessConfigured = Boolean(privateClient);

interface ConfidentialContent {
  accessCode: string;
  intro: string[];
  sections: SideQuestSection[];
}

async function getConfidentialContent(slug: string): Promise<ConfidentialContent | null> {
  if (!privateClient) return null;
  // Only documents under the "confidential." path are private; never read anything else as secret content.
  return privateClient.fetch<ConfidentialContent | null>(
    `*[_type == "sideQuestPrivate" && questSlug == $slug && _id in path("confidential.**")][0]{
      accessCode,
      "intro": coalesce(intro, []),
      "sections": coalesce(sections[]{ heading, "paragraphs": coalesce(paragraphs, []) }, [])
    }`,
    { slug },
    { cache: "no-store" },
  );
}

export const accessCookieName = (slug: string) => `sq-access-${slug}`;

// The cookie holds a signature of the slug and the current code, keyed by the server's token.
// Changing the code in Studio invalidates every existing unlock.
function signature(slug: string, accessCode: string) {
  return createHmac("sha256", readToken ?? "").update(`${slug}:${accessCode}`).digest("hex");
}

const normalize = (code: string) => code.trim().toUpperCase().replace(/\s+/g, "");

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

/** The story, if this visitor has unlocked it; otherwise null. */
export async function getUnlockedContent(slug: string) {
  const token = (await cookies()).get(accessCookieName(slug))?.value;
  if (!token) return null;
  const content = await getConfidentialContent(slug);
  if (!content?.accessCode || !safeEqual(token, signature(slug, content.accessCode))) return null;
  return { intro: content.intro, sections: content.sections };
}

/** Checks a submitted code. Returns the cookie value to set, or null if the code is wrong. */
export async function checkAccessCode(slug: string, submitted: string): Promise<string | null> {
  const content = await getConfidentialContent(slug);
  if (!content?.accessCode) return null;
  if (!safeEqual(normalize(submitted), normalize(content.accessCode))) return null;
  return signature(slug, content.accessCode);
}
