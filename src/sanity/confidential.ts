// Server-only: reads confidential side quest content and checks access codes.
// Never import this from a client component — it uses SANITY_API_READ_TOKEN.
import { timingSafeEqual } from "node:crypto";
import { createClient } from "@sanity/client";
import type { SideQuestSection } from "@/content/sidequests";
import { sanityApiVersion, sanityDataset, sanityProjectId } from "./env";

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

// Case, spaces and the hyphen don't matter: "k7q4 mz2p" matches "K7Q4-MZ2P".
const normalize = (code: string) => code.toUpperCase().replace(/[^A-Z0-9]/g, "");

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

/** Checks a submitted code. Returns the story if it's right, otherwise null. */
export async function checkAccessCode(slug: string, submitted: string) {
  const content = await getConfidentialContent(slug);
  if (!content?.accessCode) return null;
  if (!safeEqual(normalize(submitted), normalize(content.accessCode))) return null;
  return { intro: content.intro, sections: content.sections };
}
