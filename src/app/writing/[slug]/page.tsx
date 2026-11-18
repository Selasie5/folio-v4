import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatPostDate, getPost, getPosts } from "@/content/devto";

type Params = Promise<{ slug: string }>;

export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const post = await getPost((await params).slug);
  if (!post) return { title: "Post not found | Selasie Sepenu" };

  return {
    title: `${post.title} | Selasie Sepenu`,
    description: post.description,
    alternates: { canonical: post.url },
    openGraph: { title: post.title, description: post.description, images: post.coverImage ? [post.coverImage] : [] },
  };
}

export default async function PostPage({ params }: { params: Params }) {
  const post = await getPost((await params).slug);
  if (!post) notFound();

  return (
    <main className="flex w-full flex-col items-start">
      <Link
        href="/writing"
        className="font-mono text-xs text-gray-500 transition-colors hover:text-black dark:text-neutral-400 dark:hover:text-white"
      >
        ← All posts
      </Link>

      <article className="mt-8 w-full">
        <header>
          <h1 className="text-2xl leading-tight text-black dark:text-neutral-100 mono">{post.title}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-xs text-gray-500 dark:text-neutral-400">
            <time dateTime={post.publishedAt}>{formatPostDate(post.publishedAt)}</time>
            <span aria-hidden>·</span>
            <span>{post.readingTimeMinutes} min read</span>
            {post.tags.map((tag) => (
              <span key={tag} className="rounded bg-gray-100 px-1.5 py-0.5 text-gray-600 dark:bg-neutral-800 dark:text-neutral-400">
                {tag}
              </span>
            ))}
          </div>
        </header>

        {post.coverImage && (
          // eslint-disable-next-line @next/next/no-img-element -- dev.to serves its own resized images
          <img src={post.coverImage} alt="" className="mt-8 w-full rounded-lg border border-gray-100 dark:border-neutral-800" />
        )}

        <div className="article-body mt-8" dangerouslySetInnerHTML={{ __html: post.bodyHtml }} />

        <footer className="mt-12 border-t border-gray-100 pt-6 dark:border-neutral-800">
          <a
            href={post.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-xs text-gray-500 transition-colors hover:text-black dark:text-neutral-400 dark:hover:text-white"
          >
            Read and comment on dev.to ↗
          </a>
        </footer>
      </article>
    </main>
  );
}
