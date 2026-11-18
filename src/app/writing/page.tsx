import type { Metadata } from "next";
import Link from "next/link";
import { PostList } from "@/components/core/Writing";
import { getPosts } from "@/content/devto";

export const metadata: Metadata = {
  title: "Writing | Selasie Sepenu",
  description: "Articles by Selasie Sepenu on software engineering, frontend and JavaScript.",
};

export default async function WritingPage() {
  const posts = await getPosts();

  return (
    <main className="flex w-full flex-col items-start">
      <Link
        href="/"
        className="font-mono text-xs text-gray-500 transition-colors hover:text-black dark:text-neutral-400 dark:hover:text-white"
      >
        ← Home
      </Link>
      <h1 className="mt-8 text-lg text-black dark:text-neutral-100 mono">Writing</h1>
      <div className="mt-5 w-full">
        {posts.length > 0 ? (
          <PostList posts={posts} />
        ) : (
          <p className="text-sm text-gray-500 dark:text-neutral-400">Posts couldn&apos;t be loaded right now.</p>
        )}
      </div>
    </main>
  );
}
