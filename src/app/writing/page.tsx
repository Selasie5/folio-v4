import type { Metadata } from "next";
import { PostList } from "@/components/core/Writing";
import PageTopBar from "@/components/layout/PageTopBar";
import { getPosts } from "@/sanity/fetchPosts";

export const metadata: Metadata = {
  title: "Writing | Selasie Sepenu",
  description: "Articles by Selasie Sepenu on software engineering, frontend and JavaScript.",
};

export default async function WritingPage() {
  const posts = await getPosts();

  return (
    <main className="flex w-full flex-col items-start">
      <PageTopBar href="/" label="Back home" />
      <header className="mt-8">
        <h1 className="text-2xl leading-tight text-black dark:text-neutral-100 mono">Writing</h1>
        <p className="mt-3 max-w-[52ch] text-sm leading-6 text-gray-500 dark:text-neutral-400">
          Notes on frontend engineering, JavaScript and the systems behind the products I build.
        </p>
      </header>
      <div className="mt-8 w-full">
        {posts.length > 0 ? (
          <PostList posts={posts} />
        ) : (
          <p className="text-sm text-gray-500 dark:text-neutral-400">Posts couldn&apos;t be loaded right now.</p>
        )}
      </div>
    </main>
  );
}
