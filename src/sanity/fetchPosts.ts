import { getDevtoPost, getDevtoPosts, type Post, type PostWithBody } from "@/content/devto";
import { sanityClient } from "./client";
import { getDraftPost, getDraftPosts } from "./draftPosts";
import { fetchOptions, postFields } from "./postFields";

const postsQuery = `*[_type == "post" && defined(slug.current) && length(bodyHtml) > 0] | order(publishedAt desc){${postFields}}`;
const postQuery = `*[_type == "post" && slug.current == $slug][0]{${postFields}, bodyHtml}`;

async function getPublishedPosts(): Promise<Post[]> {
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

// Posts are synced into Sanity from dev.to (`npm run cms:sync-posts`).
// If Sanity has none or can't be reached, read dev.to directly.
// Unpublished drafts are listed too, marked `draft`, so readers can see what's coming.
export async function getPosts(): Promise<Post[]> {
  const [published, drafts] = await Promise.all([getPublishedPosts(), getDraftPosts()]);
  return [...drafts, ...published].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

/** A published post, or a draft whose body is cut down to its public preview. */
export async function getPost(slug: string): Promise<PostWithBody | null> {
  if (sanityClient) {
    try {
      const post = await sanityClient.fetch<PostWithBody | null>(postQuery, { slug }, fetchOptions);
      if (post?.bodyHtml) return post;
    } catch (error) {
      console.error(`Unable to load post "${slug}" from Sanity; using dev.to.`, error);
    }
  }
  return (await getDraftPost(slug)) ?? getDevtoPost(slug);
}
