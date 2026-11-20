// Server-only: lists unpublished posts and serves their preview.
// Never import this from a client component — it uses SANITY_API_READ_TOKEN.
import { createClient } from "@sanity/client";
import type { Post, PostWithBody } from "@/content/devto";
import { sanityApiVersion, sanityDataset, sanityProjectId } from "./env";
import { fetchOptions, postFields } from "./postFields";

const readToken = process.env.SANITY_API_READ_TOKEN;

// Drafts ("drafts.<id>") are invisible to anonymous reads, so this needs the token,
// and the "raw" perspective so drafts aren't hidden behind their published versions.
const draftClient =
  sanityProjectId && readToken
    ? createClient({
        projectId: sanityProjectId,
        dataset: sanityDataset,
        apiVersion: sanityApiVersion,
        token: readToken,
        useCdn: false,
        perspective: "raw",
      })
    : null;

/** Drafts with a body. Posts that are already published show their published version instead. */
const draftsQuery = `{
  "drafts": *[_type == "post" && _id in path("drafts.**") && defined(slug.current) && length(bodyHtml) > 0]
    | order(publishedAt desc){${postFields}},
  "publishedIds": *[_type == "post" && !(_id in path("drafts.**")) && !(_id in path("versions.**"))]._id
}`;

const draftBodyQuery = `*[_type == "post" && _id in path("drafts.**") && slug.current == $slug][0].bodyHtml`;

async function unpublishedDrafts(): Promise<Post[]> {
  if (!draftClient) return [];
  const { drafts, publishedIds } = await draftClient.fetch<{ drafts: Post[]; publishedIds: string[] }>(
    draftsQuery,
    {},
    fetchOptions,
  );
  const published = new Set(publishedIds);
  return drafts
    .filter(({ id }) => !published.has(String(id).replace(/^drafts\./, "")))
    .map((post) => ({ ...post, draft: true }));
}

/**
 * The part of a draft that's public: the introduction and the first section
 * (everything before the second <h2>), or the first three paragraphs if it has
 * no headings. The rest never leaves the server, so it can't be read from the page.
 */
export function draftPreview(html: string): string {
  const sections = html.split(/(?=<h2[\s>])/i);
  if (sections.length > 2) return sections.slice(0, 2).join("");
  return html.split(/(?<=<\/p>)/i).slice(0, 3).join("");
}

export async function getDraftPosts(): Promise<Post[]> {
  try {
    return await unpublishedDrafts();
  } catch (error) {
    console.error("Unable to load draft posts from Sanity.", error);
    return [];
  }
}

/** A draft's details with only its preview as the body, or null if there's no such draft. */
export async function getDraftPost(slug: string): Promise<PostWithBody | null> {
  if (!draftClient) return null;
  try {
    const post = (await unpublishedDrafts()).find((draft) => draft.slug === slug);
    if (!post) return null;
    const body = await draftClient.fetch<string | null>(draftBodyQuery, { slug }, fetchOptions);
    return body ? { ...post, bodyHtml: draftPreview(body) } : null;
  } catch (error) {
    console.error(`Unable to load draft post "${slug}" from Sanity.`, error);
    return null;
  }
}
