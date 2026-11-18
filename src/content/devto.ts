const DEVTO_USERNAME = "selasie5";
const DEVTO_API = "https://dev.to/api";

export interface Post {
  id: number | string;
  slug: string;
  title: string;
  description: string;
  url: string;
  coverImage: string | null;
  publishedAt: string;
  readingTimeMinutes: number;
  tags: string[];
  /** Where the article was first published. */
  source?: "devto" | "medium";
}

export interface PostWithBody extends Post {
  bodyHtml: string;
}

interface DevtoArticle {
  id: number | string;
  slug: string;
  title: string;
  description: string;
  url: string;
  cover_image: string | null;
  published_at: string;
  reading_time_minutes: number;
  // The list endpoint returns tags as an array, the single-article endpoint as a comma-separated string.
  tag_list: string[] | string;
  body_html?: string;
}

// Fresh on every request in dev; cached for an hour in production.
const fetchOptions: RequestInit =
  process.env.NODE_ENV === "production" ? { next: { revalidate: 3600 } } : { cache: "no-store" };

async function devtoFetch<T>(path: string): Promise<T | null> {
  try {
    const response = await fetch(`${DEVTO_API}${path}`, {
      ...fetchOptions,
      headers: { Accept: "application/vnd.forem.api-v1+json" },
    });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch (error) {
    console.error(`Unable to load dev.to ${path}`, error);
    return null;
  }
}

function toPost(article: DevtoArticle): Post {
  const tags = Array.isArray(article.tag_list)
    ? article.tag_list
    : article.tag_list.split(",").map((tag) => tag.trim()).filter(Boolean);

  return {
    id: article.id,
    slug: article.slug,
    title: article.title,
    description: article.description,
    url: article.url,
    coverImage: article.cover_image,
    publishedAt: article.published_at,
    readingTimeMinutes: article.reading_time_minutes,
    tags,
    source: "devto",
  };
}

// /articles/latest is not cached like /articles, so brand-new posts show up immediately.
export async function getDevtoPosts(): Promise<Post[]> {
  const articles = await devtoFetch<DevtoArticle[]>(`/articles/latest?username=${DEVTO_USERNAME}&per_page=1000`);
  return (Array.isArray(articles) ? articles : [])
    .filter((article): article is DevtoArticle => Boolean(article && article.slug && article.title))
    .map(toPost)
    .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
}

export async function getDevtoPost(slug: string): Promise<PostWithBody | null> {
  const article = await devtoFetch<DevtoArticle>(`/articles/${DEVTO_USERNAME}/${encodeURIComponent(slug)}`);
  if (!article?.body_html) return null;
  return { ...toPost(article), bodyHtml: article.body_html };
}

export function formatPostDate(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" }).format(
    new Date(iso),
  );
}
