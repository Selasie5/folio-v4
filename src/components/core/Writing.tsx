import Link from "next/link";
import { formatPostDate, type Post } from "@/content/devto";

export function PostList({ posts }: { posts: Post[] }) {
  return (
    <ul className="w-full divide-y divide-gray-100 border-y border-gray-100 dark:divide-neutral-800 dark:border-neutral-800">
      {posts.map((post) => (
        <li key={post.id}>
          <Link
            href={`/writing/${post.slug}`}
            className="group grid gap-2 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-6"
          >
            <h3 className="text-sm leading-5 text-black transition-colors group-hover:text-gray-600 dark:text-white dark:group-hover:text-neutral-300">
              {post.title}
            </h3>
            <div className="flex items-center gap-3 font-mono text-xs leading-5 text-gray-500 dark:text-neutral-400 sm:justify-end">
              {post.tags[0] && (
                <span className="rounded bg-gray-100 px-1.5 py-0.5 text-gray-600 dark:bg-neutral-800 dark:text-neutral-400">
                  {post.tags[0]}
                </span>
              )}
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
      <div className="flex items-baseline justify-between gap-4">
        <h2 id="writing-heading" className="text-lg text-black dark:text-neutral-100 mono">Writing</h2>
        <Link
          href="/writing"
          className="font-mono text-xs text-gray-500 transition-colors hover:text-black dark:text-neutral-400 dark:hover:text-white"
        >
          All posts →
        </Link>
      </div>
      <div className="mt-5"><PostList posts={posts.slice(0, limit)} /></div>
    </section>
  );
}
