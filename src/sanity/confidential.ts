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
  // Resolve the slug to the published quest's ID (which never changes, even if the slug is renamed),
  // then read exactly "confidential.<that ID>". Only that private path is ever read as secret content.
  return privateClient.fetch<ConfidentialContent | null>(
    `*[_type == "sideQuestPrivate" && _id == "confidential." + *[
      _type == "sideQuest" && slug.current == $slug && !(_id in path("drafts.**")) && !(_id in path("versions.**"))
    ][0]._id][0]{
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
