// The post fields every list and page needs (the body is fetched separately).
export const postFields = `
  "id": _id,
  "slug": slug.current,
  "source": coalesce(source, "devto"),
  title,
  "description": coalesce(description, ""),
  url,
  "coverImage": coverImage,
  publishedAt,
  "readingTimeMinutes": coalesce(readingTimeMinutes, 1),
  "tags": coalesce(tags, [])
`;

// Fresh on every request in dev; cached for a minute in production.
export const fetchOptions =
  process.env.NODE_ENV === "production" ? { next: { revalidate: 60 } } : { cache: "no-store" as const };
