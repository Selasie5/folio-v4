import Link from "next/link";
import { DraftTag } from "@/components/core/DraftPost";
import MoreLink from "@/components/core/MoreLink";
import { formatPostDate, type Post } from "@/content/devto";

export function PostList({ posts }: { posts: Post[] }) {
  return (
    <ul className="focus-list w-full divide-y divide-dotted divide-gray-300 border-y border-dotted border-gray-300 dark:divide-neutral-700 dark:border-neutral-700">
      {posts.map((post) => (
        <li key={post.id}>
          <Link
            href={`/writing/${post.slug}`}
            className="grid gap-2 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-6"
          >
            <h3 className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm leading-5 text-black dark:text-white">
              {post.title}
              {post.draft && <DraftTag />}
            </h3>
            <div className="flex items-center text-xs leading-5 text-gray-500 dark:text-neutral-400 sm:justify-end">
              <time dateTime={post.publishedAt} className="whitespace-nowrap">
                {formatPostDate(post.publishedAt)}
              </time>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default function Writing({ posts, limit = 3 }: { posts: Post[]; limit?: number }) {
  if (posts.length === 0) return null;

  return (
    <section className="mt-14 w-full sm:mt-16" aria-labelledby="writing-heading">
      <div className="flex items-center justify-between gap-4">
        <h2 id="writing-heading" className="text-lg text-black dark:text-neutral-100 mono">Writing</h2>
        <MoreLink href="/writing" label="All posts" />
      </div>
      <div className="mt-5"><PostList posts={posts.slice(0, limit)} /></div>
    </section>
  );
}
