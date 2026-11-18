import { getDevtoPost, getDevtoPosts, type Post, type PostWithBody } from "@/content/devto";
import { sanityClient } from "./client";

const postFields = `
  "id": devtoId,
  "slug": slug.current,
  title,
  "description": coalesce(description, ""),
  url,
  "coverImage": coverImage,
  publishedAt,
  "readingTimeMinutes": coalesce(readingTimeMinutes, 1),
  "tags": coalesce(tags, [])
`;

const postsQuery = `*[_type == "post" && defined(slug.current)] | order(publishedAt desc){${postFields}}`;
const postQuery = `*[_type == "post" && slug.current == $slug][0]{${postFields}, bodyHtml}`;

// Fresh on every request in dev; cached for a minute in production.
const fetchOptions =
  process.env.NODE_ENV === "production" ? { next: { revalidate: 60 } } : { cache: "no-store" as const };

// Posts are synced into Sanity from dev.to (`npm run cms:sync-posts`).
// If Sanity has none or can't be reached, read dev.to directly.
export async function getPosts(): Promise<Post[]> {
  if (sanityClient) {
    try {
      const posts = await sanityClient.fetch<Post[]>(postsQuery, {}, fetchOptions);
      if (posts.length > 0) return posts;
    } catch (error) {
      console.error("Unable to load posts from Sanity; using dev.to.", error);
    }
  }
  return getDevtoPosts();
}

export async function getPost(slug: string): Promise<PostWithBody | null> {
  if (sanityClient) {
    try {
      const post = await sanityClient.fetch<PostWithBody | null>(postQuery, { slug }, fetchOptions);
      if (post?.bodyHtml) return post;
    } catch (error) {
      console.error(`Unable to load post "${slug}" from Sanity; using dev.to.`, error);
    }
  }
  return getDevtoPost(slug);
}
