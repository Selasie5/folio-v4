import { books as localBooks, type Book } from "@/content/books";
import { sanityClient } from "./client";

// Covers are served from Sanity's image CDN, resized for the cards.
const booksQuery = `*[_type == "book" && defined(title) && defined(cover.asset) && !(_id in path("drafts.**"))] | order(order asc){
  "slug": _id,
  title,
  author,
  "cover": cover.asset->url + "?w=480&fit=max&auto=format",
  year,
  link
}`;

// Fresh on every request in dev; cached for a minute in production.
const fetchOptions =
  process.env.NODE_ENV === "production" ? { next: { revalidate: 60 } } : { cache: "no-store" as const };

// GROQ returns null for missing fields; the cards expect them to be absent.
const clean = (book: Book): Book => ({ ...book, year: book.year ?? undefined, link: book.link ?? undefined });

/** The Bookshelf, edited in Sanity Studio. Falls back to src/content/books.json if Sanity has none or fails. */
export async function getBooks(): Promise<Book[]> {
  if (sanityClient) {
    try {
      const books = await sanityClient.fetch<Book[]>(booksQuery, {}, fetchOptions);
      if (books.length > 0) return books.map(clean);
    } catch (error) {
      console.error("Unable to load books from Sanity; using the local copies.", error);
    }
  }
  return localBooks;
}
